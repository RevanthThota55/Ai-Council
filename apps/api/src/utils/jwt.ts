/**
 * JWT Utility Functions
 * Handles JSON Web Token generation, verification, and decoding
 *
 * Why JWT?
 * - Stateless authentication (no session storage needed)
 * - Self-contained (contains user info)
 * - Secure (digitally signed)
 * - Portable (works across different domains)
 */

import jwt from 'jsonwebtoken'

/**
 * JWT Payload Structure
 * What information we store inside the token
 */
export interface JWTPayload {
  userId: string
  email: string
  iat?: number // Issued at (timestamp)
  exp?: number // Expires at (timestamp)
}

/**
 * Get JWT secret from environment
 * Throws error if not configured (critical for security)
 */
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error(
      'JWT_SECRET is not defined in environment variables. Please set it in .env file.'
    )
  }

  return secret
}

/**
 * Generate JWT Token
 * Creates a signed token containing user information
 *
 * @param payload - User data to encode in token
 * @param expiresIn - Token expiration time (default: 24 hours)
 * @returns Signed JWT token string
 *
 * Example:
 * const token = generateToken({ userId: '123', email: 'user@example.com' })
 */
export function generateToken(payload: JWTPayload, expiresIn = '24h'): string {
  const secret = getJWTSecret()

  return jwt.sign(payload, secret, {
    expiresIn: expiresIn,
    issuer: 'ai-council-api',
    audience: 'ai-council-users',
  } as any)
}

/**
 * Verify JWT Token
 * Checks if token is valid and not expired
 *
 * @param token - JWT token string to verify
 * @returns Decoded payload if valid
 * @throws Error if token is invalid or expired
 *
 * Example:
 * try {
 *   const payload = verifyToken(token)
 *   console.log('User ID:', payload.userId)
 * } catch (error) {
 *   console.error('Invalid token:', error.message)
 * }
 */
export function verifyToken(token: string): JWTPayload {
  const secret = getJWTSecret()

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: 'ai-council-api',
      audience: 'ai-council-users',
    }) as JWTPayload

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired. Please log in again.')
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token. Please log in again.')
    }

    throw new Error('Token verification failed.')
  }
}

/**
 * Decode JWT Token (without verification)
 * Useful for debugging or extracting info from expired tokens
 *
 * WARNING: This does NOT verify the token! Use only for non-security purposes.
 *
 * @param token - JWT token string to decode
 * @returns Decoded payload (may be from expired/invalid token)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Extract token from Authorization header
 * Handles "Bearer <token>" format
 *
 * @param authHeader - Authorization header value
 * @returns Token string or null if invalid format
 *
 * Example:
 * const token = extractTokenFromHeader('Bearer abc123xyz')
 * // Returns: 'abc123xyz'
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null
  }

  const parts = authHeader.split(' ')

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }

  return parts[1]
}

/**
 * Check if token is expired
 * @param token - JWT token to check
 * @returns true if expired, false if still valid
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)

  if (!decoded || !decoded.exp) {
    return true
  }

  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now()
}
