import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  bio: text("bio"),
  profileImage: text("profile_image"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  bio: true,
  profileImage: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const writings = pgTable("writings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  description: text("description").notNull(),
  coverImage: text("cover_image"),
  category: text("category").notNull(),
  tags: text("tags").array(),
  isFeatured: boolean("is_featured").default(false),
  readTime: integer("read_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWritingSchema = createInsertSchema(writings).pick({
  userId: true,
  title: true,
  content: true,
  description: true,
  coverImage: true,
  category: true,
  tags: true,
  readTime: true,
});

export type InsertWriting = z.infer<typeof insertWritingSchema>;
export type Writing = typeof writings.$inferSelect;

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  writingId: integer("writing_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  userId: true,
  writingId: true,
  content: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  writingId: integer("writing_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLikeSchema = createInsertSchema(likes).pick({
  userId: true,
  writingId: true,
});

export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Like = typeof likes.$inferSelect;

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  writingId: integer("writing_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).pick({
  userId: true,
  writingId: true,
});

export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull(),
  followingId: integer("following_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFollowSchema = createInsertSchema(follows).pick({
  followerId: true,
  followingId: true,
});

export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Follow = typeof follows.$inferSelect;

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  endDate: timestamp("end_date").notNull(),
  wordLimit: text("word_limit"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChallengeSchema = createInsertSchema(challenges).pick({
  title: true,
  description: true,
  endDate: true,
  wordLimit: true,
});

export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export const challengeEntries = pgTable("challenge_entries", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull(),
  writingId: integer("writing_id").notNull(),
  rank: integer("rank"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChallengeEntrySchema = createInsertSchema(challengeEntries).pick({
  challengeId: true,
  writingId: true,
  rank: true,
});

export type InsertChallengeEntry = z.infer<typeof insertChallengeEntrySchema>;
export type ChallengeEntry = typeof challengeEntries.$inferSelect;

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  type: true,
  message: true,
  metadata: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
