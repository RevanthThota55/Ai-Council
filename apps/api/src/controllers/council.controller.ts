/**
 * Council Controller
 * HTTP endpoints for council management
 * Phase 3: Council CRUD operations
 */

import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import {
  createCouncil,
  getUserCouncils,
  getCouncilById,
  updateCouncil,
  deleteCouncil,
} from '../services/council.service'
import { CouncilStatus } from '@prisma/client'

/**
 * POST /api/councils
 * Create a new council
 */
export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    const { name, description, agent1Id, agent2Id, agent3Id, agent4Id, agent1Custom, agent2Custom, agent3Custom, agent4Custom } = req.body

    // Validation
    if (!name || !description || !agent1Id || !agent2Id || !agent3Id || !agent4Id) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: name, description, and 4 agent IDs',
      })
      return
    }

    if (description.length < 20) {
      res.status(400).json({
        success: false,
        error: 'Description must be at least 20 characters',
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

    // Create council
    const council = await createCouncil({
      userId: req.user.userId,
      name,
      description,
      agent1Id,
      agent2Id,
      agent3Id,
      agent4Id,
      agent1Custom,
      agent2Custom,
      agent3Custom,
      agent4Custom,
    })

    res.status(201).json({
      success: true,
      data: council,
      message: 'Council created successfully',
    })
  } catch (error) {
    console.error('Create council error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create council'
    res.status(500).json({ success: false, error: errorMessage })
  }
}

/**
 * GET /api/councils
 * Get user's councils
 */
export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    const { status } = req.query
    const councilStatus = status as CouncilStatus | undefined

    const councils = await getUserCouncils(req.user.userId, councilStatus)

    res.status(200).json({
      success: true,
      data: councils,
      message: `Found ${councils.length} councils`,
    })
  } catch (error) {
    console.error('List councils error:', error)
    res.status(500).json({ success: false, error: 'Failed to retrieve councils' })
  }
}

/**
 * GET /api/councils/:id
 * Get single council with all messages
 */
export async function getOne(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    const { id } = req.params
    const council = await getCouncilById(id, req.user.userId)

    res.status(200).json({
      success: true,
      data: council,
    })
  } catch (error) {
    console.error('Get council error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve council'

    if (errorMessage.includes('not found')) {
      res.status(404).json({ success: false, error: errorMessage })
    } else if (errorMessage.includes('Unauthorized')) {
      res.status(403).json({ success: false, error: errorMessage })
    } else {
      res.status(500).json({ success: false, error: errorMessage })
    }
  }
}

/**
 * PUT /api/councils/:id
 * Update council (name or status)
 */
export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    const { id } = req.params
    const { name, status } = req.body

    const council = await updateCouncil(id, req.user.userId, { name, status })

    res.status(200).json({
      success: true,
      data: council,
      message: 'Council updated successfully',
    })
  } catch (error) {
    console.error('Update council error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update council'

    if (errorMessage.includes('not found')) {
      res.status(404).json({ success: false, error: errorMessage })
    } else if (errorMessage.includes('Unauthorized')) {
      res.status(403).json({ success: false, error: errorMessage })
    } else {
      res.status(500).json({ success: false, error: errorMessage })
    }
  }
}

/**
 * DELETE /api/councils/:id
 * Soft delete council
 */
export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    const { id } = req.params
    await deleteCouncil(id, req.user.userId)

    res.status(200).json({
      success: true,
      message: 'Council deleted successfully',
    })
  } catch (error) {
    console.error('Delete council error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete council'

    if (errorMessage.includes('not found')) {
      res.status(404).json({ success: false, error: errorMessage })
    } else if (errorMessage.includes('Unauthorized')) {
      res.status(403).json({ success: false, error: errorMessage })
    } else {
      res.status(500).json({ success: false, error: errorMessage })
    }
  }
}
