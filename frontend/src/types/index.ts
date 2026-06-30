import type { PaymentMethod } from "@/constants/payment";

export enum UserRole {
  CLIENT = "CLIENT",
  INSTRUCTOR = "INSTRUCTOR",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

// Basic user info returned by backend in instructor listings
// (without createdAt, updatedAt, and optionally without email/phone for privacy)
export interface UserBasic {
  id: string;
  email?: string; // Optional for privacy in public listings
  phone?: string | null; // Optional for privacy in public listings
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: string; // Note: backend returns string, not enum
}

export interface InstructorProfile {
  id: string;
  userId: string;
  user?: UserBasic; // Use UserBasic instead of full User for API responses
  bio: string | null;
  tagline: string | null;
  specializations: string[];
  tags: string[];
  goals: string[];
  location: string | null;
  city: string | null;
  hourlyRate: number | null;
  hourlyRateHidden: boolean;
  packageDealsEnabled: boolean;
  packageDealsDescription: string | null;
  photoUrl: string | null;
  gallery: string[];
  verified: boolean;
  isDraft: boolean;
  yearsExperience: number | null;
  availability: string | null;
  languages: string[];
  showPhone?: boolean;
  showEmail?: boolean;
  contactMessage?: string | null;
  // Booking settings
  sessionDuration?: number;
  sessionPrice?: number | null;
  isBookingEnabled?: boolean;
  minNoticeHours?: number;
  // Payment information
  paymentMethods?: PaymentMethod[];
  paymentInfo?: string | null;
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  reviewCount?: number;
  favoriteCount?: number;
}

export interface InstructorListing extends Omit<
  InstructorProfile,
  "user" | "availability"
> {
  username: string;
  fullName: string;
  availability: "online" | "in-person" | "both";
  primarySpecialization: string;
  videoUrl: string | null;
  user?: UserBasic; // Use UserBasic instead of User (no phone, createdAt, updatedAt)
}

export interface Service {
  id: string;
  instructorId: string;
  instructor?: InstructorProfile;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface Booking {
  id: string;
  clientId: string;
  client?: User;
  instructorId: string;
  instructor?: InstructorProfile;
  serviceId: string;
  service?: Service;
  date: string;
  status: BookingStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  review?: Review;
}

export interface FavoriteInstructor {
  id: string;
  userId: string;
  user: UserBasic;
  photoUrl: string | null;
  tagline: string | null;
  city: string | null;
  specializations: string[];
  verified: boolean;
  favoritedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  booking?: Booking;
  userId: string;
  user?: User;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export type NotificationType =
  | "FAVORITE"
  | "NEW_BOOKING"
  | "NEW_REVIEW"
  | "BOOKING_CANCELLED";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface PaginatedNotifications {
  data: Notification[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
