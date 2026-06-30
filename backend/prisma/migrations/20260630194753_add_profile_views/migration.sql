-- CreateTable
CREATE TABLE "profile_views" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instructorProfileId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "profile_views_userId_viewedAt_idx" ON "profile_views"("userId", "viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "profile_views_userId_instructorProfileId_key" ON "profile_views"("userId", "instructorProfileId");

-- AddForeignKey
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_instructorProfileId_fkey" FOREIGN KEY ("instructorProfileId") REFERENCES "instructor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
