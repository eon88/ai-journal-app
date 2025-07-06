import { 
  journalEntries, 
  userStats, 
  savedInsights,
  type JournalEntry, 
  type InsertJournalEntry,
  type UserStats,
  type InsertUserStats,
  type SavedInsight,
  type InsertSavedInsight,
  type AIReflection,
  type GrowthMetrics
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte, count } from "drizzle-orm";

export interface IStorage {
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  getAllJournalEntries(): Promise<JournalEntry[]>;
  getRecentJournalEntries(limit: number): Promise<JournalEntry[]>;
  getEntriesByDateRange(startDate: Date, endDate: Date): Promise<JournalEntry[]>;
  updateJournalEntryReflection(id: number, reflection: AIReflection): Promise<JournalEntry | undefined>;
  
  // Stats and gamification
  getUserStats(): Promise<UserStats>;
  updateUserStats(stats: Partial<UserStats>): Promise<UserStats>;
  calculateStreak(): Promise<{ currentStreak: number; longestStreak: number }>;
  getGrowthMetrics(): Promise<GrowthMetrics>;
  
  // Saved insights
  saveInsight(insight: InsertSavedInsight): Promise<SavedInsight>;
  getSavedInsights(): Promise<SavedInsight[]>;
  deleteSavedInsight(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await db
      .insert(journalEntries)
      .values({
        content: insertEntry.content,
        mood: insertEntry.mood || null,
        tags: insertEntry.tags || null,
      })
      .returning();
    
    // Update user stats
    await this.updateStatsOnNewEntry();
    
    return entry;
  }

  private async updateStatsOnNewEntry(): Promise<void> {
    const stats = await this.getUserStats();
    const streakData = await this.calculateStreak();
    
    // Award XP points: 10 for entry, bonus for streaks
    const baseXP = 10;
    const streakBonus = streakData.currentStreak > 1 ? streakData.currentStreak * 2 : 0;
    const newXP = stats.xpPoints + baseXP + streakBonus;
    
    await this.updateUserStats({
      totalEntries: stats.totalEntries + 1,
      currentStreak: streakData.currentStreak,
      longestStreak: Math.max(stats.longestStreak, streakData.longestStreak),
      xpPoints: newXP,
      lastEntryDate: new Date(),
    });
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry || undefined;
  }

  async getAllJournalEntries(): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries).orderBy(desc(journalEntries.createdAt));
  }

  async getRecentJournalEntries(limit: number): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries)
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit);
  }

  async getEntriesByDateRange(startDate: Date, endDate: Date): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries)
      .where(and(
        gte(journalEntries.createdAt, startDate),
        lte(journalEntries.createdAt, endDate)
      ))
      .orderBy(desc(journalEntries.createdAt));
  }

  async updateJournalEntryReflection(id: number, reflection: AIReflection): Promise<JournalEntry | undefined> {
    const [updatedEntry] = await db
      .update(journalEntries)
      .set({ aiReflection: reflection })
      .where(eq(journalEntries.id, id))
      .returning();
    return updatedEntry || undefined;
  }

  async getUserStats(): Promise<UserStats> {
    let [stats] = await db.select().from(userStats).limit(1);
    
    if (!stats) {
      // Initialize stats for first time user
      [stats] = await db.insert(userStats).values({
        totalEntries: 0,
        currentStreak: 0,
        longestStreak: 0,
        xpPoints: 0,
      }).returning();
    }
    
    return stats;
  }

  async updateUserStats(updateData: Partial<UserStats>): Promise<UserStats> {
    const currentStats = await this.getUserStats();
    
    const [updatedStats] = await db
      .update(userStats)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(userStats.id, currentStats.id))
      .returning();
      
    return updatedStats;
  }

  async calculateStreak(): Promise<{ currentStreak: number; longestStreak: number }> {
    const entries = await db.select({
      createdAt: journalEntries.createdAt
    }).from(journalEntries).orderBy(desc(journalEntries.createdAt));

    if (entries.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    // Check if there's an entry today or yesterday to start streak
    const latestEntry = entries[0];
    const latestDate = new Date(latestEntry.createdAt);
    const daysDiff = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) {
      currentStreak = 1;
      
      // Calculate consecutive days
      for (let i = 1; i < entries.length; i++) {
        const currentDate = new Date(entries[i-1].createdAt);
        const prevDate = new Date(entries[i].createdAt);
        const diff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diff === 1) {
          currentStreak++;
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, currentStreak, tempStreak);
    
    return { currentStreak, longestStreak };
  }

  async getGrowthMetrics(): Promise<GrowthMetrics> {
    const stats = await this.getUserStats();
    const entries = await this.getAllJournalEntries();
    
    // Calculate mood trends
    const moodCounts: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }
    });
    
    const moodTrends = Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / entries.length) * 100)
    }));

    // Calculate theme frequency (from tags)
    const themeCounts: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.tags) {
        entry.tags.forEach(tag => {
          themeCounts[tag] = (themeCounts[tag] || 0) + 1;
        });
      }
    });
    
    const commonThemes = Object.entries(themeCounts)
      .map(([theme, frequency]) => ({ theme, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // Calculate writing frequency by day
    const writingFrequency = entries.reduce((acc: Record<string, number>, entry) => {
      const date = new Date(entry.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const writingFrequencyArray = Object.entries(writingFrequency)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalEntries: stats.totalEntries,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      xpPoints: stats.xpPoints,
      moodTrends,
      commonThemes,
      writingFrequency: writingFrequencyArray,
    };
  }

  async saveInsight(insight: InsertSavedInsight): Promise<SavedInsight> {
    const [savedInsight] = await db
      .insert(savedInsights)
      .values(insight)
      .returning();
    return savedInsight;
  }

  async getSavedInsights(): Promise<SavedInsight[]> {
    return await db.select().from(savedInsights).orderBy(desc(savedInsights.createdAt));
  }

  async deleteSavedInsight(id: number): Promise<void> {
    await db.delete(savedInsights).where(eq(savedInsights.id, id));
  }
}

export const storage = new DatabaseStorage();
