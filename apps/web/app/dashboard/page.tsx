/**
 * Dashboard Page
 * Protected page - requires authentication
 * Shows user profile and account information
 */

'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../stores/auth-store'
import { useRequireAuth } from '../../lib/hooks/useAuth'

export default function DashboardPage() {
  // Automatically redirects to /login if not authenticated
  const { user, isLoading } = useRequireAuth()

  const router = useRouter()
  const { logout } = useAuthStore()

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // User will be defined here (useRequireAuth redirects if not)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Card */}
        <div className="mb-8 overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome{user.name ? `, ${user.name}` : ''}!
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              You're successfully logged in to AI Council Portal
            </p>
          </div>
        </div>

        {/* Account Information */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Account Information</h3>
            <div className="mt-5 border-t border-gray-200">
              <dl className="divide-y divide-gray-200">
                {/* Email */}
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                  <dt className="text-sm font-medium text-gray-500">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{user.email}</dd>
                </div>

                {/* Name */}
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {user.name || 'Not provided'}
                  </dd>
                </div>

                {/* Subscription Tier */}
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                  <dt className="text-sm font-medium text-gray-500">Subscription</dt>
                  <dd className="mt-1 sm:col-span-2 sm:mt-0">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        user.subscriptionTier === 'FREE'
                          ? 'bg-gray-100 text-gray-800'
                          : user.subscriptionTier === 'PRO'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {user.subscriptionTier}
                    </span>
                  </dd>
                </div>

                {/* Account Created */}
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                  <dt className="text-sm font-medium text-gray-500">Account created</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Quick Actions (Placeholder for future features) */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Test Agents (Phase 2) */}
            <button
              onClick={() => router.push('/test-agents' as any)}
              className="flex items-center justify-center rounded-lg border-2 border-blue-500 bg-blue-50 p-6 text-center hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <div>
                <div className="text-3xl mb-2">🧪</div>
                <h4 className="text-base font-medium text-blue-900">Test Agents</h4>
                <p className="mt-1 text-sm text-blue-700">Try out AI agents - Phase 2</p>
              </div>
            </button>

            {/* Create Council (Phase 3) */}
            <button
              disabled
              className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div>
                <h4 className="text-base font-medium text-gray-900">Create Council</h4>
                <p className="mt-1 text-sm text-gray-500">Coming in Phase 3</p>
              </div>
            </button>

            {/* View Councils (Phase 3) */}
            <button
              disabled
              className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div>
                <h4 className="text-base font-medium text-gray-900">My Councils</h4>
                <p className="mt-1 text-sm text-gray-500">Coming in Phase 3</p>
              </div>
            </button>

            {/* Upgrade (Future) */}
            <button
              disabled
              className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div>
                <h4 className="text-base font-medium text-gray-900">Upgrade Plan</h4>
                <p className="mt-1 text-sm text-gray-500">Coming soon</p>
              </div>
            </button>
          </div>
        </div>

        {/* Phase 2 Complete Message */}
        <div className="mt-8 rounded-lg bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Phase 2: AI Agent System Complete!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  32 AI agents available across 6 categories! Test agents with custom prompts, get GPT-4 powered recommendations, and track your usage. Click "Test Agents" above to try it out!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
