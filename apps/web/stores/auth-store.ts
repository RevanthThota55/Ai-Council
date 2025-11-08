import { create } from 'zustand'
import type { User, SignupRequest, LoginRequest } from '@ai-council/shared-types'
import { authApi, setAuthToken, removeAuthToken } from '../lib/api-client'

/**
 * Authentication Store
 * Manages user authentication state across the application using Zustand
 *
 * What is Zustand?
 * - Simple state management for React
 * - Like useState but shared across entire app
 * - No provider needed (unlike Context API)
 * - Minimal boilerplate (unlike Redux)
 *
 * This store handles:
 * - Login/Signup
 * - Logout
 * - Checking if user is authenticated
 * - Storing user data
 * - Managing loading states
 * - Error handling
 */

interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  signup: (data: SignupRequest) => Promise<boolean>
  login: (data: LoginRequest) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial State
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true (we'll check auth on app load)
  error: null,

  /**
   * Signup Action
   * Creates new user account and logs them in
   *
   * @param data - Signup credentials
   * @returns true if successful, false if error
   *
   * Usage:
   * const signup = useAuthStore(state => state.signup)
   * const success = await signup({ email, password, name })
   */
  signup: async (data) => {
    set({ isLoading: true, error: null })

    const response = await authApi.signup(data)

    if (response.success && response.data) {
      // Save token to localStorage
      setAuthToken(response.data.token)

      // Update state with user data
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      return true
    } else {
      // Handle error
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: response.error || 'Signup failed',
      })

      return false
    }
  },

  /**
   * Login Action
   * Authenticates existing user
   *
   * @param data - Login credentials
   * @returns true if successful, false if error
   *
   * Usage:
   * const login = useAuthStore(state => state.login)
   * const success = await login({ email, password })
   */
  login: async (data) => {
    set({ isLoading: true, error: null })

    const response = await authApi.login(data)

    if (response.success && response.data) {
      // Save token to localStorage
      setAuthToken(response.data.token)

      // Update state with user data
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      return true
    } else {
      // Handle error
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: response.error || 'Login failed',
      })

      return false
    }
  },

  /**
   * Logout Action
   * Clears user session and removes token
   *
   * Usage:
   * const logout = useAuthStore(state => state.logout)
   * logout()
   */
  logout: () => {
    // Remove token from localStorage
    removeAuthToken()

    // Call logout API (for session cleanup if needed)
    authApi.logout().catch((error) => {
      console.error('Logout API error:', error)
      // Continue with local logout even if API fails
    })

    // Clear state
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  },

  /**
   * Check Auth Action
   * Verifies if user is authenticated on app load
   * Fetches current user data if token exists
   *
   * This should be called when app loads to restore session
   *
   * Usage:
   * const checkAuth = useAuthStore(state => state.checkAuth)
   * useEffect(() => { checkAuth() }, [])
   */
  checkAuth: async () => {
    set({ isLoading: true })

    // Try to get current user (token is auto-attached by API client)
    const response = await authApi.getMe()

    if (response.success && response.data) {
      // User is authenticated
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } else {
      // Not authenticated or token expired
      removeAuthToken()

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  },

  /**
   * Clear Error Action
   * Removes error message
   *
   * Usage:
   * const clearError = useAuthStore(state => state.clearError)
   * clearError()
   */
  clearError: () => {
    set({ error: null })
  },
}))

/**
 * Example Usage in Components:
 *
 * // In Login page
 * const { login, error, isLoading } = useAuthStore()
 *
 * const handleLogin = async () => {
 *   const success = await login({ email, password })
 *   if (success) {
 *     router.push('/dashboard')
 *   }
 * }
 *
 * // In App root (check auth on load)
 * const { checkAuth } = useAuthStore()
 *
 * useEffect(() => {
 *   checkAuth()
 * }, [checkAuth])
 *
 * // In any component (get current user)
 * const { user, isAuthenticated } = useAuthStore()
 *
 * if (isAuthenticated) {
 *   return <div>Welcome, {user.name}!</div>
 * }
 */
