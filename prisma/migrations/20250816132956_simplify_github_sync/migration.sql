/*
  Warnings:

  - You are about to drop the column `labelMapping` on the `GitHubIssueSync` table. All the data in the column will be lost.
  - You are about to drop the column `lastSyncDirection` on the `GitHubIssueSync` table. All the data in the column will be lost.
  - You are about to drop the column `lastSyncError` on the `GitHubIssueSync` table. All the data in the column will be lost.
  - You are about to drop the column `statusMapping` on the `GitHubIssueSync` table. All the data in the column will be lost.
  - You are about to drop the column `syncConflictResolution` on the `GitHubIssueSync` table. All the data in the column will be lost.
  - Made the column `lastSyncAt` on table `GitHubIssueSync` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."GitHubIssueSync" DROP COLUMN "labelMapping",
DROP COLUMN "lastSyncDirection",
DROP COLUMN "lastSyncError",
DROP COLUMN "statusMapping",
DROP COLUMN "syncConflictResolution",
ALTER COLUMN "lastSyncAt" SET NOT NULL,
ALTER COLUMN "lastSyncAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropEnum
DROP TYPE "public"."ConflictResolution";

-- DropEnum
DROP TYPE "public"."SyncDirection";
