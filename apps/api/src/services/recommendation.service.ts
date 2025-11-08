/**
 * Agent Recommendation Service
 * Uses GPT-4 to analyze user's goal and recommend 4 best agents
 */

import { chatCompletion } from './openai.service'
import { allAgents, getAgentById } from '@ai-council/ai-agents'
import { AgentRecommendation } from '@ai-council/shared-types'

/**
 * Recommend 4 agents based on user's goal description
 * Uses GPT-4 to intelligently analyze the description and select relevant agents
 *
 * @param userDescription - User's goal/intent description
 * @returns 4 recommended agents with reasons
 */
export async function recommendAgents(userDescription: string): Promise<{
  recommendations: AgentRecommendation[]
  analysisUsed: {
    model: string
    tokensUsed: number
    estimatedCost: number
  }
}> {
  try {
    // Build a comprehensive agent list for GPT-4 to analyze
    const agentsList = allAgents
      .map(
        (agent, index) =>
          `${index + 1}. ${agent.id}: ${agent.name} - ${agent.description} (Category: ${agent.category})`
      )
      .join('\n')

    // Create system prompt for recommendation analysis
    const systemPrompt = `You are an expert at matching AI agents to user needs. You have access to a library of AI agent templates, each with specific expertise.

Your task is to analyze the user's goal description and recommend EXACTLY 4 agents that would work best together as a team to help the user achieve their goal.

Consider:
- What skills are needed for this goal?
- Which agents complement each other well?
- What diverse perspectives would be valuable?
- Balance between specialized and general expertise

Available agents:
${agentsList}

Respond in VALID JSON format with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "recommendations": [
    {
      "agentId": "agent-id-here",
      "reason": "Brief explanation why this agent is recommended",
      "relevanceScore": 95
    }
  ]
}

Return exactly 4 recommendations ordered by relevance (highest score first). Scores should be 1-100.`

    const userPrompt = `User's goal: "${userDescription}"\n\nRecommend 4 agents that would best help achieve this goal.`

    // Call GPT-4 for intelligent recommendations
    const response = await chatCompletion(systemPrompt, userPrompt, [], 'gpt-4', 0.7)

    // Parse GPT-4's response
    let recommendations: AgentRecommendation[]

    try {
      // Remove markdown code blocks if present
      let cleanedContent = response.content.trim()
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      }

      const parsed = JSON.parse(cleanedContent)

      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        throw new Error('Invalid response format from GPT-4')
      }

      // Validate and map recommendations to actual agent objects
      recommendations = parsed.recommendations
        .slice(0, 4) // Ensure exactly 4
        .map((rec: { agentId: string; reason: string; relevanceScore: number }) => {
          const agent = getAgentById(rec.agentId)

          if (!agent) {
            throw new Error(`Agent not found: ${rec.agentId}`)
          }

          return {
            agent: agent,
            reason: rec.reason,
            relevanceScore: rec.relevanceScore,
          }
        })
    } catch (parseError) {
      console.error('Failed to parse GPT-4 recommendation response:', parseError)
      console.error('Raw response:', response.content)

      // Fallback to keyword-based matching
      console.log('Falling back to keyword-based recommendations')
      recommendations = fallbackRecommendations(userDescription)
    }

    // Ensure we have exactly 4 recommendations
    if (recommendations.length < 4) {
      console.warn('Not enough recommendations, filling with fallback agents')
      const existingAgentIds = recommendations.map(r => r.agent.id)
      const fallbackAgents = allAgents
        .filter(agent => !existingAgentIds.includes(agent.id))
        .slice(0, 4 - recommendations.length)

      for (const agent of fallbackAgents) {
        recommendations.push({
          agent: agent,
          reason: 'Additional agent to complete your team',
          relevanceScore: 50,
        })
      }
    }

    return {
      recommendations: recommendations.slice(0, 4),
      analysisUsed: {
        model: response.model,
        tokensUsed: response.tokensUsed,
        estimatedCost: response.estimatedCost,
      },
    }
  } catch (error) {
    console.error('Error in recommendAgents:', error)

    // Final fallback: return keyword-based recommendations
    const fallbackRecs = fallbackRecommendations(userDescription)

    return {
      recommendations: fallbackRecs,
      analysisUsed: {
        model: 'fallback',
        tokensUsed: 0,
        estimatedCost: 0,
      },
    }
  }
}

/**
 * Fallback recommendation system using keyword matching
 * Used when GPT-4 analysis fails or is unavailable
 */
function fallbackRecommendations(userDescription: string): AgentRecommendation[] {
  const description = userDescription.toLowerCase()

  // Score each agent based on keyword matches
  const scoredAgents = allAgents.map(agent => {
    let score = 0
    const keywords = [
      ...agent.name.toLowerCase().split(' '),
      ...agent.description.toLowerCase().split(' '),
      agent.category,
      agent.role,
    ]

    // Check for keyword matches
    for (const keyword of keywords) {
      if (description.includes(keyword.toLowerCase())) {
        score += 20
      }
    }

    // Category-specific keyword boosting
    if (
      (description.includes('code') ||
        description.includes('program') ||
        description.includes('develop')) &&
      agent.category === 'coding'
    ) {
      score += 30
    }

    if (
      (description.includes('business') ||
        description.includes('market') ||
        description.includes('strategy')) &&
      agent.category === 'business'
    ) {
      score += 30
    }

    if (
      (description.includes('write') ||
        description.includes('content') ||
        description.includes('blog')) &&
      agent.category === 'writing'
    ) {
      score += 30
    }

    if (
      (description.includes('learn') ||
        description.includes('teach') ||
        description.includes('study')) &&
      agent.category === 'learning'
    ) {
      score += 30
    }

    if (
      (description.includes('health') ||
        description.includes('fitness') ||
        description.includes('workout')) &&
      agent.category === 'health'
    ) {
      score += 30
    }

    if (
      (description.includes('design') ||
        description.includes('creative') ||
        description.includes('art')) &&
      agent.category === 'creative'
    ) {
      score += 30
    }

    return { agent, score }
  })

  // Sort by score and take top 4
  const topAgents = scoredAgents
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ agent, score }) => ({
      agent: agent,
      reason: `Matched based on keywords related to ${agent.category} and ${agent.role}`,
      relevanceScore: Math.min(score, 100),
    }))

  // If we don't have 4, add some default versatile agents
  if (topAgents.length < 4) {
    const defaultAgentIds = [
      'agent-coder',
      'agent-strategist',
      'agent-writer',
      'agent-researcher',
    ]

    const existingIds = topAgents.map(r => r.agent.id)

    for (const agentId of defaultAgentIds) {
      if (topAgents.length >= 4) break
      if (existingIds.includes(agentId)) continue

      const agent = getAgentById(agentId)
      if (agent) {
        topAgents.push({
          agent: agent,
          reason: 'Versatile agent suitable for general tasks',
          relevanceScore: 40,
        })
      }
    }
  }

  return topAgents.slice(0, 4)
}

/**
 * Get recommendations with caching (for future optimization)
 * Currently just calls recommendAgents directly
 */
export async function getCachedRecommendations(userDescription: string): Promise<{
  recommendations: AgentRecommendation[]
  analysisUsed: {
    model: string
    tokensUsed: number
    estimatedCost: number
  }
}> {
  // In Phase 4, we can cache recommendations based on similar descriptions
  // For now, just return fresh recommendations
  return recommendAgents(userDescription)
}
