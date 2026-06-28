-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_userId_fkey";

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "isGuestReview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lowRatingReason" TEXT,
ADD COLUMN     "reviewToken" TEXT,
ADD COLUMN     "reviewTokenExpiresAt" TIMESTAMP(3),
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "reviews_reviewToken_key" ON "reviews"("reviewToken");

-- CreateIndex
CREATE INDEX "reviews_reviewToken_idx" ON "reviews"("reviewToken");

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
