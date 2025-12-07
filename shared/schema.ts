import { pgTable, text, serial, integer, boolean, timestamp, jsonb, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  profilePhotoUrl: text("profile_photo_url"), // Profile photo URL
  location: text("location"), // City, State
  zipCode: text("zip_code"), // Zip code for region-based access
  waitlistUser: boolean("waitlist_user").default(false), // True if outside Detroit area
  userType: text("user_type").default("mother"), // "mother", "partner"
  pregnancyWeek: integer("pregnancy_week"),
  pregnancyStage: text("pregnancy_stage"), // "first", "second", "third", "postpartum"
  dueDate: timestamp("due_date"),
  isPostpartum: boolean("is_postpartum").default(false),
  // Pregnancy and postpartum-specific fields
  babyBirthDate: timestamp("baby_birth_date"),
  pregnancyExperience: jsonb("pregnancy_experience").default([]),
  birthExperience: jsonb("birth_experience").default([]),
  supportNeeds: jsonb("support_needs").default([]),
  preferences: jsonb("preferences").default({}),
  // Provider information for red flag notifications
  obMidwifeName: text("ob_midwife_name"),
  obMidwifePractice: text("ob_midwife_practice"), // Office/practice name
  obMidwifeEmail: text("ob_midwife_email"),
  doulaName: text("doula_name"),
  doulaPractice: text("doula_practice"), // Office/practice name  
  doulaEmail: text("doula_email"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Partnership connections between mother and partner accounts
export const partnerships = pgTable("partnerships", {
  id: serial("id").primaryKey(),
  motherId: integer("mother_id").references(() => users.id).notNull(),
  partnerId: integer("partner_id").references(() => users.id),
  relationshipType: text("relationship_type").notNull(), // "spouse", "partner", "other"
  status: text("status").default("pending"), // "pending", "active", "inactive", "revoked", "expired"
  inviteCode: text("invite_code").unique(),
  expiresAt: timestamp("expires_at"), // Invite code expiration (default 7 days)
  redeemedAt: timestamp("redeemed_at"), // When partner accepted invite
  nickname: text("nickname"), // Optional friendly name for partner
  // Privacy settings for what partner can access
  visibilityPreset: text("visibility_preset").default("essentials_only"), // "full_support", "essentials_only", "appointments_only", "custom"
  canViewCheckIns: boolean("can_view_check_ins").default(true),
  canViewJournal: boolean("can_view_journal").default(false),
  canViewAppointments: boolean("can_view_appointments").default(true),
  canViewResources: boolean("can_view_resources").default(true),
  lastNotifiedAt: timestamp("last_notified_at"), // Track last update notification sent
  createdAt: timestamp("created_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
}, (table) => ({
  unique: unique().on(table.motherId, table.partnerId),
}));

// Partner update events - tracks what updates partners can see
export const partnerUpdates = pgTable("partner_updates", {
  id: serial("id").primaryKey(),
  motherId: integer("mother_id").references(() => users.id).notNull(),
  partnerId: integer("partner_id").references(() => users.id).notNull(),
  partnershipId: integer("partnership_id").references(() => partnerships.id).notNull(),
  eventType: text("event_type").notNull(), // "check_in", "appointment", "journal_summary", "milestone"
  title: text("title").notNull(), // User-friendly title for the update
  summary: text("summary"), // Brief description of the update
  payloadSnapshot: jsonb("payload_snapshot").default({}), // Sanitized data subset
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Partner-specific resources and education content
export const partnerResources = pgTable("partner_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "video", "article", "guide", "checklist"
  category: text("category").notNull(), // "understanding_pregnancy", "supporting_labor", "postpartum_support", "communication"
  duration: text("duration"),
  pregnancyStage: text("pregnancy_stage"),
  url: text("url"),
  isRequired: boolean("is_required").default(false),
  sortOrder: integer("sort_order").default(0),
});

// Track partner completion of resources
export const partnerProgress = pgTable("partner_progress", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => users.id).notNull(),
  resourceId: integer("resource_id").references(() => partnerResources.id).notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  timeSpent: integer("time_spent"), // in minutes
  notes: text("notes"),
}, (table) => ({
  unique: unique().on(table.partnerId, table.resourceId),
}));

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
  feeling: text("feeling"), // "peaceful", "anxious", "tired", "overwhelmed", "grateful", "other"
  bodyCare: text("body_care"), // "not-yet", "a-little", "yes-tried", "yes-nourished"
  feelingSupported: text("feeling_supported"), // "not-really", "a-little", "mostly", "fully-supported"
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

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "ob", "doula", "therapist", "lactation", "baby-checkup", "ultrasound", "other"
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  duration: integer("duration").notNull(), // in minutes
  location: text("location"),
  providerName: text("provider_name"),
  providerPhone: text("provider_phone"),
  providerEmail: text("provider_email"),
  reminders: boolean("reminders").default(true),
  supportPersonEmail: text("support_person_email"),
  supportPersonName: text("support_person_name"),
  notes: text("notes"),
  isRecurring: boolean("is_recurring").default(false),
  recurringType: text("recurring_type"), // "weekly", "monthly", "custom"
  // Calendar sync fields
  source: text("source").default("manual"), // "manual", "google", "outlook"
  externalCalendarId: text("external_calendar_id"), // ID from external calendar
  lastSyncedAt: timestamp("last_synced_at"), // Last time synced from external calendar
  isExternal: boolean("is_external").default(false), // Whether this was imported from an external calendar
  createdAt: timestamp("created_at").defaultNow(),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "location", "birth_month", "topic", "resource"
  zipCode: text("zip_code"), // for location-based groups
  city: text("city"), // city name for location filtering
  state: text("state"), // state abbreviation (e.g., "MI", "CA")
  dueDate: timestamp("due_date"), // for birth month groups
  topic: text("topic"), // for topic-based groups like "breastfeeding", "NICU", "VBAC"
  isPrivate: boolean("is_private").default(false),
  memberCount: integer("member_count").default(0),
  createdBy: integer("created_by").references(() => users.id),
  // External resource fields for community organizations
  website: text("website"), // External website URL
  contactEmail: text("contact_email"), // Contact email
  contactPhone: text("contact_phone"), // Contact phone
  isExternal: boolean("is_external").default(false), // True for external resources/organizations
  // Google Places integration fields
  googlePlaceId: text("google_place_id"), // Unique ID from Google Places to prevent duplicates
  source: text("source").default("manual"), // "manual", "google_places"
  address: text("address"), // Full address from Google Places
  rating: integer("rating"), // Rating (1-5) from Google Places
  createdAt: timestamp("created_at").defaultNow(),
});

