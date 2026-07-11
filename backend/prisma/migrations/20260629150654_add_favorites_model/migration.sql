/*
  Warnings:

  - You are about to drop the column `reviewToken` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `reviewTokenExpiresAt` on the `reviews` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_clientId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_serviceId_fkey";

-- DropIndex
DROP INDEX "reviews_reviewToken_idx";

-- DropIndex
DROP INDEX "reviews_reviewToken_key";

-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "cancellationTokenExpiresAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "reviewTokenExpiresAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "instructor_profiles" ALTER COLUMN "sessionPrice" DROP NOT NULL,
ALTER COLUMN "sessionPrice" DROP DEFAULT,
ALTER COLUMN "minNoticeHours" SET DEFAULT 48;

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "reviewToken",
DROP COLUMN "reviewTokenExpiresAt";

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instructorProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorites_userId_idx" ON "favorites"("userId");

-- CreateIndex
CREATE INDEX "favorites_instructorProfileId_idx" ON "favorites"("instructorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_instructorProfileId_key" ON "favorites"("userId", "instructorProfileId");

-- CreateIndex
CREATE INDEX "bookings_clientId_idx" ON "bookings"("clientId");

-- CreateIndex
CREATE INDEX "bookings_instructorId_idx" ON "bookings"("instructorId");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- RenameForeignKey
ALTER TABLE "bookings" RENAME CONSTRAINT "bookings_instructorId_fkey" TO "bookings_instructor_user_fkey";

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_instructorProfileId_fkey" FOREIGN KEY ("instructorProfileId") REFERENCES "instructor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
