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

export const toolSettings = pgTable("tool_settings", {
  id: serial("id").primaryKey(),
  csatEnabled: boolean("csat_enabled").notNull().default(true),
  ocrEnabled: boolean("ocr_enabled").notNull().default(true),
  dnsEnabled: boolean("dns_enabled").notNull().default(true),
  emailHealthEnabled: boolean("email_health_enabled").notNull().default(true),
});

export const apiTokens = pgTable("api_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  name: text("name").notNull(),
  permissions: text("permissions").array().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsed: timestamp("last_used"),
});

export const queryLogs = pgTable("query_logs", {
  id: serial("id").primaryKey(),
  toolType: text("tool_type").notNull(),
  queryData: text("query_data"),
  responseData: text("response_data"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
  apiToken: text("api_token"),
});

export const serverSettings = pgTable("server_settings", {
  id: serial("id").primaryKey(),
  supportEmail: text("support_email").default("support@example.com"),
  aboutText: text("about_text").default("Professional tool suite for business analytics"),
  privacyPolicyUrl: text("privacy_policy_url"),
  termsOfServiceUrl: text("terms_of_service_url"),
  gdprCompliant: boolean("gdpr_compliant").notNull().default(true),
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

export const insertToolSettingsSchema = createInsertSchema(toolSettings).pick({
  csatEnabled: true,
  ocrEnabled: true,
  dnsEnabled: true,
  emailHealthEnabled: true,
});

export const insertApiTokenSchema = createInsertSchema(apiTokens).pick({
  token: true,
  name: true,
  permissions: true,
  isActive: true,
});

export const insertQueryLogSchema = createInsertSchema(queryLogs).pick({
  toolType: true,
  queryData: true,
  responseData: true,
  ipAddress: true,
  userAgent: true,
  apiToken: true,
});

export const insertServerSettingsSchema = createInsertSchema(serverSettings).pick({
  supportEmail: true,
  aboutText: true,
  privacyPolicyUrl: true,
  termsOfServiceUrl: true,
  gdprCompliant: true,
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
export type ToolSettings = typeof toolSettings.$inferSelect;
export type InsertToolSettings = z.infer<typeof insertToolSettingsSchema>;
export type ApiToken = typeof apiTokens.$inferSelect;
export type InsertApiToken = z.infer<typeof insertApiTokenSchema>;
export type QueryLog = typeof queryLogs.$inferSelect;
export type InsertQueryLog = z.infer<typeof insertQueryLogSchema>;
export type ServerSettings = typeof serverSettings.$inferSelect;
export type InsertServerSettings = z.infer<typeof insertServerSettingsSchema>;
export type ErrorLog = typeof errorLogs.$inferSelect;
export type InsertErrorLog = z.infer<typeof insertErrorLogSchema>;
