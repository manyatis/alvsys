-- AlterTable
ALTER TABLE "public"."UserComplaint" ADD COLUMN     "dataSourceId" TEXT;

-- CreateTable
CREATE TABLE "public"."DataSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "scrapeInterval" INTEGER,
    "lastScrapedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DataSource_type_idx" ON "public"."DataSource"("type");

-- CreateIndex
CREATE INDEX "DataSource_isActive_idx" ON "public"."DataSource"("isActive");

-- CreateIndex
CREATE INDEX "UserComplaint_dataSourceId_idx" ON "public"."UserComplaint"("dataSourceId");

-- AddForeignKey
ALTER TABLE "public"."UserComplaint" ADD CONSTRAINT "UserComplaint_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "public"."DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
