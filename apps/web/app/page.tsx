'use client'

import Link from 'next/link'
import { useAuth } from '../lib/hooks/useAuth'

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          AI Council Portal
        </h1>
        <p className="text-center text-lg mb-4">
          Multi-agent AI collaboration platform
        </p>

        {/* Auth Status */}
        {!isLoading && (
          <div className="mt-6 flex justify-center gap-4">
            {isAuthenticated ? (
              <>
                <p className="text-sm text-gray-600">
                  Welcome back, {user?.name || user?.email}!
                </p>
                <Link
                  href="/dashboard"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}

        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm">
            ✅ <strong>Phase 1: Authentication System</strong> - Complete
          </p>
          <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">
            User signup, login, and protected routes are now working!
          </p>
        </div>
      </div>
    </main>
  )
}
