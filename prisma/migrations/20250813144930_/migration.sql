/*
  Warnings:

  - You are about to drop the column `activity` on the `AIWorkLog` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `AIWorkLog` table. All the data in the column will be lost.
  - You are about to drop the column `endpoint` on the `AIWorkLog` table. All the data in the column will be lost.
  - You are about to drop the column `payload` on the `AIWorkLog` table. All the data in the column will be lost.
  - You are about to drop the column `response` on the `AIWorkLog` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Card` table. All the data in the column will be lost.
  - The `status` column on the `Card` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `ProjectUser` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ProjectUser` table. All the data in the column will be lost.
  - You are about to drop the column `socialProvider` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionInformationId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AgentDeveloperInstruction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubscriptionInformation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubscriptionTier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `action` to the `AIWorkLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cardId` to the `AIWorkLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `AIWorkLog` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('REFINEMENT', 'READY', 'IN_PROGRESS', 'BLOCKED', 'READY_FOR_REVIEW', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."InstructionType" AS ENUM ('GIT', 'SPIKE', 'CODING', 'ARCHITECTURE');

-- DropForeignKey
ALTER TABLE "public"."AgentDeveloperInstruction" DROP CONSTRAINT "AgentDeveloperInstruction_cardId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Card" DROP CONSTRAINT "Card_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Card" DROP CONSTRAINT "Card_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Project" DROP CONSTRAINT "Project_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProjectUser" DROP CONSTRAINT "ProjectUser_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProjectUser" DROP CONSTRAINT "ProjectUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SubscriptionInformation" DROP CONSTRAINT "SubscriptionInformation_subscriptionTierId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_subscriptionInformationId_fkey";

-- DropIndex
DROP INDEX "public"."User_subscriptionInformationId_key";

-- AlterTable
ALTER TABLE "public"."AIWorkLog" DROP COLUMN "activity",
DROP COLUMN "date",
DROP COLUMN "endpoint",
DROP COLUMN "payload",
DROP COLUMN "response",
ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "apiEndpoint" TEXT,
ADD COLUMN     "cardId" TEXT NOT NULL,
ADD COLUMN     "details" JSONB,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Card" DROP COLUMN "createdById",
ADD COLUMN     "aiAssigneeId" TEXT,
ADD COLUMN     "assigneeId" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "sprintId" TEXT,
ADD COLUMN     "storyPoints" INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'REFINEMENT';

-- AlterTable
ALTER TABLE "public"."Organization" ADD COLUMN     "description" TEXT,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "organizationId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."ProjectUser" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "socialProvider",
DROP COLUMN "subscriptionInformationId",
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscriptionPlan" TEXT,
ADD COLUMN     "subscriptionStatus" TEXT,
ADD COLUMN     "username" TEXT,
ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "public"."AgentDeveloperInstruction";

-- DropTable
DROP TABLE "public"."SubscriptionInformation";

-- DropTable
DROP TABLE "public"."SubscriptionTier";

-- DropTable
DROP TABLE "public"."VerificationToken";

-- DropEnum
DROP TYPE "public"."AgentInstructionType";

-- DropEnum
DROP TYPE "public"."CardStatus";

-- DropEnum
DROP TYPE "public"."SocialProvider";

-- DropEnum
DROP TYPE "public"."SubscriptionTierType";

-- CreateTable
CREATE TABLE "public"."OrganizationInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "isAiComment" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Label" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "description" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CardLabel" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,

    CONSTRAINT "CardLabel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Sprint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentDeveloperInstructions" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "instructionType" "public"."InstructionType" NOT NULL,
    "branchName" TEXT,
    "createBranch" BOOLEAN NOT NULL DEFAULT false,
    "webResearchPrompt" TEXT,
    "codeResearchPrompt" TEXT,
    "architectureGuidelines" TEXT,
    "generalInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentDeveloperInstructions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."APIKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "APIKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationInvitation_token_key" ON "public"."OrganizationInvitation"("token");

-- CreateIndex
CREATE INDEX "OrganizationInvitation_email_idx" ON "public"."OrganizationInvitation"("email");

-- CreateIndex
CREATE INDEX "OrganizationInvitation_organizationId_idx" ON "public"."OrganizationInvitation"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationInvitation_token_idx" ON "public"."OrganizationInvitation"("token");

-- CreateIndex
CREATE INDEX "Comment_cardId_idx" ON "public"."Comment"("cardId");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "public"."Comment"("authorId");

-- CreateIndex
CREATE INDEX "Label_projectId_idx" ON "public"."Label"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Label_projectId_name_key" ON "public"."Label"("projectId", "name");

-- CreateIndex
CREATE INDEX "CardLabel_cardId_idx" ON "public"."CardLabel"("cardId");

-- CreateIndex
CREATE INDEX "CardLabel_labelId_idx" ON "public"."CardLabel"("labelId");

-- CreateIndex
CREATE UNIQUE INDEX "CardLabel_cardId_labelId_key" ON "public"."CardLabel"("cardId", "labelId");

-- CreateIndex
CREATE INDEX "Sprint_projectId_idx" ON "public"."Sprint"("projectId");

-- CreateIndex
CREATE INDEX "Sprint_isActive_idx" ON "public"."Sprint"("isActive");

-- CreateIndex
CREATE INDEX "AgentDeveloperInstructions_cardId_idx" ON "public"."AgentDeveloperInstructions"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "APIKey_key_key" ON "public"."APIKey"("key");

-- CreateIndex
CREATE INDEX "APIKey_userId_idx" ON "public"."APIKey"("userId");

-- CreateIndex
CREATE INDEX "APIKey_key_idx" ON "public"."APIKey"("key");

-- CreateIndex
CREATE INDEX "AIWorkLog_cardId_idx" ON "public"."AIWorkLog"("cardId");

-- CreateIndex
CREATE INDEX "AIWorkLog_userId_idx" ON "public"."AIWorkLog"("userId");

-- CreateIndex
CREATE INDEX "AIWorkLog_createdAt_idx" ON "public"."AIWorkLog"("createdAt");

-- CreateIndex
CREATE INDEX "Card_projectId_idx" ON "public"."Card"("projectId");

-- CreateIndex
CREATE INDEX "Card_status_idx" ON "public"."Card"("status");

-- CreateIndex
CREATE INDEX "Card_assigneeId_idx" ON "public"."Card"("assigneeId");

-- CreateIndex
CREATE INDEX "Card_sprintId_idx" ON "public"."Card"("sprintId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "public"."Organization"("slug");

-- CreateIndex
CREATE INDEX "Project_organizationId_idx" ON "public"."Project"("organizationId");

-- CreateIndex
CREATE INDEX "Project_ownerId_idx" ON "public"."Project"("ownerId");

-- CreateIndex
CREATE INDEX "ProjectUser_userId_idx" ON "public"."ProjectUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "public"."User"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "public"."OrganizationInvitation" ADD CONSTRAINT "OrganizationInvitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationInvitation" ADD CONSTRAINT "OrganizationInvitation_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectUser" ADD CONSTRAINT "ProjectUser_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectUser" ADD CONSTRAINT "ProjectUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "public"."Sprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Label" ADD CONSTRAINT "Label_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardLabel" ADD CONSTRAINT "CardLabel_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardLabel" ADD CONSTRAINT "CardLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "public"."Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sprint" ADD CONSTRAINT "Sprint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentDeveloperInstructions" ADD CONSTRAINT "AgentDeveloperInstructions_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."APIKey" ADD CONSTRAINT "APIKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIWorkLog" ADD CONSTRAINT "AIWorkLog_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AIWorkLog" ADD CONSTRAINT "AIWorkLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
