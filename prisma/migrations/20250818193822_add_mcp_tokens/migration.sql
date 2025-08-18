-- CreateTable
CREATE TABLE "public"."MCPToken" (
    "id" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "name" TEXT,
    "userId" TEXT NOT NULL,
    "lastUsed" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MCPToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MCPToken_keyHash_key" ON "public"."MCPToken"("keyHash");

-- CreateIndex
CREATE INDEX "MCPToken_userId_idx" ON "public"."MCPToken"("userId");

-- CreateIndex
CREATE INDEX "MCPToken_keyHash_idx" ON "public"."MCPToken"("keyHash");

-- AddForeignKey
ALTER TABLE "public"."MCPToken" ADD CONSTRAINT "MCPToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
