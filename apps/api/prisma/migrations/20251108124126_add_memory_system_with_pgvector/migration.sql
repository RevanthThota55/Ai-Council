-- Note: Using PostgreSQL DOUBLE PRECISION[] for embeddings
-- pgvector extension would be ideal but requires separate installation
-- We'll implement similarity search in application code for MVP

-- CreateTable
CREATE TABLE "memories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "councilId" TEXT,
    "content" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "memories_userId_idx" ON "memories"("userId");

-- CreateIndex
CREATE INDEX "memories_councilId_idx" ON "memories"("councilId");

-- CreateIndex
CREATE INDEX "memories_createdAt_idx" ON "memories"("createdAt");

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "councils"("id") ON DELETE CASCADE ON UPDATE CASCADE;
