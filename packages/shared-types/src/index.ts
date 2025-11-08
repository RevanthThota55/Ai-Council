/**
 * Shared TypeScript types for AI Council Portal
 * Used across frontend (web) and backend (api)
 */

// ==================== Enums ====================

export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  BUSINESS = 'BUSINESS',
}

// ==================== User Types ====================

export interface User {
  id: string
  email: string
  name: string | null // Name is optional
  subscriptionTier: SubscriptionTier
  createdAt: Date
  updatedAt: Date
}

export interface UserCredentials {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

// ==================== Auth Request/Response Types ====================

export interface SignupRequest {
  email: string
  password: string
  name?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: Omit<User, 'password'> // User without password field
}

// ==================== AI Agent Types ====================

export enum AgentRole {
  CODER = 'coder',
  DESIGNER = 'designer',
  ANALYST = 'analyst',
  RESEARCHER = 'researcher',
  WRITER = 'writer',
}

export interface AIAgent {
  id: string
  role: AgentRole
  name: string
  description: string
  systemPrompt: string
  model: 'gpt-4' | 'claude-3-opus' | 'claude-3-sonnet'
  temperature: number
}

// ==================== Council Session Types ====================

export interface CouncilSession {
  id: string
  userId: string
  agents: AIAgent[]
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  sessionId: string
  agentId: string | null // null for user messages
  content: string
  role: 'user' | 'agent'
  timestamp: Date
}

// ==================== API Response Types ====================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ==================== Memory Types (Phase 4) ====================

export interface Memory {
  id: string
  userId: string
  sessionId: string
  content: string
  embedding: number[]
  metadata: Record<string, unknown>
  createdAt: Date
}

// ==================== Output Types (Phase 5) ====================

export enum OutputType {
  DOCUMENT = 'document',
  CODE = 'code',
  IMAGE = 'image',
}

export interface GeneratedOutput {
  id: string
  sessionId: string
  type: OutputType
  content: string
  filename: string
  createdAt: Date
}
