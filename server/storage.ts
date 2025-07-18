import {
  users,
  chatMessages,
  journalEntries,
  checkIns,
  affirmations,
  experts,
  resources,
  appointments,
  type User,
  type InsertUser,
  type ChatMessage,
  type InsertChatMessage,
  type JournalEntry,
  type InsertJournalEntry,
  type CheckIn,
  type InsertCheckIn,
  type Affirmation,
  type InsertAffirmation,
  type Expert,
  type InsertExpert,
  type Resource,
  type InsertResource,
  type Appointment,
  type InsertAppointment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;

  // Chat operations
  getChatMessages(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Journal operations
  getJournalEntries(userId: number): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;

  // Check-in operations
  getCheckIns(userId: number): Promise<CheckIn[]>;
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  getTodaysCheckIn(userId: number): Promise<CheckIn | undefined>;

  // Affirmation operations
  getAffirmations(pregnancyStage?: string): Promise<Affirmation[]>;
  createAffirmation(affirmation: InsertAffirmation): Promise<Affirmation>;
  getRandomAffirmation(pregnancyStage?: string): Promise<Affirmation | undefined>;

  // Expert operations
  getExperts(): Promise<Expert[]>;
  getExpertsBySpecialty(specialty: string): Promise<Expert[]>;
  createExpert(expert: InsertExpert): Promise<Expert>;

  // Resource operations
  getResources(pregnancyStage?: string): Promise<Resource[]>;
  getResourcesByCategory(category: string): Promise<Resource[]>;
  getPopularResources(): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;

  // Appointment operations
  getAppointments(userId: number): Promise<Appointment[]>;
  getUpcomingAppointments(userId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private seedingPromise: Promise<void> | null = null;

  constructor() {
    this.seedingPromise = this.seedData();
  }

  private async ensureSeeded() {
    if (this.seedingPromise) {
      await this.seedingPromise;
      this.seedingPromise = null;
    }
  }

  private async seedData() {
    try {
      // Check if data already exists
      const existingExperts = await db.select().from(experts).limit(1);
      if (existingExperts.length > 0) {
        return; // Data already seeded
      }

      // Seed default affirmations
      const defaultAffirmations: InsertAffirmation[] = [
        {
          content: "I am strong, capable, and surrounded by love. My body knows how to nurture and protect my baby.",
          pregnancyStage: "second",
          isActive: true,
        },
        {
          content: "I trust my body and my instincts. I am prepared for this beautiful journey.",
          pregnancyStage: "third",
          isActive: true,
        },
        {
          content: "Each day brings me closer to meeting my baby. I am excited and ready.",
          pregnancyStage: "third",
          isActive: true,
        },
        {
          content: "I am healing and growing stronger every day. My body is amazing.",
          pregnancyStage: "postpartum",
          isActive: true,
        },
      ];

      await db.insert(affirmations).values(defaultAffirmations);

      // Seed default experts
      const defaultExperts: InsertExpert[] = [
        {
          name: "Dr. Sarah Johnson",
          title: "Certified Doula",
          specialty: "doula",
          rating: 5,
          reviewCount: 127,
          photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
          bio: "Experienced doula with over 10 years supporting families through pregnancy and birth.",
          contactInfo: { email: "sarah@example.com", phone: "+1-555-0123" },
          isAvailable: true,
        },
        {
          name: "Lisa Martinez",
          title: "Lactation Consultant",
          specialty: "lactation",
          rating: 5,
          reviewCount: 89,
          photoUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
          bio: "Certified lactation consultant helping new mothers with breastfeeding challenges.",
          contactInfo: { email: "lisa@example.com", phone: "+1-555-0456" },
          isAvailable: true,
        },
      ];

      await db.insert(experts).values(defaultExperts);

      // Seed default resources
      const defaultResources: InsertResource[] = [
        {
          title: "Preparing for Labor",
          description: "Everything you need to know about labor and delivery",
          type: "video",
          duration: "12 min",
          pregnancyStage: "second",
          category: "labor",
          url: "#",
          isPopular: true,
        },
        {
          title: "Nutrition During Pregnancy",
          description: "Essential nutrition guidelines for expecting mothers",
          type: "article",
          duration: "5 min read",
          pregnancyStage: "second",
          category: "nutrition",
          url: "#",
          isPopular: true,
        },
        {
          title: "Sleep Tips for Pregnancy",
          description: "How to get better sleep during pregnancy",
          type: "guide",
          duration: "8 min read",
          pregnancyStage: "second",
          category: "sleep",
          url: "#",
          isPopular: false,
        },
      ];

      await db.insert(resources).values(defaultResources);

      // Seed default appointments
      const defaultAppointments: InsertAppointment[] = [
        {
          userId: 2,
          title: "20-Week Anatomy Scan",
          description: "Detailed ultrasound to check baby's development",
          type: "ultrasound",
          date: new Date("2025-07-25T10:00:00Z"),
          time: "10:00 AM",
          duration: 60,
          location: "Women's Health Center, Room 201",
          providerName: "Dr. Sarah Chen",
          providerPhone: "(555) 123-4567",
          providerEmail: "dr.chen@womenshealth.com",
          reminders: true,
          supportPersonName: "Mike (Partner)",
          supportPersonEmail: "mike@email.com",
          notes: "Bring insurance card and previous ultrasound images",
          isRecurring: false,
        },
        {
          userId: 2,
          title: "Monthly OB Checkup",
          description: "Regular prenatal appointment with OB/GYN",
          type: "ob",
          date: new Date("2025-07-30T14:30:00Z"),
          time: "2:30 PM",
          duration: 45,
          location: "Maternal Care Clinic",
          providerName: "Dr. Lisa Rodriguez",
          providerPhone: "(555) 987-6543",
          providerEmail: "dr.rodriguez@maternalcare.com",
          reminders: true,
          notes: "Routine blood work and weight check",
          isRecurring: true,
          recurringType: "monthly",
        },
        {
          userId: 2,
          title: "Childbirth Class",
          description: "Preparation for labor and delivery",
          type: "other",
          date: new Date("2025-08-05T18:00:00Z"),
          time: "6:00 PM",
          duration: 120,
          location: "Community Health Center, Conference Room A",
          providerName: "Maria Santos, RN",
          providerPhone: "(555) 456-7890",
          reminders: true,
          supportPersonName: "Mike (Partner)",
          supportPersonEmail: "mike@email.com",
          notes: "Bring pillow and comfortable clothes",
          isRecurring: false,
        },
      ];

      await db.insert(appointments).values(defaultAppointments);
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    await this.ensureSeeded();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Chat operations
  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.timestamp);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // Journal operations
  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    return await db.select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(journalEntries.createdAt);
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await db
      .insert(journalEntries)
      .values(insertEntry)
      .returning();
    return entry;
  }

  // Check-in operations
  async getCheckIns(userId: number): Promise<CheckIn[]> {
    return await db.select()
      .from(checkIns)
      .where(eq(checkIns.userId, userId))
      .orderBy(checkIns.createdAt);
  }

  async createCheckIn(insertCheckIn: InsertCheckIn): Promise<CheckIn> {
    const [checkIn] = await db
      .insert(checkIns)
      .values(insertCheckIn)
      .returning();
    return checkIn;
  }

  async getTodaysCheckIn(userId: number): Promise<CheckIn | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [checkIn] = await db.select()
      .from(checkIns)
      .where(eq(checkIns.userId, userId))
      .orderBy(checkIns.createdAt)
      .limit(1);
    
    return checkIn || undefined;
  }

  // Affirmation operations
  async getAffirmations(pregnancyStage?: string): Promise<Affirmation[]> {
    await this.ensureSeeded();
    if (pregnancyStage) {
      return await db.select()
        .from(affirmations)
        .where(and(
          eq(affirmations.isActive, true),
          eq(affirmations.pregnancyStage, pregnancyStage)
        ));
    }
    
    return await db.select()
      .from(affirmations)
      .where(eq(affirmations.isActive, true));
  }

  async createAffirmation(insertAffirmation: InsertAffirmation): Promise<Affirmation> {
    const [affirmation] = await db
      .insert(affirmations)
      .values(insertAffirmation)
      .returning();
    return affirmation;
  }

  async getRandomAffirmation(pregnancyStage?: string): Promise<Affirmation | undefined> {
    const affirmationsList = await this.getAffirmations(pregnancyStage);
    if (affirmationsList.length === 0) return undefined;
    return affirmationsList[Math.floor(Math.random() * affirmationsList.length)];
  }

  // Expert operations
  async getExperts(): Promise<Expert[]> {
    await this.ensureSeeded();
    return await db.select()
      .from(experts)
      .where(eq(experts.isAvailable, true))
      .orderBy(experts.rating);
  }

  async getExpertsBySpecialty(specialty: string): Promise<Expert[]> {
    return await db.select()
      .from(experts)
      .where(eq(experts.specialty, specialty))
      .orderBy(experts.rating);
  }

  async createExpert(insertExpert: InsertExpert): Promise<Expert> {
    const [expert] = await db
      .insert(experts)
      .values(insertExpert)
      .returning();
    return expert;
  }

  // Resource operations
  async getResources(pregnancyStage?: string): Promise<Resource[]> {
    await this.ensureSeeded();
    if (pregnancyStage) {
      return await db.select()
        .from(resources)
        .where(eq(resources.pregnancyStage, pregnancyStage));
    }
    
    return await db.select().from(resources);
  }

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return await db.select()
      .from(resources)
      .where(eq(resources.category, category));
  }

  async getPopularResources(): Promise<Resource[]> {
    return await db.select()
      .from(resources)
      .where(eq(resources.isPopular, true));
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const [resource] = await db
      .insert(resources)
      .values(insertResource)
      .returning();
    return resource;
  }

  // Appointment operations
  async getAppointments(userId: number): Promise<Appointment[]> {
    await this.ensureSeeded();
    return await db.select()
      .from(appointments)
      .where(eq(appointments.userId, userId))
      .orderBy(appointments.date);
  }

  async getUpcomingAppointments(userId: number): Promise<Appointment[]> {
    await this.ensureSeeded();
    const now = new Date();
    return await db.select()
      .from(appointments)
      .where(and(
        eq(appointments.userId, userId),
        // Note: In a real app, you'd use proper date comparison
        // For now, we'll get all and filter in the component
      ))
      .orderBy(appointments.date);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values(insertAppointment)
      .returning();
    return appointment;
  }

  async updateAppointment(id: number, updateData: Partial<InsertAppointment>): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set(updateData)
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }
}

export const storage = new DatabaseStorage();
