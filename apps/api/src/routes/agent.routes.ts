/**
 * Agent Routes
 * API endpoints for agent templates, recommendations, and testing
 */

import { Router } from 'express'
import {
  getAllTemplates,
  getTemplatesByCategory,
  searchAgentTemplates,
  getRecommendations,
  testAgent,
  getUserUsage,
} from '../controllers/agent.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// ==================== Public Routes (No Auth Required) ====================

/**
 * GET /api/agents/templates
 * Get all available agent templates
 * Public - users can browse agents before signing up
 */
router.get('/templates', getAllTemplates)

/**
 * GET /api/agents/templates/:category
 * Get agent templates by category
 * Public - users can browse categories
 */
router.get('/templates/:category', getTemplatesByCategory)

/**
 * GET /api/agents/search?q=keyword
 * Search agents by keyword
 * Public - users can search before signing up
 */
router.get('/search', searchAgentTemplates)

// ==================== Protected Routes (Auth Required) ====================

/**
 * POST /api/agents/recommend
 * Get 4 recommended agents based on user's goal
 * Protected - requires authentication
 *
 * Body:
 * {
 *   "description": "I want to learn Python and build a web scraper"
 * }
 */
router.post('/recommend', authMiddleware, getRecommendations)

/**
 * POST /api/agents/test
 * Test a specific agent with a custom prompt
 * Protected - requires authentication
 *
 * Body:
 * {
 *   "agentId": "agent-coder",
 *   "prompt": "Write a Python function to reverse a string"
 * }
 */
router.post('/test', authMiddleware, testAgent)

/**
 * GET /api/agents/usage
 * Get current user's API usage statistics
 * Protected - requires authentication
 */
router.get('/usage', authMiddleware, getUserUsage)

export default router
