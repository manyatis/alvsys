-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable - Add vector columns to existing tables
ALTER TABLE "UserComplaint" ADD COLUMN IF NOT EXISTS "embedding_new" vector(1536);
ALTER TABLE "ComplaintCategory" ADD COLUMN IF NOT EXISTS "centerEmbedding_new" vector(1536);

-- Copy existing data if needed (converting from float arrays to vector)
-- Note: This will be empty for new installations

-- Drop old columns and rename new ones
-- ALTER TABLE "UserComplaint" DROP COLUMN IF EXISTS "embedding";
-- ALTER TABLE "UserComplaint" RENAME COLUMN "embedding_new" TO "embedding";

-- ALTER TABLE "ComplaintCategory" DROP COLUMN IF EXISTS "centerEmbedding";  
-- ALTER TABLE "ComplaintCategory" RENAME COLUMN "centerEmbedding_new" TO "centerEmbedding";

-- Add vector similarity index for performance
CREATE INDEX IF NOT EXISTS "UserComplaint_embedding_cosine_idx" ON "UserComplaint" USING hnsw ("embedding" vector_cosine_ops);
CREATE INDEX IF NOT EXISTS "ComplaintCategory_centerEmbedding_cosine_idx" ON "ComplaintCategory" USING hnsw ("centerEmbedding" vector_cosine_ops);