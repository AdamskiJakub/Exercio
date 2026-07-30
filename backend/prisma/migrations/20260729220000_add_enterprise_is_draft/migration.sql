-- Add isDraft column to enterprise_profiles
ALTER TABLE "enterprise_profiles" ADD COLUMN IF NOT EXISTS "isDraft" BOOLEAN NOT NULL DEFAULT true;
