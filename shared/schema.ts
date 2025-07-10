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
  isPinned: boolean("is_pinned").default(false),
  folderId: integer("folder_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  content: true,
  mood: true,
  tags: true,
  type: true,
  status: true,
  symbol: true,
  isPinned: true,
  folderId: true,
}).partial({
  type: true,
  status: true,
  symbol: true,
  isPinned: true,
  folderId: true,
});

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

// Bullet Symbol System
export const BULLET_SYMBOLS = {
  "•": { type: "task", status: "pending", name: "Task" },
  "✔": { type: "task", status: "done", name: "Completed task" },
  "→": { type: "task", status: "migrated", name: "Moved/rescheduled task" },
  "✖": { type: "task", status: "cancelled", name: "Canceled task" },
  "○": { type: "event", status: "pending", name: "Event or appointment" },
  "★": { type: "priority", status: "pending", name: "Important item" },
  "–": { type: "note", status: "none", name: "Note or observation" },
  "❓": { type: "question", status: "pending", name: "Question or needs clarification" },
  "🪶": { type: "insight", status: "none", name: "Insight or realization" },
  "🌱": { type: "growth", status: "none", name: "Growth opportunity" },
  "🎯": { type: "goal", status: "pending", name: "Goal or focus" },
  "🧭": { type: "direction", status: "none", name: "Daily direction or theme" },
  "🔥": { type: "motivation", status: "none", name: "Motivating quote or idea" },
  "🏆": { type: "achievement", status: "done", name: "Achievement or milestone" },
  "🧙": { type: "prompt", status: "none", name: "Prompt from Merlin" },
  "📸": { type: "media", status: "none", name: "Photo attached" },
  "📌": { type: "pinned", status: "none", name: "Pinned/important entry" },
  "🧩": { type: "pattern", status: "none", name: "Part of a recurring pattern" },
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
  userId: integer("user_id").references(() => users.id).notNull(),
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
  userId: integer("user_id").references(() => users.id).notNull(),
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
  status: text("status").default("not_started").notNull(), // 'not_started', 'accepted', 'completed'
  acceptedAt: timestamp("accepted_at"),
  completedAt: timestamp("completed_at"),
  acceptedUserId: integer("accepted_user_id").references(() => users.id), // Track which user accepted
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedInsights = pgTable("saved_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
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
  userId: integer("user_id").references(() => users.id).notNull(),
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
  displayName: varchar("display_name", { length: 100 }),
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
// Forum moderators table
export const forumModerators = pgTable("forum_moderators", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  assignedBy: integer("assigned_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

// Custom folders for organizing journal entries
export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 20 }).default("#3B82F6"), // hex color for folder icon
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFolderSchema = createInsertSchema(folders).pick({
  name: true,
  color: true,
});

export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Folder = typeof folders.$inferSelect;

// Forum rank hierarchy based on XP points
export interface ForumRank {
  id: number;
  name: string;
  minXP: number;
  maxXP: number;
  color: string;
  icon: string;
  badge: string;
  description: string;
}

export const FORUM_RANKS: ForumRank[] = [
  {
    id: 1,
    name: "Wanderer",
    minXP: 0,
    maxXP: 99,
    color: "#94A3B8", // gray
    icon: "🚶",
    badge: "🌱",
    description: "Just beginning their journey of self-discovery"
  },
  {
    id: 2,
    name: "Seeker",
    minXP: 100,
    maxXP: 299,
    color: "#84CC16", // lime
    icon: "🔍",
    badge: "🌿",
    description: "Actively exploring thoughts and emotions"
  },
  {
    id: 3,
    name: "Student",
    minXP: 300,
    maxXP: 599,
    color: "#06B6D4", // cyan
    icon: "📖",
    badge: "💭",
    description: "Learning and absorbing life lessons"
  },
  {
    id: 4,
    name: "Climber",
    minXP: 600,
    maxXP: 999,
    color: "#8B5CF6", // violet
    icon: "⛰️",
    badge: "📚",
    description: "Steadily ascending towards greater understanding"
  },
  {
    id: 5,
    name: "Builder",
    minXP: 1000,
    maxXP: 1499,
    color: "#F59E0B", // amber
    icon: "🔨",
    badge: "⚡",
    description: "Constructing a solid foundation for growth"
  },
  {
    id: 6,
    name: "Navigator",
    minXP: 1500,
    maxXP: 2099,
    color: "#DC2626", // red
    icon: "🧭",
    badge: "🗺️",
    description: "Charting their course with purpose and direction"
  },
  {
    id: 7,
    name: "Architect",
    minXP: 2100,
    maxXP: 2799,
    color: "#7C3AED", // purple
    icon: "🏗️",
    badge: "📐",
    description: "Masterfully designing their life path"
  },
  {
    id: 8,
    name: "Guardian",
    minXP: 2800,
    maxXP: 4999,
    color: "#BE185D", // pink
    icon: "🛡️",
    badge: "🌟",
    description: "Protecting and nurturing wisdom within the community"
  },
  {
    id: 9,
    name: "Sage",
    minXP: 5000,
    maxXP: 9999,
    color: "#059669", // emerald
    icon: "🧙",
    badge: "👑",
    description: "Embodying deep wisdom and guiding others"
  },
  {
    id: 10,
    name: "Legendary Oracle",
    minXP: 10000,
    maxXP: Infinity,
    color: "#DC2626", // red with gold accent
    icon: "🏆",
    badge: "🏆",
    description: "A legendary figure whose wisdom transcends ordinary understanding"
  }
];

// Function to get forum rank based on XP
export function getForumRank(xpPoints: number): ForumRank {
  return FORUM_RANKS.find(rank => xpPoints >= rank.minXP && xpPoints <= rank.maxXP) || FORUM_RANKS[0];
}

// Function to get next rank and XP needed
export function getNextRank(xpPoints: number): { nextRank: ForumRank | null; xpNeeded: number } {
  const currentRank = getForumRank(xpPoints);
  const nextRankIndex = FORUM_RANKS.findIndex(rank => rank.id === currentRank.id) + 1;
  
  if (nextRankIndex >= FORUM_RANKS.length) {
    return { nextRank: null, xpNeeded: 0 }; // Already at max rank
  }
  
  const nextRank = FORUM_RANKS[nextRankIndex];
  const xpNeeded = nextRank.minXP - xpPoints;
  
  return { nextRank, xpNeeded };
}

// Progressive Gamification System
export const PROGRESSIVE_GAMIFICATION_ENABLED = true;

// Feature unlock configuration based on levels
export interface FeatureUnlock {
  level: number;
  features: string[];
  description: string;
  motivation: string;
}

export const LEVEL_UNLOCKS: FeatureUnlock[] = [
  {
    level: 1, // Wanderer (0-99 XP)
    features: [
      'journal_entries_30',
      'basic_symbols_5',
      'mood_tracker_5',
      'daily_quote',
      'daily_challenge_1',
      'streak_tracker',
      'xp_tracking'
    ],
    description: "Journal entry cap: 30 entries, 5 basic symbols, 5 moods, daily quote & challenge",
    motivation: "You've begun your journey. Every step forward is progress."
  },
  {
    level: 2, // Seeker (100-299 XP)
    features: [
      'xp_bonus_3day',
      'ai_reflection_weekly',
      'mood_history',
      'insights_vault',
      'symbols_8'
    ],
    description: "AI reflections, mood history, insights vault, more symbols",
    motivation: "There's more to discover inside you. Keep exploring."
  },
  {
    level: 3, // Student (300-599 XP)
    features: [
      'mood_tracker_10',
      'pin_entries',
      'basic_folders',
      'challenge_sequences',
      'badge_cabinet'
    ],
    description: "Full mood tracker, pinning, folders, challenge sequences",
    motivation: "You're learning the language of your inner world."
  },
  {
    level: 4, // Climber (600-999 XP)
    features: [
      'streak_badges',
      'ai_reflection_weekly_reports',
      'mood_trends_graph',
      'folder_customization'
    ],
    description: "Weekly AI reports, mood trends, folder customization",
    motivation: "You're getting stronger. Your mind has muscles now."
  },
  {
    level: 5, // Builder (1000-1499 XP)
    features: [
      'unlimited_entries',
      'all_symbols_18',
      'daily_challenges_3',
      'pattern_recognition_ai',
      'prompt_library'
    ],
    description: "Unlimited entries, all symbols, pattern recognition, prompts",
    motivation: "You're building your inner home. One word at a time."
  },
  {
    level: 6, // Navigator (1500-2099 XP)
    features: [
      'life_path_quiz',
      'advanced_search',
      'reflection_tags',
      'navigation_mode'
    ],
    description: "Life path quiz, advanced search, navigation mode",
    motivation: "You're not lost anymore. You have a compass now."
  },
  {
    level: 7, // Architect (2100-2799 XP)
    features: [
      'growth_dashboard',
      'custom_prompt_packs',
      'visual_themes',
      'long_term_vision'
    ],
    description: "Growth dashboard, custom prompts, themes, vision tracking",
    motivation: "You're not just living your life — you're designing it."
  },
  {
    level: 8, // Guardian (2800-4999 XP)
    features: [
      'forum_access',
      'leaderboard',
      'shareable_badges',
      'community_threads',
      'guardian_gate'
    ],
    description: "Forum access, leaderboard, community features",
    motivation: "You've seen what works. Now you help others rise."
  },
  {
    level: 9, // Sage (5000-9999 XP)
    features: [
      'merlin_prophecies',
      'legacy_view',
      'deep_prompts',
      'contribution_quests'
    ],
    description: "Merlin prophecies, legacy view, deep prompts, contributions",
    motivation: "You've gone deep. You've become a well others can drink from."
  },
  {
    level: 10, // Legendary Oracle (10000+ XP)
    features: [
      'secret_grove_theme',
      'oracle_forum',
      'custom_avatars',
      'solo_quests',
      'oracle_emblem'
    ],
    description: "Secret grove theme, oracle forum, avatars, solo quests",
    motivation: "You've become what you once sought. A voice that echoes."
  }
];

// Function to get unlocked features for a user level
export function getUnlockedFeatures(userLevel: number): string[] {
  if (!PROGRESSIVE_GAMIFICATION_ENABLED) {
    // Return all features if progressive system is disabled
    return LEVEL_UNLOCKS.flatMap(unlock => unlock.features);
  }
  
  return LEVEL_UNLOCKS
    .filter(unlock => unlock.level <= userLevel)
    .flatMap(unlock => unlock.features);
}

// Function to check if a specific feature is unlocked
export function isFeatureUnlocked(userLevel: number, featureName: string): boolean {
  if (!PROGRESSIVE_GAMIFICATION_ENABLED) return true;
  
  const unlockedFeatures = getUnlockedFeatures(userLevel);
  return unlockedFeatures.includes(featureName);
}

// Function to get next unlock information
export function getNextUnlock(userLevel: number): FeatureUnlock | null {
  const nextUnlock = LEVEL_UNLOCKS.find(unlock => unlock.level > userLevel);
  return nextUnlock || null;
}

// User progress tracking
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  currentLevel: integer("current_level").default(1).notNull(),
  unlockedFeatures: text("unlocked_features").array().default([]).notNull(),
  tokensEarned: integer("tokens_earned").default(0).notNull(),
  themesUnlocked: text("themes_unlocked").array().default([]).notNull(),
  activeTheme: varchar("active_theme", { length: 50 }).default("default"),
  lastLevelUp: timestamp("last_level_up"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

// Quest system for guided journeys
export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  questArc: varchar("quest_arc", { length: 50 }).notNull(), // "mountain_path", "blueprint_series", etc.
  level: integer("level").notNull(),
  steps: jsonb("steps").notNull(), // Array of quest steps
  rewards: jsonb("rewards").notNull(), // XP, tokens, badges, etc.
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userQuests = pgTable("user_quests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  questId: integer("quest_id").notNull().references(() => quests.id),
  status: varchar("status", { length: 20 }).default("active").notNull(), // active, completed, abandoned
  currentStep: integer("current_step").default(0).notNull(),
  progress: jsonb("progress"), // Step-specific progress data
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type Quest = typeof quests.$inferSelect;
export type InsertQuest = typeof quests.$inferInsert;
export type UserQuest = typeof userQuests.$inferSelect;
export type InsertUserQuest = typeof userQuests.$inferInsert;
