import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getNiaResponse, generateJournalPrompt } from "./services/openai";
import {
  insertUserSchema,
  insertChatMessageSchema,
  insertJournalEntrySchema,
  insertCheckInSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      // Convert dueDate string to Date object if provided
      if (req.body.dueDate && typeof req.body.dueDate === 'string') {
        req.body.dueDate = new Date(req.body.dueDate);
      }
      
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("User creation error:", error);
      res.status(400).json({ message: "Invalid user data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      const user = await storage.updateUser(userId, updateData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Error updating user", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Chat routes
  app.get("/api/chat/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching chat messages", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      
      // Save user message
      const userMessage = await storage.createChatMessage(messageData);
      
      // Get user context for AI response
      const user = await storage.getUser(messageData.userId);
      const userContext = user ? {
        pregnancyWeek: user.pregnancyWeek || undefined,
        pregnancyStage: user.pregnancyStage || undefined,
        isPostpartum: user.isPostpartum || undefined,
      } : undefined;

      // Generate AI response
      const aiResponse = await getNiaResponse(messageData.content, userContext);
      
      // Save AI response
      const aiMessage = await storage.createChatMessage({
        userId: messageData.userId,
        content: aiResponse,
        isFromUser: false,
      });

      res.json({ userMessage, aiMessage });
    } catch (error) {
      res.status(400).json({ message: "Error processing chat message", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Journal routes
  app.get("/api/journal/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const entries = await storage.getJournalEntries(userId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Error fetching journal entries", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/journal", async (req, res) => {
    try {
      const entryData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(entryData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Error creating journal entry", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/journal-prompt/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      const prompt = await generateJournalPrompt(
        user?.pregnancyWeek || undefined,
        user?.pregnancyStage || undefined,
        user?.isPostpartum || undefined
      );
      
      res.json({ prompt });
    } catch (error) {
      res.status(500).json({ message: "Error generating journal prompt", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Check-in routes
  app.get("/api/checkin/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const checkIns = await storage.getCheckIns(userId);
      res.json(checkIns);
    } catch (error) {
      res.status(500).json({ message: "Error fetching check-ins", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/checkin/today/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const checkIn = await storage.getTodaysCheckIn(userId);
      res.json(checkIn);
    } catch (error) {
      res.status(500).json({ message: "Error fetching today's check-in", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/checkin", async (req, res) => {
    try {
      const checkInData = insertCheckInSchema.parse(req.body);
      const checkIn = await storage.createCheckIn(checkInData);
      res.json(checkIn);
    } catch (error) {
      res.status(400).json({ message: "Error creating check-in", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Affirmation routes
  app.get("/api/affirmations", async (req, res) => {
    try {
      const pregnancyStage = req.query.stage as string;
      const affirmations = await storage.getAffirmations(pregnancyStage);
      res.json(affirmations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching affirmations", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/affirmations/random", async (req, res) => {
    try {
      const pregnancyStage = req.query.stage as string;
      const affirmation = await storage.getRandomAffirmation(pregnancyStage);
      res.json(affirmation);
    } catch (error) {
      res.status(500).json({ message: "Error fetching random affirmation", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Expert routes
  app.get("/api/experts", async (req, res) => {
    try {
      const specialty = req.query.specialty as string;
      const experts = specialty 
        ? await storage.getExpertsBySpecialty(specialty)
        : await storage.getExperts();
      res.json(experts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching experts", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Resource routes
  app.get("/api/resources", async (req, res) => {
    try {
      const pregnancyStage = req.query.stage as string;
      const category = req.query.category as string;
      const popular = req.query.popular === 'true';
      
      let resources;
      if (popular) {
        resources = await storage.getPopularResources();
      } else if (category) {
        resources = await storage.getResourcesByCategory(category);
      } else {
        resources = await storage.getResources(pregnancyStage);
      }
      
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Error fetching resources", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
