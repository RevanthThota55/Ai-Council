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

export enum AgentCategory {
  CODING = 'coding',
  BUSINESS = 'business',
  WRITING = 'writing',
  LEARNING = 'learning',
  HEALTH = 'health',
  CREATIVE = 'creative',
}

export enum AgentRole {
  // Coding Category
  CODER = 'coder',
  DEBUGGER = 'debugger',
  CODE_REVIEWER = 'code-reviewer',
  ARCHITECT = 'architect',
  FRONTEND_DEV = 'frontend-dev',
  BACKEND_DEV = 'backend-dev',
  DEVOPS = 'devops',
  SECURITY = 'security',

  // Business Category
  STRATEGIST = 'strategist',
  MARKETER = 'marketer',
  FINANCIAL = 'financial',
  SALES = 'sales',
  LEGAL = 'legal',
  HR = 'hr',

  // Writing Category
  WRITER = 'writer',
  EDITOR = 'editor',
  RESEARCHER = 'researcher',
  COPYWRITER = 'copywriter',
  TECHNICAL_WRITER = 'technical-writer',

  // Learning Category
  TEACHER = 'teacher',
  TUTOR = 'tutor',
  MENTOR = 'mentor',
  QUIZ_MASTER = 'quiz-master',
  STUDY_BUDDY = 'study-buddy',

  // Health & Fitness Category
  TRAINER = 'trainer',
  NUTRITIONIST = 'nutritionist',
  WELLNESS_COACH = 'wellness-coach',
  YOGA_INSTRUCTOR = 'yoga-instructor',

  // Creative Category
  DESIGNER = 'designer',
  MUSICIAN = 'musician',
  ARTIST = 'artist',

  // Legacy (keeping for backward compatibility)
  ANALYST = 'analyst',
}

export interface AIAgent {
  id: string
  role: AgentRole
  name: string
  description: string
  category: AgentCategory
  systemPrompt: string
  model: 'gpt-4' | 'gpt-4-turbo' | 'claude-3-opus' | 'claude-3-sonnet'
  temperature: number
  icon: string // Emoji for UI
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
  councilId: string
  role: 'USER' | 'AGENT' | 'SYSTEM'
  agentId: string | null // null for USER or SYSTEM messages
  content: string
  tokensUsed: number | null
  cost: number | null
  createdAt: Date
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

// ==================== AI Service Types (Phase 2) ====================

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AICompletionRequest {
  agentId: string
  prompt: string
  conversationHistory?: AIMessage[]
}

export interface AICompletionResponse {
  content: string
  model: string
  tokensUsed: number
  estimatedCost: number // in USD
  finishReason: string
}

export interface RecommendationRequest {
  description: string // User's goal description
}

export interface AgentRecommendation {
  agent: AIAgent
  reason: string // Why this agent was recommended
  relevanceScore: number // 0-100
}

export interface RecommendationResponse {
  recommendations: AgentRecommendation[]
  analysisUsed: {
    model: string
    tokensUsed: number
    estimatedCost: number
  }
}

export interface AgentTestRequest {
  agentId: string
  prompt: string
}

export interface AgentTestResponse {
  agentName: string
  response: string
  tokensUsed: number
  estimatedCost: number
  model: string
}

// ==================== Council Types (Phase 3) ====================

export interface Council {
  id: string
  userId: string
  name: string
  description: string
  agent1Id: string
  agent2Id: string
  agent3Id: string
  agent4Id: string
  agent1Custom?: string | null
  agent2Custom?: string | null
  agent3Custom?: string | null
  agent4Custom?: string | null
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
  createdAt: Date
  updatedAt: Date
}

export interface CouncilWithMessages extends Council {
  messages: Message[]
}

export interface CouncilWithCount extends Council {
  _count: {
    messages: number
  }
}

export interface CreateCouncilRequest {
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

export interface UpdateCouncilRequest {
  name?: string
  status?: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
}

// ==================== Socket.IO Event Types (Phase 3) ====================

// Client -> Server Events
export interface ClientToServerEvents {
  join_council: (data: { councilId: string }) => void
  leave_council: (data: { councilId: string }) => void
  send_message: (data: { councilId: string; content: string }) => void
}

// Server -> Client Events
export interface ServerToClientEvents {
  joined_council: (data: { success: boolean; councilId: string; councilName: string }) => void
  user_message: (data: { messageId: string; content: string; createdAt: Date }) => void
  agent_typing: (data: { agentNumber: number; totalAgents: number }) => void
  agent_response: (data: {
    agentId: string
    agentName: string
    content: string
    messageId: string
    tokensUsed: number
    cost: number
  }) => void
  all_agents_responded: (data: { totalResponses: number }) => void
  error: (data: { message: string }) => void
}

// ==================== Memory Types (Phase 4) ====================

export interface Memory {
  id: string
  userId: string
  councilId: string | null
  content: string
  embedding: number[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateMemoryRequest {
  content: string
  tags?: string[]
  councilId?: string
}

export interface SearchMemoryRequest {
  query: string
  limit?: number
}

export interface MemoryWithSimilarity extends Memory {
  similarity: number // Cosine similarity score (0-1)
}

export interface MemoryStatsResponse {
  totalMemories: number
  memoriesThisWeek: number
}
