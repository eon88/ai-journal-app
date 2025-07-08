import { pgTable, text, serial, timestamp, jsonb, integer, boolean, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  aiReflection: jsonb("ai_reflection"),
  mood: text("mood"),
  tags: text("tags").array(),
  type: text("type"), // task, note, insight, event, etc.
  status: text("status"), // pending, done, migrated, scheduled for applicable types
  symbol: text("symbol"), // the actual symbol used (→, ✓, 💡, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  content: true,
  mood: true,
  tags: true,
  type: true,
  status: true,
  symbol: true,
}).partial({
  type: true,
  status: true,
  symbol: true,
});

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

// Bullet Symbol System
export const BULLET_SYMBOLS = {
  "→": { type: "task", status: "pending", name: "Task" },
  "✓": { type: "task", status: "done", name: "Completed Task" },
  ">>": { type: "task", status: "migrated", name: "Migrated Task" },
  "📅": { type: "scheduled", status: "pending", name: "Scheduled" },
  "★": { type: "event", status: "pending", name: "Event" },
  "✎": { type: "note", status: "none", name: "Note" },
  "💡": { type: "insight", status: "none", name: "Insight" },
  "⚠️": { type: "priority", status: "pending", name: "Priority" },
} as const;

export type BulletSymbol = keyof typeof BULLET_SYMBOLS;
export type EntryType = typeof BULLET_SYMBOLS[BulletSymbol]["type"];
export type EntryStatus = typeof BULLET_SYMBOLS[BulletSymbol]["status"];

// Utility function to parse bullet symbols from entry content
export function parseBulletSymbol(content: string): {
  symbol: BulletSymbol | null;
  type: EntryType | null;
  status: EntryStatus | null;
  cleanContent: string;
} {
  const trimmedContent = content.trim();
  
  // Check for bullet symbols at the start of the content
  for (const [symbol, config] of Object.entries(BULLET_SYMBOLS)) {
    if (trimmedContent.startsWith(symbol)) {
      const cleanContent = trimmedContent.slice(symbol.length).trim();
      return {
        symbol: symbol as BulletSymbol,
        type: config.type,
        status: config.status,
        cleanContent
      };
    }
  }
  
  // No bullet symbol found
  return {
    symbol: null,
    type: null,
    status: null,
    cleanContent: trimmedContent
  };
}

export interface AIReflection {
  insights: string;
  reflectionQuestion: string;
  growthPattern: string;
  processingTime: number;
}

export interface WeeklyReflection {
  weekStart: string;
  weekEnd: string;
  entryCount: number;
  dominantMoods: string[];
  commonThemes: string;
  growthObservations: string;
  weeklyInsight: string;
  directionAndMomentum: string;
  emergingGoals: string[];
  goalProgressAssessment?: string; // Premium feature: AI assessment of progress toward user goals
  processingTime: number;
}

export interface MonthlyReflection {
  month: string;
  year: number;
  entryCount: number;
  moodTrends: string;
  keyThemes: string;
  growthJourney: string;
  monthlyWisdom: string;
  lifeDirection: string;
  emergingGoals: string[];
  goalAchievementSuggestions: string[];
  goalProgressAssessment?: string; // Premium feature: AI assessment of progress toward user goals
  processingTime: number;
}

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  totalEntries: integer("total_entries").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  xpPoints: integer("xp_points").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  title: text("title").default("Reflective Wanderer").notNull(),
  moodMasteryScore: integer("mood_mastery_score").default(0).notNull(),
  lastEntryDate: timestamp("last_entry_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  requirement: text("requirement").notNull(),
  xpReward: integer("xp_reward").default(0).notNull(),
  unlockedAt: timestamp("unlocked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD format
  title: text("title").notNull(),
  description: text("description").notNull(),
  prompt: text("prompt").notNull(),
  xpReward: integer("xp_reward").default(15).notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedInsights = pgTable("saved_insights", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // 'insight', 'lesson', 'goal'
  source: text("source").notNull(), // 'daily', 'weekly', 'monthly'
  entryId: integer("entry_id").references(() => journalEntries.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User accounts table for subscription management
export const userAccounts = pgTable("user_accounts", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  accountType: text("account_type").notNull().default("free_beta"), // 'free_beta', 'paid', 'trial'
  subscriptionStatus: text("subscription_status").default("active"), // 'active', 'canceled', 'past_due', 'incomplete'
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  trialEndDate: timestamp("trial_end_date"),
  betaAccessGranted: boolean("beta_access_granted").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // price in cents
  currency: text("currency").default("usd").notNull(),
  interval: text("interval").notNull(), // 'month', 'year'
  stripePriceId: varchar("stripe_price_id", { length: 255 }).notNull(),
  features: text("features").array().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User goals table for paid subscribers
export const userGoals = pgTable("user_goals", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  targetDate: timestamp("target_date"),
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, completed, paused
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // low, medium, high
  progressNotes: text("progress_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;

export type SavedInsight = typeof savedInsights.$inferSelect;
export type InsertSavedInsight = typeof savedInsights.$inferInsert;

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = typeof dailyChallenges.$inferInsert;

export type UserAccount = typeof userAccounts.$inferSelect;
export type InsertUserAccount = typeof userAccounts.$inferInsert;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

export type UserGoal = typeof userGoals.$inferSelect;
export type InsertUserGoal = typeof userGoals.$inferInsert;

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for simple auth
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 50 }),
  lastName: varchar("last_name", { length: 50 }),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).default("user").notNull(), // 'admin' or 'user'
  hasCompletedQuestionnaire: boolean("has_completed_questionnaire").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export interface GrowthMetrics {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  xpPoints: number;
  moodTrends: Array<{ mood: string; count: number; percentage: number }>;
  commonThemes: Array<{ theme: string; frequency: number }>;
  writingFrequency: Array<{ date: string; count: number }>;
}

// Forum tables
export const forumCategories = pgTable("forum_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  color: varchar("color", { length: 50 }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => forumCategories.id).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  replyCount: integer("reply_count").default(0).notNull(),
  lastReplyAt: timestamp("last_reply_at"),
  lastReplyBy: integer("last_reply_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  postId: integer("post_id").references(() => forumPosts.id).notNull(),
  parentReplyId: integer("parent_reply_id").references(() => forumReplies.id),
  likeCount: integer("like_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const forumLikes = pgTable("forum_likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  postId: integer("post_id").references(() => forumPosts.id),
  replyId: integer("reply_id").references(() => forumReplies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ForumCategory = typeof forumCategories.$inferSelect;
export type InsertForumCategory = typeof forumCategories.$inferInsert;

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = typeof forumPosts.$inferInsert;

export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = typeof forumReplies.$inferInsert;

export type ForumLike = typeof forumLikes.$inferSelect;
export type InsertForumLike = typeof forumLikes.$inferInsert;
