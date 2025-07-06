import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
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
  processingTime: number;
}
