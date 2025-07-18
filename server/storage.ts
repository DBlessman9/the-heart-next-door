import {
  users,
  chatMessages,
  journalEntries,
  checkIns,
  affirmations,
  experts,
  resources,
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
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chatMessages: Map<number, ChatMessage>;
  private journalEntries: Map<number, JournalEntry>;
  private checkIns: Map<number, CheckIn>;
  private affirmations: Map<number, Affirmation>;
  private experts: Map<number, Expert>;
  private resources: Map<number, Resource>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.chatMessages = new Map();
    this.journalEntries = new Map();
    this.checkIns = new Map();
    this.affirmations = new Map();
    this.experts = new Map();
    this.resources = new Map();
    this.currentId = 1;
    this.seedData();
  }

  private seedData() {
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

    defaultAffirmations.forEach(affirmation => {
      this.createAffirmation(affirmation);
    });

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

    defaultExperts.forEach(expert => {
      this.createExpert(expert);
    });

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

    defaultResources.forEach(resource => {
      this.createResource(resource);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      pregnancyWeek: insertUser.pregnancyWeek || null,
      pregnancyStage: insertUser.pregnancyStage || null,
      dueDate: insertUser.dueDate || null,
      isPostpartum: insertUser.isPostpartum || null,
      preferences: insertUser.preferences || {},
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Chat operations
  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // Journal operations
  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.currentId++;
    const entry: JournalEntry = {
      ...insertEntry,
      id,
      createdAt: new Date(),
      pregnancyWeek: insertEntry.pregnancyWeek || null,
      prompt: insertEntry.prompt || null,
    };
    this.journalEntries.set(id, entry);
    return entry;
  }

  // Check-in operations
  async getCheckIns(userId: number): Promise<CheckIn[]> {
    return Array.from(this.checkIns.values())
      .filter(checkIn => checkIn.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createCheckIn(insertCheckIn: InsertCheckIn): Promise<CheckIn> {
    const id = this.currentId++;
    const checkIn: CheckIn = {
      ...insertCheckIn,
      id,
      createdAt: new Date(),
      energyLevel: insertCheckIn.energyLevel || null,
      mood: insertCheckIn.mood || null,
      symptoms: insertCheckIn.symptoms || {},
      notes: insertCheckIn.notes || null,
    };
    this.checkIns.set(id, checkIn);
    return checkIn;
  }

  async getTodaysCheckIn(userId: number): Promise<CheckIn | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.checkIns.values())
      .find(checkIn => 
        checkIn.userId === userId &&
        checkIn.createdAt! >= today &&
        checkIn.createdAt! < tomorrow
      );
  }

  // Affirmation operations
  async getAffirmations(pregnancyStage?: string): Promise<Affirmation[]> {
    return Array.from(this.affirmations.values())
      .filter(affirmation => 
        affirmation.isActive &&
        (!pregnancyStage || affirmation.pregnancyStage === pregnancyStage)
      );
  }

  async createAffirmation(insertAffirmation: InsertAffirmation): Promise<Affirmation> {
    const id = this.currentId++;
    const affirmation: Affirmation = {
      ...insertAffirmation,
      id,
      pregnancyStage: insertAffirmation.pregnancyStage || null,
      isActive: insertAffirmation.isActive || null,
    };
    this.affirmations.set(id, affirmation);
    return affirmation;
  }

  async getRandomAffirmation(pregnancyStage?: string): Promise<Affirmation | undefined> {
    const affirmations = await this.getAffirmations(pregnancyStage);
    if (affirmations.length === 0) return undefined;
    return affirmations[Math.floor(Math.random() * affirmations.length)];
  }

  // Expert operations
  async getExperts(): Promise<Expert[]> {
    return Array.from(this.experts.values())
      .filter(expert => expert.isAvailable)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  async getExpertsBySpecialty(specialty: string): Promise<Expert[]> {
    return Array.from(this.experts.values())
      .filter(expert => expert.specialty === specialty && expert.isAvailable)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  async createExpert(insertExpert: InsertExpert): Promise<Expert> {
    const id = this.currentId++;
    const expert: Expert = {
      ...insertExpert,
      id,
      rating: insertExpert.rating || null,
      reviewCount: insertExpert.reviewCount || null,
      photoUrl: insertExpert.photoUrl || null,
      bio: insertExpert.bio || null,
      contactInfo: insertExpert.contactInfo || {},
      isAvailable: insertExpert.isAvailable || null,
    };
    this.experts.set(id, expert);
    return expert;
  }

  // Resource operations
  async getResources(pregnancyStage?: string): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .filter(resource => 
        !pregnancyStage || resource.pregnancyStage === pregnancyStage
      );
  }

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .filter(resource => resource.category === category);
  }

  async getPopularResources(): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .filter(resource => resource.isPopular);
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const id = this.currentId++;
    const resource: Resource = {
      ...insertResource,
      id,
      pregnancyStage: insertResource.pregnancyStage || null,
      category: insertResource.category || null,
      description: insertResource.description || null,
      duration: insertResource.duration || null,
      url: insertResource.url || null,
      isPopular: insertResource.isPopular || null,
    };
    this.resources.set(id, resource);
    return resource;
  }
}

export const storage = new MemStorage();
