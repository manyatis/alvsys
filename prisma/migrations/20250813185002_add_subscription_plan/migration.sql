/*
  Warnings:

  - You are about to drop the column `stripeSubscriptionId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionPlan` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."User_stripeCustomerId_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "stripeSubscriptionId",
DROP COLUMN "subscriptionPlan",
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN     "stripePriceId" TEXT,
ADD COLUMN     "subscriptionEndDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionId" TEXT,
ADD COLUMN     "subscriptionStartDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionTier" TEXT NOT NULL DEFAULT 'free';

-- CreateTable
CREATE TABLE "public"."SubscriptionPlan" (
    "id" SERIAL NOT NULL,
    "planId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "billingPeriod" TEXT NOT NULL DEFAULT 'month',
    "features" TEXT[],
    "description" TEXT,
    "stripePriceId" TEXT,
    "stripeProductId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_planId_key" ON "public"."SubscriptionPlan"("planId");
