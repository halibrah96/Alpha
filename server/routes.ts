import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCsatDataSchema, insertAdSettingsSchema, insertErrorLogSchema, insertToolSettingsSchema, insertApiTokenSchema, insertServerSettingsSchema } from "@shared/schema";
import multer from "multer";
import Tesseract from "tesseract.js";
import { randomBytes } from "crypto";
import dns from "dns";
import { promisify } from "util";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const resolveTxt = promisify(dns.resolveTxt);
const resolveMx = promisify(dns.resolveMx);

// API token verification middleware
const verifyApiToken = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: "API token required" });
  }

  try {
    const apiToken = await storage.getApiToken(token);
    if (!apiToken || !apiToken.isActive) {
      return res.status(401).json({ message: "Invalid or inactive API token" });
    }

    // Update last used timestamp
    await storage.updateApiToken(apiToken.id, { lastUsed: new Date() });
    req.apiToken = apiToken;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid API token" });
  }
};

// Query logging middleware
const logQuery = (toolType: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      await storage.logQuery({
        toolType,
        queryData: JSON.stringify(req.body),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        apiToken: req.apiToken?.token || null
      });
    } catch (error) {
      console.error('Failed to log query:', error);
    }
    next();
  };
};

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

  // Tool settings endpoints
  app.get("/api/tools/settings", async (req, res) => {
    try {
      const settings = await storage.getToolSettings();
      res.json(settings || {
        csatEnabled: true,
        ocrEnabled: true,
        dnsEnabled: true,
        emailHealthEnabled: true
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tool settings" });
    }
  });

  app.put("/api/tools/settings", async (req, res) => {
    try {
      const validatedSettings = insertToolSettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateToolSettings(validatedSettings);
      res.json(updatedSettings);
    } catch (error) {
      res.status(400).json({ message: "Invalid tool settings" });
    }
  });

  // Query statistics endpoint
  app.get("/api/stats/queries", async (req, res) => {
    try {
      const stats = await storage.getQueryStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch query statistics" });
    }
  });

  // OCR processing endpoint
  app.post("/api/ocr/process", upload.single('image'), logQuery('ocr'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const result = await Tesseract.recognize(req.file.buffer, 'eng', {
        logger: () => {} // Disable logging
      });

      res.json({ 
        text: result.data.text,
        confidence: result.data.confidence
      });
    } catch (error) {
      await storage.logError({
        type: "OCR_ERROR",
        message: `OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      res.status(500).json({ message: "Failed to process image" });
    }
  });

  // DNS analysis endpoint
  app.post("/api/dns/analyze", logQuery('dns'), async (req, res) => {
    try {
      const { domain } = req.body;
      if (!domain) {
        return res.status(400).json({ message: "Domain is required" });
      }

      const results = {
        domain,
        records: {
          mx: [] as any[],
          spf: { type: 'SPF', status: 'not_found' },
          dkim: { type: 'DKIM', status: 'not_found' },
          dmarc: { type: 'DMARC', status: 'not_found' }
        },
        summary: {
          totalChecks: 4,
          passed: 0,
          warnings: 0,
          failed: 0
        }
      };

      try {
        // Check MX records
        const mxRecords = await resolveMx(domain);
        results.records.mx = mxRecords.map(record => ({
          type: 'MX',
          status: 'valid',
          value: `${record.priority} ${record.exchange}`,
          details: `Priority: ${record.priority}, Exchange: ${record.exchange}`
        }));
        if (mxRecords.length > 0) results.summary.passed++;
      } catch (error) {
        results.records.mx = [];
        results.summary.failed++;
      }

      try {
        // Check SPF record
        const txtRecords = await resolveTxt(domain);
        const spfRecord = txtRecords.find(record => 
          record.some(txt => txt.startsWith('v=spf1'))
        );
        if (spfRecord) {
          results.records.spf = {
            type: 'SPF',
            status: 'valid',
            value: spfRecord.join(' '),
            details: 'SPF record found and valid'
          };
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }
      } catch (error) {
        results.summary.failed++;
      }

      try {
        // Check DMARC record
        const dmarcRecords = await resolveTxt(`_dmarc.${domain}`);
        const dmarcRecord = dmarcRecords.find(record =>
          record.some(txt => txt.startsWith('v=DMARC1'))
        );
        if (dmarcRecord) {
          results.records.dmarc = {
            type: 'DMARC',
            status: 'valid',
            value: dmarcRecord.join(' '),
            details: 'DMARC policy found'
          };
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }
      } catch (error) {
        results.summary.failed++;
      }

      try {
        // Check DKIM (basic check for common selectors)
        const dkimSelectors = ['default', 'selector1', 'selector2', 'google', 'k1'];
        let dkimFound = false;
        
        for (const selector of dkimSelectors) {
          try {
            const dkimRecords = await resolveTxt(`${selector}._domainkey.${domain}`);
            if (dkimRecords.length > 0) {
              results.records.dkim = {
                type: 'DKIM',
                status: 'valid',
                value: dkimRecords[0].join(' '),
                details: `DKIM key found for selector: ${selector}`
              };
              dkimFound = true;
              break;
            }
          } catch (error) {
            // Continue to next selector
          }
        }
        
        if (dkimFound) {
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }
      } catch (error) {
        results.summary.failed++;
      }

      res.json(results);
    } catch (error) {
      await storage.logError({
        type: "DNS_ERROR",
        message: `DNS analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      res.status(500).json({ message: "Failed to analyze DNS records" });
    }
  });

  // Email health check endpoint
  app.post("/api/email/health-check", logQuery('email'), async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const domain = email.split('@')[1];
      if (!domain) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const results = {
        email,
        domain,
        deliverabilityScore: 0,
        checks: {
          validFormat: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
          domainExists: false,
          mxRecordExists: false,
          spfConfigured: false,
          dmarcConfigured: false,
          dkimConfigured: false,
          blacklisted: false
        },
        recommendations: [] as string[],
        riskLevel: 'high' as 'low' | 'medium' | 'high'
      };

      let score = 0;

      // Valid format check
      if (results.checks.validFormat) score += 15;

      try {
        // Check if domain exists (MX records)
        const mxRecords = await resolveMx(domain);
        results.checks.domainExists = true;
        results.checks.mxRecordExists = mxRecords.length > 0;
        if (results.checks.mxRecordExists) score += 25;
      } catch (error) {
        results.recommendations.push("Domain does not have valid MX records configured.");
      }

      try {
        // Check SPF
        const txtRecords = await resolveTxt(domain);
        results.checks.spfConfigured = txtRecords.some(record =>
          record.some(txt => txt.startsWith('v=spf1'))
        );
        if (results.checks.spfConfigured) {
          score += 20;
        } else {
          results.recommendations.push("Configure SPF record to improve email deliverability.");
        }
      } catch (error) {
        results.recommendations.push("Unable to verify SPF configuration.");
      }

      try {
        // Check DMARC
        const dmarcRecords = await resolveTxt(`_dmarc.${domain}`);
        results.checks.dmarcConfigured = dmarcRecords.some(record =>
          record.some(txt => txt.startsWith('v=DMARC1'))
        );
        if (results.checks.dmarcConfigured) {
          score += 20;
        } else {
          results.recommendations.push("Implement DMARC policy for better email security.");
        }
      } catch (error) {
        results.recommendations.push("Unable to verify DMARC configuration.");
      }

      try {
        // Check DKIM
        const dkimSelectors = ['default', 'selector1', 'selector2', 'google', 'k1'];
        for (const selector of dkimSelectors) {
          try {
            const dkimRecords = await resolveTxt(`${selector}._domainkey.${domain}`);
            if (dkimRecords.length > 0) {
              results.checks.dkimConfigured = true;
              break;
            }
          } catch (error) {
            // Continue to next selector
          }
        }
        if (results.checks.dkimConfigured) {
          score += 20;
        } else {
          results.recommendations.push("Configure DKIM signing for email authentication.");
        }
      } catch (error) {
        results.recommendations.push("Unable to verify DKIM configuration.");
      }

      results.deliverabilityScore = Math.min(100, score);

      // Determine risk level
      if (results.deliverabilityScore >= 80) {
        results.riskLevel = 'low';
      } else if (results.deliverabilityScore >= 60) {
        results.riskLevel = 'medium';
      } else {
        results.riskLevel = 'high';
      }

      res.json(results);
    } catch (error) {
      await storage.logError({
        type: "EMAIL_HEALTH_ERROR",
        message: `Email health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      res.status(500).json({ message: "Failed to check email health" });
    }
  });

  // API token management endpoints
  app.post("/api/tokens", async (req, res) => {
    try {
      const { name, permissions } = req.body;
      const token = randomBytes(32).toString('hex');
      
      const apiToken = await storage.createApiToken({
        token,
        name,
        permissions: permissions || [],
        isActive: true
      });
      
      res.json(apiToken);
    } catch (error) {
      res.status(400).json({ message: "Failed to create API token" });
    }
  });

  app.get("/api/tokens", async (req, res) => {
    try {
      const tokens = await storage.getApiTokens();
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch API tokens" });
    }
  });

  app.put("/api/tokens/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateApiToken(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Failed to update API token" });
    }
  });

  app.delete("/api/tokens/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteApiToken(id);
      res.json({ message: "API token deleted" });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete API token" });
    }
  });

  // Server settings endpoints
  app.get("/api/server/settings", async (req, res) => {
    try {
      const settings = await storage.getServerSettings();
      res.json(settings || {
        supportEmail: "support@example.com",
        aboutText: "Professional tool suite for business analytics",
        privacyPolicyUrl: null,
        termsOfServiceUrl: null,
        gdprCompliant: true
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch server settings" });
    }
  });

  app.put("/api/server/settings", async (req, res) => {
    try {
      const validatedSettings = insertServerSettingsSchema.parse(req.body);
      const updated = await storage.updateServerSettings(validatedSettings);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Invalid server settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
