'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useRequireAuth } from '@/lib/hooks/useAuth'
import { AgentRecommendation } from '@ai-council/shared-types'
import { getAgentById } from '@ai-council/ai-agents'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Badge } from '../../../components/ui/badge'
import { ArrowLeft, ArrowRight, Check, Sparkles, Users, Lightbulb } from 'lucide-react'

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
  const [creationProgress, setCreationProgress] = useState('')

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

    const progressMessages = [
      'Assembling your AI team...',
      'Preparing the council room...',
      'Almost ready!',
    ]

    try {
      // Simulate progress
      for (let i = 0; i < progressMessages.length; i++) {
        setCreationProgress(progressMessages[i])
        await new Promise(resolve => setTimeout(resolve, 800))
      }

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
        // Success - redirect to chat
        setTimeout(() => {
          router.push(`/councils/${data.data.id}`)
        }, 1000)
      } else {
        setError(data.error || 'Failed to create council')
        setCreationProgress('')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setCreationProgress('')
    } finally {
      setLoading(false)
    }
  }

  function generateCouncilName(desc: string): string {
    const words = desc.split(' ').slice(0, 4).join(' ')
    return words.charAt(0).toUpperCase() + words.slice(1) + ' Council'
  }

  function toggleAgent(agentId: string) {
    if (selectedAgents.includes(agentId)) {
      if (selectedAgents.length > 1) {
        setSelectedAgents(selectedAgents.filter(id => id !== agentId))
      }
    } else {
      if (selectedAgents.length < 4) {
        setSelectedAgents([...selectedAgents, agentId])
      }
    }
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

  const progressPercentage = (step / 3) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : router.push('/councils')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <div className="text-sm font-medium text-gray-600">
              Step {step} of 3
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <motion.div
              className="h-2 rounded-full gradient-brand"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step Circles */}
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      s < step
                        ? 'gradient-brand text-white shadow-lg'
                        : s === step
                        ? 'bg-brand-indigo text-white ring-4 ring-brand-indigo ring-opacity-20'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s < step ? <Check className="w-6 h-6" /> : s}
                  </div>
                  <div className="mt-2 text-xs font-medium text-gray-600 text-center">
                    {s === 1 && 'Describe Goal'}
                    {s === 2 && 'Recommendations'}
                    {s === 3 && 'Confirm'}
                  </div>
                </div>
                {s < 3 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded ${
                      s < step ? 'gradient-brand' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <Card className="p-6 sm:p-8 lg:p-12 bg-white border border-gray-200 shadow-lg">
          <AnimatePresence mode="wait">
            {/* Step 1: Describe Goal */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    What do you want to achieve?
                  </h1>
                  <p className="text-gray-600">
                    Describe your goal in detail so we can recommend the perfect AI experts for you
                  </p>
                </div>

                <div className="mb-6">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2">
                    Your Goal
                  </Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Example: I want to learn Python programming and build web applications. I'm a complete beginner and need guidance on where to start, what resources to use, and how to practice effectively."
                    rows={8}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:border-brand-indigo resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      {description.length} / 500 characters (minimum 20)
                    </p>
                    {description.length < 20 && (
                      <p className="text-xs text-red-600">
                        {20 - description.length} more characters needed
                      </p>
                    )}
                  </div>
                </div>

                {/* Example Suggestions */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">💡 Quick Examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Learn a new skill',
                      'Start a business',
                      'Get fit and healthy',
                      'Creative project',
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => {
                          const examples: Record<string, string> = {
                            'Learn a new skill': 'I want to learn Python programming from scratch and build real-world applications.',
                            'Start a business': 'I want to start an online business selling handmade products. I need help with business strategy, marketing, and operations.',
                            'Get fit and healthy': 'I want to get fit, lose weight, and build healthy eating habits. I need a sustainable plan.',
                            'Creative project': 'I want to write and publish a fantasy novel. I need help with plotting, character development, and publishing strategy.',
                          }
                          setDescription(examples[example] || example)
                        }}
                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleGetRecommendations}
                    disabled={loading || description.trim().length < 20}
                    className="gradient-brand text-white shadow-button hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Get Recommendations
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: AI Recommendations */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Perfect! Here's your recommended council
                  </h1>
                  <p className="text-gray-600">
                    These 4 AI experts will help you achieve your goal
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {recommendations.map((rec) => {
                    const isSelected = selectedAgents.includes(rec.agent.id)
                    return (
                      <Card
                        key={rec.agent.id}
                        className={`p-6 cursor-pointer transition-all border-2 ${
                          isSelected
                            ? 'border-brand-indigo bg-gradient-to-br from-brand-indigo/5 to-brand-purple/5 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleAgent(rec.agent.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{rec.agent.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                  {rec.agent.name}
                                </h3>
                                <Badge className="bg-gray-100 text-gray-700">
                                  {rec.agent.category}
                                </Badge>
                              </div>
                              {isSelected && (
                                <div className="w-6 h-6 rounded-full bg-brand-indigo flex items-center justify-center flex-shrink-0">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {rec.agent.description}
                            </p>
                            <p className="text-sm text-brand-indigo italic">
                              💡 {rec.reason}
                            </p>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>

                {error && (
                  <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="border-gray-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={selectedAgents.length !== 4}
                    className="gradient-brand text-white shadow-button hover:opacity-90 disabled:opacity-50"
                  >
                    Use These Agents
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Name & Confirm */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-pink to-brand-indigo flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Almost done! Name your council
                  </h1>
                  <p className="text-gray-600">
                    Give your council a memorable name
                  </p>
                </div>

                <div className="mb-8">
                  <Label htmlFor="councilName" className="text-sm font-medium text-gray-700 mb-2">
                    Council Name
                  </Label>
                  <Input
                    id="councilName"
                    type="text"
                    value={councilName}
                    onChange={(e) => setCouncilName(e.target.value)}
                    placeholder="My AI Council"
                    className="h-12 text-lg"
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {councilName.length} / 50 characters
                  </p>
                </div>

                {/* Council Preview */}
                <Card className="p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Your Council Preview</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Name</p>
                      <p className="text-lg font-bold text-gray-900">
                        {councilName || generateCouncilName(description)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Your Team (5 members)</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-brand-indigo/10 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center">
                            <span className="text-xl">👤</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">You</p>
                            <p className="text-xs text-gray-600">Team Leader</p>
                          </div>
                        </div>
                        {selectedAgents.map((agentId) => {
                          const agent = getAgentById(agentId)
                          return (
                            <div key={agentId} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                              <div className="text-2xl">{agent?.icon}</div>
                              <div>
                                <p className="font-semibold text-gray-900">{agent?.name}</p>
                                <p className="text-xs text-gray-600">{agent?.description}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Goal</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{description}</p>
                    </div>
                  </div>
                </Card>

                {error && (
                  <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {creationProgress && (
                  <div className="mb-6 rounded-lg bg-brand-indigo/10 border border-brand-indigo/20 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm font-medium text-brand-indigo">{creationProgress}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="border-gray-300"
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateCouncil}
                    disabled={loading}
                    className="gradient-brand text-white shadow-button hover:opacity-90 disabled:opacity-50 text-lg px-8"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Council! 🚀
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  )
}
