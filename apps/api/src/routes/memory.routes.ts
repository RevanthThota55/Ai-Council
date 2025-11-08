/**
 * Memory Routes
 * API endpoints for shared memory system
 * Phase 4: Memory Management
 *
 * 🔒 CRITICAL SECURITY: ALL routes protected with authMiddleware
 */

import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { create, list, getOne, remove, search, getStats } from '../controllers/memory.controller'

const router = Router()

// 🔒 SECURITY: Protect ALL memory endpoints with authentication
router.use(authMiddleware)

/**
 * POST /api/memory
 * Store a new memory
 *
 * 🔒 SECURITY: userId extracted from JWT token (req.user.userId)
 *
 * Body:
 * {
 *   "content": "I love Python programming",
 *   "tags": ["coding", "python"],
 *   "councilId": "optional-council-id"
 * }
 */
router.post('/', create)

/**
 * GET /api/memory
 * Get all user's memories
 *
 * 🔒 SECURITY: Returns ONLY memories where memory.userId === req.user.userId
 */
router.get('/', list)

/**
 * GET /api/memory/stats
 * Get memory statistics for user
 *
 * 🔒 SECURITY: Stats for authenticated user only
 */
router.get('/stats', getStats)

/**
 * POST /api/memory/search
 * Search similar memories using vector similarity
 *
 * 🔒 SECURITY: Searches ONLY within user's own memories
 *
 * Body:
 * {
 *   "query": "What do I know about Python?",
 *   "limit": 5
 * }
 */
router.post('/search', search)

/**
 * GET /api/memory/:id
 * Get single memory
 *
 * 🔒 SECURITY: Returns 403 Forbidden if user doesn't own the memory
 */
router.get('/:id', getOne)

/**
 * DELETE /api/memory/:id
 * Delete a memory
 *
 * 🔒 SECURITY: Verifies memory.userId === req.user.userId before deletion
 * Returns 403 Forbidden if user tries to delete another user's memory
 */
router.delete('/:id', remove)

export default router
