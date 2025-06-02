import { users, csatData, adSettings, errorLogs, type User, type InsertUser, type CsatData, type InsertCsatData, type AdSettings, type InsertAdSettings, type ErrorLog, type InsertErrorLog } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // CSAT data methods
  saveCsatData(data: InsertCsatData): Promise<CsatData>;
  getLatestCsatData(): Promise<CsatData | undefined>;
  
  // Ad settings methods
  getAdSettings(): Promise<AdSettings | undefined>;
  updateAdSettings(settings: InsertAdSettings): Promise<AdSettings>;
  
  // Error log methods
  logError(error: InsertErrorLog): Promise<ErrorLog>;
  getErrorLogs(): Promise<ErrorLog[]>;
  clearErrorLogs(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async saveCsatData(data: InsertCsatData): Promise<CsatData> {
    const [csatEntry] = await db
      .insert(csatData)
      .values(data)
      .returning();
    return csatEntry;
  }

  async getLatestCsatData(): Promise<CsatData | undefined> {
    const [latest] = await db
      .select()
      .from(csatData)
      .orderBy(csatData.createdAt)
      .limit(1);
    return latest || undefined;
  }

  async getAdSettings(): Promise<AdSettings | undefined> {
    const [settings] = await db.select().from(adSettings).limit(1);
    return settings || undefined;
  }

  async updateAdSettings(settings: InsertAdSettings): Promise<AdSettings> {
    // Try to update existing settings first
    const existing = await this.getAdSettings();
    
    if (existing) {
      const [updated] = await db
        .update(adSettings)
        .set(settings)
        .where(eq(adSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new settings if none exist
      const [created] = await db
        .insert(adSettings)
        .values(settings)
        .returning();
      return created;
    }
  }

  async logError(error: InsertErrorLog): Promise<ErrorLog> {
    const [errorEntry] = await db
      .insert(errorLogs)
      .values(error)
      .returning();
    return errorEntry;
  }

  async getErrorLogs(): Promise<ErrorLog[]> {
    return await db
      .select()
      .from(errorLogs)
      .orderBy(errorLogs.timestamp);
  }

  async clearErrorLogs(): Promise<void> {
    await db.delete(errorLogs);
  }
}

export const storage = new DatabaseStorage();
