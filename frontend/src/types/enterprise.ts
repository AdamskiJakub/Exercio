export enum EnterpriseCategory {
  DANCE_SCHOOL = "DANCE_SCHOOL",
  GYM = "GYM",
  FITNESS_CLUB = "FITNESS_CLUB",
  YOGA_STUDIO = "YOGA_STUDIO",
  PILATES_STUDIO = "PILATES_STUDIO",
  MARTIAL_ARTS = "MARTIAL_ARTS",
  SWIMMING_POOL = "SWIMMING_POOL",
  PERSONAL_TRAINING_STUDIO = "PERSONAL_TRAINING_STUDIO",
  SPORTS_CENTER = "SPORTS_CENTER",
  OTHER = "OTHER",
}

export enum EnterpriseStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  REJECTED = "REJECTED",
}

export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  REMOVED = "REMOVED",
}

export interface EnterpriseProfile {
  id: string;
  userId: string;
  status: EnterpriseStatus;
  verified: boolean;
  companyName: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  openingHours: Record<string, string> | null;
  highlights: { label: string; value: string }[] | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  city: string | null;
  address: string | null;
  postalCode: string | null;
  category: EnterpriseCategory;
  tags: string[];
  amenities: string[];
  gallery: string[];
  videos: string[];
  partners: string[];
  certificates: string[];
  subscriptionId: string | null;
  subscriptionStatus: string | null;
  subscribedAt: string | null;
  subscriptionExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  instructors?: EnterpriseInstructorWithProfile[];
  news?: EnterpriseNews[];
  averageRating?: number | null;
  reviewCount?: number;
}

export interface EnterpriseInstructor {
  id: string;
  enterpriseId: string;
  instructorId: string;
  status: InvitationStatus;
  role: string | null;
  invitedAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  removedAt: string | null;
}

export interface EnterpriseInstructorWithProfile extends EnterpriseInstructor {
  instructor: {
    id: string;
    userId: string;
    photoUrl: string | null;
    tagline: string | null;
    city: string | null;
    specializations: string[];
    verified: boolean;
    user: {
      id: string;
      username: string;
      firstName: string | null;
      lastName: string | null;
      role: string;
      avatarUrl?: string | null;
    };
  };
}

export interface EnterpriseNews {
  id: string;
  enterpriseId: string;
  type: string;
  url: string;
  title: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  platform: string | null;
  createdAt: string;
}

export interface EnterpriseLead {
  id: string;
  companyName: string;
  city: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnterpriseListing {
  id: string;
  companyName: string;
  slug: string;
  shortDescription: string | null;
  logoUrl: string | null;
  city: string | null;
  category: EnterpriseCategory;
  tags: string[];
  verified: boolean;
  averageRating?: number | null;
  reviewCount?: number;
  instructorCount?: number;
}

export interface CreateEnterpriseLeadDto {
  companyName: string;
  city?: string;
  email: string;
  phone?: string;
  website?: string;
  message?: string;
  businessType?: string;
  instructorCount?: string;
}

export interface UpdateEnterpriseProfileDto {
  companyName?: string;
  shortDescription?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  coverUrl?: string;
  openingHours?: Record<string, string>;
  highlights?: { label: string; value: string }[];
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  category?: EnterpriseCategory;
  tags?: string[];
  amenities?: string[];
  gallery?: string[];
  videos?: string[];
  partners?: string[];
  certificates?: string[];
}

export interface SearchInstructorResult {
  id: string;
  userId: string;
  photoUrl: string | null;
  tagline: string | null;
  city: string | null;
  specializations: string[];
  specializationSlugs: string[];
  verified: boolean;
  isDraft: boolean;
  user: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    avatarUrl?: string | null;
  };
}

export interface CreateInvitationDto {
  instructorId: string;
  role?: string;
}
