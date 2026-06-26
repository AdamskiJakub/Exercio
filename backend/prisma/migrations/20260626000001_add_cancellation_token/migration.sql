-- Add cancellationToken and cancellationTokenExpiresAt columns to bookings table
ALTER TABLE "bookings" ADD COLUMN "cancellationToken" TEXT;
ALTER TABLE "bookings" ADD COLUMN "cancellationTokenExpiresAt" TIMESTAMPTZ;

-- Add reviewToken and reviewTokenExpiresAt columns to bookings table
ALTER TABLE "bookings" ADD COLUMN "reviewToken" TEXT;
ALTER TABLE "bookings" ADD COLUMN "reviewTokenExpiresAt" TIMESTAMPTZ;

-- Create unique indexes
CREATE UNIQUE INDEX "bookings_cancellationToken_key" ON "bookings"("cancellationToken");
CREATE UNIQUE INDEX "bookings_reviewToken_key" ON "bookings"("reviewToken");

-- Create indexes for queries
CREATE INDEX "bookings_cancellationToken_idx" ON "bookings"("cancellationToken");
CREATE INDEX "bookings_cancellationTokenExpiresAt_idx" ON "bookings"("cancellationTokenExpiresAt");
CREATE INDEX "bookings_reviewToken_idx" ON "bookings"("reviewToken");
CREATE INDEX "bookings_reviewTokenExpiresAt_idx" ON "bookings"("reviewTokenExpiresAt");
