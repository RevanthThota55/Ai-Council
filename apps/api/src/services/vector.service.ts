/**
 * Vector Service
 * Handles embedding generation and similarity search
 * Phase 4: Shared Memory System
 *
 * 🔒 SECURITY: All similarity searches MUST filter by userId FIRST!
 */

import OpenAI from 'openai'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Get OpenAI client
 */
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey || apiKey === 'your-openai-api-key-here') {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  return new OpenAI({ apiKey })
}

/**
 * Generate embedding vector for text
 * Using OpenAI's text-embedding-3-small model (1536 dimensions)
 *
 * @param text - Text to convert to embedding
 * @returns Array of 1536 floats representing the text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const client = getOpenAIClient()

    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

/**
 * Calculate cosine similarity between two vectors
 * Returns value between -1 and 1 (higher = more similar)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same dimensions')
  }

  let dotProduct = 0
  let magnitudeA = 0
  let magnitudeB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    magnitudeA += vecA[i] * vecA[i]
    magnitudeB += vecB[i] * vecB[i]
  }

  magnitudeA = Math.sqrt(magnitudeA)
  magnitudeB = Math.sqrt(magnitudeB)

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0
  }

  return dotProduct / (magnitudeA * magnitudeB)
}

/**
 * Find similar memories using vector similarity
 *
 * 🔒 CRITICAL SECURITY: ALWAYS filters by userId FIRST!
 * This prevents cross-user memory access
 *
 * @param queryEmbedding - Vector embedding of search query
 * @param userId - User ID (from JWT token) - REQUIRED for security!
 * @param limit - Maximum number of results
 * @param threshold - Minimum similarity score (0-1)
 * @returns Array of memories sorted by similarity
 */
export async function findSimilarMemories(
  queryEmbedding: number[],
  userId: string, // 🔒 SECURITY: Must be from JWT token!
  limit: number = 5,
  threshold: number = 0.7
) {
  // 🔒 SECURITY: Get ONLY this user's memories
  const userMemories = await prisma.memory.findMany({
    where: {
      userId: userId, // 🔒 CRITICAL: Filter by userId FIRST!
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Calculate similarity scores (in-memory since we don't have pgvector)
  const memoriesWithScores = userMemories
    .map(memory => ({
      ...memory,
      similarity: cosineSimilarity(queryEmbedding, memory.embedding),
    }))
    .filter(m => m.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)

  return memoriesWithScores
}

/**
 * Search memories by text query
 *
 * 🔒 CRITICAL SECURITY: userId parameter is REQUIRED!
 *
 * @param query - Text query to search for
 * @param userId - User ID from JWT token
 * @param limit - Max results
 * @returns Similar memories (user's own memories only!)
 */
export async function searchMemories(
  query: string,
  userId: string, // 🔒 SECURITY: From JWT token only!
  limit: number = 5
) {
  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query)

  // Find similar memories (automatically filters by userId)
  return findSimilarMemories(queryEmbedding, userId, limit)
}
