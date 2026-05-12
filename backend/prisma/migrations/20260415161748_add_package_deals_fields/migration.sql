-- AlterTable
ALTER TABLE "instructor_profiles" ADD COLUMN     "packageDealsDescription" TEXT,
ADD COLUMN     "packageDealsEnabled" BOOLEAN DEFAULT false;
