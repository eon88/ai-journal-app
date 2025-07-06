import { pgTable, text, serial, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  aiReflection: jsonb("ai_reflection"),
  mood: text("mood"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  content: true,
  mood: true,
  tags: true,
});

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

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
  processingTime: number;
}

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  totalEntries: integer("total_entries").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  xpPoints: integer("xp_points").default(0).notNull(),
  lastEntryDate: timestamp("last_entry_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;

export type SavedInsight = typeof savedInsights.$inferSelect;
export type InsertSavedInsight = typeof savedInsights.$inferInsert;

export interface GrowthMetrics {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  xpPoints: number;
  moodTrends: Array<{ mood: string; count: number; percentage: number }>;
  commonThemes: Array<{ theme: string; frequency: number }>;
  writingFrequency: Array<{ date: string; count: number }>;
}
