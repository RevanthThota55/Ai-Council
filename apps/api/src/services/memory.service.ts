/**
 * Memory Service
 * Manages user memories with CRITICAL SECURITY
 * Phase 4: Shared Memory System
 *
 * 🔒 SECURITY ENFORCEMENT:
 * - EVERY query filters by userId
 * - userId comes from JWT token ONLY (never from request body!)
 * - Row-level security prevents cross-user memory access
 */

import { PrismaClient } from '@prisma/client'
import { generateEmbedding, searchMemories as vectorSearch } from './vector.service'

const prisma = new PrismaClient()

/**
 * Store a new memory
 *
 * 🔒 SECURITY: userId parameter MUST come from JWT token (req.user.userId)
 * NEVER accept userId from request body!
 *
 * @param userId - From JWT token (req.user.userId) - NOT from request!
 * @param content - Memory content
 * @param tags - Optional tags for categorization
 * @param councilId - Optional council association
 */
export async function storeMemory(
  userId: string, // 🔒 CRITICAL: From JWT token ONLY!
  content: string,
  tags: string[] = [],
  councilId?: string
) {
  // Generate embedding for content
  const embedding = await generateEmbedding(content)

  // Create memory with userId from JWT
  const memory = await prisma.memory.create({
    data: {
      userId: userId, // 🔒 From JWT, not request body!
      content: content,
      embedding: embedding,
      tags: tags,
      councilId: councilId,
    },
  })

  return memory
}

/**
 * Get all user's memories
 *
 * 🔒 SECURITY: Only returns memories where memory.userId === authenticated userId
 *
 * @param userId - From JWT token (req.user.userId)
 * @returns User's own memories ONLY
 */
export async function getUserMemories(userId: string) {
  // 🔒 CRITICAL: Filter by userId - prevents cross-user access
  const memories = await prisma.memory.findMany({
    where: {
      userId: userId, // 🔒 Row-level security enforcement
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return memories
}

/**
 * Get single memory by ID
 *
 * 🔒 SECURITY: Verifies memory belongs to user before returning
 *
 * @param memoryId - Memory ID to retrieve
 * @param userId - From JWT token
 * @returns Memory if user owns it, throws error otherwise
 */
export async function getMemoryById(memoryId: string, userId: string) {
  const memory = await prisma.memory.findUnique({
    where: { id: memoryId },
  })

  if (!memory) {
    throw new Error('Memory not found')
  }

  // 🔒 CRITICAL: Verify ownership
  if (memory.userId !== userId) {
    throw new Error('Unauthorized: You do not have access to this memory')
  }

  return memory
}

/**
 * Search similar memories using vector similarity
 *
 * 🔒 SECURITY: Searches ONLY within user's own memories
 *
 * @param query - Search query text
 * @param userId - From JWT token
 * @param limit - Max results
 * @returns Similar memories (user's own memories only!)
 */
export async function searchSimilarMemories(
  query: string,
  userId: string, // 🔒 CRITICAL: From JWT token!
  limit: number = 5
) {
  // Vector search automatically filters by userId
  return vectorSearch(query, userId, limit)
}

/**
 * Delete a memory
 *
 * 🔒 SECURITY: Verifies ownership before deletion
 * Returns 403 Forbidden if user doesn't own the memory
 *
 * @param memoryId - Memory to delete
 * @param userId - From JWT token
 */
export async function deleteMemory(memoryId: string, userId: string) {
  // 🔒 CRITICAL: Verify ownership first!
  const memory = await prisma.memory.findUnique({
    where: { id: memoryId },
  })

  if (!memory) {
    throw new Error('Memory not found')
  }

  // 🔒 SECURITY CHECK: Prevent User A from deleting User B's memories
  if (memory.userId !== userId) {
    throw new Error('Unauthorized: You cannot delete this memory')
  }

  // Safe to delete - user owns this memory
  await prisma.memory.delete({
    where: { id: memoryId },
  })

  return { success: true }
}

/**
 * Get memories by tags
 *
 * 🔒 SECURITY: Filters by userId
 *
 * @param tags - Tags to filter by
 * @param userId - From JWT token
 */
export async function getMemoriesByTags(tags: string[], userId: string) {
  // 🔒 CRITICAL: Filter by userId AND tags
  const memories = await prisma.memory.findMany({
    where: {
      userId: userId, // 🔒 Security first!
      tags: {
        hasSome: tags, // Has at least one of these tags
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return memories
}

/**
 * Update memory content (re-generates embedding)
 *
 * 🔒 SECURITY: Verifies ownership before update
 *
 * @param memoryId - Memory to update
 * @param userId - From JWT token
 * @param content - New content
 * @param tags - New tags (optional)
 */
export async function updateMemory(
  memoryId: string,
  userId: string, // 🔒 From JWT!
  content: string,
  tags?: string[]
) {
  // 🔒 CRITICAL: Verify ownership
  const existing = await getMemoryById(memoryId, userId) // This already checks ownership

  // Generate new embedding
  const embedding = await generateEmbedding(content)

  // Update memory
  const updated = await prisma.memory.update({
    where: { id: memoryId },
    data: {
      content: content,
      embedding: embedding,
      tags: tags !== undefined ? tags : existing.tags,
    },
  })

  return updated
}

/**
 * Get memory stats for user
 *
 * 🔒 SECURITY: Counts only user's own memories
 */
export async function getUserMemoryStats(userId: string) {
  const totalMemories = await prisma.memory.count({
    where: { userId: userId }, // 🔒 Security filter
  })

  const memoriesThisWeek = await prisma.memory.count({
    where: {
      userId: userId, // 🔒 Security filter
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  })

  return {
    totalMemories,
    memoriesThisWeek,
  }
}
