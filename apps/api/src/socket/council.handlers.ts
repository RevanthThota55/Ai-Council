/**
 * Socket.IO Council Handlers
 * Real-time chat for council sessions
 * Phase 3: WebSocket communication
 */

import { Server, Socket } from 'socket.io'
import { verifyToken } from '../utils/jwt'
import { generateSequentialAgentResponses, saveUserMessage } from '../services/council-chat.service'
import { getCouncilById } from '../services/council.service'

/**
 * Socket data with user info
 */
interface SocketData {
  userId: string
  email: string
}

/**
 * Setup Socket.IO event handlers for councils
 */
export function setupCouncilHandlers(io: Server) {
  // Authenticate socket connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error('Authentication token required'))
      }

      // Verify JWT
      const payload = verifyToken(token)

      // Attach user data to socket
      socket.data = {
        userId: payload.userId,
        email: payload.email,
      } as SocketData

      next()
    } catch (error) {
      next(new Error('Invalid or expired token'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const user = socket.data as SocketData
    console.log(`✅ User connected: ${user.email} (${socket.id})`)

    // Join council room
    socket.on('join_council', async (data: { councilId: string }) => {
      try {
        const { councilId } = data

        // Verify user has access to this council
        const council = await getCouncilById(councilId, user.userId)

        // Join Socket.IO room for this council
        socket.join(`council-${councilId}`)

        socket.emit('joined_council', {
          success: true,
          councilId: councilId,
          councilName: council.name,
        })

        console.log(`📥 User ${user.email} joined council: ${council.name}`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to join council'
        socket.emit('error', { message: errorMessage })
        console.error('Join council error:', error)
      }
    })

    // User sends a message
    socket.on('send_message', async (data: { councilId: string; content: string }) => {
      try {
        const { councilId, content } = data

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content cannot be empty' })
          return
        }

        if (content.length > 2000) {
          socket.emit('error', { message: 'Message too long (max 2000 characters)' })
          return
        }

        // Verify user has access
        await getCouncilById(councilId, user.userId)

        // Save user message
        const userMessage = await saveUserMessage(councilId, content.trim())

        // Broadcast user message to council room
        io.to(`council-${councilId}`).emit('user_message', {
          messageId: userMessage.id,
          content: userMessage.content,
          createdAt: userMessage.createdAt,
        })

        console.log(`💬 Message from ${user.email} in council ${councilId}`)

        // Emit initial typing indicator
        io.to(`council-${councilId}`).emit('agent_typing', {
          agentNumber: 1,
          totalAgents: 4,
        })

        // Generate sequential agent responses
        const agentResponses = await generateSequentialAgentResponses(councilId, content.trim())

        // Emit each response
        for (const response of agentResponses) {
          io.to(`council-${councilId}`).emit('agent_response', {
            agentId: response.agentId,
            agentName: response.agentName,
            content: response.content,
            messageId: response.messageId,
            tokensUsed: response.tokensUsed,
            cost: response.cost,
          })

          // Small delay between responses for better UX
          await new Promise(resolve => setTimeout(resolve, 500))
        }

        // All agents responded
        io.to(`council-${councilId}`).emit('all_agents_responded', {
          totalResponses: agentResponses.length,
        })

        console.log(`✅ All ${agentResponses.length} agents responded in council ${councilId}`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to process message'
        socket.emit('error', { message: errorMessage })
        console.error('Send message error:', error)
      }
    })

    // Leave council room
    socket.on('leave_council', (data: { councilId: string }) => {
      const { councilId } = data
      socket.leave(`council-${councilId}`)
      console.log(`📤 User ${user.email} left council ${councilId}`)
    })

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${user.email} (${socket.id})`)
    })
  })
}
