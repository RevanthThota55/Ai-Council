/**
 * Authentication Controller
 * Handles user signup, login, and profile retrieval
 *
 * Business logic for authentication endpoints
 */

import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
import { generateToken } from '../utils/jwt'
import { validateSignupData, validateLoginData } from '../utils/validation'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

/**
 * Signup Controller
 * Creates a new user account
 *
 * POST /api/auth/signup
 * Body: { email, password, name? }
 */
export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body

    // Validate input data
    const validation = validateSignupData({ email, password, name })
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: validation.error,
      })
      return
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'User with this email already exists',
      })
      return
    }

    // Hash password with bcrypt (10 rounds)
    // Why bcrypt?
    // - Salted hashing (prevents rainbow table attacks)
    // - Slow by design (prevents brute-force attacks)
    // - Industry standard for password storage
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user in database
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        name: name?.trim() || null,
        subscriptionTier: 'FREE', // Default subscription
      },
    })

    // Generate JWT token (24 hour expiry)
    const token = generateToken({
      userId: user.id,
      email: user.email,
    })

    // Don't send password in response!
    const { password: _, ...userWithoutPassword } = user

    res.status(201).json({
      success: true,
      data: {
        token,
        user: userWithoutPassword,
      },
      message: 'Account created successfully',
    })
  } catch (error) {
    console.error('Signup error:', error)

    res.status(500).json({
      success: false,
      error: 'An error occurred during signup. Please try again.',
    })
  }
}

/**
 * Login Controller
 * Authenticates user and returns JWT token
 *
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body

    // Validate input data
    const validation = validateLoginData({ email, password })
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: validation.error,
      })
      return
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      })
      return
    }

    // Compare password with hashed password
    // bcrypt.compare handles the salt automatically
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      })
      return
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    })

    // Don't send password in response!
    const { password: _, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      data: {
        token,
        user: userWithoutPassword,
      },
      message: 'Login successful',
    })
  } catch (error) {
    console.error('Login error:', error)

    res.status(500).json({
      success: false,
      error: 'An error occurred during login. Please try again.',
    })
  }
}

/**
 * Get Current User Controller
 * Returns current user's profile based on JWT token
 *
 * GET /api/auth/me
 * Requires: Authorization header with JWT token
 */
export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    // User data is attached by authMiddleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      })
      return
    }

    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    })

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      })
      return
    }

    // Don't send password!
    const { password: _, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    })
  } catch (error) {
    console.error('Get user error:', error)

    res.status(500).json({
      success: false,
      error: 'An error occurred while fetching user data',
    })
  }
}

/**
 * Logout Controller (Optional - for token blacklisting)
 * Currently JWT is stateless, so logout is handled client-side
 * In Phase 4, we can add token blacklisting with Session model
 *
 * POST /api/auth/logout
 */
export async function logout(_req: AuthRequest, res: Response): Promise<void> {
  // For now, just return success
  // Client will remove token from localStorage
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  })
}
