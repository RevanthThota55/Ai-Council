'use client'

/**
 * Council Chat Page
 * Real-time chat interface with 4 AI agents
 * Phase 3: The core product experience
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useRequireAuth } from '@/lib/hooks/useAuth'
import { useSocket } from '@/lib/hooks/useSocket'
import { CouncilWithMessages, Message } from '@ai-council/shared-types'
import { getAgentById } from '@ai-council/ai-agents'

export default function CouncilChatPage() {
  const { isLoading: authLoading } = useRequireAuth()
  const router = useRouter()
  const params = useParams()
  const councilId = params.id as string

  const [council, setCouncil] = useState<CouncilWithMessages | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [typingAgent, setTypingAgent] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { socket, isConnected, error: socketError } = useSocket(councilId)

  // Fetch council data
  useEffect(() => {
    async function fetchCouncil() {
      try {
        const token = localStorage.getItem('auth_token')
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/councils/${councilId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()

        if (data.success) {
          setCouncil(data.data)
          setMessages(data.data.messages || [])
        } else {
          console.error('Failed to load council:', data.error)
          router.push('/councils' as any)
        }
      } catch (error) {
        console.error('Error fetching council:', error)
        router.push('/councils' as any)
      } finally {
        setLoading(false)
      }
    }

    if (councilId) {
      fetchCouncil()
    }
  }, [councilId, router])

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return

    socket.on('user_message', (data) => {
      const newMessage: Message = {
        id: data.messageId,
        councilId: councilId,
        role: 'USER',
        agentId: null,
        content: data.content,
        createdAt: data.createdAt,
        tokensUsed: null,
        cost: null,
      }
      setMessages((prev) => [...prev, newMessage])
    })

    socket.on('agent_typing', (data) => {
      setTypingAgent(data.agentNumber)
    })

    socket.on('agent_response', (data) => {
      const newMessage: Message = {
        id: data.messageId,
        councilId: councilId,
        role: 'AGENT',
        agentId: data.agentId,
        content: data.content,
        createdAt: new Date(),
        tokensUsed: data.tokensUsed,
        cost: data.cost,
      }
      setMessages((prev) => [...prev, newMessage])
      setTypingAgent(null)
    })

    socket.on('all_agents_responded', () => {
      setTypingAgent(null)
      setSending(false)
    })

    return () => {
      socket.off('user_message')
      socket.off('agent_typing')
      socket.off('agent_response')
      socket.off('all_agents_responded')
    }
  }, [socket, councilId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message
  async function handleSend() {
    if (!socket || !inputMessage.trim() || sending) return

    setSending(true)
    socket.emit('send_message', {
      councilId: councilId,
      content: inputMessage.trim(),
    })
    setInputMessage('')
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading council...</div>
  }

  if (!council) return null

  const agents = [
    { id: council.agent1Id, agent: getAgentById(council.agent1Id) },
    { id: council.agent2Id, agent: getAgentById(council.agent2Id) },
    { id: council.agent3Id, agent: getAgentById(council.agent3Id) },
    { id: council.agent4Id, agent: getAgentById(council.agent4Id) },
  ]

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              ☰
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                🏛️ {council.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{messages.length} messages</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/councils' as any)}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Agent Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } lg:block absolute lg:relative z-10 w-64 bg-white border-r border-gray-200 h-full overflow-y-auto`}
        >
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Your Team</h2>

            {/* User */}
            <div className="mb-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👨‍💻</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">You</p>
                  <p className="text-xs text-gray-600">Team Leader</p>
                </div>
              </div>
            </div>

            {/* Agents */}
            {agents.map(({ agent }, index) => (
              <div key={index} className="mb-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">{agent?.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{agent?.name}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{agent?.description}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Connection Status */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-600">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              if (msg.role === 'SYSTEM') {
                return (
                  <div key={msg.id} className="text-center">
                    <span className="inline-block px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm">
                      {msg.content}
                    </span>
                  </div>
                )
              }

              if (msg.role === 'USER') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-lg sm:max-w-xl lg:max-w-2xl">
                      <div className="bg-blue-600 text-white rounded-lg px-4 py-3 shadow">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">👨‍💻</span>
                          <span className="text-xs font-medium opacity-90">You</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )
              }

              if (msg.role === 'AGENT' && msg.agentId) {
                const agent = getAgentById(msg.agentId)
                return (
                  <div key={msg.id} className="flex justify-start">
                    <div className="max-w-lg sm:max-w-xl lg:max-w-2xl">
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{agent?.icon}</span>
                          <span className="text-xs font-semibold text-gray-900">{agent?.name}</span>
                        </div>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                        {msg.tokensUsed && (
                          <p className="text-xs text-gray-500 mt-2">
                            {msg.tokensUsed} tokens • ${msg.cost?.toFixed(4)}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )
              }

              return null
            })}

            {/* Typing Indicator */}
            {typingAgent !== null && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                    <span className="text-sm text-gray-600">Agent {typingAgent} is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4">
            {socketError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{socketError}</p>
              </div>
            )}

            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Type your message... (Shift+Enter for new line)"
                rows={3}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={sending || !isConnected}
              />
              <button
                onClick={handleSend}
                disabled={sending || !inputMessage.trim() || !isConnected}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-w-[80px]"
              >
                {sending ? '...' : 'Send'}
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>{inputMessage.length} / 2000</span>
              <span>{isConnected ? '🟢 Connected' : '🔴 Disconnected'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-0 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
