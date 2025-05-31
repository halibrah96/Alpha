import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCsatDataSchema, insertAdSettingsSchema, insertErrorLogSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        await storage.logError({
          type: "AUTH_ERROR",
          message: `Failed login attempt for username: ${username}`
        });
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ message: "Login successful", user: { id: user.id, username: user.username } });
    } catch (error) {
      await storage.logError({
        type: "SERVER_ERROR",
        message: `Login error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // CSAT data endpoints
  app.post("/api/csat/save", async (req, res) => {
    try {
      const validatedData = insertCsatDataSchema.parse(req.body);
      const savedData = await storage.saveCsatData(validatedData);
      res.json(savedData);
    } catch (error) {
      await storage.logError({
        type: "VALIDATION_ERROR",
        message: `CSAT data validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      res.status(400).json({ message: "Invalid CSAT data" });
    }
  });

  app.get("/api/csat/latest", async (req, res) => {
    try {
      const latestData = await storage.getLatestCsatData();
      res.json(latestData || null);
    } catch (error) {
      await storage.logError({
        type: "SERVER_ERROR",
        message: `Failed to fetch latest CSAT data: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      res.status(500).json({ message: "Failed to fetch data" });
    }
  });

  // Ad settings endpoints
  app.get("/api/ads/settings", async (req, res) => {
    try {
      const settings = await storage.getAdSettings();
      res.json(settings);
    } catch (error) {
      await storage.logError({
        type: "SERVER_ERROR",
        message: `Failed to fetch ad settings: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      res.status(500).json({ message: "Failed to fetch ad settings" });
    }
  });

  app.put("/api/ads/settings", async (req, res) => {
    try {
      const validatedSettings = insertAdSettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateAdSettings(validatedSettings);
      res.json(updatedSettings);
    } catch (error) {
      await storage.logError({
        type: "VALIDATION_ERROR",
        message: `Ad settings validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      res.status(400).json({ message: "Invalid ad settings" });
    }
  });

  // Error log endpoints
  app.post("/api/logs/error", async (req, res) => {
    try {
      const validatedError = insertErrorLogSchema.parse(req.body);
      const loggedError = await storage.logError(validatedError);
      res.json(loggedError);
    } catch (error) {
      res.status(400).json({ message: "Invalid error log data" });
    }
  });

  app.get("/api/logs/errors", async (req, res) => {
    try {
      const logs = await storage.getErrorLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch error logs" });
    }
  });

  app.delete("/api/logs/errors", async (req, res) => {
    try {
      await storage.clearErrorLogs();
      res.json({ message: "Error logs cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear error logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
