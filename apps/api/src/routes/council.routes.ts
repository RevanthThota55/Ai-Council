/**
 * Council Routes
 * API endpoints for council management
 * Phase 3: Council Session UI
 */

import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { create, list, getOne, update, remove } from '../controllers/council.controller'

const router = Router()

// All council routes require authentication
router.use(authMiddleware)

/**
 * POST /api/councils
 * Create a new council
 *
 * Body:
 * {
 *   "name": "Learn Python Council",
 *   "description": "I want to learn Python and build web applications",
 *   "agent1Id": "agent-coder",
 *   "agent2Id": "agent-teacher",
 *   "agent3Id": "agent-debugger",
 *   "agent4Id": "agent-researcher",
 *   "agent1Custom"?: "Custom instructions for agent 1",
 *   ...
 * }
 */
router.post('/', create)

/**
 * GET /api/councils
 * Get user's councils
 *
 * Query params:
 * - status?: "ACTIVE" | "ARCHIVED" | "DELETED"
 */
router.get('/', list)

/**
 * GET /api/councils/:id
 * Get single council with all messages
 */
router.get('/:id', getOne)

/**
 * PUT /api/councils/:id
 * Update council (name or status)
 *
 * Body:
 * {
 *   "name"?: "New name",
 *   "status"?: "ARCHIVED"
 * }
 */
router.put('/:id', update)

/**
 * DELETE /api/councils/:id
 * Soft delete council (sets status to DELETED)
 */
router.delete('/:id', remove)

export default router
