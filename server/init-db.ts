import { db } from "./db";
import { users, adSettings } from "@shared/schema";

async function initializeDatabase() {
  try {
    // Check if admin user exists
    const existingAdmin = await db.select().from(users).limit(1);
    
    if (existingAdmin.length === 0) {
      // Create default admin user
      await db.insert(users).values({
        username: "admin",
        password: "admin123"
      });
      console.log("Default admin user created");
    }

    // Check if ad settings exist
    const existingSettings = await db.select().from(adSettings).limit(1);
    
    if (existingSettings.length === 0) {
      // Create default ad settings
      await db.insert(adSettings).values({
        intrusiveAdsEnabled: true,
        bannerAdsEnabled: true,
        adFrequency: 5,
        googleAdsId: null
      });
      console.log("Default ad settings created");
    }

    console.log("Database initialization complete");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
}

export { initializeDatabase };