/**
 * Authentication Routes
 * Defines API endpoints for user authentication
 *
 * Routes:
 * - POST /api/auth/signup - Create new user account
 * - POST /api/auth/login  - Authenticate user
 * - GET  /api/auth/me     - Get current user (protected)
 * - POST /api/auth/logout - Logout user (protected)
 */

import { Router } from 'express'
import { signup, login, getMe, logout } from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

/**
 * POST /api/auth/signup
 * Public route - Create new user account
 *
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "securePassword123",
 *   "name": "John Doe" (optional)
 * }
 *
 * Response (201):
 * {
 *   "success": true,
 *   "data": {
 *     "token": "jwt-token-here",
 *     "user": { id, email, name, subscriptionTier, ... }
 *   },
 *   "message": "Account created successfully"
 * }
 */
router.post('/signup', signup)

/**
 * POST /api/auth/login
 * Public route - Authenticate user and get token
 *
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "securePassword123"
 * }
 *
 * Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "token": "jwt-token-here",
 *     "user": { id, email, name, subscriptionTier, ... }
 *   },
 *   "message": "Login successful"
 * }
 */
router.post('/login', login)

/**
 * GET /api/auth/me
 * Protected route - Get current user's profile
 *
 * Headers:
 * Authorization: Bearer <jwt-token>
 *
 * Response (200):
 * {
 *   "success": true,
 *   "data": { id, email, name, subscriptionTier, ... }
 * }
 */
router.get('/me', authMiddleware, getMe)

/**
 * POST /api/auth/logout
 * Protected route - Logout user (clear session if needed)
 *
 * Headers:
 * Authorization: Bearer <jwt-token>
 *
 * Response (200):
 * {
 *   "success": true,
 *   "message": "Logged out successfully"
 * }
 */
router.post('/logout', authMiddleware, logout)

export default router
