import { PrismaService } from '../prisma/prisma.service';

/**
 * Aggregated review stats for an instructor.
 * Keyed by userId (which matches InstructorProfile.userId).
 */
export type ReviewStatsMap = Map<
  string,
  { avgRating: number; reviewCount: number }
>;

/**
 * Fetch aggregated review stats (average rating + review count) for all instructors.
 *
 * Uses raw SQL to avoid N+1 queries. The JOIN goes through the bookings table
 * because reviews are linked to bookings, and bookings have instructorId.
 *
 * Table names use the actual PostgreSQL names as defined by @@map() in schema.prisma:
 * - "reviews" (Prisma model: Review)
 * - "bookings" (Prisma model: Booking)
 */
export async function fetchInstructorReviewStats(
  prisma: PrismaService,
): Promise<ReviewStatsMap> {
  const rows = await prisma.$queryRaw<
    Array<{ instructor_id: string; avg_rating: number; review_count: bigint }>
  >`
    SELECT
      b."instructorId" AS instructor_id,
      COALESCE(AVG(r.rating), 0)::numeric(3,1) AS avg_rating,
      COUNT(r.id) AS review_count
    FROM "reviews" r
    JOIN "bookings" b ON b."id" = r."bookingId"
    GROUP BY b."instructorId"
  `;

  const map = new Map<string, { avgRating: number; reviewCount: number }>();
  for (const row of rows) {
    map.set(row.instructor_id, {
      avgRating: Number(row.avg_rating),
      reviewCount: Number(row.review_count),
    });
  }
  return map;
}
