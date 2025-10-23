import {
  users,
  chatMessages,
  journalEntries,
  checkIns,
  affirmations,
  experts,
  resources,
  appointments,
  groups,
  memberships,
  groupMessages,
  partnerships,
  partnerResources,
  partnerProgress,
  partnerUpdates,
  emailSignups,
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
  type Group,
  type InsertGroup,
  type Membership,
  type InsertMembership,
  type GroupMessage,
  type InsertGroupMessage,
  type Partnership,
  type InsertPartnership,
  type PartnerResource,
  type InsertPartnerResource,
  type PartnerProgress,
  type InsertPartnerProgress,
  type PartnerUpdate,
  type InsertPartnerUpdate,
  type EmailSignup,
  type InsertEmailSignup,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, gte, lt, desc } from "drizzle-orm";

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
  getAppointmentByExternalId(externalId: string, source: string): Promise<Appointment | null>;

  // Community operations
  getGroups(userId?: number): Promise<Group[]>;
  getUserGroups(userId: number): Promise<Group[]>;
  createGroup(group: InsertGroup): Promise<Group>;
  joinGroup(userId: number, groupId: number): Promise<void>;
  leaveGroup(userId: number, groupId: number): Promise<void>;
  getGroupMessages(groupId: number): Promise<GroupMessage[]>;
  createGroupMessage(message: InsertGroupMessage): Promise<GroupMessage>;

  // Partner operations
  createPartnership(partnership: InsertPartnership): Promise<Partnership>;
  getPartnershipByCode(inviteCode: string): Promise<Partnership | undefined>;
  getPartnershipByUsers(motherId: number, partnerId: number): Promise<Partnership | undefined>;
  acceptPartnership(id: number): Promise<Partnership>;
  updatePartnershipPermissions(id: number, permissions: Partial<Pick<Partnership, 'canViewCheckIns' | 'canViewJournal' | 'canViewAppointments' | 'canViewResources'>>): Promise<Partnership>;
  getPartnerResources(category?: string): Promise<PartnerResource[]>;
  createPartnerProgress(progress: InsertPartnerProgress): Promise<PartnerProgress>;
  getPartnerProgress(partnerId: number): Promise<PartnerProgress[]>;
  
  // Enhanced partnership operations
  generateInviteCodeForMother(motherId: number, relationshipType: string, nickname?: string): Promise<Partnership>;
  redeemInviteCode(inviteCode: string, partnerId: number): Promise<Partnership>;
  getMotherPartnerships(motherId: number): Promise<Partnership[]>;
  getPartnerPartnerships(partnerId: number): Promise<Partnership[]>;
  revokePartnership(partnershipId: number): Promise<Partnership>;
  regenerateInviteCode(partnershipId: number): Promise<Partnership>;
  
  // Partner updates operations
  createPartnerUpdate(update: InsertPartnerUpdate): Promise<PartnerUpdate>;
  getPartnerUpdates(partnerId: number): Promise<PartnerUpdate[]>;
  markPartnerUpdateAsRead(updateId: number): Promise<PartnerUpdate>;

  // Email signup operations
  createEmailSignup(signup: InsertEmailSignup): Promise<EmailSignup>;
  getEmailSignups(): Promise<EmailSignup[]>;
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
      const existingGroups = await db.select().from(groups).limit(1);
      if (existingExperts.length > 0 && existingGroups.length > 0) {
        return; // Data already seeded
      }

      // Seed default affirmations
      const defaultAffirmations: InsertAffirmation[] = [
        {
          content: "I am exactly where I need to be in my journey. I trust in divine timing.",
          pregnancyStage: "trying_to_conceive",
          isActive: true,
        },
        {
          content: "My body is capable and wise. I honor my journey with patience and self-love.",
          pregnancyStage: "trying_to_conceive",
          isActive: true,
        },
        {
          content: "I release worry and embrace hope. Each day is a gift of possibility.",
          pregnancyStage: "trying_to_conceive",
          isActive: true,
        },
        {
          content: "I am creating a beautiful life for myself right now. My body knows how to nurture and protect my baby.",
          pregnancyStage: "first",
          isActive: true,
        },
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

      // Seed Detroit community support organizations and resources
      const defaultGroups: InsertGroup[] = [
        {
          name: "The Mom Wellness Cave",
          description: "Detroit-based community designed to support mothers' mental, emotional, and spiritual wellbeing. Offers in-person playdates, moms-only nights, and business resources for mom entrepreneurs.",
          type: "resource",
          zipCode: "48228",
          isPrivate: false,
          createdBy: 2,
          website: "https://www.themomwellnesscave.com",
          contactEmail: "christian@christianmoon.com",
          isExternal: true,
        },
        {
          name: "Black Mothers Breastfeeding Association",
          description: "Reduces racial inequities in breastfeeding support for Black families through direct services, training, and advocacy. Offers Community-based Doula Program and Breastfeeding Peer Counselor Program.",
          type: "resource",
          topic: "breastfeeding",
          isPrivate: false,
          createdBy: 2,
          website: "https://blackmothersbreastfeeding.org",
          contactEmail: "communications@bmbfa.org",
          contactPhone: "(800) 313-6141",
          isExternal: true,
        },
        {
          name: "Brilliant Detroit",
          description: "Builds community hubs in Detroit neighborhoods to support families with children ages 0-8, offering free programs in education, health, family support, and community-building.",
          type: "resource",
          zipCode: "48228",
          isPrivate: false,
          createdBy: 2,
          website: "https://brilliantdetroit.org",
          contactEmail: "info@brilliantdetroit.org",
          contactPhone: "(313) 406-3275",
          isExternal: true,
        },
        {
          name: "Mothering Justice",
          description: "Grassroots policy advocacy organization empowering mothers of color to take action on policies affecting families. Focus areas include reproductive justice, paid leave, and affordable childcare.",
          type: "resource",
          topic: "advocacy",
          isPrivate: false,
          createdBy: 2,
          website: "https://www.motheringjustice.org",
          contactEmail: "info@motheringjustice.org",
          contactPhone: "(313) 340-2840",
          isExternal: true,
        },
        {
          name: "Birth Detroit",
          description: "Detroit's first and only Black-led community freestanding birth center, providing midwifery-led maternal health care. Offers prenatal, postpartum care, childbirth education, and community workshops.",
          type: "resource",
          topic: "birth_center",
          isPrivate: false,
          createdBy: 2,
          website: "https://www.birthdetroit.com",
          contactEmail: "info@birthdetroit.com",
          contactPhone: "(313) 977-0962",
          isExternal: true,
        },
        {
          name: "Wrapped in Love Doula & Lactation",
          description: "Full-spectrum doula support (DONA & CCI trained) and lactation services supporting families throughout pregnancy, birth, and postpartum in Metro Detroit.",
          type: "resource",
          topic: "doula",
          isPrivate: false,
          createdBy: 2,
          contactEmail: "Wrappedinlovedoula@gmail.com",
          isExternal: true,
        },
        {
          name: "The Luke Clinic",
          description: "Free, life-affirming prenatal care and infant care (up to 12 months) for uninsured and underinsured families in Detroit. Offers free ultrasounds, lab work, and social work support.",
          type: "resource",
          topic: "healthcare",
          isPrivate: false,
          createdBy: 2,
          website: "https://www.thelukeclinic.org",
          contactEmail: "office@thelukeclinic.org",
          contactPhone: "(313) 789-7862",
          isExternal: true,
        },
        {
          name: "Remembering Cherubs",
          description: "Detroit's only nonprofit resource center focused on pregnancy and infant loss support. Offers Care Concierge service for tailored resource lists and ongoing support programs.",
          type: "resource",
          topic: "loss_support",
          isPrivate: false,
          createdBy: 2,
          website: "https://www.rememberingcherubs.org",
          contactEmail: "info@rememberingcherubs.org",
          contactPhone: "(313) 617-9254",
          isExternal: true,
        },
        {
          name: "The Baby Bond: Birth & Beyond",
          description: "Wellness for healthy families - creating happy baby bonds. Promotes sustainable development to decrease maternal and infant mortality rates while providing holistic wellness services.",
          type: "resource",
          topic: "wellness",
          isPrivate: false,
          createdBy: 2,
          website: "https://www.thebabybond.org",
          isExternal: true,
        },
        {
          name: "SEMPQIC",
          description: "Southeast Michigan Perinatal Quality Improvement Coalition - works to reduce maternal morbidity and mortality in Wayne, Oakland, and Macomb counties through Project Detroit: Voices for Life.",
          type: "resource",
          topic: "advocacy",
          isPrivate: false,
          createdBy: 2,
          website: "https://www.sempqic.org/maternalhealth",
          contactEmail: "info@sempqic.org",
          isExternal: true,
        },
        {
          name: "Dr. Lakeshia Grant - Community Doula",
          description: "Independent community doula serving Detroit families. For contact information, visit the Michigan Department of Health & Human Services Doula Registry.",
          type: "resource",
          topic: "doula",
          isPrivate: false,
          createdBy: 2,
          website: "https://www.michigan.gov/mdhhs/keep-mi-healthy/maternal-and-infant-health/mdhhs-doula-initiative/mdhhs-doula-registry",
          contactEmail: "MDHHS-MIDoula@michigan.gov",
          isExternal: true,
        },
      ];

      await db.insert(groups).values(defaultGroups);

      // Seed partner resources
      const defaultPartnerResources: InsertPartnerResource[] = [
        {
          title: "Understanding Pregnancy: A Partner's Guide",
          description: "Essential information for partners supporting their pregnant loved one",
          type: "guide",
          category: "understanding_pregnancy",
          duration: "15 min read",
          pregnancyStage: "first",
          isRequired: true,
          sortOrder: 1,
        },
        {
          title: "Supporting Your Partner During Labor",
          description: "Practical tips for being the best birth partner",
          type: "video",
          category: "supporting_labor",
          duration: "20 min",
          pregnancyStage: "third",
          isRequired: true,
          sortOrder: 2,
        },
        {
          title: "Effective Communication During Pregnancy",
          description: "How to communicate effectively during this emotional time",
          type: "article",
          category: "communication",
          duration: "10 min read",
          isRequired: false,
          sortOrder: 3,
        },
        {
          title: "Postpartum Support: What Partners Need to Know",
          description: "Supporting your partner through the fourth trimester",
          type: "guide",
          category: "postpartum_support",
          duration: "18 min read",
          pregnancyStage: "postpartum",
          isRequired: true,
          sortOrder: 4,
        },
      ];

      await db.insert(partnerResources).values(defaultPartnerResources);
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
      .where(
        and(
          eq(checkIns.userId, userId),
          gte(checkIns.createdAt, today),
          lt(checkIns.createdAt, tomorrow)
        )
      )
      .orderBy(desc(checkIns.createdAt))
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

  async getAppointmentByExternalId(externalId: string, source: string): Promise<Appointment | null> {
    const [appointment] = await db.select()
      .from(appointments)
      .where(and(
        eq(appointments.externalCalendarId, externalId),
        eq(appointments.source, source)
      ))
      .limit(1);
    return appointment || null;
  }

  // Community operations
  async getGroups(userId?: number): Promise<Group[]> {
    await this.ensureSeeded();
    const allGroups = await db.select().from(groups).orderBy(groups.createdAt);
    
    if (userId) {
      // Check membership status for each group
      const userMemberships = await db.select()
        .from(memberships)
        .where(eq(memberships.userId, userId));
      
      return allGroups.map(group => ({
        ...group,
        userMembership: userMemberships.some(m => m.groupId === group.id)
      })) as any;
    }
    
    return allGroups;
  }

  async getUserGroups(userId: number): Promise<Group[]> {
    await this.ensureSeeded();
    return await db.select({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      type: groups.type,
      zipCode: groups.zipCode,
      dueDate: groups.dueDate,
      topic: groups.topic,
      isPrivate: groups.isPrivate,
      memberCount: groups.memberCount,
      createdBy: groups.createdBy,
      createdAt: groups.createdAt,
    })
    .from(groups)
    .innerJoin(memberships, eq(memberships.groupId, groups.id))
    .where(eq(memberships.userId, userId))
    .orderBy(groups.createdAt);
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const [group] = await db
      .insert(groups)
      .values(insertGroup)
      .returning();
    
    // Automatically join the creator to the group
    if (insertGroup.createdBy) {
      await this.joinGroup(insertGroup.createdBy, group.id);
    }
    
    return group;
  }

  async joinGroup(userId: number, groupId: number): Promise<void> {
    await db.insert(memberships).values({
      userId,
      groupId,
      role: 'member'
    });
    
    // Update member count
    await db.update(groups)
      .set({ memberCount: sql`${groups.memberCount} + 1` })
      .where(eq(groups.id, groupId));
  }

  async leaveGroup(userId: number, groupId: number): Promise<void> {
    await db.delete(memberships)
      .where(and(
        eq(memberships.userId, userId),
        eq(memberships.groupId, groupId)
      ));
    
    // Update member count
    await db.update(groups)
      .set({ memberCount: sql`${groups.memberCount} - 1` })
      .where(eq(groups.id, groupId));
  }

  async getGroupMessages(groupId: number): Promise<GroupMessage[]> {
    return await db.select({
      id: groupMessages.id,
      groupId: groupMessages.groupId,
      userId: groupMessages.userId,
      content: groupMessages.content,
      replyTo: groupMessages.replyTo,
      createdAt: groupMessages.createdAt,
      userName: users.firstName,
    })
    .from(groupMessages)
    .innerJoin(users, eq(users.id, groupMessages.userId))
    .where(eq(groupMessages.groupId, groupId))
    .orderBy(groupMessages.createdAt);
  }

  async createGroupMessage(insertMessage: InsertGroupMessage): Promise<GroupMessage> {
    const [message] = await db
      .insert(groupMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // Partner operations
  async createPartnership(insertPartnership: InsertPartnership): Promise<Partnership> {
    const [partnership] = await db
      .insert(partnerships)
      .values(insertPartnership)
      .returning();
    return partnership;
  }

  async getPartnershipByCode(inviteCode: string): Promise<Partnership | undefined> {
    const [partnership] = await db
      .select()
      .from(partnerships)
      .where(eq(partnerships.inviteCode, inviteCode));
    return partnership || undefined;
  }

  async getPartnershipByUsers(motherId: number, partnerId: number): Promise<Partnership | undefined> {
    const [partnership] = await db
      .select()
      .from(partnerships)
      .where(
        and(
          eq(partnerships.motherId, motherId),
          eq(partnerships.partnerId, partnerId)
        )
      );
    return partnership || undefined;
  }

  async acceptPartnership(id: number): Promise<Partnership> {
    const [partnership] = await db
      .update(partnerships)
      .set({ 
        status: "active",
        acceptedAt: new Date()
      })
      .where(eq(partnerships.id, id))
      .returning();
    return partnership;
  }

  async updatePartnershipPermissions(
    id: number, 
    permissions: Partial<Pick<Partnership, 'canViewCheckIns' | 'canViewJournal' | 'canViewAppointments' | 'canViewResources'>>
  ): Promise<Partnership> {
    const [partnership] = await db
      .update(partnerships)
      .set(permissions)
      .where(eq(partnerships.id, id))
      .returning();
    return partnership;
  }

  async getPartnerResources(category?: string): Promise<PartnerResource[]> {
    if (category) {
      return await db
        .select()
        .from(partnerResources)
        .where(eq(partnerResources.category, category))
        .orderBy(partnerResources.sortOrder);
    }
    
    return await db
      .select()
      .from(partnerResources)
      .orderBy(partnerResources.sortOrder);
  }

  async createPartnerProgress(insertProgress: InsertPartnerProgress): Promise<PartnerProgress> {
    const [progress] = await db
      .insert(partnerProgress)
      .values(insertProgress)
      .returning();
    return progress;
  }

  async getPartnerProgress(partnerId: number): Promise<PartnerProgress[]> {
    return await db
      .select()
      .from(partnerProgress)
      .where(eq(partnerProgress.partnerId, partnerId))
      .orderBy(partnerProgress.completedAt);
  }

  // Enhanced partnership operations
  async generateInviteCodeForMother(motherId: number, relationshipType: string, nickname?: string): Promise<Partnership> {
    // Generate a unique 8-character invite code
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    const [partnership] = await db
      .insert(partnerships)
      .values({
        motherId,
        relationshipType,
        inviteCode,
        expiresAt,
        nickname,
        status: "pending",
        visibilityPreset: "essentials_only",
        canViewCheckIns: true,
        canViewJournal: false,
        canViewAppointments: true,
        canViewResources: true,
      })
      .returning();
    
    return partnership;
  }

  async redeemInviteCode(inviteCode: string, partnerId: number): Promise<Partnership> {
    // Find the partnership by invite code
    const [partnership] = await db
      .select()
      .from(partnerships)
      .where(eq(partnerships.inviteCode, inviteCode));
    
    if (!partnership) {
      throw new Error("Invalid invite code");
    }
    
    // Check if code has expired
    if (partnership.expiresAt && new Date() > partnership.expiresAt) {
      throw new Error("Invite code has expired");
    }
    
    // Check if code has already been redeemed
    if (partnership.partnerId) {
      throw new Error("Invite code has already been used");
    }
    
    // Update partnership with partner ID and activate it
    const [updatedPartnership] = await db
      .update(partnerships)
      .set({
        partnerId,
        status: "active",
        redeemedAt: new Date(),
        acceptedAt: new Date(),
      })
      .where(eq(partnerships.id, partnership.id))
      .returning();
    
    return updatedPartnership;
  }

  async getMotherPartnerships(motherId: number): Promise<Partnership[]> {
    return await db
      .select()
      .from(partnerships)
      .where(eq(partnerships.motherId, motherId))
      .orderBy(desc(partnerships.createdAt));
  }

  async getPartnerPartnerships(partnerId: number): Promise<Partnership[]> {
    return await db
      .select()
      .from(partnerships)
      .where(eq(partnerships.partnerId, partnerId))
      .orderBy(desc(partnerships.createdAt));
  }

  async revokePartnership(partnershipId: number): Promise<Partnership> {
    const [partnership] = await db
      .update(partnerships)
      .set({ status: "revoked" })
      .where(eq(partnerships.id, partnershipId))
      .returning();
    
    return partnership;
  }

  async regenerateInviteCode(partnershipId: number): Promise<Partnership> {
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    const [partnership] = await db
      .update(partnerships)
      .set({
        inviteCode,
        expiresAt,
        status: "pending",
        partnerId: null,
        redeemedAt: null,
      })
      .where(eq(partnerships.id, partnershipId))
      .returning();
    
    return partnership;
  }

  // Partner updates operations
  async createPartnerUpdate(insertUpdate: InsertPartnerUpdate): Promise<PartnerUpdate> {
    const [update] = await db
      .insert(partnerUpdates)
      .values(insertUpdate)
      .returning();
    
    return update;
  }

  async getPartnerUpdates(partnerId: number): Promise<PartnerUpdate[]> {
    return await db
      .select()
      .from(partnerUpdates)
      .where(eq(partnerUpdates.partnerId, partnerId))
      .orderBy(desc(partnerUpdates.createdAt));
  }

  async markPartnerUpdateAsRead(updateId: number): Promise<PartnerUpdate> {
    const [update] = await db
      .update(partnerUpdates)
      .set({ isRead: true })
      .where(eq(partnerUpdates.id, updateId))
      .returning();
    
    return update;
  }

  // Email signup operations
  async createEmailSignup(insertSignup: InsertEmailSignup): Promise<EmailSignup> {
    const [signup] = await db
      .insert(emailSignups)
      .values(insertSignup)
      .returning();
    return signup;
  }

  async getEmailSignups(): Promise<EmailSignup[]> {
    return await db
      .select()
      .from(emailSignups)
      .orderBy(desc(emailSignups.signupDate));
  }
}

export const storage = new DatabaseStorage();
