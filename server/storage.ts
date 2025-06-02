import { users, csatData, adSettings, errorLogs, toolSettings, apiTokens, queryLogs, serverSettings, type User, type InsertUser, type CsatData, type InsertCsatData, type AdSettings, type InsertAdSettings, type ErrorLog, type InsertErrorLog, type ToolSettings, type InsertToolSettings, type ApiToken, type InsertApiToken, type QueryLog, type InsertQueryLog, type ServerSettings, type InsertServerSettings } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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
  
  // Tool settings methods
  getToolSettings(): Promise<ToolSettings | undefined>;
  updateToolSettings(settings: InsertToolSettings): Promise<ToolSettings>;
  
  // API token methods
  createApiToken(token: InsertApiToken): Promise<ApiToken>;
  getApiTokens(): Promise<ApiToken[]>;
  getApiToken(token: string): Promise<ApiToken | undefined>;
  updateApiToken(id: number, data: Partial<InsertApiToken>): Promise<ApiToken>;
  deleteApiToken(id: number): Promise<void>;
  
  // Query log methods
  logQuery(log: InsertQueryLog): Promise<QueryLog>;
  getQueryStats(): Promise<{ toolType: string; count: number }[]>;
  
  // Server settings methods
  getServerSettings(): Promise<ServerSettings | undefined>;
  updateServerSettings(settings: InsertServerSettings): Promise<ServerSettings>;
  
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

  async getToolSettings(): Promise<ToolSettings | undefined> {
    const [settings] = await db.select().from(toolSettings).limit(1);
    return settings || undefined;
  }

  async updateToolSettings(settings: InsertToolSettings): Promise<ToolSettings> {
    const existing = await this.getToolSettings();
    
    if (existing) {
      const [updated] = await db
        .update(toolSettings)
        .set(settings)
        .where(eq(toolSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(toolSettings)
        .values(settings)
        .returning();
      return created;
    }
  }

  async createApiToken(token: InsertApiToken): Promise<ApiToken> {
    const [created] = await db
      .insert(apiTokens)
      .values(token)
      .returning();
    return created;
  }

  async getApiTokens(): Promise<ApiToken[]> {
    return await db.select().from(apiTokens).orderBy(desc(apiTokens.createdAt));
  }

  async getApiToken(token: string): Promise<ApiToken | undefined> {
    const [apiToken] = await db.select().from(apiTokens).where(eq(apiTokens.token, token));
    return apiToken || undefined;
  }

  async updateApiToken(id: number, data: Partial<InsertApiToken>): Promise<ApiToken> {
    const [updated] = await db
      .update(apiTokens)
      .set(data)
      .where(eq(apiTokens.id, id))
      .returning();
    return updated;
  }

  async deleteApiToken(id: number): Promise<void> {
    await db.delete(apiTokens).where(eq(apiTokens.id, id));
  }

  async logQuery(log: InsertQueryLog): Promise<QueryLog> {
    const [created] = await db
      .insert(queryLogs)
      .values(log)
      .returning();
    return created;
  }

  async getQueryStats(): Promise<{ toolType: string; count: number }[]> {
    const stats = await db
      .select({
        toolType: queryLogs.toolType,
        count: queryLogs.id
      })
      .from(queryLogs);
    
    const groupedStats: { [key: string]: number } = {};
    stats.forEach(stat => {
      groupedStats[stat.toolType] = (groupedStats[stat.toolType] || 0) + 1;
    });
    
    return Object.entries(groupedStats).map(([toolType, count]) => ({
      toolType,
      count
    }));
  }

  async getServerSettings(): Promise<ServerSettings | undefined> {
    const [settings] = await db.select().from(serverSettings).limit(1);
    return settings || undefined;
  }

  async updateServerSettings(settings: InsertServerSettings): Promise<ServerSettings> {
    const existing = await this.getServerSettings();
    
    if (existing) {
      const [updated] = await db
        .update(serverSettings)
        .set(settings)
        .where(eq(serverSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(serverSettings)
        .values(settings)
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
