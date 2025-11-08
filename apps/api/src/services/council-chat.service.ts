/**
 * Council Chat Service
 * Handles sequential agent responses for council sessions
 * Phase 3: Real-time chat with 4 AI agents
 */

import { PrismaClient } from '@prisma/client'
import { AIMessage } from '@ai-council/shared-types'
import { chatCompletion } from './openai.service'
import { getCouncilAgents } from './council.service'

const prisma = new PrismaClient()

/**
 * Agent Response with metadata
 */
export interface AgentResponse {
  agentId: string
  agentName: string
  content: string
  tokensUsed: number
  cost: number
  messageId: string
}

/**
 * Generate sequential responses from all 4 agents in a council
 *
 * Pattern:
 * 1. Agent 1 sees: user message
 * 2. Agent 2 sees: user message + Agent 1 response
 * 3. Agent 3 sees: user message + Agent 1 + Agent 2 responses
 * 4. Agent 4 sees: user message + Agent 1 + Agent 2 + Agent 3 responses
 *
 * This creates natural collaboration where agents build on each other's responses!
 */
export async function generateSequentialAgentResponses(
  councilId: string,
  userMessage: string
): Promise<AgentResponse[]> {
  // Get council with agents
  const council = await prisma.council.findUnique({
    where: { id: councilId },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 20, // Last 20 messages for context
      },
    },
  })

  if (!council) {
    throw new Error('Council not found')
  }

  // Get agent configurations
  const agents = getCouncilAgents(council)

  // Build conversation history (excluding the just-sent user message)
  const conversationHistory: AIMessage[] = council.messages
    .reverse() // Chronological order
    .map(msg => ({
      role: msg.role === 'USER' ? 'user' : 'assistant',
      content: `${msg.agentId ? `[${getAgentName(msg.agentId)}]` : '[You]'}: ${msg.content}`,
    }))

  const responses: AgentResponse[] = []

  // Generate responses sequentially
  for (let i = 0; i < agents.length; i++) {
    const { agentId, agent, customPrompt } = agents[i]

    // Build context for this agent
    const agentContext: AIMessage[] = [
      ...conversationHistory,
      // Add user's new message
      { role: 'user', content: `[User]: ${userMessage}` },
      // Add previous agents' responses from this turn
      ...responses.map(r => ({
        role: 'assistant' as const,
        content: `[${r.agentName}]: ${r.content}`,
      })),
    ]

    // Use custom prompt if provided, otherwise use agent's default
    const systemPrompt =
      customPrompt ||
      `${agent.systemPrompt}\n\nYou are part of a 5-person AI council helping the user. Collaborate with other agents and build on their insights. Keep responses concise but helpful.`

    // Generate response
    const aiResponse = await chatCompletion(
      systemPrompt,
      `The user said: "${userMessage}"\n\n${
        responses.length > 0
          ? `Other agents have responded:\n${responses.map(r => `- ${r.agentName}: ${r.content}`).join('\n')}\n\n`
          : ''
      }Provide your perspective and advice.`,
      agentContext,
      agent.model === 'gpt-4' || agent.model === 'gpt-4-turbo' ? agent.model : 'gpt-4',
      agent.temperature
    )

    // Save agent message to database
    const message = await prisma.message.create({
      data: {
        councilId: councilId,
        role: 'AGENT',
        agentId: agentId,
        content: aiResponse.content,
        tokensUsed: aiResponse.tokensUsed,
        cost: aiResponse.estimatedCost,
      },
    })

    // Update council's updatedAt timestamp
    await prisma.council.update({
      where: { id: councilId },
      data: { updatedAt: new Date() },
    })

    responses.push({
      agentId: agentId,
      agentName: agent.name,
      content: aiResponse.content,
      tokensUsed: aiResponse.tokensUsed,
      cost: aiResponse.estimatedCost,
      messageId: message.id,
    })
  }

  return responses
}

/**
 * Helper to get agent name by ID
 */
function getAgentName(agentId: string): string {
  const { getAgentById } = require('@ai-council/ai-agents')
  const agent = getAgentById(agentId)
  return agent?.name || 'Unknown Agent'
}

/**
 * Save user message to database
 */
export async function saveUserMessage(councilId: string, content: string) {
  const message = await prisma.message.create({
    data: {
      councilId: councilId,
      role: 'USER',
      content: content,
    },
  })

  // Update council's updatedAt
  await prisma.council.update({
    where: { id: councilId },
    data: { updatedAt: new Date() },
  })

  return message
}
