-- AlterTable: Add cover photo, opening hours, and highlights to enterprise_profiles
ALTER TABLE "enterprise_profiles" ADD COLUMN "coverUrl" TEXT;
ALTER TABLE "enterprise_profiles" ADD COLUMN "openingHours" JSONB;
ALTER TABLE "enterprise_profiles" ADD COLUMN "highlights" JSONB;

-- AlterTable: Add type column to enterprise_news
ALTER TABLE "enterprise_news" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'link';
