-- Add social media fields to instructor_profiles table
ALTER TABLE "instructor_profiles" ADD COLUMN IF NOT EXISTS "instagramUrl" TEXT;
ALTER TABLE "instructor_profiles" ADD COLUMN IF NOT EXISTS "facebookUrl" TEXT;
ALTER TABLE "instructor_profiles" ADD COLUMN IF NOT EXISTS "whatsappUrl" TEXT;
