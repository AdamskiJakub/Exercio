-- CreateEnum
CREATE TYPE "EnterpriseCategory" AS ENUM ('DANCE_SCHOOL', 'GYM', 'FITNESS_CLUB', 'YOGA_STUDIO', 'PILATES_STUDIO', 'MARTIAL_ARTS', 'SWIMMING_POOL', 'PERSONAL_TRAINING_STUDIO', 'SPORTS_CENTER', 'OTHER');

-- CreateEnum
CREATE TYPE "EnterpriseStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'REMOVED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'ENTERPRISE_INVITATION';
ALTER TYPE "NotificationType" ADD VALUE 'ENTERPRISE_INVITATION_ACCEPTED';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ENTERPRISE';

-- CreateTable
CREATE TABLE "enterprise_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "EnterpriseStatus" NOT NULL DEFAULT 'PENDING',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "companyName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "youtubeUrl" TEXT,
    "tiktokUrl" TEXT,
    "city" TEXT,
    "address" TEXT,
    "postalCode" TEXT,
    "category" "EnterpriseCategory" NOT NULL DEFAULT 'OTHER',
    "tags" TEXT[],
    "amenities" TEXT[],
    "gallery" TEXT[],
    "videos" TEXT[],
    "partners" TEXT[],
    "certificates" TEXT[],
    "subscriptionId" TEXT,
    "subscriptionStatus" TEXT DEFAULT 'incomplete',
    "subscribedAt" TIMESTAMP(3),
    "subscriptionExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enterprise_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprise_instructors" (
    "id" TEXT NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "role" TEXT,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "enterprise_instructors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprise_news" (
    "id" TEXT NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "platform" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enterprise_news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprise_leads" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "city" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enterprise_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_profiles_userId_key" ON "enterprise_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_profiles_slug_key" ON "enterprise_profiles"("slug");

-- CreateIndex
CREATE INDEX "enterprise_profiles_status_idx" ON "enterprise_profiles"("status");

-- CreateIndex
CREATE INDEX "enterprise_profiles_city_idx" ON "enterprise_profiles"("city");

-- CreateIndex
CREATE INDEX "enterprise_profiles_category_idx" ON "enterprise_profiles"("category");

-- CreateIndex
CREATE INDEX "enterprise_profiles_slug_idx" ON "enterprise_profiles"("slug");

-- CreateIndex
CREATE INDEX "enterprise_instructors_enterpriseId_idx" ON "enterprise_instructors"("enterpriseId");

-- CreateIndex
CREATE INDEX "enterprise_instructors_instructorId_idx" ON "enterprise_instructors"("instructorId");

-- CreateIndex
CREATE INDEX "enterprise_instructors_status_idx" ON "enterprise_instructors"("status");

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_instructors_enterpriseId_instructorId_key" ON "enterprise_instructors"("enterpriseId", "instructorId");

-- CreateIndex
CREATE INDEX "enterprise_news_enterpriseId_idx" ON "enterprise_news"("enterpriseId");

-- CreateIndex
CREATE INDEX "enterprise_leads_status_idx" ON "enterprise_leads"("status");

-- AddForeignKey
ALTER TABLE "enterprise_profiles" ADD CONSTRAINT "enterprise_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise_instructors" ADD CONSTRAINT "enterprise_instructors_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "enterprise_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise_instructors" ADD CONSTRAINT "enterprise_instructors_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "instructor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise_news" ADD CONSTRAINT "enterprise_news_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "enterprise_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
