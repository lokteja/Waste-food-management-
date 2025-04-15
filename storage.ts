import { users, ngos, foodPickups, type User, type InsertUser, type NGO, type InsertNGO, type FoodPickup, type InsertFoodPickup } from "@shared/schema";
import { createId } from "@paralleldrive/cuid2";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  
  // NGO operations
  getNGO(id: number): Promise<NGO | undefined>;
  getNGOByUserId(userId: number): Promise<NGO | undefined>;
  createNGO(ngo: InsertNGO): Promise<NGO>;
  getAllNGOs(): Promise<NGO[]>;
  approveNGO(id: number): Promise<NGO | undefined>;
  
  // Food pickup operations
  createFoodPickup(pickup: InsertFoodPickup): Promise<FoodPickup>;
  getFoodPickup(id: number): Promise<FoodPickup | undefined>;
  getAllFoodPickups(): Promise<FoodPickup[]>;
  getAvailableFoodPickups(): Promise<FoodPickup[]>;
  getNGOFoodPickups(ngoId: number): Promise<FoodPickup[]>;
  getVolunteerFoodPickups(volunteerId: number): Promise<FoodPickup[]>;
  assignFoodPickup(id: number, volunteerId: number): Promise<FoodPickup | undefined>;
  updateFoodPickupStatus(id: number, status: 'pending' | 'assigned' | 'completed' | 'cancelled'): Promise<FoodPickup | undefined>;
  
  // Stats
  getStats(): Promise<{ totalMealsSaved: number; activeVolunteers: number; partnerNGOs: number }>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ngos: Map<number, NGO>;
  private foodPickups: Map<number, FoodPickup>;
  
  public sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private ngoIdCounter: number;
  private foodPickupIdCounter: number;

  constructor() {
    this.users = new Map();
    this.ngos = new Map();
    this.foodPickups = new Map();
    this.userIdCounter = 1;
    this.ngoIdCounter = 1;
    this.foodPickupIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Seed an admin user
    this.createUser({
      email: "admin@foodshare.org",
      password: "$2b$10$ZP1eUCVuF9PV5UYVn6Q2puIJpDqxsj0r1iykN6RWYGWbH6qExPZ3O", // "password123"
      role: "admin",
      firstName: "Admin",
      lastName: "User",
      phone: "555-123-4567",
      address: "123 Admin St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94103",
      country: "US",
      availability: "weekday_morning,weekend_afternoon"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, isVerified: false, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.verificationToken === token,
    );
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.resetToken === token && user.resetTokenExpiry && user.resetTokenExpiry > new Date(),
    );
  }

  // NGO methods
  async getNGO(id: number): Promise<NGO | undefined> {
    return this.ngos.get(id);
  }

  async getNGOByUserId(userId: number): Promise<NGO | undefined> {
    return Array.from(this.ngos.values()).find(
      (ngo) => ngo.userId === userId,
    );
  }

  async createNGO(insertNGO: InsertNGO): Promise<NGO> {
    const id = this.ngoIdCounter++;
    const ngo: NGO = { ...insertNGO, id, isApproved: false };
    this.ngos.set(id, ngo);
    return ngo;
  }

  async getAllNGOs(): Promise<NGO[]> {
    return Array.from(this.ngos.values());
  }

  async approveNGO(id: number): Promise<NGO | undefined> {
    const ngo = await this.getNGO(id);
    if (!ngo) return undefined;

    const updatedNGO = { ...ngo, isApproved: true };
    this.ngos.set(id, updatedNGO);
    return updatedNGO;
  }

  // Food pickup methods
  async createFoodPickup(insertPickup: InsertFoodPickup): Promise<FoodPickup> {
    const id = this.foodPickupIdCounter++;
    const pickup: FoodPickup = { 
      ...insertPickup, 
      id, 
      status: 'pending', 
      volunteerId: null, 
      distance: null,
      createdAt: new Date() 
    };
    this.foodPickups.set(id, pickup);
    return pickup;
  }

  async getFoodPickup(id: number): Promise<FoodPickup | undefined> {
    return this.foodPickups.get(id);
  }

  async getAllFoodPickups(): Promise<FoodPickup[]> {
    return Array.from(this.foodPickups.values());
  }

  async getAvailableFoodPickups(): Promise<FoodPickup[]> {
    return Array.from(this.foodPickups.values())
      .filter(pickup => pickup.status === 'pending' && pickup.pickupTime > new Date());
  }

  async getNGOFoodPickups(ngoId: number): Promise<FoodPickup[]> {
    return Array.from(this.foodPickups.values())
      .filter(pickup => pickup.ngoId === ngoId);
  }

  async getVolunteerFoodPickups(volunteerId: number): Promise<FoodPickup[]> {
    return Array.from(this.foodPickups.values())
      .filter(pickup => pickup.volunteerId === volunteerId);
  }

  async assignFoodPickup(id: number, volunteerId: number): Promise<FoodPickup | undefined> {
    const pickup = await this.getFoodPickup(id);
    if (!pickup || pickup.status !== 'pending') return undefined;

    const updatedPickup = { ...pickup, volunteerId, status: 'assigned' as const };
    this.foodPickups.set(id, updatedPickup);
    return updatedPickup;
  }

  async updateFoodPickupStatus(id: number, status: 'pending' | 'assigned' | 'completed' | 'cancelled'): Promise<FoodPickup | undefined> {
    const pickup = await this.getFoodPickup(id);
    if (!pickup) return undefined;

    const updatedPickup = { ...pickup, status };
    this.foodPickups.set(id, updatedPickup);
    return updatedPickup;
  }
  
  // Stats methods
  async getStats(): Promise<{ totalMealsSaved: number; activeVolunteers: number; partnerNGOs: number }> {
    const completedPickups = Array.from(this.foodPickups.values())
      .filter(pickup => pickup.status === 'completed');
    
    const totalMealsSaved = completedPickups.length * 25; // Rough estimate, 25 meals per pickup
    
    const activeVolunteers = new Set(
      Array.from(this.foodPickups.values())
        .filter(pickup => pickup.status === 'assigned' || pickup.status === 'completed')
        .map(pickup => pickup.volunteerId)
    ).size;
    
    const partnerNGOs = Array.from(this.ngos.values())
      .filter(ngo => ngo.isApproved)
      .length;
    
    return { totalMealsSaved, activeVolunteers, partnerNGOs };
  }
}

export const storage = new MemStorage();
