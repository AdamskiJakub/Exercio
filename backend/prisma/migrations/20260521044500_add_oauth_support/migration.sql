-- AlterTable: Make password nullable for OAuth users
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;

-- AlterTable: Add OAuth provider fields
ALTER TABLE "users" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'local';
ALTER TABLE "users" ADD COLUMN "providerId" TEXT;
ALTER TABLE "users" ADD COLUMN "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "avatarUrl" TEXT;

-- CreateIndex: Unique constraint on provider + providerId combination
CREATE UNIQUE INDEX "users_provider_providerId_key" ON "users"("provider", "providerId");
