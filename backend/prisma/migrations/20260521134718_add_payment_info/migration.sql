-- AlterTable: Add payment info fields to instructor_profiles
-- Note: These fields were already applied via 'prisma db push' but need migration for production

-- Add paymentMethods as text array (empty array by default)
ALTER TABLE "instructor_profiles" 
ADD COLUMN IF NOT EXISTS "paymentMethods" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add paymentInfo as text field (nullable)
ALTER TABLE "instructor_profiles" 
ADD COLUMN IF NOT EXISTS "paymentInfo" TEXT;
