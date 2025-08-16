-- CreateEnum
CREATE TYPE "public"."SyncDirection" AS ENUM ('VIBES_TO_GITHUB', 'GITHUB_TO_VIBES', 'BIDIRECTIONAL');

-- CreateEnum
CREATE TYPE "public"."ConflictResolution" AS ENUM ('MANUAL', 'VIBES_WINS', 'GITHUB_WINS', 'LATEST_TIMESTAMP');

-- AlterTable
ALTER TABLE "public"."Card" ADD COLUMN     "githubIssueId" INTEGER,
ADD COLUMN     "githubIssueUrl" TEXT,
ADD COLUMN     "githubLastSyncAt" TIMESTAMP(3),
ADD COLUMN     "githubSyncEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Comment" ADD COLUMN     "githubCommentId" INTEGER,
ADD COLUMN     "githubSyncEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "githubInstallationId" TEXT,
ADD COLUMN     "githubLastSyncAt" TIMESTAMP(3),
ADD COLUMN     "githubRepoId" TEXT,
ADD COLUMN     "githubRepoName" TEXT,
ADD COLUMN     "githubRepoUrl" TEXT,
ADD COLUMN     "githubSyncEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "githubWebhookSecret" TEXT;

-- CreateTable
CREATE TABLE "public"."GitHubIssueSync" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "githubIssueId" INTEGER NOT NULL,
    "githubIssueNodeId" TEXT NOT NULL,
    "githubRepoName" TEXT NOT NULL,
    "lastSyncDirection" "public"."SyncDirection" NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "syncConflictResolution" "public"."ConflictResolution" NOT NULL DEFAULT 'MANUAL',
    "statusMapping" JSONB,
    "labelMapping" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GitHubIssueSync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GitHubInstallation" (
    "id" TEXT NOT NULL,
    "githubInstallationId" TEXT NOT NULL,
    "githubAccountId" TEXT NOT NULL,
    "githubAccountLogin" TEXT NOT NULL,
    "githubAccountType" TEXT NOT NULL,
    "repositorySelection" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "events" TEXT[],
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "suspendedAt" TIMESTAMP(3),
    "suspendedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GitHubInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GitHubWebhookEvent" (
    "id" TEXT NOT NULL,
    "githubEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "repositoryName" TEXT NOT NULL,
    "projectId" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "processingError" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB NOT NULL,
    "signature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GitHubWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GitHubIssueSync_cardId_key" ON "public"."GitHubIssueSync"("cardId");

-- CreateIndex
CREATE INDEX "GitHubIssueSync_projectId_idx" ON "public"."GitHubIssueSync"("projectId");

-- CreateIndex
CREATE INDEX "GitHubIssueSync_githubIssueId_idx" ON "public"."GitHubIssueSync"("githubIssueId");

-- CreateIndex
CREATE INDEX "GitHubIssueSync_githubRepoName_idx" ON "public"."GitHubIssueSync"("githubRepoName");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubInstallation_githubInstallationId_key" ON "public"."GitHubInstallation"("githubInstallationId");

-- CreateIndex
CREATE INDEX "GitHubInstallation_userId_idx" ON "public"."GitHubInstallation"("userId");

-- CreateIndex
CREATE INDEX "GitHubInstallation_githubAccountLogin_idx" ON "public"."GitHubInstallation"("githubAccountLogin");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubWebhookEvent_githubEventId_key" ON "public"."GitHubWebhookEvent"("githubEventId");

-- CreateIndex
CREATE INDEX "GitHubWebhookEvent_projectId_idx" ON "public"."GitHubWebhookEvent"("projectId");

-- CreateIndex
CREATE INDEX "GitHubWebhookEvent_eventType_idx" ON "public"."GitHubWebhookEvent"("eventType");

-- CreateIndex
CREATE INDEX "GitHubWebhookEvent_processed_idx" ON "public"."GitHubWebhookEvent"("processed");

-- CreateIndex
CREATE INDEX "GitHubWebhookEvent_repositoryName_idx" ON "public"."GitHubWebhookEvent"("repositoryName");

-- CreateIndex
CREATE INDEX "Card_githubIssueId_idx" ON "public"."Card"("githubIssueId");

-- CreateIndex
CREATE INDEX "Comment_githubCommentId_idx" ON "public"."Comment"("githubCommentId");

-- CreateIndex
CREATE INDEX "Project_githubRepoId_idx" ON "public"."Project"("githubRepoId");

-- AddForeignKey
ALTER TABLE "public"."GitHubIssueSync" ADD CONSTRAINT "GitHubIssueSync_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GitHubIssueSync" ADD CONSTRAINT "GitHubIssueSync_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GitHubInstallation" ADD CONSTRAINT "GitHubInstallation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GitHubWebhookEvent" ADD CONSTRAINT "GitHubWebhookEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
