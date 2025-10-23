import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getNiaResponse, generateJournalPrompt } from "./services/openai";
import {
  insertUserSchema,
  insertChatMessageSchema,
  insertJournalEntrySchema,
  insertCheckInSchema,
  insertAppointmentSchema,
  insertGroupSchema,
  insertMembershipSchema,
  insertGroupMessageSchema,
  insertPartnershipSchema,
  insertPartnerProgressSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Detroit area zip codes (Detroit and surrounding areas)
  const detroitZipCodes = [
    // Detroit proper
    "48201", "48202", "48203", "48204", "48205", "48206", "48207", "48208", "48209", "48210",
    "48211", "48212", "48213", "48214", "48215", "48216", "48217", "48218", "48219", "48220",
    "48221", "48222", "48223", "48224", "48225", "48226", "48227", "48228", "48229", "48230",
    "48231", "48232", "48233", "48234", "48235", "48236", "48237", "48238", "48239", "48240",
    "48242", "48243",
    // Surrounding metro areas
    "48067", "48070", "48071", "48072", "48073", "48075", "48076", "48220", "48221", "48223",
    "48224", "48225", "48226", "48227", "48228", "48229", "48230", "48331", "48334", "48335",
    "48336", "48340", "48341", "48342", "48346", "48347", "48348", "48375", "48377", "48380",
  ];

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if zip code is in Detroit area
      const isDetroitArea = userData.zipCode ? detroitZipCodes.includes(userData.zipCode) : false;
      
      // Set waitlist flag for non-Detroit users
      const userDataWithWaitlist = {
        ...userData,
        waitlistUser: !isDetroitArea,
      };
      
      const user = await storage.createUser(userDataWithWaitlist);
      res.json(user);
    } catch (error) {
      console.error("User creation error:", error);
      
      // Handle duplicate email error specifically
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        return res.status(409).json({ 
          message: "An account with this email already exists", 
          error: "duplicate_email" 
        });
      }
      
      res.status(400).json({ 
        message: "Invalid user data", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
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

  app.get("/api/users/email/:email", async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user by email", error: error instanceof Error ? error.message : "Unknown error" });
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
      const recentCheckIn = await storage.getTodaysCheckIn(messageData.userId);
      
      const userContext = user ? {
        pregnancyWeek: user.pregnancyWeek || undefined,
        pregnancyStage: user.pregnancyStage || undefined,
        isPostpartum: user.isPostpartum || undefined,
        recentCheckIn: recentCheckIn ? {
          feeling: recentCheckIn.feeling || undefined,
          bodyCare: recentCheckIn.bodyCare || undefined,
          feelingSupported: recentCheckIn.feelingSupported || undefined,
          date: recentCheckIn.createdAt || undefined
        } : undefined,
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

  // Appointment routes
  app.get("/api/appointments/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const appointments = await storage.getAppointments(userId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointments", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/appointments/:userId/upcoming", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const appointments = await storage.getUpcomingAppointments(userId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching upcoming appointments", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Error creating appointment", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const updateData = req.body;
      const appointment = await storage.updateAppointment(appointmentId, updateData);
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Error updating appointment", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      await storage.deleteAppointment(appointmentId);
      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting appointment", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Community routes
  app.get("/api/community/groups", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const groups = await storage.getGroups(userId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Error fetching groups", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/community/my-groups/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const groups = await storage.getUserGroups(userId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user groups", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/community/groups", async (req, res) => {
    try {
      const groupData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(groupData);
      res.json(group);
    } catch (error) {
      res.status(400).json({ message: "Error creating group", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/community/groups/:groupId/join", async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const { userId } = req.body;
      await storage.joinGroup(userId, groupId);
      res.json({ message: "Successfully joined group" });
    } catch (error) {
      res.status(400).json({ message: "Error joining group", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/community/groups/:groupId/leave", async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const { userId } = req.body;
      await storage.leaveGroup(userId, groupId);
      res.json({ message: "Successfully left group" });
    } catch (error) {
      res.status(400).json({ message: "Error leaving group", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/community/messages/:groupId", async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const messages = await storage.getGroupMessages(groupId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching group messages", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/community/messages", async (req, res) => {
    try {
      const messageData = insertGroupMessageSchema.parse(req.body);
      const message = await storage.createGroupMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Error creating message", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Dashboard/Insights routes
  app.get("/api/checkins/trends/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const checkIns = await storage.getCheckIns(userId);
      // Return last 7 days of check-ins for trends
      const last7Days = checkIns
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 7);
      res.json(last7Days);
    } catch (error) {
      res.status(500).json({ message: "Error fetching check-in trends", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/resources/completed/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      // For now, return sample completed resources
      // In a real app, you'd track user's completed resources
      const completedResources = [
        { id: 1, title: "Understanding Your Changing Body", completedAt: new Date() },
        { id: 2, title: "Nutrition During Pregnancy", completedAt: new Date() },
        { id: 3, title: "Preparing for Labor", completedAt: new Date() }
      ];
      res.json(completedResources);
    } catch (error) {
      res.status(500).json({ message: "Error fetching completed resources", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/appointments/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const appointments = await storage.getAppointments(userId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointments", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Partner routes
  app.post("/api/partnerships", async (req, res) => {
    try {
      const validatedPartnership = insertPartnershipSchema.parse(req.body);
      // Generate a unique invite code
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const partnership = await storage.createPartnership({
        ...validatedPartnership,
        inviteCode
      });
      res.status(201).json(partnership);
    } catch (error) {
      console.error("Error creating partnership:", error);
      res.status(500).json({ message: "Failed to create partnership" });
    }
  });

  app.get("/api/partnerships/code/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const partnership = await storage.getPartnershipByCode(code);
      if (!partnership) {
        return res.status(404).json({ message: "Partnership not found" });
      }
      res.json(partnership);
    } catch (error) {
      console.error("Error getting partnership by code:", error);
      res.status(500).json({ message: "Failed to get partnership" });
    }
  });

  app.post("/api/partnerships/:id/accept", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const partnership = await storage.acceptPartnership(id);
      res.json(partnership);
    } catch (error) {
      console.error("Error accepting partnership:", error);
      res.status(500).json({ message: "Failed to accept partnership" });
    }
  });

  app.patch("/api/partnerships/:id/permissions", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const permissions = req.body;
      const partnership = await storage.updatePartnershipPermissions(id, permissions);
      res.json(partnership);
    } catch (error) {
      console.error("Error updating partnership permissions:", error);
      res.status(500).json({ message: "Failed to update permissions" });
    }
  });

  app.get("/api/partner-resources", async (req, res) => {
    try {
      const { category } = req.query;
      const resources = await storage.getPartnerResources(category as string);
      res.json(resources);
    } catch (error) {
      console.error("Error getting partner resources:", error);
      res.status(500).json({ message: "Failed to get partner resources" });
    }
  });

  app.post("/api/partner-progress", async (req, res) => {
    try {
      const validatedProgress = insertPartnerProgressSchema.parse(req.body);
      const progress = await storage.createPartnerProgress(validatedProgress);
      res.status(201).json(progress);
    } catch (error) {
      console.error("Error creating partner progress:", error);
      res.status(500).json({ message: "Failed to create partner progress" });
    }
  });

  app.get("/api/partner-progress/:partnerId", async (req, res) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      const progress = await storage.getPartnerProgress(partnerId);
      res.json(progress);
    } catch (error) {
      console.error("Error getting partner progress:", error);
      res.status(500).json({ message: "Failed to get partner progress" });
    }
  });

  // Email signup routes for landing page
  app.post("/api/email-signups", async (req, res) => {
    try {
      const { email, name, userType, dueDate, source } = req.body;
      
      // Basic validation
      if (!email || !email.includes('@')) {
        return res.status(400).json({ message: "Valid email is required" });
      }

      const signup = await storage.createEmailSignup({
        email,
        name,
        userType,
        dueDate,
        source: source || "landing_page",
      });
      
      res.json(signup);
    } catch (error) {
      console.error("Error creating email signup:", error);
      if (error.message?.includes('unique constraint')) {
        res.status(400).json({ message: "Email already registered" });
      } else {
        res.status(500).json({ message: "Failed to register email" });
      }
    }
  });

  app.get("/api/email-signups", async (req, res) => {
    try {
      const signups = await storage.getEmailSignups();
      res.json(signups);
    } catch (error) {
      console.error("Error fetching email signups:", error);
      res.status(500).json({ message: "Failed to fetch email signups" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
