/*
  Warnings:

  - Made the column `packageDealsEnabled` on table `instructor_profiles` required. This step will fail if there are existing NULL values in that column.

*/

-- Backfill existing NULL values before enforcing NOT NULL
UPDATE "instructor_profiles"
SET "packageDealsEnabled" = false
WHERE "packageDealsEnabled" IS NULL;

-- AlterTable
ALTER TABLE "instructor_profiles" ADD COLUMN     "hourlyRateHidden" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "packageDealsEnabled" SET NOT NULL;
