'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useRequireAuth } from '@/lib/hooks/useAuth'
import { useSocket } from '@/lib/hooks/useSocket'
import { CouncilWithMessages, Message } from '@ai-council/shared-types'
import { getAgentById } from '@ai-council/ai-agents'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { ArrowLeft, Send, Menu, X, Building2 } from 'lucide-react'

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
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
          router.push('/councils')
        }
      } catch (error) {
        console.error('Error fetching council:', error)
        router.push('/councils')
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
  }, [messages, typingAgent])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [inputMessage])

  // Send message
  async function handleSend() {
    if (!socket || !inputMessage.trim() || sending || !isConnected) return

    setSending(true)
    socket.emit('send_message', {
      councilId: councilId,
      content: inputMessage.trim(),
    })
    setInputMessage('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-indigo border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-indigo border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading council...</p>
        </div>
      </div>
    )
  }

  if (!council) return null

  const agents = [
    { id: council.agent1Id, agent: getAgentById(council.agent1Id) },
    { id: council.agent2Id, agent: getAgentById(council.agent2Id) },
    { id: council.agent3Id, agent: getAgentById(council.agent3Id) },
    { id: council.agent4Id, agent: getAgentById(council.agent4Id) },
  ].filter(item => item.agent)

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => router.push('/councils')}
              className="hidden sm:flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-indigo" />
                {council.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {agents.length} agents • {isConnected ? (
                  <span className="text-green-600">Connected</span>
                ) : (
                  <span className="text-red-600">Disconnected</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {(isDesktop || sidebarOpen) && (
          <div
            className={`${
              sidebarOpen && !isDesktop ? 'fixed' : ''
            } ${isDesktop ? 'block' : sidebarOpen ? 'block' : 'hidden'} lg:relative z-20 w-72 bg-white border-r border-gray-200 h-full overflow-y-auto flex flex-col`}
          >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Your Team
                  </h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-1 rounded-md hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* You Card */}
              <div className="p-4 border-b border-gray-200">
                <Card className="p-4 bg-gradient-to-br from-brand-indigo/10 to-brand-purple/10 border-2 border-brand-indigo/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">You</p>
                      <p className="text-xs text-gray-600">Team Leader</p>
                    </div>
                    <div className="ml-auto w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </Card>
              </div>

              {/* Agents List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {agents.map(({ agent }, index) => (
                  <Card
                    key={agent?.id || index}
                    className={`p-4 border transition-all ${
                      typingAgent === index + 1
                        ? 'border-brand-indigo bg-brand-indigo/5 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{agent?.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{agent?.name}</p>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                          {agent?.description}
                        </p>
                        {typingAgent === index + 1 && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-brand-indigo">
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo animate-bounce"></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span>Thinking...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-gray-200 flex-shrink-0">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Status</span>
                    <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                      {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Messages</span>
                    <span className="font-medium">{messages.length}</span>
                  </div>
                </div>
              </div>
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center max-w-md"
                >
                  <div className="text-6xl mb-4">👋</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome to your council!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your {agents.length} AI experts are ready to help. Ask them anything!
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "Hello team! Where should I start?",
                      "What's the best approach?",
                      "Can you help me understand this?",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInputMessage(suggestion)}
                        className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-full hover:border-brand-indigo hover:text-brand-indigo transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  if (msg.role === 'USER') {
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-end"
                      >
                        <div className="max-w-2xl">
                          <div className="gradient-brand text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg">
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-right">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    )
                  }

                  if (msg.role === 'AGENT' && msg.agentId) {
                    const agent = getAgentById(msg.agentId)
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center text-xl">
                            {agent?.icon || '🤖'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 max-w-2xl">
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            {agent?.name}
                          </p>
                          <Card className="p-4 bg-white border border-gray-200 shadow-sm">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                          </Card>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {msg.tokensUsed && (
                              <span>
                                {msg.tokensUsed} tokens • ${msg.cost?.toFixed(4)}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  }

                  return null
                })}

                {/* Typing Indicator */}
                {typingAgent !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center text-xl">
                        {agents[typingAgent - 1]?.agent?.icon || '🤖'}
                      </div>
                    </div>
                    <div className="flex-1">
                      <Card className="p-4 bg-white border border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {agents[typingAgent - 1]?.agent?.name || `Agent ${typingAgent}`} is thinking...
                          </span>
                        </div>
                      </Card>
                    </div>
                  </motion.div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
            {socketError && (
              <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">{socketError}</p>
              </div>
            )}

            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  rows={1}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:border-brand-indigo resize-none text-sm"
                  disabled={sending || !isConnected}
                  maxLength={2000}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {inputMessage.length} / 2000
                </div>
              </div>
              <Button
                onClick={handleSend}
                disabled={sending || !inputMessage.trim() || !isConnected}
                className="gradient-brand text-white h-12 px-6 shadow-button hover:opacity-90 disabled:opacity-50"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>
                {isConnected ? (
                  <span className="text-green-600">🟢 Connected</span>
                ) : (
                  <span className="text-red-600">🔴 Disconnected</span>
                )}
              </span>
              <span>Press Enter to send, Shift+Enter for new line</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
