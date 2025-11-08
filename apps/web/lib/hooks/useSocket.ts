/**
 * useSocket Hook
 * Custom hook for Socket.IO connection
 * Phase 3: Real-time council chat
 */

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@ai-council/shared-types'

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

export function useSocket(councilId?: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<TypedSocket | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')

    if (!token) {
      setError('No authentication token found')
      return
    }

    // Create Socket.IO connection
    const socket: TypedSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      auth: { token },
      autoConnect: true,
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id)
      setIsConnected(true)
      setError(null)

      // Auto-join council room if councilId provided
      if (councilId) {
        socket.emit('join_council', { councilId })
      }
    })

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected')
      setIsConnected(false)
    })

    socket.on('error', (data) => {
      console.error('Socket error:', data.message)
      setError(data.message)
    })

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message)
      setError(err.message)
      setIsConnected(false)
    })

    // Cleanup on unmount
    return () => {
      if (councilId) {
        socket.emit('leave_council', { councilId })
      }
      socket.disconnect()
    }
  }, [councilId])

  return {
    socket: socketRef.current,
    isConnected,
    error,
  }
}
