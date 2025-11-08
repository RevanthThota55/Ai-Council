'use client'

/**
 * My Councils Page
 * List all user's councils
 * Phase 3: Council management
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/hooks/useAuth'
import { CouncilWithCount } from '@ai-council/shared-types'
import { getAgentById } from '@ai-council/ai-agents'

export default function CouncilsPage() {
  const { user, isLoading: authLoading } = useRequireAuth()
  const router = useRouter()
  const [councils, setCouncils] = useState<CouncilWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE')

  useEffect(() => {
    fetchCouncils()
  }, [filter])

  async function fetchCouncils() {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/councils?status=${filter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
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

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My AI Councils</h1>
              <p className="mt-1 text-sm text-gray-600">Manage your collaborative AI sessions</p>
            </div>
            <button
              onClick={() => router.push('/councils/new' as any)}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              + Create New Council
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'ACTIVE'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('ARCHIVED')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'ARCHIVED'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Archived
          </button>
        </div>

        {/* Councils Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading councils...</p>
          </div>
        ) : councils.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">🏛️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'ACTIVE' ? 'No active councils yet' : 'No archived councils'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'ACTIVE'
                ? 'Create your first AI council to get started!'
                : 'Your archived councils will appear here'}
            </p>
            {filter === 'ACTIVE' && (
              <button
                onClick={() => router.push('/councils/new' as any)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Your First Council
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {councils.map((council) => {
              const agents = [
                getAgentById(council.agent1Id),
                getAgentById(council.agent2Id),
                getAgentById(council.agent3Id),
                getAgentById(council.agent4Id),
              ]

              return (
                <div
                  key={council.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/councils/${council.id}` as any)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {council.name}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {council.description}
                    </p>

                    {/* Agent Icons */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">👨‍💻</span>
                      {agents.map((agent, i) => (
                        <span key={i} className="text-2xl" title={agent?.name}>
                          {agent?.icon}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{council._count.messages} messages</span>
                      <span>{new Date(council.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
