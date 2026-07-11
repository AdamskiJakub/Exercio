-- Add new fields to enterprise_profiles for the enterprise redesign
ALTER TABLE "enterprise_profiles" ADD COLUMN "businessType" TEXT;
ALTER TABLE "enterprise_profiles" ADD COLUMN "targetAudience" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "enterprise_profiles" ADD COLUMN "disciplines" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "enterprise_profiles" ADD COLUMN "languages" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "enterprise_profiles" ADD COLUMN "hasParking" BOOLEAN;
ALTER TABLE "enterprise_profiles" ADD COLUMN "hasShower" BOOLEAN;
ALTER TABLE "enterprise_profiles" ADD COLUMN "hasLockerRoom" BOOLEAN;
ALTER TABLE "enterprise_profiles" ADD COLUMN "hasAirConditioning" BOOLEAN;
ALTER TABLE "enterprise_profiles" ADD COLUMN "hasDisabledAccess" BOOLEAN;
ALTER TABLE "enterprise_profiles" ADD COLUMN "hasFreeTrial" BOOLEAN;
ALTER TABLE "enterprise_profiles" ADD COLUMN "pricing" JSONB;
ALTER TABLE "enterprise_profiles" ADD COLUMN "faq" JSONB;
