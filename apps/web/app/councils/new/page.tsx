'use client'

/**
 * Council Creation Wizard
 * 3-step process: Describe Goal → AI Recommendations → Name & Confirm
 * Phase 3: Council creation flow
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/hooks/useAuth'
import { AgentRecommendation } from '@ai-council/shared-types'
import { getAgentById } from '@ai-council/ai-agents'

export default function NewCouncilPage() {
  const { user, isLoading: authLoading } = useRequireAuth()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [description, setDescription] = useState('')
  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>([])
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [councilName, setCouncilName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Get AI recommendations
  async function handleGetRecommendations() {
    if (description.trim().length < 20) {
      setError('Description must be at least 20 characters')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agents/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description: description.trim() }),
      })

      const data = await res.json()

      if (data.success) {
        setRecommendations(data.data.recommendations)
        setSelectedAgents(data.data.recommendations.map((r: AgentRecommendation) => r.agent.id))
        setCouncilName(generateCouncilName(description))
        setStep(2)
      } else {
        setError(data.error || 'Failed to get recommendations')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Create council
  async function handleCreateCouncil() {
    if (selectedAgents.length !== 4) {
      setError('Please select exactly 4 agents')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/councils`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: councilName || generateCouncilName(description),
          description: description.trim(),
          agent1Id: selectedAgents[0],
          agent2Id: selectedAgents[1],
          agent3Id: selectedAgents[2],
          agent4Id: selectedAgents[3],
        }),
      })

      const data = await res.json()

      if (data.success) {
        router.push(`/councils/${data.data.id}` as any)
      } else {
        setError(data.error || 'Failed to create council')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function generateCouncilName(desc: string): string {
    const words = desc.split(' ').slice(0, 4).join(' ')
    return words.charAt(0).toUpperCase() + words.slice(1) + ' Council'
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    s <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-12 sm:w-24 h-1 ${s < step ? 'bg-blue-600' : 'bg-gray-200'}`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs sm:text-sm text-gray-600">
            <span>Describe</span>
            <span>Recommend</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          {/* Step 1: Describe Goal */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Create Your AI Council
              </h1>
              <p className="text-gray-600 mb-6">What do you want to accomplish?</p>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your goal in detail..."
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <p className="text-xs text-gray-500 mt-2">{description.length} / 500 characters (min 20)</p>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-blue-900 mb-2">💡 Examples:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Learn Python programming and build web applications</li>
                  <li>• Start an online bakery business with marketing strategy</li>
                  <li>• Get fit, lose weight, and build healthy habits</li>
                  <li>• Write and publish a fantasy novel</li>
                </ul>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => router.push('/councils' as any)}
                  className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGetRecommendations}
                  disabled={loading || description.trim().length < 20}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Analyzing...' : 'Get Recommendations →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: AI Recommendations */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Recommended Agents
              </h1>
              <p className="text-sm text-gray-600 mb-6">
                Based on: "{description.substring(0, 60)}..."
              </p>

              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.agent.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedAgents.includes(rec.agent.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{rec.agent.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{rec.agent.name}</h3>
                          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                            {rec.agent.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rec.agent.description}</p>
                        <p className="text-sm text-blue-700 italic">
                          💡 {rec.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={selectedAgents.length !== 4}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Use These Agents →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Name & Confirm */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Almost Done!</h1>
              <p className="text-gray-600 mb-6">Name your council and confirm your team</p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Council Name (optional)
                </label>
                <input
                  type="text"
                  value={councilName}
                  onChange={(e) => setCouncilName(e.target.value)}
                  placeholder="My AI Council"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default: Based on your goal description
                </p>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Team (5 members):</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded border border-blue-200">
                    <span className="text-2xl">👨‍💻</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">You</p>
                      <p className="text-xs text-gray-600">Team Leader</p>
                    </div>
                  </div>
                  {selectedAgents.map((agentId) => {
                    const agent = getAgentById(agentId)
                    return (
                      <div key={agentId} className="flex items-center gap-3 p-2">
                        <span className="text-2xl">{agent?.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{agent?.name}</p>
                          <p className="text-xs text-gray-600">{agent?.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button
                  onClick={handleCreateCouncil}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Council! 🚀'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Need help? Your AI team will guide you through any goal.</p>
        </div>
      </div>
    </div>
  )
}
