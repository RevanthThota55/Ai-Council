-- CreateEnum
CREATE TYPE "CouncilStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'AGENT', 'SYSTEM');

-- CreateTable
CREATE TABLE "councils" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "agent1Id" TEXT NOT NULL,
    "agent2Id" TEXT NOT NULL,
    "agent3Id" TEXT NOT NULL,
    "agent4Id" TEXT NOT NULL,
    "agent1Custom" TEXT,
    "agent2Custom" TEXT,
    "agent3Custom" TEXT,
    "agent4Custom" TEXT,
    "status" "CouncilStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "councils_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "councilId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "agentId" TEXT,
    "content" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "cost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "councils_userId_idx" ON "councils"("userId");

-- CreateIndex
CREATE INDEX "councils_status_idx" ON "councils"("status");

-- CreateIndex
CREATE INDEX "messages_councilId_idx" ON "messages"("councilId");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");

-- AddForeignKey
ALTER TABLE "councils" ADD CONSTRAINT "councils_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "councils"("id") ON DELETE CASCADE ON UPDATE CASCADE;
