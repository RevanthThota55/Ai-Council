/**
 * useAuth Hook
 * Custom React hook for authentication logic
 *
 * What is a custom hook?
 * - A reusable function that uses React hooks
 * - Starts with "use" prefix
 * - Can be used in any component
 * - Encapsulates common logic
 *
 * This hook provides:
 * - Authentication status
 * - User data
 * - Redirect to login if not authenticated
 * - Loading states
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../stores/auth-store'

interface UseAuthOptions {
  /**
   * If true, redirects to /login when user is not authenticated
   * Use this for protected pages (dashboard, profile, etc.)
   */
  redirectIfNotAuthenticated?: boolean

  /**
   * If true, redirects to /dashboard when user IS authenticated
   * Use this for auth pages (login, signup)
   */
  redirectIfAuthenticated?: boolean

  /**
   * Custom redirect path (default: /login or /dashboard)
   */
  redirectTo?: string
}

/**
 * useAuth Hook
 * Manages authentication state and redirects
 *
 * @param options - Configuration options
 * @returns Authentication state and user data
 *
 * Example - Protected page (requires login):
 * ```tsx
 * function Dashboard() {
 *   const { user, isLoading } = useAuth({ redirectIfNotAuthenticated: true })
 *
 *   if (isLoading) return <div>Loading...</div>
 *
 *   return <div>Welcome, {user?.name}!</div>
 * }
 * ```
 *
 * Example - Auth page (redirect if already logged in):
 * ```tsx
 * function LoginPage() {
 *   const { isLoading } = useAuth({ redirectIfAuthenticated: true })
 *
 *   if (isLoading) return <div>Loading...</div>
 *
 *   return <LoginForm />
 * }
 * ```
 *
 * Example - Public page (no redirect):
 * ```tsx
 * function HomePage() {
 *   const { user, isAuthenticated } = useAuth()
 *
 *   return (
 *     <div>
 *       {isAuthenticated ? (
 *         <p>Welcome back, {user?.name}!</p>
 *       ) : (
 *         <p>Welcome, guest!</p>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useAuth(options: UseAuthOptions = {}) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore()

  const {
    redirectIfNotAuthenticated = false,
    redirectIfAuthenticated = false,
    redirectTo,
  } = options

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Handle redirects after auth check completes
  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return

    // Redirect to login if not authenticated (protected pages)
    if (redirectIfNotAuthenticated && !isAuthenticated) {
      const destination = redirectTo || '/login'
      router.push(destination as any)
      return
    }

    // Redirect to dashboard if authenticated (auth pages)
    if (redirectIfAuthenticated && isAuthenticated) {
      const destination = redirectTo || '/dashboard'
      router.push(destination as any)
      return
    }
  }, [isLoading, isAuthenticated, redirectIfNotAuthenticated, redirectIfAuthenticated, redirectTo, router])

  return {
    user,
    isAuthenticated,
    isLoading,
  }
}

/**
 * useRequireAuth Hook
 * Shorthand for protected pages - redirects to login if not authenticated
 *
 * Example:
 * ```tsx
 * function ProtectedPage() {
 *   const { user, isLoading } = useRequireAuth()
 *
 *   if (isLoading) return <div>Loading...</div>
 *
 *   return <div>Protected content for {user?.name}</div>
 * }
 * ```
 */
export function useRequireAuth() {
  return useAuth({ redirectIfNotAuthenticated: true })
}

/**
 * useGuestOnly Hook
 * Shorthand for auth pages - redirects to dashboard if authenticated
 *
 * Example:
 * ```tsx
 * function LoginPage() {
 *   const { isLoading } = useGuestOnly()
 *
 *   if (isLoading) return <div>Loading...</div>
 *
 *   return <LoginForm />
 * }
 * ```
 */
export function useGuestOnly() {
  return useAuth({ redirectIfAuthenticated: true })
}
