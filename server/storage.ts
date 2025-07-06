import { journalEntries, type JournalEntry, type InsertJournalEntry, type AIReflection } from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, lte, and } from "drizzle-orm";

export interface IStorage {
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  getAllJournalEntries(): Promise<JournalEntry[]>;
  getRecentJournalEntries(limit: number): Promise<JournalEntry[]>;
  getEntriesByDateRange(startDate: Date, endDate: Date): Promise<JournalEntry[]>;
  updateJournalEntryReflection(id: number, reflection: AIReflection): Promise<JournalEntry | undefined>;
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
    return entry;
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
}

export const storage = new DatabaseStorage();
