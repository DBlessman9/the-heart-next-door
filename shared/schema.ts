import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  pregnancyWeek: integer("pregnancy_week"),
  pregnancyStage: text("pregnancy_stage"), // "first", "second", "third", "postpartum"
  dueDate: timestamp("due_date"),
  isPostpartum: boolean("is_postpartum").default(false),
  preferences: jsonb("preferences").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isFromUser: boolean("is_from_user").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  prompt: text("prompt"),
  content: text("content").notNull(),
  pregnancyWeek: integer("pregnancy_week"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const checkIns = pgTable("check_ins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  energyLevel: integer("energy_level"), // 1-5
  mood: text("mood"),
  symptoms: jsonb("symptoms").default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const affirmations = pgTable("affirmations", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  pregnancyStage: text("pregnancy_stage"),
  isActive: boolean("is_active").default(true),
});

export const experts = pgTable("experts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  specialty: text("specialty").notNull(),
  rating: integer("rating").default(5), // 1-5
  reviewCount: integer("review_count").default(0),
  photoUrl: text("photo_url"),
  bio: text("bio"),
  contactInfo: jsonb("contact_info").default({}),
  isAvailable: boolean("is_available").default(true),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "video", "article", "guide"
  duration: text("duration"),
  pregnancyStage: text("pregnancy_stage"),
  category: text("category"),
  url: text("url"),
  isPopular: boolean("is_popular").default(false),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  dueDate: z.union([z.string(), z.date()]).optional().transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export const insertCheckInSchema = createInsertSchema(checkIns).omit({
  id: true,
  createdAt: true,
});

export const insertAffirmationSchema = createInsertSchema(affirmations).omit({
  id: true,
});

export const insertExpertSchema = createInsertSchema(experts).omit({
  id: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type Affirmation = typeof affirmations.$inferSelect;
export type InsertAffirmation = z.infer<typeof insertAffirmationSchema>;
export type Expert = typeof experts.$inferSelect;
export type InsertExpert = z.infer<typeof insertExpertSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
