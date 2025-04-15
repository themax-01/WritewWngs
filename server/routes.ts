import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertWritingSchema, 
  insertCommentSchema,
  insertLikeSchema,
  insertBookmarkSchema,
  insertFollowSchema,
  insertChallengeSchema,
  insertChallengeEntrySchema,
  insertNotificationSchema
} from "@shared/schema";
import { z } from "zod";

function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).send("Unauthorized");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Writings Routes
  app.get("/api/writings", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const tag = req.query.tag as string | undefined;
      const featured = req.query.featured === "true";
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const search = req.query.search as string | undefined;
      
      let writings;
      
      if (featured) {
        writings = await storage.getFeaturedWritings();
      } else if (category) {
        writings = await storage.getWritingsByCategory(category);
      } else if (tag) {
        writings = await storage.getWritingsByTag(tag);
      } else if (userId) {
        writings = await storage.getWritingsByUser(userId);
      } else if (search) {
        writings = await storage.searchWritings(search);
      } else {
        // Get all writings from storage
        writings = Array.from((await Promise.all(Array.from(Array(storage.writingId).keys()).map(id => storage.getWriting(id + 1)))).filter(Boolean));
      }
      
      // Enrich writings with author info and stats
      const enrichedWritings = await Promise.all(writings.map(async (writing) => {
        const author = await storage.getUser(writing.userId);
        const likes = await storage.getLikesByWriting(writing.id);
        const comments = await storage.getCommentsByWriting(writing.id);
        
        return {
          ...writing,
          author: author ? {
            id: author.id,
            username: author.username,
            fullName: author.fullName,
            profileImage: author.profileImage
          } : null,
          stats: {
            likes: likes.length,
            comments: comments.length
          }
        };
      }));
      
      res.json(enrichedWritings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch writings" });
    }
  });
  
  app.get("/api/writings/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    
    try {
      const writing = await storage.getWriting(id);
      if (!writing) {
        return res.status(404).json({ error: "Writing not found" });
      }
      
      const author = await storage.getUser(writing.userId);
      const likes = await storage.getLikesByWriting(writing.id);
      const comments = await storage.getCommentsByWriting(writing.id);
      
      // Check if the authenticated user has liked or bookmarked this writing
      let userLike = undefined;
      let userBookmark = undefined;
      
      if (req.isAuthenticated()) {
        userLike = await storage.getLike(req.user.id, writing.id);
        userBookmark = await storage.getBookmark(req.user.id, writing.id);
      }
      
      res.json({
        ...writing,
        author: author ? {
          id: author.id,
          username: author.username,
          fullName: author.fullName,
          profileImage: author.profileImage,
          bio: author.bio
        } : null,
        stats: {
          likes: likes.length,
          comments: comments.length
        },
        userInteraction: {
          liked: !!userLike,
          bookmarked: !!userBookmark
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch writing" });
    }
  });
  
  app.post("/api/writings", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertWritingSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const writing = await storage.createWriting(validatedData);
      res.status(201).json(writing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid writing data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create writing" });
    }
  });
  
  app.put("/api/writings/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    
    try {
      const writing = await storage.getWriting(id);
      if (!writing) {
        return res.status(404).json({ error: "Writing not found" });
      }
      
      // Check if user is the author or admin
      if (writing.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Unauthorized to update this writing" });
      }
      
      const updatedWriting = await storage.updateWriting(id, req.body);
      res.json(updatedWriting);
    } catch (error) {
      res.status(500).json({ error: "Failed to update writing" });
    }
  });
  
  app.delete("/api/writings/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    
    try {
      const writing = await storage.getWriting(id);
      if (!writing) {
        return res.status(404).json({ error: "Writing not found" });
      }
      
      // Check if user is the author or admin
      if (writing.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Unauthorized to delete this writing" });
      }
      
      await storage.deleteWriting(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete writing" });
    }
  });
  
  // Comments Routes
  app.get("/api/writings/:id/comments", async (req, res) => {
    const writingId = parseInt(req.params.id);
    if (isNaN(writingId)) {
      return res.status(400).json({ error: "Invalid writing ID" });
    }
    
    try {
      const comments = await storage.getCommentsByWriting(writingId);
      
      // Enrich comments with author info
      const enrichedComments = await Promise.all(comments.map(async (comment) => {
        const author = await storage.getUser(comment.userId);
        
        return {
          ...comment,
          author: author ? {
            id: author.id,
            username: author.username,
            fullName: author.fullName,
            profileImage: author.profileImage
          } : null
        };
      }));
      
      res.json(enrichedComments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });
  
  app.post("/api/writings/:id/comments", isAuthenticated, async (req, res) => {
    const writingId = parseInt(req.params.id);
    if (isNaN(writingId)) {
      return res.status(400).json({ error: "Invalid writing ID" });
    }
    
    try {
      const writing = await storage.getWriting(writingId);
      if (!writing) {
        return res.status(404).json({ error: "Writing not found" });
      }
      
      const validatedData = insertCommentSchema.parse({
        userId: req.user.id,
        writingId,
        content: req.body.content
      });
      
      const comment = await storage.createComment(validatedData);
      
      // Create notification for the writing author (if not self-comment)
      if (writing.userId !== req.user.id) {
        await storage.createNotification({
          userId: writing.userId,
          type: "comment",
          message: `${req.user.fullName} commented on your writing "${writing.title}"`,
          metadata: {
            commentId: comment.id,
            writingId: writing.id,
            commenterId: req.user.id
          }
        });
      }
      
      // Include author info in response
      const author = await storage.getUser(comment.userId);
      
      res.status(201).json({
        ...comment,
        author: author ? {
          id: author.id,
          username: author.username,
          fullName: author.fullName,
          profileImage: author.profileImage
        } : null
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid comment data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create comment" });
    }
  });
  
  app.delete("/api/comments/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    
    try {
      const comment = await storage.getComment(id);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      
      // Check if user is the author or admin
      if (comment.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Unauthorized to delete this comment" });
      }
      
      await storage.deleteComment(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });
  
  // Likes Routes
  app.post("/api/writings/:id/like", isAuthenticated, async (req, res) => {
    const writingId = parseInt(req.params.id);
    if (isNaN(writingId)) {
      return res.status(400).json({ error: "Invalid writing ID" });
    }
    
    try {
      const writing = await storage.getWriting(writingId);
      if (!writing) {
        return res.status(404).json({ error: "Writing not found" });
      }
      
      // Check if already liked
      const existingLike = await storage.getLike(req.user.id, writingId);
      if (existingLike) {
        return res.status(400).json({ error: "Already liked" });
      }
      
      const validatedData = insertLikeSchema.parse({
        userId: req.user.id,
        writingId
      });
      
      const like = await storage.createLike(validatedData);
      
      // Create notification for the writing author (if not self-like)
      if (writing.userId !== req.user.id) {
        await storage.createNotification({
          userId: writing.userId,
          type: "like",
          message: `${req.user.fullName} liked your writing "${writing.title}"`,
          metadata: {
            likeId: like.id,
            writingId: writing.id,
            likerId: req.user.id
          }
        });
      }
      
      res.status(201).json(like);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid like data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to like writing" });
    }
  });
  
  app.delete("/api/writings/:id/like", isAuthenticated, async (req, res) => {
    const writingId = parseInt(req.params.id);
    if (isNaN(writingId)) {
      return res.status(400).json({ error: "Invalid writing ID" });
    }
    
    try {
      const writing = await storage.getWriting(writingId);
      if (!writing) {
        return res.status(404).json({ error: "Writing not found" });
      }
      
      const result = await storage.deleteLike(req.user.id, writingId);
      if (!result) {
        return res.status(404).json({ error: "Like not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to unlike writing" });
    }
  });
  
  // Bookmarks Routes
  app.post("/api/writings/:id/bookmark", isAuthenticated, async (req, res) => {
    const writingId = parseInt(req.params.id);
    if (isNaN(writingId)) {
      return res.status(400).json({ error: "Invalid writing ID" });
    }
    
    try {
      const writing = await storage.getWriting(writingId);
      if (!writing) {
        return res.status(404).json({ error: "Writing not found" });
      }
      
      // Check if already bookmarked
      const existingBookmark = await storage.getBookmark(req.user.id, writingId);
      if (existingBookmark) {
        return res.status(400).json({ error: "Already bookmarked" });
      }
      
      const validatedData = insertBookmarkSchema.parse({
        userId: req.user.id,
        writingId
      });
      
      const bookmark = await storage.createBookmark(validatedData);
      
      // Create notification for the writing author (if not self-bookmark)
      if (writing.userId !== req.user.id) {
        await storage.createNotification({
          userId: writing.userId,
          type: "bookmark",
          message: `${req.user.fullName} bookmarked your writing "${writing.title}"`,
          metadata: {
            bookmarkId: bookmark.id,
            writingId: writing.id,
            bookmarkerId: req.user.id
          }
        });
      }
      
      res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid bookmark data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to bookmark writing" });
    }
  });
  
  app.delete("/api/writings/:id/bookmark", isAuthenticated, async (req, res) => {
    const writingId = parseInt(req.params.id);
    if (isNaN(writingId)) {
      return res.status(400).json({ error: "Invalid writing ID" });
    }
    
    try {
      const writing = await storage.getWriting(writingId);
      if (!writing) {
        return res.status(404).json({ error: "Writing not found" });
      }
      
      const result = await storage.deleteBookmark(req.user.id, writingId);
      if (!result) {
        return res.status(404).json({ error: "Bookmark not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to remove bookmark" });
    }
  });
  
  app.get("/api/bookmarks", isAuthenticated, async (req, res) => {
    try {
      const bookmarks = await storage.getBookmarksByUser(req.user.id);
      
      // Enrich bookmarks with writing info
      const enrichedBookmarks = await Promise.all(bookmarks.map(async (bookmark) => {
        const writing = await storage.getWriting(bookmark.writingId);
        
        if (!writing) return null;
        
        const author = await storage.getUser(writing.userId);
        const likes = await storage.getLikesByWriting(writing.id);
        const comments = await storage.getCommentsByWriting(writing.id);
        
        return {
          ...bookmark,
          writing: {
            ...writing,
            author: author ? {
              id: author.id,
              username: author.username,
              fullName: author.fullName,
              profileImage: author.profileImage
            } : null,
            stats: {
              likes: likes.length,
              comments: comments.length
            }
          }
        };
      }));
      
      // Filter out null values (in case a writing was deleted)
      const filteredBookmarks = enrichedBookmarks.filter(bookmark => bookmark !== null);
      
      res.json(filteredBookmarks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
  });
  
  // Follows Routes
  app.post("/api/users/:id/follow", isAuthenticated, async (req, res) => {
    const followingId = parseInt(req.params.id);
    if (isNaN(followingId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    // Can't follow yourself
    if (followingId === req.user.id) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }
    
    try {
      const userToFollow = await storage.getUser(followingId);
      if (!userToFollow) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if already following
      const existingFollow = await storage.getFollow(req.user.id, followingId);
      if (existingFollow) {
        return res.status(400).json({ error: "Already following" });
      }
      
      const validatedData = insertFollowSchema.parse({
        followerId: req.user.id,
        followingId
      });
      
      const follow = await storage.createFollow(validatedData);
      
      // Create notification for the followed user
      await storage.createNotification({
        userId: followingId,
        type: "follow",
        message: `${req.user.fullName} started following you`,
        metadata: {
          followId: follow.id,
          followerId: req.user.id
        }
      });
      
      res.status(201).json(follow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid follow data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to follow user" });
    }
  });
  
  app.delete("/api/users/:id/follow", isAuthenticated, async (req, res) => {
    const followingId = parseInt(req.params.id);
    if (isNaN(followingId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    try {
      const result = await storage.deleteFollow(req.user.id, followingId);
      if (!result) {
        return res.status(404).json({ error: "Follow not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to unfollow user" });
    }
  });
  
  app.get("/api/users/:id/followers", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const followers = await storage.getFollowers(userId);
      
      // Enrich followers with user info
      const enrichedFollowers = await Promise.all(followers.map(async (follow) => {
        const follower = await storage.getUser(follow.followerId);
        
        return follower ? {
          id: follower.id,
          username: follower.username,
          fullName: follower.fullName,
          profileImage: follower.profileImage,
          bio: follower.bio,
          followedAt: follow.createdAt
        } : null;
      }));
      
      // Filter out null values
      const filteredFollowers = enrichedFollowers.filter(follower => follower !== null);
      
      res.json(filteredFollowers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch followers" });
    }
  });
  
  app.get("/api/users/:id/following", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const following = await storage.getFollowing(userId);
      
      // Enrich following with user info
      const enrichedFollowing = await Promise.all(following.map(async (follow) => {
        const followed = await storage.getUser(follow.followingId);
        
        return followed ? {
          id: followed.id,
          username: followed.username,
          fullName: followed.fullName,
          profileImage: followed.profileImage,
          bio: followed.bio,
          followedAt: follow.createdAt
        } : null;
      }));
      
      // Filter out null values
      const filteredFollowing = enrichedFollowing.filter(followed => followed !== null);
      
      res.json(filteredFollowing);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch following" });
    }
  });
  
  // User Profile Routes
  app.get("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get statistics
      const writings = await storage.getWritingsByUser(userId);
      const followers = await storage.getFollowers(userId);
      const following = await storage.getFollowing(userId);
      
      // Check if the authenticated user follows this user
      let isFollowing = false;
      if (req.isAuthenticated()) {
        const follow = await storage.getFollow(req.user.id, userId);
        isFollowing = !!follow;
      }
      
      // Remove sensitive fields
      const { password, ...safeUser } = user;
      
      res.json({
        ...safeUser,
        stats: {
          writingsCount: writings.length,
          followersCount: followers.length,
          followingCount: following.length
        },
        isFollowing
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });
  
  app.put("/api/users/profile", isAuthenticated, async (req, res) => {
    try {
      // Only allow updating certain fields
      const { fullName, bio, profileImage } = req.body;
      
      const updatedUser = await storage.updateUser(req.user.id, {
        fullName,
        bio,
        profileImage
      });
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Remove sensitive fields
      const { password, ...safeUser } = updatedUser;
      
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });
  
  // Challenges Routes
  app.get("/api/challenges", async (req, res) => {
    try {
      const challenges = await storage.getAllChallenges();
      
      // Enrich challenges with entry counts
      const enrichedChallenges = await Promise.all(challenges.map(async (challenge) => {
        const entries = await storage.getChallengeEntriesByChallenge(challenge.id);
        
        return {
          ...challenge,
          entriesCount: entries.length
        };
      }));
      
      res.json(enrichedChallenges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch challenges" });
    }
  });
  
  app.get("/api/challenges/:id", async (req, res) => {
    const challengeId = parseInt(req.params.id);
    if (isNaN(challengeId)) {
      return res.status(400).json({ error: "Invalid challenge ID" });
    }
    
    try {
      const challenge = await storage.getChallenge(challengeId);
      if (!challenge) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      
      const entries = await storage.getChallengeEntriesByChallenge(challengeId);
      
      // Enrich entries with writing and author info
      const enrichedEntries = await Promise.all(entries.map(async (entry) => {
        const writing = await storage.getWriting(entry.writingId);
        if (!writing) return null;
        
        const author = await storage.getUser(writing.userId);
        const likes = await storage.getLikesByWriting(writing.id);
        const comments = await storage.getCommentsByWriting(writing.id);
        
        return {
          ...entry,
          writing: {
            ...writing,
            author: author ? {
              id: author.id,
              username: author.username,
              fullName: author.fullName,
              profileImage: author.profileImage
            } : null,
            stats: {
              likes: likes.length,
              comments: comments.length
            }
          }
        };
      }));
      
      // Filter out null values and sort by rank if available
      const filteredEntries = enrichedEntries
        .filter(entry => entry !== null)
        .sort((a, b) => {
          // If both have ranks, sort by rank
          if (a.rank && b.rank) return a.rank - b.rank;
          // If only one has rank, it comes first
          if (a.rank) return -1;
          if (b.rank) return 1;
          // Otherwise sort by likes count
          return b.writing.stats.likes - a.writing.stats.likes;
        });
      
      res.json({
        ...challenge,
        entries: filteredEntries
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch challenge" });
    }
  });
  
  app.post("/api/challenges", isAuthenticated, async (req, res) => {
    // Only admins can create challenges
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized to create challenges" });
    }
    
    try {
      const validatedData = insertChallengeSchema.parse(req.body);
      
      const challenge = await storage.createChallenge(validatedData);
      res.status(201).json(challenge);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid challenge data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create challenge" });
    }
  });
  
  app.post("/api/challenges/:id/entries", isAuthenticated, async (req, res) => {
    const challengeId = parseInt(req.params.id);
    if (isNaN(challengeId)) {
      return res.status(400).json({ error: "Invalid challenge ID" });
    }
    
    try {
      const challenge = await storage.getChallenge(challengeId);
      if (!challenge) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      
      // Check if challenge has ended
      if (new Date() > challenge.endDate) {
        return res.status(400).json({ error: "Challenge has ended" });
      }
      
      // Create the writing first
      const writingData = insertWritingSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const writing = await storage.createWriting(writingData);
      
      // Then create the challenge entry
      const entryData = insertChallengeEntrySchema.parse({
        challengeId,
        writingId: writing.id,
        rank: null // Rank will be assigned later by admin
      });
      
      const entry = await storage.createChallengeEntry(entryData);
      
      res.status(201).json({
        ...entry,
        writing
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid entry data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to submit entry" });
    }
  });
  
  app.put("/api/challenges/:challengeId/entries/:entryId/rank", isAuthenticated, async (req, res) => {
    // Only admins can rank entries
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized to rank entries" });
    }
    
    const challengeId = parseInt(req.params.challengeId);
    const entryId = parseInt(req.params.entryId);
    const { rank } = req.body;
    
    if (isNaN(challengeId) || isNaN(entryId) || isNaN(rank)) {
      return res.status(400).json({ error: "Invalid IDs or rank" });
    }
    
    try {
      const challenge = await storage.getChallenge(challengeId);
      if (!challenge) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      
      const entry = await storage.getChallengeEntry(entryId);
      if (!entry || entry.challengeId !== challengeId) {
        return res.status(404).json({ error: "Entry not found for this challenge" });
      }
      
      const updatedEntry = await storage.updateChallengeEntryRank(entryId, rank);
      
      // Notify the entry author
      const writing = await storage.getWriting(entry.writingId);
      if (writing) {
        await storage.createNotification({
          userId: writing.userId,
          type: "challenge_rank",
          message: `Your entry in "${challenge.title}" challenge has been ranked #${rank}!`,
          metadata: {
            challengeId,
            entryId,
            writingId: writing.id,
            rank
          }
        });
      }
      
      res.json(updatedEntry);
    } catch (error) {
      res.status(500).json({ error: "Failed to rank entry" });
    }
  });
  
  // Notifications Routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });
  
  app.put("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid notification ID" });
    }
    
    try {
      const notification = await storage.getNotification(id);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      
      // Check if notification belongs to user
      if (notification.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized to update this notification" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(id);
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });
  
  // Admin Routes
  app.get("/api/admin/users", isAuthenticated, async (req, res) => {
    // Check if user is admin (additional check just in case)
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    try {
      const users = await storage.getAllUsers();
      
      // Remove sensitive fields
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
  app.put("/api/admin/writings/:id/feature", isAuthenticated, async (req, res) => {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid writing ID" });
    }
    
    try {
      const writing = await storage.getWriting(id);
      if (!writing) {
        return res.status(404).json({ error: "Writing not found" });
      }
      
      const { feature } = req.body;
      const updatedWriting = await storage.updateWriting(id, { isFeatured: !!feature });
      
      // Notify the writing author about being featured
      if (feature && writing.userId !== req.user.id) {
        await storage.createNotification({
          userId: writing.userId,
          type: "featured",
          message: `Your writing "${writing.title}" has been featured!`,
          metadata: {
            writingId: writing.id
          }
        });
      }
      
      res.json(updatedWriting);
    } catch (error) {
      res.status(500).json({ error: "Failed to update writing feature status" });
    }
  });
  
  // Categories list
  app.get("/api/categories", async (req, res) => {
    // We could fetch this dynamically from writings, but for simplicity return fixed list
    const categories = [
      "Fiction",
      "Science Fiction",
      "Fantasy",
      "Mystery",
      "Poetry",
      "Essays",
      "Memoir"
    ];
    
    res.json(categories);
  });

  const httpServer = createServer(app);

  return httpServer;
}
