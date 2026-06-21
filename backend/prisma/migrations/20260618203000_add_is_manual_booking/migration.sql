-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "isManualBooking" BOOLEAN NOT NULL DEFAULT false;

-- Mark existing instructor-created bookings (no clientId, no guestEmail) as manual
UPDATE "bookings"
SET "isManualBooking" = true
WHERE "clientId" IS NULL
  AND "guestEmail" IS NULL;
