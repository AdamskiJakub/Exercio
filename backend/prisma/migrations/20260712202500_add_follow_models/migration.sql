-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'NEW_FOLLOWER';

-- CreateTable
CREATE TABLE "enterprise_follows" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enterprise_follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructor_follows" (
    "id" TEXT NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "instructorProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instructor_follows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_follows_followerId_enterpriseId_key" ON "enterprise_follows"("followerId", "enterpriseId");

-- CreateIndex
CREATE INDEX "enterprise_follows_followerId_idx" ON "enterprise_follows"("followerId");

-- CreateIndex
CREATE INDEX "enterprise_follows_enterpriseId_idx" ON "enterprise_follows"("enterpriseId");

-- CreateIndex
CREATE UNIQUE INDEX "instructor_follows_enterpriseId_instructorProfileId_key" ON "instructor_follows"("enterpriseId", "instructorProfileId");

-- CreateIndex
CREATE INDEX "instructor_follows_enterpriseId_idx" ON "instructor_follows"("enterpriseId");

-- CreateIndex
CREATE INDEX "instructor_follows_instructorProfileId_idx" ON "instructor_follows"("instructorProfileId");

-- AddForeignKey
ALTER TABLE "enterprise_follows" ADD CONSTRAINT "enterprise_follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise_follows" ADD CONSTRAINT "enterprise_follows_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "enterprise_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructor_follows" ADD CONSTRAINT "instructor_follows_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "enterprise_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructor_follows" ADD CONSTRAINT "instructor_follows_instructorProfileId_fkey" FOREIGN KEY ("instructorProfileId") REFERENCES "instructor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
