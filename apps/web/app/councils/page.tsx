'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useRequireAuth } from '@/lib/hooks/useAuth'
import { CouncilWithCount } from '@ai-council/shared-types'
import { getAgentById } from '@ai-council/ai-agents'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Plus, Building2, MessageSquare, Clock, ArrowRight } from 'lucide-react'

export default function CouncilsPage() {
  const { user, isLoading: authLoading } = useRequireAuth()
  const router = useRouter()
  const [councils, setCouncils] = useState<CouncilWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL')

  useEffect(() => {
    fetchCouncils()
  }, [filter])

  async function fetchCouncils() {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const status = filter === 'ALL' ? undefined : filter
      const url = status
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/councils?status=${status}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/councils`
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setCouncils(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch councils:', error)
    } finally {
      setLoading(false)
    }
  }

  function getTimeAgo(date: Date | string): string {
    const now = new Date()
    const then = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return then.toLocaleDateString()
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-indigo border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                My Councils
              </h1>
              <p className="text-gray-600">
                Manage your collaborative AI sessions
              </p>
            </div>
            <Button
              onClick={() => router.push('/councils/new')}
              className="gradient-brand text-white shadow-button hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Council
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-1 rounded-lg border border-gray-200 inline-flex">
          {(['ALL', 'ACTIVE', 'ARCHIVED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                filter === tab
                  ? 'gradient-brand text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Councils Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6 bg-white animate-pulse">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-4" />
                <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
              </Card>
            ))}
          </div>
        ) : councils.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200"
          >
            <div className="text-6xl mb-4">🏛️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {filter === 'ALL' ? 'No councils yet' : filter === 'ACTIVE' ? 'No active councils' : 'No archived councils'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {filter === 'ALL' || filter === 'ACTIVE'
                ? 'Create your first AI council to get started! Get recommendations from 4 specialized AI experts.'
                : 'Your archived councils will appear here'}
            </p>
            {(filter === 'ALL' || filter === 'ACTIVE') && (
              <Button
                onClick={() => router.push('/councils/new')}
                className="gradient-brand text-white shadow-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Council
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {councils.map((council, index) => {
              const agents = [
                getAgentById(council.agent1Id),
                getAgentById(council.agent2Id),
                getAgentById(council.agent3Id),
                getAgentById(council.agent4Id),
              ].filter(Boolean)

              return (
                <motion.div
                  key={council.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="p-6 bg-white border-2 border-gray-200 hover:border-brand-indigo hover:shadow-card-hover transition-all duration-300 cursor-pointer group h-full flex flex-col"
                    onClick={() => router.push(`/councils/${council.id}`)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-brand-indigo transition-colors">
                            {council.name}
                          </h3>
                          <Badge
                            className={`mt-1 ${
                              council.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {council.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                      {council.description || 'No description provided'}
                    </p>

                    {/* Agent Avatars */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex -space-x-2">
                        {agents.slice(0, 4).map((agent, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center border-2 border-white text-sm"
                            title={agent?.name}
                          >
                            {agent?.icon || '🤖'}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-2">
                        {agents.length} agents
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{council._count?.messages || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{getTimeAgo(council.updatedAt)}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-indigo group-hover:translate-x-1 transition-all" />
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
