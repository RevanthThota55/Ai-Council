/**
 * Shared Configuration for AI Council Portal
 * Constants and configuration values used across frontend and backend
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  VERSION: 'v1',
  BASE_PATH: '/api',
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
} as const

/**
 * Agent Configuration
 */
export const AGENT_CONFIG = {
  MAX_AGENTS_PER_SESSION: 5,
  MIN_AGENTS_PER_SESSION: 1,
  DEFAULT_TEMPERATURE: 0.7,
  MAX_TOKENS: 2000,
  TIMEOUT: 60000, // 60 seconds per agent response
} as const

/**
 * Session Configuration
 */
export const SESSION_CONFIG = {
  MAX_MESSAGES: 1000,
  MAX_SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
} as const

/**
 * Memory Configuration (Phase 4)
 */
export const MEMORY_CONFIG = {
  MAX_MEMORIES_PER_USER: 10000,
  EMBEDDING_DIMENSION: 1536, // OpenAI ada-002 dimension
  SIMILARITY_THRESHOLD: 0.7,
  MAX_RESULTS: 10,
} as const

/**
 * File Upload Configuration (Phase 5)
 */
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/markdown', 'text/plain'],
  ALLOWED_CODE_TYPES: ['text/javascript', 'text/typescript', 'text/python'],
} as const

/**
 * Pagination Configuration
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
} as const

/**
 * Security Configuration
 */
export const SECURITY_CONFIG = {
  JWT_EXPIRY: '7d', // 7 days
  REFRESH_TOKEN_EXPIRY: '30d', // 30 days
  BCRYPT_ROUNDS: 12,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
} as const

/**
 * WebSocket Configuration
 */
export const WEBSOCKET_CONFIG = {
  PING_INTERVAL: 30000, // 30 seconds
  PING_TIMEOUT: 5000, // 5 seconds
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 1000, // 1 second
} as const
