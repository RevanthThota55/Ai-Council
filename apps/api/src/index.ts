import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const httpServer = createServer(app)

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ai-council-api',
    version: '0.1.0',
  })
})

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'AI Council API',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      // More endpoints will be added in future phases
    },
  })
})

// Socket.IO connection handling (skeleton for Phase 3)
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Server configuration
const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '0.0.0.0'

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 AI Council API running on http://${HOST}:${PORT}`)
  console.log(`📡 Socket.IO ready for connections`)
  console.log(`🏥 Health check: http://${HOST}:${PORT}/health`)
})

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

export { app, io }
