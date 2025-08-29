-- CreateTable
CREATE TABLE "public"."UserComplaint" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "subreddit" TEXT,
    "author" TEXT,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "sentiment" TEXT,
    "businessIdeas" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserComplaint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserComplaint_source_idx" ON "public"."UserComplaint"("source");

-- CreateIndex
CREATE INDEX "UserComplaint_subreddit_idx" ON "public"."UserComplaint"("subreddit");

-- CreateIndex
CREATE INDEX "UserComplaint_createdAt_idx" ON "public"."UserComplaint"("createdAt");
