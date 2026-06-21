/**
 * Shared TypeScript interfaces for the Bookings module
 */

/** A single time slot returned by the availability system */
export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  isShortNotice: boolean;
  isException?: boolean;
  available: boolean;
  booking?: TimeSlotBookingInfo;
}

export interface TimeSlotBookingInfo {
  id: string;
  status: string;
  notes?: string;
  clientName: string;
  clientEmail?: string;
  cancellationReason?: string;
  cancelledBy?: string;
}

/** Weekly availability slot from the database */
export interface WeeklyAvailabilitySlot {
  id: string;
  instructorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Availability exception from the database */
export interface AvailabilityExceptionSlot {
  id: string;
  instructorId: string;
  date: Date;
  isAvailable: boolean;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Minimal booking data used for slot overlap checking */
export interface BookingOverlapInfo {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
  notes?: string | boolean;
  guestName?: string | boolean;
  guestEmail?: string | boolean;
  cancellationReason?: string | boolean;
  cancelledBy?: string | boolean;
  client?:
    | {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      }
    | false
    | null;
}

/** Shape of the instructor profile data needed for slot generation */
export interface InstructorSlotProfile {
  userId: string;
  isBookingEnabled: boolean;
  sessionDuration: number;
  minNoticeHours: number;
  weeklyAvailability: WeeklyAvailabilitySlot[];
  availabilityExceptions: AvailabilityExceptionSlot[];
}

/** Result of the cancellation deadline check */
export interface CancellationDeadlineResult {
  canCancel: boolean;
  deadlineDate?: Date;
  errorMessage?: string;
}

/** Client name info extracted from a booking */
export interface ClientNameInfo {
  name: string;
  email?: string;
}

/**
 * A booking record with client info extracted for name/email formatting.
 * Used by helper functions that don't need the full Prisma shape.
 */
export interface BookingWithClientInfo {
  guestName?: string | boolean | null;
  guestEmail?: string | boolean | null;
  client?:
    | {
        id?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
      }
    | false
    | null;
}

// ---------------------------------------------------------------------------
// Mapping / type-guard helpers for data coming from Prisma `include: true`
// ---------------------------------------------------------------------------

/**
 * Safely map a raw Prisma weekly availability record to WeeklyAvailabilitySlot.
 * Validates the shape at runtime and returns `null` for invalid data.
 */
export function toWeeklyAvailabilitySlot(
  raw: unknown,
): WeeklyAvailabilitySlot | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (
    typeof r.id === 'string' &&
    typeof r.instructorId === 'string' &&
    typeof r.dayOfWeek === 'number' &&
    typeof r.startTime === 'string' &&
    typeof r.endTime === 'string' &&
    typeof r.isActive === 'boolean'
  ) {
    return {
      id: r.id,
      instructorId: r.instructorId,
      dayOfWeek: r.dayOfWeek,
      startTime: r.startTime,
      endTime: r.endTime,
      isActive: r.isActive,
      createdAt:
        r.createdAt instanceof Date
          ? r.createdAt
          : new Date(r.createdAt as string),
      updatedAt:
        r.updatedAt instanceof Date
          ? r.updatedAt
          : new Date(r.updatedAt as string),
    };
  }
  return null;
}

/**
 * Safely map an array of raw Prisma weekly availability records.
 * Filters out any invalid entries.
 */
export function toWeeklyAvailabilitySlots(
  raw: unknown[],
): WeeklyAvailabilitySlot[] {
  return raw
    .map(toWeeklyAvailabilitySlot)
    .filter((s): s is WeeklyAvailabilitySlot => s !== null);
}

/**
 * Safely map a raw Prisma availability exception record to AvailabilityExceptionSlot.
 */
export function toAvailabilityExceptionSlot(
  raw: unknown,
): AvailabilityExceptionSlot | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (
    typeof r.id === 'string' &&
    typeof r.instructorId === 'string' &&
    typeof r.isAvailable === 'boolean'
  ) {
    return {
      id: r.id,
      instructorId: r.instructorId,
      date: r.date instanceof Date ? r.date : new Date(r.date as string),
      isAvailable: r.isAvailable,
      startTime: (r.startTime as string) ?? null,
      endTime: (r.endTime as string) ?? null,
      reason: (r.reason as string) ?? null,
      createdAt:
        r.createdAt instanceof Date
          ? r.createdAt
          : new Date(r.createdAt as string),
      updatedAt:
        r.updatedAt instanceof Date
          ? r.updatedAt
          : new Date(r.updatedAt as string),
    };
  }
  return null;
}

/**
 * Safely map an array of raw Prisma availability exception records.
 */
export function toAvailabilityExceptionSlots(
  raw: unknown[],
): AvailabilityExceptionSlot[] {
  return raw
    .map(toAvailabilityExceptionSlot)
    .filter((s): s is AvailabilityExceptionSlot => s !== null);
}
