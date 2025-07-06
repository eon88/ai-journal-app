import { journalEntries, type JournalEntry, type InsertJournalEntry, type AIReflection } from "@shared/schema";

export interface IStorage {
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  getAllJournalEntries(): Promise<JournalEntry[]>;
  getRecentJournalEntries(limit: number): Promise<JournalEntry[]>;
  updateJournalEntryReflection(id: number, reflection: AIReflection): Promise<JournalEntry | undefined>;
}

export class MemStorage implements IStorage {
  private entries: Map<number, JournalEntry>;
  private currentId: number;

  constructor() {
    this.entries = new Map();
    this.currentId = 1;
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.currentId++;
    const entry: JournalEntry = {
      ...insertEntry,
      id,
      aiReflection: null,
      createdAt: new Date(),
    };
    this.entries.set(id, entry);
    return entry;
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    return this.entries.get(id);
  }

  async getAllJournalEntries(): Promise<JournalEntry[]> {
    return Array.from(this.entries.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getRecentJournalEntries(limit: number): Promise<JournalEntry[]> {
    const allEntries = await this.getAllJournalEntries();
    return allEntries.slice(0, limit);
  }

  async updateJournalEntryReflection(id: number, reflection: AIReflection): Promise<JournalEntry | undefined> {
    const entry = this.entries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, aiReflection: reflection };
    this.entries.set(id, updatedEntry);
    return updatedEntry;
  }
}

export const storage = new MemStorage();
