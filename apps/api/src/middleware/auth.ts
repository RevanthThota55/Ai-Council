/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens
 *
 * How it works:
 * 1. Extract token from Authorization header
 * 2. Verify token is valid and not expired
 * 3. Decode token to get user information
 * 4. Attach user data to request object
 * 5. Allow request to proceed to route handler
 *
 * If any step fails, return 401 Unauthorized error
 */

import { Request, Response, NextFunction } from 'express'
import { extractTokenFromHeader, verifyToken, JWTPayload } from '../utils/jwt'

/**
 * Extended Request interface with user data
 * After authentication, req.user will contain decoded JWT payload
 */
export interface AuthRequest extends Request {
  user?: JWTPayload
}

/**
 * Authentication Middleware
 * Use this middleware on routes that require authentication
 *
 * Example:
 * router.get('/protected', authMiddleware, (req: AuthRequest, res) => {
 *   console.log('User ID:', req.user.userId)
 *   res.json({ message: 'Access granted' })
 * })
 */
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid token.',
      })
      return
    }

    // Verify and decode token
    const payload = verifyToken(token)

    // Attach user data to request
    req.user = payload

    // Proceed to next middleware/route handler
    next()
  } catch (error) {
    // Token verification failed
    const errorMessage = error instanceof Error ? error.message : 'Invalid token'

    res.status(401).json({
      success: false,
      error: errorMessage,
    })
  }
}

/**
 * Optional Authentication Middleware
 * Attaches user if token is provided, but doesn't require it
 *
 * Use for routes that work differently for authenticated vs non-authenticated users
 *
 * Example:
 * router.get('/content', optionalAuthMiddleware, (req: AuthRequest, res) => {
 *   if (req.user) {
 *     // Show personalized content
 *   } else {
 *     // Show public content
 *   }
 * })
 */
export function optionalAuthMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization
    const token = extractTokenFromHeader(authHeader)

    if (token) {
      const payload = verifyToken(token)
      req.user = payload
    }

    // Always proceed, regardless of token presence
    next()
  } catch (error) {
    // Token was provided but invalid - continue without user
    next()
  }
}
