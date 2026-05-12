-- AlterTable
-- Add contact visibility and message fields to InstructorProfile
ALTER TABLE "instructor_profiles" 
  ADD COLUMN IF NOT EXISTS "showPhone" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "showEmail" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "contactMessage" TEXT;
