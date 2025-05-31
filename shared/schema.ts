import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const csatData = pgTable("csat_data", {
  id: serial("id").primaryKey(),
  rating1: integer("rating1").notNull().default(0),
  rating2: integer("rating2").notNull().default(0),
  rating3: integer("rating3").notNull().default(0),
  rating4: integer("rating4").notNull().default(0),
  rating5: integer("rating5").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adSettings = pgTable("ad_settings", {
  id: serial("id").primaryKey(),
  intrusiveAdsEnabled: boolean("intrusive_ads_enabled").notNull().default(true),
  bannerAdsEnabled: boolean("banner_ads_enabled").notNull().default(true),
  adFrequency: integer("ad_frequency").notNull().default(5),
  googleAdsId: text("google_ads_id"),
});

export const errorLogs = pgTable("error_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCsatDataSchema = createInsertSchema(csatData).pick({
  rating1: true,
  rating2: true,
  rating3: true,
  rating4: true,
  rating5: true,
});

export const insertAdSettingsSchema = createInsertSchema(adSettings).pick({
  intrusiveAdsEnabled: true,
  bannerAdsEnabled: true,
  adFrequency: true,
  googleAdsId: true,
});

export const insertErrorLogSchema = createInsertSchema(errorLogs).pick({
  type: true,
  message: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type CsatData = typeof csatData.$inferSelect;
export type InsertCsatData = z.infer<typeof insertCsatDataSchema>;
export type AdSettings = typeof adSettings.$inferSelect;
export type InsertAdSettings = z.infer<typeof insertAdSettingsSchema>;
export type ErrorLog = typeof errorLogs.$inferSelect;
export type InsertErrorLog = z.infer<typeof insertErrorLogSchema>;
