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
  aboutImage: string | null;
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
  businessType: string | null;
  targetAudience: string[];
  disciplines: string[];
  languages: string[];
  hasParking: boolean | null;
  hasShower: boolean | null;
  hasLockerRoom: boolean | null;
  hasAirConditioning: boolean | null;
  hasDisabledAccess: boolean | null;
  hasFreeTrial: boolean | null;
  pricing: { label: string; price: number }[] | null;
  faq: { question: string; answer: string }[] | null;
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

/**
 * A single highlight item (label + value pair).
 */
export interface HighlightItem {
  label: string;
  value: string;
}

/**
 * A single pricing item (label + price).
 */
export interface PricingItem {
  label: string;
  price: number;
}

/**
 * A single FAQ item (question + answer).
 */
export interface FaqItem {
  question: string;
  answer: string;
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
  aboutImage?: string;
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
  businessType?: string;
  targetAudience?: string[];
  disciplines?: string[];
  languages?: string[];
  hasParking?: boolean;
  hasShower?: boolean;
  hasLockerRoom?: boolean;
  hasAirConditioning?: boolean;
  hasDisabledAccess?: boolean;
  hasFreeTrial?: boolean;
  pricing?: { label: string; price: number }[];
  faq?: { question: string; answer: string }[];
}

export interface MediaField {
  url: string;
  isUploading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUrlChange: (value: string) => void;
  onRemove: () => void;
}

export interface GalleryField {
  items: string[];
  isUploading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: (url: string) => void;
  onRemove: (index: number) => void;
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
