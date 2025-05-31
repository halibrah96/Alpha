import { users, csatData, adSettings, errorLogs, type User, type InsertUser, type CsatData, type InsertCsatData, type AdSettings, type InsertAdSettings, type ErrorLog, type InsertErrorLog } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private csatDataList: CsatData[];
  private currentAdSettings: AdSettings;
  private errorLogsList: ErrorLog[];
  private currentId: number;
  private currentCsatId: number;
  private currentLogId: number;

  constructor() {
    this.users = new Map();
    this.csatDataList = [];
    this.errorLogsList = [];
    this.currentId = 1;
    this.currentCsatId = 1;
    this.currentLogId = 1;
    
    // Initialize default ad settings
    this.currentAdSettings = {
      id: 1,
      intrusiveAdsEnabled: true,
      bannerAdsEnabled: true,
      adFrequency: 5,
      googleAdsId: null,
    };

    // Create default admin user
    this.createUser({ username: "admin", password: "admin123" });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveCsatData(data: InsertCsatData): Promise<CsatData> {
    const csatEntry: CsatData = {
      id: this.currentCsatId++,
      ...data,
      createdAt: new Date(),
    };
    this.csatDataList.push(csatEntry);
    return csatEntry;
  }

  async getLatestCsatData(): Promise<CsatData | undefined> {
    return this.csatDataList[this.csatDataList.length - 1];
  }

  async getAdSettings(): Promise<AdSettings | undefined> {
    return this.currentAdSettings;
  }

  async updateAdSettings(settings: InsertAdSettings): Promise<AdSettings> {
    this.currentAdSettings = {
      ...this.currentAdSettings,
      ...settings,
    };
    return this.currentAdSettings;
  }

  async logError(error: InsertErrorLog): Promise<ErrorLog> {
    const errorEntry: ErrorLog = {
      id: this.currentLogId++,
      ...error,
      timestamp: new Date(),
    };
    this.errorLogsList.push(errorEntry);
    return errorEntry;
  }

  async getErrorLogs(): Promise<ErrorLog[]> {
    return [...this.errorLogsList].reverse(); // Most recent first
  }

  async clearErrorLogs(): Promise<void> {
    this.errorLogsList = [];
  }
}

export const storage = new MemStorage();
