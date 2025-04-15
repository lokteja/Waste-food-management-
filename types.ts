import { User, Volunteer, Ngo } from "./schema";

export type AuthUser = User & {
  volunteer?: Volunteer;
  ngo?: Ngo;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type VerificationRequest = {
  token: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  password: string;
};

export type AvailabilityTimes = {
  weekdayMornings: boolean;
  weekdayAfternoons: boolean;
  weekdayEvenings: boolean;
  weekendMornings: boolean;
  weekendAfternoons: boolean;
  weekendEvenings: boolean;
};

export type Stats = {
  mealsSaved: number;
  activeVolunteers: number;
  partnerNgos: number;
};

export type VolunteerStats = {
  pickupsCompleted: number;
  mealsSaved: number;
  totalHours: number;
};

export type NgoStats = {
  activeRequests: number;
  pendingDeliveries: number;
  mealsThisMonth: number;
};

export type FoodListingWithDetails = {
  id: number;
  title: string;
  description: string;
  mealCount: number;
  pickupAddress: string;
  distance?: number;
  pickupDate: Date;
  pickupWindow: string;
  deliveryLocation: string;
  deliveryDistance?: number;
  status: string;
  needsRefrigeration: boolean;
  instructions?: string;
  ngoId: number;
  ngoName: string;
  createdAt: Date;
};

export type PickupWithDetails = {
  id: number;
  status: string;
  acceptedAt: Date;
  completedAt?: Date;
  foodListing: FoodListingWithDetails;
  volunteer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
};
