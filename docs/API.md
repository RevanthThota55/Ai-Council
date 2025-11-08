# API Documentation

**AI Council Portal API**
**Base URL:** `http://localhost:3001`
**Version:** v1

---

## 📋 Table of Contents

1. [Health Check](#health-check)
2. [Authentication](#authentication) (Phase 1)
3. [Council Sessions](#council-sessions) (Phase 3)
4. [AI Agents](#ai-agents) (Phase 2)
5. [Memory](#memory) (Phase 4)
6. [Outputs](#outputs) (Phase 5)

---

## Health Check

### GET /health

Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-08T10:00:00.000Z",
  "service": "ai-council-api",
  "version": "0.1.0"
}
```

---

## Authentication

> **Phase 1:** Coming in Days 4-6

### POST /api/auth/signup

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token"
    }
  }
}
```

### POST /api/auth/login

Login existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token"
    }
  }
}
```

### GET /api/auth/me

Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-01-08T10:00:00.000Z"
  }
}
```

---

## AI Agents

> **Phase 2:** Coming in Days 7-10

### GET /api/agents

List all available AI agents.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "agent-coder",
      "role": "coder",
      "name": "CodeMaster",
      "description": "Expert in writing clean, efficient code",
      "model": "gpt-4",
      "temperature": 0.3
    },
    // ... more agents
  ]
}
```

### POST /api/agents/test

Test an AI agent with a prompt (for development).

**Request Body:**
```json
{
  "agentId": "agent-coder",
  "prompt": "Write a function to check if a number is prime"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "agentId": "agent-coder",
    "response": "Here's a function to check if a number is prime..."
  }
}
```

---

## Council Sessions

> **Phase 3:** Coming in Days 11-14

### POST /api/sessions

Create a new council session.

**Request Body:**
```json
{
  "agentIds": [
    "agent-coder",
    "agent-designer",
    "agent-analyst",
    "agent-researcher",
    "agent-writer"
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "userId": "user-uuid",
    "agents": [...],
    "createdAt": "2025-01-08T10:00:00.000Z"
  }
}
```

### GET /api/sessions/:sessionId

Get session details and message history.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "agents": [...],
    "messages": [
      {
        "id": "msg-uuid",
        "role": "user",
        "content": "Help me build a website",
        "timestamp": "2025-01-08T10:00:00.000Z"
      },
      {
        "id": "msg-uuid",
        "role": "agent",
        "agentId": "agent-coder",
        "content": "I can help with the technical implementation...",
        "timestamp": "2025-01-08T10:00:05.000Z"
      }
    ]
  }
}
```

### WebSocket: /socket

Real-time communication for council sessions.

**Events:**

**Client → Server:**
- `join_session` - Join a session
- `send_message` - Send message to council
- `leave_session` - Leave session

**Server → Client:**
- `agent_response` - Agent responded
- `agent_typing` - Agent is typing
- `session_update` - Session state changed

---

## Memory

> **Phase 4:** Coming in Days 15-17

### POST /api/memory

Store a memory with vector embedding.

### GET /api/memory/search

Search memories by similarity.

---

## Outputs

> **Phase 5:** Coming in Days 18-20

### POST /api/outputs

Generate and save output (document, code, image).

### GET /api/outputs/:outputId

Retrieve generated output.

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting

- **Phase 6:** Rate limiting will be implemented
- Limit: 100 requests per minute per user
- Headers will include rate limit information

---

## Authentication

Most endpoints require JWT authentication:

```
Authorization: Bearer <access-token>
```

Tokens expire after 7 days. Use refresh tokens to get new access tokens.

---

_This documentation will be updated as each phase is completed._
_Last updated: Phase 0 (2025-01-08)_
