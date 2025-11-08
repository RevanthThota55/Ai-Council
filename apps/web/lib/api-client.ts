/**
 * API Client
 * Centralized utility for making HTTP requests to the backend API
 *
 * Why use this instead of fetch directly?
 * - Automatically adds auth token to requests
 * - Handles errors consistently
 * - Type-safe API calls
 * - Single place to configure API settings
 */

import type { ApiResponse, SignupRequest, LoginRequest, AuthResponse, User } from '@ai-council/shared-types'

/**
 * API Base URL
 * Points to the backend Express API
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

/**
 * Get auth token from localStorage
 * Returns null if not authenticated
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null // Server-side rendering
  }

  return localStorage.getItem('auth_token')
}

/**
 * Set auth token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
  }
}

/**
 * Remove auth token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
  }
}

/**
 * Make HTTP Request
 * Generic function for making API calls
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`

  // Get auth token if available
  const token = getAuthToken()

  // Default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Merge with options headers
  if (options.headers) {
    Object.assign(headers, options.headers)
  }

  // Add 5-second timeout to prevent hanging when backend is down
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal, // Add abort signal
    })

    clearTimeout(timeoutId) // Clear timeout if request succeeded

    const data = await response.json()

    // If response is not ok, throw error with message
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`,
      }
    }

    return data
  } catch (error) {
    clearTimeout(timeoutId)
    console.error('API request error:', error)

    // Check if it was a timeout/abort
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout - backend server may be offline',
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    }
  }
}

/**
 * Auth API Endpoints
 */
export const authApi = {
  /**
   * Signup - Create new user account
   * @param data - Signup credentials
   * @returns Auth response with token and user
   */
  signup: async (data: SignupRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Login - Authenticate existing user
   * @param data - Login credentials
   * @returns Auth response with token and user
   */
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Get current user - Fetch authenticated user's profile
   * Requires auth token
   * @returns User data
   */
  getMe: async (): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/api/auth/me', {
      method: 'GET',
    })
  },

  /**
   * Logout - End user session
   * Requires auth token
   */
  logout: async (): Promise<ApiResponse<null>> => {
    return apiRequest<null>('/api/auth/logout', {
      method: 'POST',
    })
  },
}

/**
 * Example usage:
 *
 * // Signup
 * const result = await authApi.signup({
 *   email: 'user@example.com',
 *   password: 'securePass123',
 *   name: 'John Doe'
 * })
 *
 * if (result.success && result.data) {
 *   setAuthToken(result.data.token)
 *   console.log('User:', result.data.user)
 * } else {
 *   console.error('Error:', result.error)
 * }
 *
 * // Login
 * const loginResult = await authApi.login({
 *   email: 'user@example.com',
 *   password: 'securePass123'
 * })
 *
 * // Get current user
 * const userResult = await authApi.getMe()
 *
 * // Logout
 * await authApi.logout()
 * removeAuthToken()
 */
