import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for user types
export const userRoleEnum = pgEnum('user_role', ['volunteer', 'ngo', 'admin']);

// Enum for pickup status
export const pickupStatusEnum = pgEnum('pickup_status', ['pending', 'assigned', 'completed', 'cancelled']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationToken: text("verification_token"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  availability: text("availability"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// NGO table
export const ngos = pgTable("ngos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  organizationName: text("organization_name").notNull(),
  description: text("description"),
  website: text("website"),
  isApproved: boolean("is_approved").default(false).notNull(),
});

// Food Pickups table
export const foodPickups = pgTable("food_pickups", {
  id: serial("id").primaryKey(),
  ngoId: integer("ngo_id").references(() => ngos.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  foodItems: text("food_items").notNull(),
  quantity: text("quantity").notNull(),
  pickupTime: timestamp("pickup_time").notNull(),
  pickupEndTime: timestamp("pickup_end_time").notNull(),
  destination: text("destination").notNull(),
  additionalNotes: text("additional_notes"),
  status: pickupStatusEnum("status").default('pending').notNull(),
  volunteerId: integer("volunteer_id").references(() => users.id),
  distance: text("distance"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isVerified: true,
  verificationToken: true,
  resetToken: true,
  resetTokenExpiry: true,
  createdAt: true
});

export const insertNgoSchema = createInsertSchema(ngos).omit({
  id: true,
  isApproved: true,
});

export const insertFoodPickupSchema = createInsertSchema(foodPickups).omit({
  id: true,
  status: true,
  volunteerId: true,
  distance: true,
  createdAt: true
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Extra schemas for validation
export const registerUserSchema = insertUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type NGO = typeof ngos.$inferSelect;
export type InsertNGO = z.infer<typeof insertNgoSchema>;
export type FoodPickup = typeof foodPickups.$inferSelect;
export type InsertFoodPickup = z.infer<typeof insertFoodPickupSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterUserData = z.infer<typeof registerUserSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
