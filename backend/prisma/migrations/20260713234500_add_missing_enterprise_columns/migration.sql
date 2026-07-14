-- Add missing columns that were added to schema.prisma but never had a migration
-- These use IF NOT EXISTS so they're safe to run on any database

-- User activation fields (for enterprise account activation via email)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "activationToken" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "activationExpires" TIMESTAMP(3);

-- Enterprise lead fields (from the application form)
ALTER TABLE "enterprise_leads" ADD COLUMN IF NOT EXISTS "businessType" TEXT;
ALTER TABLE "enterprise_leads" ADD COLUMN IF NOT EXISTS "instructorCount" TEXT;
