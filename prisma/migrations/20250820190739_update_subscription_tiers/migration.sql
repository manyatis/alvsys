-- AlterEnum
ALTER TYPE "public"."Status" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "plan" SET DEFAULT 'hobby',
ALTER COLUMN "subscriptionTier" SET DEFAULT 'hobby';