// Cache table for tracking resource fetches by zip code area
export const resourceFetchCache = pgTable("resource_fetch_cache", {
  id: serial("id").primaryKey(),
  zipPrefix: text("zip_prefix").notNull().unique(), // First 3 digits of zip code
  lastFetchedAt: timestamp("last_fetched_at").defaultNow(),
  resourceCount: integer("resource_count").default(0),
});

export const memberships = pgTable("memberships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  groupId: integer("group_id").references(() => groups.id).notNull(),
  role: text("role").default("member"), // "member", "moderator", "admin"
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => ({
  unique: unique().on(table.userId, table.groupId),
}));

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  groupId: integer("group_id").references(() => groups.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  unique: unique().on(table.userId, table.groupId),
}));

export const groupMessages = pgTable("group_messages", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  replyTo: integer("reply_to"), // Self-reference, will be handled by drizzle
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  dueDate: z.union([z.string(), z.date()]).optional().transform((val) => {
    if (typeof val === 'string' && val) {
      return new Date(val);
    }
    return val;
  }),
  babyBirthDate: z.union([z.string(), z.date()]).optional().transform((val) => {
    if (typeof val === 'string' && val) {
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

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.union([z.string(), z.date()]).transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
  memberCount: true,
});

export const insertMembershipSchema = createInsertSchema(memberships).omit({
  id: true,
  joinedAt: true,
});

export const insertGroupMessageSchema = createInsertSchema(groupMessages).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertPartnershipSchema = createInsertSchema(partnerships).omit({
  id: true,
  createdAt: true,
  acceptedAt: true,
});

export const insertPartnerResourceSchema = createInsertSchema(partnerResources).omit({
  id: true,
});

export const insertPartnerProgressSchema = createInsertSchema(partnerProgress).omit({
  id: true,
  completedAt: true,
});

export const insertPartnerUpdateSchema = createInsertSchema(partnerUpdates).omit({
  id: true,
  createdAt: true,
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
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Membership = typeof memberships.$inferSelect;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type GroupMessage = typeof groupMessages.$inferSelect;
export type InsertGroupMessage = z.infer<typeof insertGroupMessageSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Partnership = typeof partnerships.$inferSelect;
export type InsertPartnership = z.infer<typeof insertPartnershipSchema>;
export type PartnerResource = typeof partnerResources.$inferSelect;
export type InsertPartnerResource = z.infer<typeof insertPartnerResourceSchema>;
export type PartnerProgress = typeof partnerProgress.$inferSelect;
export type InsertPartnerProgress = z.infer<typeof insertPartnerProgressSchema>;
export type PartnerUpdate = typeof partnerUpdates.$inferSelect;
export type InsertPartnerUpdate = z.infer<typeof insertPartnerUpdateSchema>;

// Email signups for landing page
export const emailSignups = pgTable("email_signups", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  userType: text("user_type"), // "pregnant", "postpartum", "partner", "birthworker", "healthcare", "other"
  dueDate: text("due_date"),
  source: text("source").default("landing_page"),
  signupDate: timestamp("signup_date").defaultNow(),
  isConverted: boolean("is_converted").default(false),
  convertedAt: timestamp("converted_at"),
});

export const insertEmailSignupSchema = createInsertSchema(emailSignups).omit({
  id: true,
  signupDate: true,
});

export type EmailSignup = typeof emailSignups.$inferSelect;
export type InsertEmailSignup = z.infer<typeof insertEmailSignupSchema>;
