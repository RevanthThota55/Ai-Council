/**
 * Agent Controller
 * Handles agent-related API endpoints
 * Phase 2: Agent templates, recommendations, and testing
 */

import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import {
  allAgents,
  getAgentById,
  getAgentsByCategory,
  getCategoriesWithCounts,
  searchAgents,
} from '@ai-council/ai-agents'
import { recommendAgents } from '../services/recommendation.service'
import { chatCompletion } from '../services/openai.service'
import { trackUsage, checkRateLimit, getUserUsageStats } from '../utils/usage-tracker'
import { AgentCategory, SubscriptionTier } from '@ai-council/shared-types'

/**
 * GET /api/agents/templates
 * Get all agent templates
 */
export async function getAllTemplates(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const categoryCounts = getCategoriesWithCounts()

    res.status(200).json({
      success: true,
      data: {
        agents: allAgents,
        total: allAgents.length,
        categoryCounts: categoryCounts,
      },
      message: `${allAgents.length} agent templates available`,
    })
  } catch (error) {
    console.error('Get all templates error:', error)

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve agent templates',
    })
  }
}

/**
 * GET /api/agents/templates/:category
 * Get agent templates by category
 */
export async function getTemplatesByCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { category } = req.params

    // Validate category
    if (!Object.values(AgentCategory).includes(category as AgentCategory)) {
      res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${Object.values(AgentCategory).join(', ')}`,
      })
      return
    }

    const agents = getAgentsByCategory(category as AgentCategory)

    res.status(200).json({
      success: true,
      data: {
        category: category,
        agents: agents,
        total: agents.length,
      },
      message: `Found ${agents.length} agents in ${category} category`,
    })
  } catch (error) {
    console.error('Get templates by category error:', error)

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve agent templates',
    })
  }
}

/**
 * GET /api/agents/search?q=keyword
 * Search agents by keyword
 */
export async function searchAgentTemplates(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { q } = req.query

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Search query parameter "q" is required',
      })
      return
    }

    const results = searchAgents(q)

    res.status(200).json({
      success: true,
      data: {
        query: q,
        results: results,
        total: results.length,
      },
      message: `Found ${results.length} matching agents`,
    })
  } catch (error) {
    console.error('Search agents error:', error)

    res.status(500).json({
      success: false,
      error: 'Failed to search agent templates',
    })
  }
}

/**
 * POST /api/agents/recommend
 * Get 4 recommended agents based on user's goal description
 * Protected route - requires authentication
 */
export async function getRecommendations(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      })
      return
    }

    const { description } = req.body

    // Validate input
    if (!description || typeof description !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Description is required and must be a string',
      })
      return
    }

    if (description.trim().length < 10) {
      res.status(400).json({
        success: false,
        error: 'Description must be at least 10 characters long',
      })
      return
    }

    if (description.length > 500) {
      res.status(400).json({
        success: false,
        error: 'Description must be less than 500 characters',
      })
      return
    }

    // Check rate limit (using FREE tier for now, will use actual tier in production)
    const userId = req.user.userId
    const rateLimit = checkRateLimit(userId, SubscriptionTier.FREE)

    if (!rateLimit.allowed) {
      res.status(429).json({
        success: false,
        error: rateLimit.reason,
        data: {
          requestsThisHour: rateLimit.requestsThisHour,
          limit: rateLimit.limit,
        },
      })
      return
    }

    // Get recommendations using GPT-4
    const result = await recommendAgents(description.trim())

    // Track usage
    trackUsage(
      userId,
      result.analysisUsed.model,
      result.analysisUsed.tokensUsed,
      result.analysisUsed.estimatedCost,
      'recommendation'
    )

    res.status(200).json({
      success: true,
      data: {
        recommendations: result.recommendations,
        description: description.trim(),
        analysisUsed: result.analysisUsed,
      },
      message: 'Generated 4 agent recommendations based on your goal',
    })
  } catch (error) {
    console.error('Get recommendations error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Failed to generate recommendations'

    res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
}

/**
 * POST /api/agents/test
 * Test a specific agent with a custom prompt
 * Protected route - requires authentication
 */
export async function testAgent(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      })
      return
    }

    const { agentId, prompt } = req.body

    // Validate input
    if (!agentId || typeof agentId !== 'string') {
      res.status(400).json({
        success: false,
        error: 'agentId is required and must be a string',
      })
      return
    }

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({
        success: false,
        error: 'prompt is required and must be a string',
      })
      return
    }

    if (prompt.trim().length < 5) {
      res.status(400).json({
        success: false,
        error: 'Prompt must be at least 5 characters long',
      })
      return
    }

    if (prompt.length > 2000) {
      res.status(400).json({
        success: false,
        error: 'Prompt must be less than 2000 characters',
      })
      return
    }

    // Get agent
    const agent = getAgentById(agentId)

    if (!agent) {
      res.status(404).json({
        success: false,
        error: `Agent not found: ${agentId}`,
      })
      return
    }

    // Check rate limit
    const userId = req.user.userId
    const rateLimit = checkRateLimit(userId, SubscriptionTier.FREE)

    if (!rateLimit.allowed) {
      res.status(429).json({
        success: false,
        error: rateLimit.reason,
        data: {
          requestsThisHour: rateLimit.requestsThisHour,
          limit: rateLimit.limit,
        },
      })
      return
    }

    // Get AI response
    // Only use OpenAI models for now (we only have OpenAI key)
    const model: 'gpt-4' | 'gpt-4-turbo' =
      agent.model === 'gpt-4' || agent.model === 'gpt-4-turbo' ? agent.model : 'gpt-4'

    const aiResponse = await chatCompletion(
      agent.systemPrompt,
      prompt.trim(),
      [],
      model,
      agent.temperature
    )

    // Track usage
    trackUsage(userId, aiResponse.model, aiResponse.tokensUsed, aiResponse.estimatedCost, 'test')

    res.status(200).json({
      success: true,
      data: {
        agentName: agent.name,
        agentRole: agent.role,
        response: aiResponse.content,
        tokensUsed: aiResponse.tokensUsed,
        estimatedCost: aiResponse.estimatedCost,
        model: aiResponse.model,
      },
      message: 'Agent test successful',
    })
  } catch (error) {
    console.error('Test agent error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Failed to test agent'

    res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
}

/**
 * GET /api/agents/usage
 * Get current user's API usage statistics
 * Protected route - requires authentication
 */
export async function getUserUsage(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      })
      return
    }

    const userId = req.user.userId
    const stats = getUserUsageStats(userId)

    res.status(200).json({
      success: true,
      data: stats,
      message: 'Usage statistics retrieved',
    })
  } catch (error) {
    console.error('Get user usage error:', error)

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve usage statistics',
    })
  }
}
