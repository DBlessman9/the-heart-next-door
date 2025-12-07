import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { getNiaResponse, generateJournalPrompt } from "./services/openai";
import multer from "multer";
import { readFileSync } from "fs";
import {
  users,
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
  insertPartnerUpdateSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 1 * 1024 * 1024, // 1MB limit (after compression)
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    },
  });

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
      
      // Calculate pregnancy week from due date if not provided
      let pregnancyWeek = userData.pregnancyWeek;
      if (!pregnancyWeek && userData.dueDate) {
        const dueDate = new Date(userData.dueDate);
        const today = new Date();
        const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const weeksUntilDue = Math.floor(daysUntilDue / 7);
        pregnancyWeek = Math.max(0, 40 - weeksUntilDue);
      }
      
      // Set waitlist flag for non-Detroit users
      const userDataWithWaitlist = {
        ...userData,
        pregnancyWeek,
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
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
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
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "No update data provided" });
      }
      const user = await storage.updateUser(userId, req.body);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(400).json({ message: "Error updating user", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Profile photo upload route
  app.post("/api/user/upload-photo", upload.single('photo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = parseInt(req.body.userId);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Convert image to base64 data URL
      const base64Image = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

      // Update user's profile photo URL
      const user = await storage.updateUser(userId, { profilePhotoUrl: dataUrl });
      res.json(user);
    } catch (error) {
      console.error("Photo upload error:", error);
      res.status(500).json({ 
        message: "Error uploading photo", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Provider lookup route
  app.get("/api/provider/lookup", async (req, res) => {
    try {
      const { practice, location } = req.query;
      
      if (!practice || typeof practice !== 'string') {
        return res.status(400).json({ message: "Practice name is required" });
      }

      // For now, return a simple response indicating the feature is in development
      // In production, this would integrate with a medical provider directory API
      // or use web search to find contact information
      
      res.json({
        practice,
        location,
        email: null,
        message: "Provider lookup feature is in development. Please enter contact information manually or call the office directly."
      });
    } catch (error) {
      console.error("Provider lookup error:", error);
      res.status(500).json({ 
        message: "Error looking up provider", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Chat routes
  app.get("/api/chat/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Error fetching chat messages", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      if (!req.body || !req.body.userId || !req.body.message) {
        return res.status(400).json({ message: "Missing required fields: userId and message" });
      }
      
      // Transform request body to match schema (message -> content)
      const transformedBody = {
        userId: req.body.userId,
        content: req.body.message,
        isFromUser: req.body.isFromUser ?? true,
      };
      
      const messageData = insertChatMessageSchema.parse(transformedBody);
      
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
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const entries = await storage.getJournalEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
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
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const checkIns = await storage.getCheckIns(userId);
      res.json(checkIns);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
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
      if (!req.body || !req.body.userId) {
        return res.status(400).json({ message: "Missing required field: userId" });
      }
      const checkInData = insertCheckInSchema.parse(req.body);
      const checkIn = await storage.createCheckIn(checkInData);
      
      // Detect red flags
      const user = await storage.getUser(checkInData.userId);
      if (user) {
        const redFlag = await storage.detectRedFlags(checkIn, user);
        if (redFlag) {
          // Send alerts to care team
          const { sendRedFlagAlert } = await import("./services/email");
          
          // Alert OB/Midwife
          if (user.obMidwifeEmail) {
            await sendRedFlagAlert({
              motherName: user.firstName,
              providerEmail: user.obMidwifeEmail,
              providerName: user.obMidwifeName || "Healthcare Provider",
              alert: redFlag,
              details: `Check-in: Feeling ${checkIn.feeling}, Body Care: ${checkIn.bodyCare}, Support: ${checkIn.feelingSupported}`,
            });
          }
          
          // Alert Doula
          if (user.doulaEmail) {
            await sendRedFlagAlert({
              motherName: user.firstName,
              providerEmail: user.doulaEmail,
              providerName: user.doulaName || "Doula",
              alert: redFlag,
              details: `Check-in: Feeling ${checkIn.feeling}, Body Care: ${checkIn.bodyCare}, Support: ${checkIn.feelingSupported}`,
            });
          }
        }
      }
      
      res.json(checkIn);
    } catch (error) {
      console.error("Error creating check-in:", error);
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

  // Calendar Sync routes
  // Helper function to detect pregnancy-related appointments
  const isPregnancyRelated = (title: string, description?: string): boolean => {
    const keywords = [
      'ob', 'obgyn', 'ob-gyn', 'ob/gyn', 'obstetric', 'gynecolog',
      'prenatal', 'pregnancy', 'pregnant', 'ultrasound', 'sonogram',
      'doula', 'midwife', 'midwifery', 'lactation', 'breastfeeding',
      'maternal', 'fetal', 'baby', 'infant', 'newborn', 'birth',
      'postpartum', 'checkup', 'check-up', 'prenatal', 'antenatal',
      'anatomy scan', 'growth scan', 'nst', 'non-stress', 'gestational',
      'cervix', 'labor', 'delivery', 'trimester', 'weeks pregnant',
      'due date', 'contractions', 'monitoring', 'pediatric', 'pediatrician',
      'hospital tour', 'birthing class', 'childbirth'
    ];
    
    const searchText = `${title} ${description || ''}`.toLowerCase();
    return keywords.some(keyword => searchText.includes(keyword));
  };

  // Auto-classify appointment type based on title/description
  const classifyAppointmentType = (title: string, description?: string): string => {
    const searchText = `${title} ${description || ''}`.toLowerCase();
    
    if (searchText.includes('ultrasound') || searchText.includes('sonogram') || searchText.includes('scan')) {
      return 'ultrasound';
    }
    if (searchText.includes('doula')) {
      return 'doula';
    }
    if (searchText.includes('lactation') || searchText.includes('breastfeeding')) {
      return 'lactation';
    }
    if (searchText.includes('therap')) {
      return 'therapist';
    }
    if (searchText.includes('baby') || searchText.includes('pediatric') || searchText.includes('newborn')) {
      return 'baby-checkup';
    }
    if (searchText.includes('ob') || searchText.includes('prenatal') || searchText.includes('maternal')) {
      return 'ob';
    }
    
    return 'other';
  };

  // Connect to Google Calendar
  app.post("/api/calendar/connect/google", async (req, res) => {
    try {
      const { userId } = req.body;
      
      // Return setup instructions for Google Calendar connector
      res.json({
        message: "To sync your Google Calendar, you need to set up the Google Calendar connector.",
        setupRequired: true,
        connectorId: "connector:ccfg_google-calendar_DDDBAC03DE404369B74F32E78D",
        instructions: "Click 'Set Up Google Calendar' below to connect your calendar and automatically sync your pregnancy appointments."
      });
    } catch (error) {
      res.status(500).json({ message: "Error connecting to Google Calendar", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Connect to Outlook Calendar
  app.post("/api/calendar/connect/outlook", async (req, res) => {
    try {
      const { userId } = req.body;
      
      // Return setup instructions for Outlook connector
      res.json({
        message: "To sync your Outlook Calendar, you need to set up the Outlook connector.",
        setupRequired: true,
        connectorId: "connector:ccfg_outlook_01K4BBCKRJKP82N3PYQPZQ6DAK",
        instructions: "Click 'Set Up Outlook' below to connect your calendar and automatically sync your pregnancy appointments."
      });
    } catch (error) {
      res.status(500).json({ message: "Error connecting to Outlook Calendar", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Sync appointments from external calendar
  app.post("/api/calendar/sync/:source", async (req, res) => {
    try {
      const { source } = req.params; // 'google' or 'outlook'
      const { userId, events } = req.body;
      
      if (!events || !Array.isArray(events)) {
        return res.status(400).json({ message: "Events array is required" });
      }

      const syncedAppointments = [];
      const skippedCount = {
        notPregnancyRelated: 0,
        alreadySynced: 0,
        invalid: 0
      };

      for (const event of events) {
        try {
          // Skip if not pregnancy-related
          if (!isPregnancyRelated(event.title || event.summary, event.description)) {
            skippedCount.notPregnancyRelated++;
            continue;
          }

          // Check if already synced
          const existing = await storage.getAppointmentByExternalId(event.id, source);
          if (existing) {
            skippedCount.alreadySynced++;
            continue;
          }

          // Parse date and time
          const startDate = new Date(event.start?.dateTime || event.start?.date);
          if (isNaN(startDate.getTime())) {
            skippedCount.invalid++;
            continue;
          }

          const endDate = event.end?.dateTime ? new Date(event.end.dateTime) : new Date(startDate.getTime() + 60 * 60 * 1000);
          const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

          // Create appointment
          const appointmentData = {
            userId,
            title: event.title || event.summary || 'Appointment',
            description: event.description || undefined,
            type: classifyAppointmentType(event.title || event.summary, event.description),
            date: startDate,
            time: startDate.toTimeString().slice(0, 5),
            duration: duration || 60,
            location: event.location || undefined,
            reminders: true,
            source,
            externalCalendarId: event.id,
            lastSyncedAt: new Date(),
            isExternal: true,
          };

          const appointment = await storage.createAppointment(appointmentData);
          syncedAppointments.push(appointment);
        } catch (err) {
          console.error('Error syncing individual event:', err);
          skippedCount.invalid++;
        }
      }

      res.json({
        success: true,
        syncedCount: syncedAppointments.length,
        skipped: skippedCount,
        appointments: syncedAppointments,
        message: `Successfully synced ${syncedAppointments.length} pregnancy-related appointment(s) from ${source}.`
      });
    } catch (error) {
      res.status(500).json({ message: "Error syncing calendar", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Community routes
  app.get("/api/community/groups", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const userZipCode = req.query.zipCode as string | undefined;
      const groups = await storage.getGroups(userId, userZipCode);
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

  // Favorites routes
  app.post("/api/community/favorites", async (req, res) => {
    try {
      const { userId, groupId } = req.body;
      const favorite = await storage.addFavorite(userId, groupId);
      res.json(favorite);
    } catch (error) {
      res.status(400).json({ message: "Error adding favorite", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.delete("/api/community/favorites", async (req, res) => {
    try {
      const { userId, groupId } = req.body;
      await storage.removeFavorite(userId, groupId);
      res.json({ message: "Favorite removed" });
    } catch (error) {
      res.status(400).json({ message: "Error removing favorite", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/community/favorites/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Error fetching favorites", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/community/is-favorited/:userId/:groupId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const groupId = parseInt(req.params.groupId);
      const isFavorited = await storage.isFavorited(userId, groupId);
      res.json({ isFavorited });
    } catch (error) {
      res.status(500).json({ message: "Error checking favorite status", error: error instanceof Error ? error.message : "Unknown error" });
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

  // Enhanced partnership routes
  app.post("/api/partnerships/generate", async (req, res) => {
    try {
      const { motherId, relationshipType, nickname } = req.body;
      if (!motherId || !relationshipType) {
        return res.status(400).json({ message: "motherId and relationshipType are required" });
      }
      const partnership = await storage.generateInviteCodeForMother(motherId, relationshipType, nickname);
      res.json(partnership);
    } catch (error) {
      console.error("Error generating invite code:", error);
      res.status(500).json({ message: "Failed to generate invite code" });
    }
  });

  // Atomic partner registration with invite code (creates user + redeems code in one transaction)
  app.post("/api/partners/register", async (req, res) => {
    let createdUser: any = null;
    
    try {
      const { inviteCode, userData } = req.body;
      
      if (!inviteCode) {
        return res.status(400).json({ message: "inviteCode is required" });
      }
      
      // Validate user data
      const validatedUserData = insertUserSchema.parse(userData);
      
      // First, validate the invite code exists and is valid
      const partnership = await storage.getPartnershipByCode(inviteCode.toUpperCase());
      if (!partnership) {
        return res.status(400).json({ message: "Invalid invite code" });
      }
      
      if (partnership.status !== "pending" || partnership.partnerId) {
        return res.status(400).json({ message: "This invite code has already been used or is invalid" });
      }
      
      if (partnership.expiresAt && new Date(partnership.expiresAt) < new Date()) {
        return res.status(400).json({ message: "This invite code has expired" });
      }
      
      // Check if user already exists (for retry scenarios)
      let user = await storage.getUserByEmail(validatedUserData.email);
      
      if (user) {
        // User exists, check if they're a partner
        if (user.userType !== "partner") {
          return res.status(400).json({ message: "An account with this email already exists" });
        }
        // Existing partner user, try to redeem the code
        createdUser = null; // Don't mark for rollback since we didn't create it
      } else {
        // Create the partner user
        user = await storage.createUser({
          ...validatedUserData,
          userType: "partner"
        });
        createdUser = user; // Mark for potential rollback
      }
      
      // Redeem the code to link accounts
      try {
        const linkedPartnership = await storage.redeemInviteCode(inviteCode.toUpperCase(), user.id);
        res.json({ user, partnership: linkedPartnership });
      } catch (redemptionError) {
        // ROLLBACK: If we just created the user and redemption fails, delete the user
        if (createdUser) {
          try {
            await db.delete(users).where(eq(users.id, createdUser.id));
            console.log(`Rolled back user creation for ID ${createdUser.id} due to redemption failure`);
          } catch (deleteError) {
            console.error("Failed to rollback user creation:", deleteError);
          }
        }
        
        console.error("Error redeeming code:", redemptionError);
        const message = redemptionError instanceof Error ? redemptionError.message : "Failed to link with partner";
        return res.status(400).json({ message });
      }
    } catch (error) {
      // ROLLBACK: If we created a user but hit an error, delete it
      if (createdUser) {
        try {
          await db.delete(users).where(eq(users.id, createdUser.id));
          console.log(`Rolled back user creation for ID ${createdUser.id} due to error`);
        } catch (deleteError) {
          console.error("Failed to rollback user creation:", deleteError);
        }
      }
      
      console.error("Error registering partner:", error);
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        return res.status(409).json({ 
          message: "An account with this email already exists", 
          error: "duplicate_email" 
        });
      }
      res.status(400).json({ 
        message: "Failed to register partner", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.post("/api/partnerships/redeem", async (req, res) => {
    try {
      const { inviteCode, partnerId } = req.body;
      if (!inviteCode || !partnerId) {
        return res.status(400).json({ message: "inviteCode and partnerId are required" });
      }
      const partnership = await storage.redeemInviteCode(inviteCode, partnerId);
      res.json(partnership);
    } catch (error) {
      console.error("Error redeeming invite code:", error);
      const message = error instanceof Error ? error.message : "Failed to redeem invite code";
      res.status(400).json({ message });
    }
  });

  app.get("/api/partnerships/mother/:motherId", async (req, res) => {
    try {
      const motherId = parseInt(req.params.motherId);
      const partnerships = await storage.getMotherPartnerships(motherId);
      res.json(partnerships);
    } catch (error) {
      console.error("Error getting mother partnerships:", error);
      res.status(500).json({ message: "Failed to get partnerships" });
    }
  });

  app.get("/api/partnerships/partner/:partnerId", async (req, res) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      const partnerships = await storage.getPartnerPartnerships(partnerId);
      res.json(partnerships);
    } catch (error) {
      console.error("Error getting partner partnerships:", error);
      res.status(500).json({ message: "Failed to get partnerships" });
    }
  });

  app.post("/api/partnerships/:id/revoke", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const partnership = await storage.revokePartnership(id);
      res.json(partnership);
    } catch (error) {
      console.error("Error revoking partnership:", error);
      res.status(500).json({ message: "Failed to revoke partnership" });
    }
  });

  app.post("/api/partnerships/:id/regenerate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const partnership = await storage.regenerateInviteCode(id);
      res.json(partnership);
    } catch (error) {
      console.error("Error regenerating invite code:", error);
      res.status(500).json({ message: "Failed to regenerate invite code" });
    }
  });

  // Partner dashboard routes
  app.get("/api/partner/dashboard/:partnerId", async (req, res) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      
      // Get partnership to find the connected mother
      const partnerships = await storage.getPartnerPartnerships(partnerId);
      if (!partnerships || partnerships.length === 0) {
        return res.status(404).json({ message: "No partnership found" });
      }
      
      const partnership = partnerships[0];
      const motherId = partnership.motherId;
      
      // Get mother's information
      const mother = await storage.getUser(motherId);
      if (!mother) {
        return res.status(404).json({ message: "Mother not found" });
      }
      
      // Get recent check-ins if allowed
      let recentCheckIns = [];
      if (partnership.canViewCheckIns) {
        const allCheckIns = await storage.getCheckIns(motherId);
        recentCheckIns = allCheckIns.slice(0, 5); // Last 5 check-ins
      }
      
      // Get upcoming appointments if allowed
      let upcomingAppointments = [];
      if (partnership.canViewAppointments) {
        const allAppointments = await storage.getAppointments(motherId);
        const now = new Date();
        upcomingAppointments = allAppointments
          .filter(apt => new Date(apt.dateTime) >= now)
          .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
          .slice(0, 3); // Next 3 appointments
      }
      
      res.json({
        mother: {
          id: mother.id,
          firstName: mother.firstName,
          lastName: mother.lastName,
          pregnancyWeek: mother.pregnancyWeek,
          pregnancyStage: mother.pregnancyStage,
          dueDate: mother.dueDate,
        },
        partnership: {
          canViewCheckIns: partnership.canViewCheckIns,
          canViewJournal: partnership.canViewJournal,
          canViewAppointments: partnership.canViewAppointments,
          canViewResources: partnership.canViewResources,
        },
        recentCheckIns,
        upcomingAppointments,
      });
    } catch (error) {
      console.error("Error getting partner dashboard:", error);
      res.status(500).json({ message: "Failed to get partner dashboard" });
    }
  });

  // Partner updates routes
  app.get("/api/partner-updates/:partnerId", async (req, res) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      const updates = await storage.getPartnerUpdates(partnerId);
      res.json(updates);
    } catch (error) {
      console.error("Error getting partner updates:", error);
      res.status(500).json({ message: "Failed to get partner updates" });
    }
  });

  app.post("/api/partner-updates/:updateId/read", async (req, res) => {
    try {
      const updateId = parseInt(req.params.updateId);
      const update = await storage.markPartnerUpdateAsRead(updateId);
      res.json(update);
    } catch (error) {
      console.error("Error marking update as read:", error);
      res.status(500).json({ message: "Failed to mark update as read" });
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

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const allUsers = await db.select().from(users);
      const usersData = allUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        pregnancyStage: user.pregnancyStage,
        userType: user.userType,
        createdAt: user.createdAt,
        waitlistUser: user.waitlistUser,
      }));
      res.json(usersData);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users", error: error instanceof Error ? error.message : "Unknown error" });
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
