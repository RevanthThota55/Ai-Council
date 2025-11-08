/**
 * Shared TypeScript types for AI Council Portal
 * Used across frontend (web) and backend (api)
 */

// ==================== User Types ====================

export interface User {
  id: string
  email: string
  name: string
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
