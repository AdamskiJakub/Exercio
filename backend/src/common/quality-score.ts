const RECENCY_BONUS_DAYS = 30;

function calculateRecencyBonus(createdAt: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const daysOld = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, RECENCY_BONUS_DAYS - daysOld);
}

// ----- Instructor Score -----

export interface InstructorScoreInput {
  isDraft: boolean;
  photoUrl: string | null;
  bio: string | null;
  specializations: string[];
  availability: string | null;
  isBookingEnabled: boolean;
  createdAt: Date;
  // Review data (optional — passed separately since it requires a join)
  reviewCount?: number;
  averageRating?: number;
}

export function calculateInstructorScore(input: InstructorScoreInput): number {
  let score = 0;

  // Published profile
  if (!input.isDraft) {
    score += 10;
  }

  // Profile photo
  if (input.photoUrl) {
    score += 5;
  }

  // Bio longer than 200 characters
  if (input.bio && input.bio.length > 200) {
    score += 5;
  }

  // At least 3 specializations
  if (input.specializations.length >= 3) {
    score += 3;
  }

  // Availability set
  if (input.availability) {
    score += 5;
  }

  // Booking enabled
  if (input.isBookingEnabled) {
    score += 5;
  }

  // Reviews: +2 per review, max 10
  const reviewPoints = Math.min((input.reviewCount || 0) * 2, 10);
  score += reviewPoints;

  // Average rating >= 4.5
  if (input.averageRating && input.averageRating >= 4.5) {
    score += 5;
  }

  // Recency bonus
  score += calculateRecencyBonus(input.createdAt);

  return score;
}

// ----- Enterprise Score -----

export interface EnterpriseScoreInput {
  status: string;
  logoUrl: string | null;
  coverUrl: string | null;
  description: string | null;
  instructorCount: number;
  gallery: string[];
  openingHours: unknown;
  createdAt: Date;
}

export function calculateEnterpriseScore(input: EnterpriseScoreInput): number {
  let score = 0;

  // Active profile
  if (input.status === 'ACTIVE') {
    score += 10;
  }

  // Logo
  if (input.logoUrl) {
    score += 5;
  }

  // Cover image
  if (input.coverUrl) {
    score += 5;
  }

  // Description longer than 300 characters
  if (input.description && input.description.length > 300) {
    score += 5;
  }

  // At least 1 instructor
  if (input.instructorCount > 0) {
    score += 5;
  }

  // Gallery with photos
  if (input.gallery.length > 0) {
    score += 3;
  }

  // Opening hours set
  if (input.openingHours) {
    score += 2;
  }

  // Recency bonus
  score += calculateRecencyBonus(input.createdAt);

  return score;
}
