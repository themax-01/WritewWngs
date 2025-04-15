import { 
  users, type User, type InsertUser,
  writings, type Writing, type InsertWriting,
  comments, type Comment, type InsertComment,
  likes, type Like, type InsertLike,
  bookmarks, type Bookmark, type InsertBookmark,
  follows, type Follow, type InsertFollow,
  challenges, type Challenge, type InsertChallenge,
  challengeEntries, type ChallengeEntry, type InsertChallengeEntry,
  notifications, type Notification, type InsertNotification
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Writings
  getWriting(id: number): Promise<Writing | undefined>;
  getWritingsByUser(userId: number): Promise<Writing[]>;
  getFeaturedWritings(): Promise<Writing[]>;
  getWritingsByCategory(category: string): Promise<Writing[]>;
  getWritingsByTag(tag: string): Promise<Writing[]>;
  createWriting(writing: InsertWriting): Promise<Writing>;
  updateWriting(id: number, writing: Partial<Writing>): Promise<Writing | undefined>;
  deleteWriting(id: number): Promise<boolean>;
  searchWritings(query: string): Promise<Writing[]>;

  // Comments
  getComment(id: number): Promise<Comment | undefined>;
  getCommentsByWriting(writingId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;

  // Likes
  getLike(userId: number, writingId: number): Promise<Like | undefined>;
  getLikesByWriting(writingId: number): Promise<Like[]>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(userId: number, writingId: number): Promise<boolean>;

  // Bookmarks
  getBookmark(userId: number, writingId: number): Promise<Bookmark | undefined>;
  getBookmarksByUser(userId: number): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(userId: number, writingId: number): Promise<boolean>;

  // Follows
  getFollow(followerId: number, followingId: number): Promise<Follow | undefined>;
  getFollowers(userId: number): Promise<Follow[]>;
  getFollowing(userId: number): Promise<Follow[]>;
  createFollow(follow: InsertFollow): Promise<Follow>;
  deleteFollow(followerId: number, followingId: number): Promise<boolean>;

  // Challenges
  getChallenge(id: number): Promise<Challenge | undefined>;
  getAllChallenges(): Promise<Challenge[]>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: number, challenge: Partial<Challenge>): Promise<Challenge | undefined>;
  
  // Challenge Entries
  getChallengeEntry(id: number): Promise<ChallengeEntry | undefined>;
  getChallengeEntriesByChallenge(challengeId: number): Promise<ChallengeEntry[]>;
  createChallengeEntry(entry: InsertChallengeEntry): Promise<ChallengeEntry>;
  updateChallengeEntryRank(id: number, rank: number): Promise<ChallengeEntry | undefined>;
  
  // Notifications
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  
  // Session
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private writings: Map<number, Writing>;
  private comments: Map<number, Comment>;
  private likes: Map<number, Like>;
  private bookmarks: Map<number, Bookmark>;
  private follows: Map<number, Follow>;
  private challenges: Map<number, Challenge>;
  private challengeEntries: Map<number, ChallengeEntry>;
  private notifications: Map<number, Notification>;
  
  private userId: number;
  private writingId: number;
  private commentId: number;
  private likeId: number;
  private bookmarkId: number;
  private followId: number;
  private challengeId: number;
  private challengeEntryId: number;
  private notificationId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.writings = new Map();
    this.comments = new Map();
    this.likes = new Map();
    this.bookmarks = new Map();
    this.follows = new Map();
    this.challenges = new Map();
    this.challengeEntries = new Map();
    this.notifications = new Map();
    
    this.userId = 1;
    this.writingId = 1;
    this.commentId = 1;
    this.likeId = 1;
    this.bookmarkId = 1;
    this.followId = 1;
    this.challengeId = 1;
    this.challengeEntryId = 1;
    this.notificationId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Create admin user
    this.createUser({
      username: "admin",
      password: "admin",
      fullName: "Admin User",
      email: "admin@pencraft.com",
      bio: "Site administrator",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }).then(user => {
      this.updateUser(user.id, { isAdmin: true });
    });
    
    // Create a sample challenge
    this.createChallenge({
      title: "The Future of Humanity",
      description: "Write a short story or essay about how you envision the future of humanity in the next 100 years.",
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      wordLimit: "1000-2500"
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      isAdmin: false,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Writings
  async getWriting(id: number): Promise<Writing | undefined> {
    return this.writings.get(id);
  }
  
  async getWritingsByUser(userId: number): Promise<Writing[]> {
    return Array.from(this.writings.values()).filter(
      (writing) => writing.userId === userId
    );
  }
  
  async getFeaturedWritings(): Promise<Writing[]> {
    return Array.from(this.writings.values()).filter(
      (writing) => writing.isFeatured
    );
  }
  
  async getWritingsByCategory(category: string): Promise<Writing[]> {
    return Array.from(this.writings.values()).filter(
      (writing) => writing.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  async getWritingsByTag(tag: string): Promise<Writing[]> {
    return Array.from(this.writings.values()).filter(
      (writing) => writing.tags && writing.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }
  
  async createWriting(insertWriting: InsertWriting): Promise<Writing> {
    const id = this.writingId++;
    const now = new Date();
    const writing: Writing = {
      ...insertWriting,
      id,
      isFeatured: false,
      createdAt: now,
      updatedAt: now
    };
    this.writings.set(id, writing);
    return writing;
  }
  
  async updateWriting(id: number, writingData: Partial<Writing>): Promise<Writing | undefined> {
    const writing = await this.getWriting(id);
    if (!writing) return undefined;
    
    const updatedWriting = { 
      ...writing, 
      ...writingData,
      updatedAt: new Date()
    };
    this.writings.set(id, updatedWriting);
    return updatedWriting;
  }
  
  async deleteWriting(id: number): Promise<boolean> {
    return this.writings.delete(id);
  }
  
  async searchWritings(query: string): Promise<Writing[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.writings.values()).filter(
      (writing) => 
        writing.title.toLowerCase().includes(lowercaseQuery) ||
        writing.description.toLowerCase().includes(lowercaseQuery) ||
        writing.content.toLowerCase().includes(lowercaseQuery) ||
        writing.category.toLowerCase().includes(lowercaseQuery) ||
        (writing.tags && writing.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
    );
  }

  // Comments
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }
  
  async getCommentsByWriting(writingId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.writingId === writingId
    );
  }
  
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentId++;
    const now = new Date();
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: now
    };
    this.comments.set(id, comment);
    return comment;
  }
  
  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Likes
  async getLike(userId: number, writingId: number): Promise<Like | undefined> {
    return Array.from(this.likes.values()).find(
      (like) => like.userId === userId && like.writingId === writingId
    );
  }
  
  async getLikesByWriting(writingId: number): Promise<Like[]> {
    return Array.from(this.likes.values()).filter(
      (like) => like.writingId === writingId
    );
  }
  
  async createLike(insertLike: InsertLike): Promise<Like> {
    const id = this.likeId++;
    const now = new Date();
    const like: Like = {
      ...insertLike,
      id,
      createdAt: now
    };
    this.likes.set(id, like);
    return like;
  }
  
  async deleteLike(userId: number, writingId: number): Promise<boolean> {
    const like = await this.getLike(userId, writingId);
    if (!like) return false;
    return this.likes.delete(like.id);
  }

  // Bookmarks
  async getBookmark(userId: number, writingId: number): Promise<Bookmark | undefined> {
    return Array.from(this.bookmarks.values()).find(
      (bookmark) => bookmark.userId === userId && bookmark.writingId === writingId
    );
  }
  
  async getBookmarksByUser(userId: number): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter(
      (bookmark) => bookmark.userId === userId
    );
  }
  
  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.bookmarkId++;
    const now = new Date();
    const bookmark: Bookmark = {
      ...insertBookmark,
      id,
      createdAt: now
    };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }
  
  async deleteBookmark(userId: number, writingId: number): Promise<boolean> {
    const bookmark = await this.getBookmark(userId, writingId);
    if (!bookmark) return false;
    return this.bookmarks.delete(bookmark.id);
  }

  // Follows
  async getFollow(followerId: number, followingId: number): Promise<Follow | undefined> {
    return Array.from(this.follows.values()).find(
      (follow) => follow.followerId === followerId && follow.followingId === followingId
    );
  }
  
  async getFollowers(userId: number): Promise<Follow[]> {
    return Array.from(this.follows.values()).filter(
      (follow) => follow.followingId === userId
    );
  }
  
  async getFollowing(userId: number): Promise<Follow[]> {
    return Array.from(this.follows.values()).filter(
      (follow) => follow.followerId === userId
    );
  }
  
  async createFollow(insertFollow: InsertFollow): Promise<Follow> {
    const id = this.followId++;
    const now = new Date();
    const follow: Follow = {
      ...insertFollow,
      id,
      createdAt: now
    };
    this.follows.set(id, follow);
    return follow;
  }
  
  async deleteFollow(followerId: number, followingId: number): Promise<boolean> {
    const follow = await this.getFollow(followerId, followingId);
    if (!follow) return false;
    return this.follows.delete(follow.id);
  }

  // Challenges
  async getChallenge(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }
  
  async getAllChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values());
  }
  
  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = this.challengeId++;
    const now = new Date();
    const challenge: Challenge = {
      ...insertChallenge,
      id,
      createdAt: now
    };
    this.challenges.set(id, challenge);
    return challenge;
  }
  
  async updateChallenge(id: number, challengeData: Partial<Challenge>): Promise<Challenge | undefined> {
    const challenge = await this.getChallenge(id);
    if (!challenge) return undefined;
    
    const updatedChallenge = { ...challenge, ...challengeData };
    this.challenges.set(id, updatedChallenge);
    return updatedChallenge;
  }

  // Challenge Entries
  async getChallengeEntry(id: number): Promise<ChallengeEntry | undefined> {
    return this.challengeEntries.get(id);
  }
  
  async getChallengeEntriesByChallenge(challengeId: number): Promise<ChallengeEntry[]> {
    return Array.from(this.challengeEntries.values()).filter(
      (entry) => entry.challengeId === challengeId
    );
  }
  
  async createChallengeEntry(insertEntry: InsertChallengeEntry): Promise<ChallengeEntry> {
    const id = this.challengeEntryId++;
    const now = new Date();
    const entry: ChallengeEntry = {
      ...insertEntry,
      id,
      createdAt: now
    };
    this.challengeEntries.set(id, entry);
    return entry;
  }
  
  async updateChallengeEntryRank(id: number, rank: number): Promise<ChallengeEntry | undefined> {
    const entry = await this.getChallengeEntry(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, rank };
    this.challengeEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  // Notifications
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }
  
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const now = new Date();
    const notification: Notification = {
      ...insertNotification,
      id,
      isRead: false,
      createdAt: now
    };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = await this.getNotification(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
}

export const storage = new MemStorage();
