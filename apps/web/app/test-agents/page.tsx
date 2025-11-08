'use client'

/**
 * Agent Test Page
 * Test AI agents with custom prompts
 * Phase 2: Agent Testing Interface
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/hooks/useAuth'

// Types
interface Agent {
  id: string
  name: string
  description: string
  category: string
  role: string
  icon: string
}

interface TestResponse {
  agentName: string
  agentRole: string
  response: string
  tokensUsed: number
  estimatedCost: number
  model: string
}

interface UsageStats {
  totalRequests: number
  totalTokens: number
  totalCost: number
  requestsThisHour: number
  lastRequest: Date | null
}

export default function TestAgentsPage() {
  const { user, isLoading: authLoading } = useRequireAuth()
  const router = useRouter()

  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState<TestResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Fetch agents on mount
  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agents/templates`)
        const data = await res.json()

        if (data.success) {
          setAgents(data.data.agents)
        }
      } catch (err) {
        console.error('Failed to fetch agents:', err)
      }
    }

    fetchAgents()
  }, [])

  // Fetch usage stats
  async function fetchUsage() {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agents/usage`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (data.success) {
        setUsage(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch usage:', err)
    }
  }

  // Handle agent test
  async function handleTest() {
    if (!selectedAgent || !prompt.trim()) {
      setError('Please select an agent and enter a prompt')
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const token = localStorage.getItem('auth_token')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agents/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          prompt: prompt.trim(),
        }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to get response from agent')
        return
      }

      setResponse(data.data)
      fetchUsage() // Refresh usage stats
    } catch (err) {
      setError('An error occurred while testing the agent')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', 'coding', 'business', 'writing', 'learning', 'health', 'creative']
  const filteredAgents =
    categoryFilter === 'all' ? agents : agents.filter(a => a.category === categoryFilter)

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Test AI Agents</h1>
              <p className="mt-1 text-sm text-gray-600">
                Try out different AI agents with custom prompts
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard' as any)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agent Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Select Agent ({filteredAgents.length})</h2>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Agent List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAgents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent(agent)
                      setResponse(null)
                      setError(null)
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedAgent?.id === agent.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">{agent.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{agent.name}</p>
                        <p className="text-xs text-gray-500 truncate">{agent.description}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          {agent.category}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Usage Stats */}
            {usage && (
              <div className="bg-white shadow rounded-lg p-6 mt-4">
                <h3 className="text-sm font-semibold mb-3">API Usage</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Hour:</span>
                    <span className="font-medium">{usage.requestsThisHour} / 20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Requests:</span>
                    <span className="font-medium">{usage.totalRequests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-medium">${usage.totalCost.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Test Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              {selectedAgent ? (
                <div>
                  {/* Agent Info */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start">
                      <span className="text-3xl mr-4">{selectedAgent.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{selectedAgent.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{selectedAgent.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {selectedAgent.category}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                            {selectedAgent.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prompt Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Prompt</label>
                    <textarea
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      placeholder={`Ask ${selectedAgent.name} anything...`}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {prompt.length} / 2000 characters
                    </p>
                  </div>

                  {/* Test Button */}
                  <button
                    onClick={handleTest}
                    disabled={loading || !prompt.trim()}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Getting Response...' : 'Test Agent'}
                  </button>

                  {/* Error */}
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Response */}
                  {response && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">Response</h3>
                        <div className="flex gap-3 text-xs text-gray-600">
                          <span>Tokens: {response.tokensUsed}</span>
                          <span>Cost: ${response.estimatedCost.toFixed(4)}</span>
                          <span>{response.model}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{response.response}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Agent</h3>
                  <p className="text-sm text-gray-600">
                    Choose an AI agent from the left to start testing
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
