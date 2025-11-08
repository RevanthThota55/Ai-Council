/**
 * Memory Controller
 * API endpoints for memory management
 * Phase 4: Shared Memory System
 *
 * 🔒 CRITICAL SECURITY PATTERN:
 * - userId comes from req.user.userId (JWT token) - NEVER from request body!
 * - All endpoints use authMiddleware
 * - Returns 403 Forbidden for unauthorized access
 */

import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import {
  storeMemory,
  getUserMemories,
  getMemoryById,
  deleteMemory,
  searchSimilarMemories,
  getUserMemoryStats,
} from '../services/memory.service'

/**
 * POST /api/memory
 * Store a new memory
 *
 * 🔒 SECURITY: userId extracted from JWT token (req.user.userId)
 * If userId is in request body, it will be IGNORED!
 */
export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    const { content, tags, councilId } = req.body

    // 🔒 SECURITY: userId from JWT token, NOT from request body!
    const userId = req.user.userId

    // Validation
    if (!content || typeof content !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Content is required and must be a string',
      })
      return
    }

    if (content.trim().length < 10) {
      res.status(400).json({
        success: false,
        error: 'Content must be at least 10 characters',
      })
      return
    }

    if (content.length > 5000) {
      res.status(400).json({
        success: false,
        error: 'Content must be less than 5000 characters',
      })
      return
    }

    // Store memory (userId from JWT ensures user can only create their own memories)
    const memory = await storeMemory(userId, content.trim(), tags, councilId)

    res.status(201).json({
      success: true,
      data: memory,
      message: 'Memory stored successfully',
    })
  } catch (error) {
    console.error('Create memory error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to store memory'
    res.status(500).json({ success: false, error: errorMessage })
  }
}

/**
 * GET /api/memory
 * Get user's memories
 *
 * 🔒 SECURITY: Returns ONLY memories where memory.userId === req.user.userId
 */
export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    // 🔒 SECURITY: Get userId from JWT token
    const userId = req.user.userId

    // Get only this user's memories
    const memories = await getUserMemories(userId)

    res.status(200).json({
      success: true,
      data: memories,
      message: `Found ${memories.length} memories`,
    })
  } catch (error) {
    console.error('List memories error:', error)
    res.status(500).json({ success: false, error: 'Failed to retrieve memories' })
  }
}

/**
 * GET /api/memory/:id
 * Get single memory
 *
 * 🔒 SECURITY: Verifies ownership before returning
 * Returns 403 if user doesn't own the memory
 */
export async function getOne(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    const { id } = req.params
    const userId = req.user.userId // 🔒 From JWT

    // This will throw if user doesn't own the memory
    const memory = await getMemoryById(id, userId)

    res.status(200).json({
      success: true,
      data: memory,
    })
  } catch (error) {
    console.error('Get memory error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve memory'

    // 🔒 SECURITY: Return 403 for unauthorized access
    if (errorMessage.includes('Unauthorized')) {
      res.status(403).json({ success: false, error: errorMessage })
    } else if (errorMessage.includes('not found')) {
      res.status(404).json({ success: false, error: errorMessage })
    } else {
      res.status(500).json({ success: false, error: errorMessage })
    }
  }
}

/**
 * DELETE /api/memory/:id
 * Delete a memory
 *
 * 🔒 SECURITY: Verifies memory.userId === req.user.userId before deleting
 * Returns 403 Forbidden if user doesn't own the memory
 */
export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    const { id } = req.params
    const userId = req.user.userId // 🔒 From JWT

    // 🔒 CRITICAL: This verifies ownership before deletion
    await deleteMemory(id, userId)

    res.status(200).json({
      success: true,
      message: 'Memory deleted successfully',
    })
  } catch (error) {
    console.error('Delete memory error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete memory'

    // 🔒 SECURITY: Return 403 for unauthorized deletion attempts
    if (errorMessage.includes('Unauthorized')) {
      res.status(403).json({ success: false, error: errorMessage })
    } else if (errorMessage.includes('not found')) {
      res.status(404).json({ success: false, error: errorMessage })
    } else {
      res.status(500).json({ success: false, error: errorMessage })
    }
  }
}

/**
 * POST /api/memory/search
 * Search similar memories using vector similarity
 *
 * 🔒 SECURITY: Searches ONLY within user's own memories
 */
export async function search(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    const { query, limit } = req.body
    const userId = req.user.userId // 🔒 From JWT

    if (!query || typeof query !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Query is required and must be a string',
      })
      return
    }

    // 🔒 SECURITY: searchSimilarMemories filters by userId automatically
    const results = await searchSimilarMemories(query, userId, limit || 5)

    res.status(200).json({
      success: true,
      data: results,
      message: `Found ${results.length} similar memories`,
    })
  } catch (error) {
    console.error('Search memories error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to search memories'
    res.status(500).json({ success: false, error: errorMessage })
  }
}

/**
 * GET /api/memory/stats
 * Get user's memory statistics
 *
 * 🔒 SECURITY: Returns stats for authenticated user only
 */
export async function getStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    const userId = req.user.userId // 🔒 From JWT
    const stats = await getUserMemoryStats(userId)

    res.status(200).json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('Get memory stats error:', error)
    res.status(500).json({ success: false, error: 'Failed to retrieve memory stats' })
  }
}
