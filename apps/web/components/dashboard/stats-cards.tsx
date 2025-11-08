'use client'

import { useState, useEffect } from 'react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Building2, MessageSquare, Zap, Crown } from 'lucide-react'
import { CouncilWithCount } from '@ai-council/shared-types'

interface StatsCardsProps {
  userSubscriptionTier?: string
}

interface DashboardStats {
  totalCouncils: number
  messagesToday: number
  activeCouncils: number
  subscriptionTier: string
}

export default function StatsCards({ userSubscriptionTier }: StatsCardsProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalCouncils: 0,
    messagesToday: 0,
    activeCouncils: 0,
    subscriptionTier: userSubscriptionTier || 'FREE',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      
      // Fetch all councils
      const councilsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/councils`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const councilsData = await councilsRes.json()
      
      // Fetch active councils
      const activeRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/councils?status=ACTIVE`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const activeData = await activeRes.json()

      const allCouncils: CouncilWithCount[] = councilsData.success ? councilsData.data : []
      const activeCouncils: CouncilWithCount[] = activeData.success ? activeData.data : []

      // Calculate messages today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // For now, we'll use total message count as a placeholder
      // In production, you'd filter by createdAt >= today
      const messagesToday = allCouncils.reduce((sum, council) => {
        return sum + (council._count?.messages || 0)
      }, 0)

      setStats({
        totalCouncils: allCouncils.length,
        messagesToday: messagesToday, // Placeholder - would need message timestamps
        activeCouncils: activeCouncils.length,
        subscriptionTier: userSubscriptionTier || 'FREE',
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsData = [
    {
      label: 'Total Councils',
      value: stats.totalCouncils,
      icon: Building2,
      gradient: 'from-brand-indigo to-brand-purple',
      color: 'text-brand-indigo',
    },
    {
      label: 'Messages Today',
      value: stats.messagesToday,
      icon: MessageSquare,
      gradient: 'from-brand-purple to-brand-pink',
      color: 'text-brand-purple',
    },
    {
      label: 'Active Councils',
      value: stats.activeCouncils,
      icon: Zap,
      gradient: 'from-brand-pink to-brand-indigo',
      color: 'text-brand-pink',
    },
    {
      label: 'Subscription',
      value: stats.subscriptionTier,
      icon: Crown,
      gradient: 'from-yellow-500 to-orange-500',
      color: 'text-yellow-600',
      isBadge: true,
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 bg-white animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-full mb-4" />
            <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {statsData.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={index}
            className="p-6 md:p-8 bg-white border border-gray-200 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
          >
            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>

            {/* Value */}
            {stat.isBadge ? (
              <Badge
                className={`mb-2 ${
                  stat.value === 'FREE'
                    ? 'bg-gray-100 text-gray-800'
                    : stat.value === 'PRO'
                    ? 'gradient-brand text-white'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {stat.value}
              </Badge>
            ) : (
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
            )}

            {/* Label */}
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Card>
        )
      })}
    </div>
  )
}

