'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Building2, ArrowRight, Plus } from 'lucide-react'
import { CouncilWithCount } from '@ai-council/shared-types'
import { getAgentById } from '@ai-council/ai-agents'

export default function QuickActions() {
  const router = useRouter()
  const [recentCouncils, setRecentCouncils] = useState<CouncilWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentCouncils()
  }, [])

  async function fetchRecentCouncils() {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/councils?status=ACTIVE`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const data = await res.json()
      if (data.success) {
        // Get top 3 most recent councils
        setRecentCouncils(data.data.slice(0, 3))
      }
    } catch (error) {
      console.error('Failed to fetch recent councils:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Create New Council Card */}
      <Card
        className="p-8 gradient-brand-br text-white border-0 hover:scale-105 transition-transform duration-300 cursor-pointer shadow-xl"
        onClick={() => router.push('/councils/new')}
      >
        <div className="flex flex-col h-full">
          <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Create New Council</h3>
          <p className="text-white/90 mb-6 flex-1">
            Get AI recommendations for any goal and start collaborating with your personal team of 4 AI experts.
          </p>
          <Button
            className="bg-white text-brand-indigo hover:bg-gray-50 font-semibold w-full sm:w-auto"
            onClick={(e) => {
              e.stopPropagation()
              router.push('/councils/new')
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Start Now
          </Button>
        </div>
      </Card>

      {/* Recent Councils Card */}
      <Card className="p-8 bg-white border border-gray-200 hover:shadow-card-hover transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Recent Councils</h3>
          <a href="/councils">
            <Button variant="ghost" size="sm" className="text-brand-indigo hover:text-brand-purple">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : recentCouncils.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏛️</div>
            <p className="text-gray-600 mb-4">No councils yet</p>
            <a href="/councils/new">
              <Button className="gradient-brand text-white">
                Create Your First Council
              </Button>
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {recentCouncils.map((council) => {
              const agents = [
                getAgentById(council.agent1Id),
                getAgentById(council.agent2Id),
                getAgentById(council.agent3Id),
                getAgentById(council.agent4Id),
              ]

              return (
                <div
                  key={council.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/councils/${council.id}`)}
                >
                  {/* Agent Avatars */}
                  <div className="flex -space-x-2">
                    {agents.slice(0, 3).map((agent, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center border-2 border-white text-lg"
                        title={agent?.name}
                      >
                        {agent?.icon || '🤖'}
                      </div>
                    ))}
                    {agents.length > 3 && (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white text-xs font-semibold text-gray-600">
                        +{agents.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Council Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate group-hover:text-brand-indigo transition-colors">
                      {council.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {council._count?.messages || 0} messages
                    </p>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-indigo group-hover:translate-x-1 transition-all" />
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

