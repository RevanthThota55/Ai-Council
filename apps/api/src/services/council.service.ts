/**
 * Council Service
 * Business logic for council operations
 * Phase 3: Council Session Management
 */

import { PrismaClient, CouncilStatus } from '@prisma/client'
import { getAgentById } from '@ai-council/ai-agents'

const prisma = new PrismaClient()

/**
 * Create Council Request
 */
export interface CreateCouncilRequest {
  userId: string
  name: string
  description: string
  agent1Id: string
  agent2Id: string
  agent3Id: string
  agent4Id: string
  agent1Custom?: string
  agent2Custom?: string
  agent3Custom?: string
  agent4Custom?: string
}

/**
 * Create a new council
 */
export async function createCouncil(data: CreateCouncilRequest) {
  // Validate all agent IDs exist
  const agentIds = [data.agent1Id, data.agent2Id, data.agent3Id, data.agent4Id]

  for (const agentId of agentIds) {
    const agent = getAgentById(agentId)
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`)
    }
  }

  // Create council
  const council = await prisma.council.create({
    data: {
      userId: data.userId,
      name: data.name,
      description: data.description,
      agent1Id: data.agent1Id,
      agent2Id: data.agent2Id,
      agent3Id: data.agent3Id,
      agent4Id: data.agent4Id,
      agent1Custom: data.agent1Custom,
      agent2Custom: data.agent2Custom,
      agent3Custom: data.agent3Custom,
      agent4Custom: data.agent4Custom,
    },
  })

  // Create system message
  await prisma.message.create({
    data: {
      councilId: council.id,
      role: 'SYSTEM',
      content: `Council "${council.name}" created! Your AI team is ready to help you achieve your goal.`,
    },
  })

  return council
}

/**
 * Get user's councils
 */
export async function getUserCouncils(userId: string, status?: CouncilStatus) {
  const councils = await prisma.council.findMany({
    where: {
      userId,
      status: status || CouncilStatus.ACTIVE,
    },
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return councils
}

/**
 * Get single council with all messages
 */
export async function getCouncilById(councilId: string, userId: string) {
  const council = await prisma.council.findUnique({
    where: {
      id: councilId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  if (!council) {
    throw new Error('Council not found')
  }

  // Verify user owns this council
  if (council.userId !== userId) {
    throw new Error('Unauthorized: You do not have access to this council')
  }

  return council
}

/**
 * Update council
 */
export async function updateCouncil(
  councilId: string,
  userId: string,
  updates: {
    name?: string
    status?: CouncilStatus
  }
) {
  // Verify ownership
  const council = await prisma.council.findUnique({
    where: { id: councilId },
  })

  if (!council) {
    throw new Error('Council not found')
  }

  if (council.userId !== userId) {
    throw new Error('Unauthorized: You do not have access to this council')
  }

  // Update
  const updated = await prisma.council.update({
    where: { id: councilId },
    data: updates,
  })

  return updated
}

/**
 * Delete council (soft delete - set status to DELETED)
 */
export async function deleteCouncil(councilId: string, userId: string) {
  return updateCouncil(councilId, userId, { status: CouncilStatus.DELETED })
}

/**
 * Get council's agent configurations
 */
export function getCouncilAgents(council: {
  agent1Id: string
  agent2Id: string
  agent3Id: string
  agent4Id: string
  agent1Custom?: string | null
  agent2Custom?: string | null
  agent3Custom?: string | null
  agent4Custom?: string | null
}) {
  return [
    {
      agentId: council.agent1Id,
      agent: getAgentById(council.agent1Id)!,
      customPrompt: council.agent1Custom,
    },
    {
      agentId: council.agent2Id,
      agent: getAgentById(council.agent2Id)!,
      customPrompt: council.agent2Custom,
    },
    {
      agentId: council.agent3Id,
      agent: getAgentById(council.agent3Id)!,
      customPrompt: council.agent3Custom,
    },
    {
      agentId: council.agent4Id,
      agent: getAgentById(council.agent4Id)!,
      customPrompt: council.agent4Custom,
    },
  ]
}
