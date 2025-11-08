/**
 * Dashboard Page
 * Protected page - requires authentication
 * Shows user profile, stats, and quick actions
 */

'use client'

import { motion } from 'framer-motion'
import { useRequireAuth } from '../../lib/hooks/useAuth'
import DashboardHeader from '../../components/dashboard/dashboard-header'
import StatsCards from '../../components/dashboard/stats-cards'
import QuickActions from '../../components/dashboard/quick-actions'
import AccountInfo from '../../components/dashboard/account-info'

export default function DashboardPage() {
  // Automatically redirects to /login if not authenticated
  const { user, isLoading } = useRequireAuth()

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-indigo border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
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
      <DashboardHeader userName={user.name || user.email} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Stats Cards */}
          <StatsCards userSubscriptionTier={user.subscriptionTier} />

          {/* Quick Actions */}
          <QuickActions />

          {/* Account Information */}
          <AccountInfo user={user} />
        </motion.div>
      </main>
    </div>
  )
}
