-- 1. Update enum (must be at the beginning)
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';

-- 2. Add new columns to bookings table
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "startTime" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "endTime" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "duration" INTEGER;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "price" DOUBLE PRECISION;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "isShortNotice" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "isManualBlock" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "guestName" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "guestEmail" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "guestPhone" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "cancelledBy" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "acknowledgedAt" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "hiddenFromClient" BOOLEAN NOT NULL DEFAULT false;

-- 3. Alter column nullability in bookings table
ALTER TABLE "bookings" ALTER COLUMN "clientId" DROP NOT NULL;
ALTER TABLE "bookings" ALTER COLUMN "serviceId" DROP NOT NULL;
ALTER TABLE "bookings" ALTER COLUMN "date" DROP NOT NULL;

-- 4. COPILOT FIX: Migrate instructorId relation from profiles to users
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_instructor_profile_fkey";
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_instructorId_fkey";

UPDATE "bookings" AS b
SET "instructorId" = ip."userId"
FROM "instructor_profiles" AS ip
WHERE b."instructorId" = ip."id";

ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_instructorId_fkey"
FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS "bookings_startTime_idx" ON "bookings"("startTime");

-- 6. Add new columns to instructor_profiles table
ALTER TABLE "instructor_profiles" ADD COLUMN IF NOT EXISTS "isBookingEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "instructor_profiles" ADD COLUMN IF NOT EXISTS "sessionDuration" INTEGER NOT NULL DEFAULT 60;
ALTER TABLE "instructor_profiles" ADD COLUMN IF NOT EXISTS "sessionPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "instructor_profiles" ADD COLUMN IF NOT EXISTS "minNoticeHours" INTEGER NOT NULL DEFAULT 24;

-- 7. CreateTable: availability (weekly schedule)
CREATE TABLE IF NOT EXISTS "availability" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_pkey" PRIMARY KEY ("id")
);

-- 8. CreateTable: availability_exceptions (special dates / time off)
CREATE TABLE IF NOT EXISTS "availability_exceptions" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT,
    "endTime" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_exceptions_pkey" PRIMARY KEY ("id")
);

-- 9. Create indexes for availability and exceptions
CREATE INDEX IF NOT EXISTS "availability_instructorId_idx" ON "availability"("instructorId");
CREATE UNIQUE INDEX IF NOT EXISTS "availability_instructorId_dayOfWeek_key" ON "availability"("instructorId", "dayOfWeek");

CREATE INDEX IF NOT EXISTS "availability_exceptions_instructorId_idx" ON "availability_exceptions"("instructorId");
CREATE INDEX IF NOT EXISTS "availability_exceptions_date_idx" ON "availability_exceptions"("date");
CREATE UNIQUE INDEX IF NOT EXISTS "availability_exceptions_instructorId_date_key" ON "availability_exceptions"("instructorId", "date");

-- 10. Add foreign keys for availability tables
ALTER TABLE "availability" ADD CONSTRAINT "availability_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "instructor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "availability_exceptions" ADD CONSTRAINT "availability_exceptions_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "instructor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
