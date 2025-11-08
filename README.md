# 🤖 AI Council Portal

> Multi-agent AI collaboration platform enabling users to interact with a personalized panel of 5 AI agents with collaborative communication, shared memory, and multimodal output generation.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Phase](https://img.shields.io/badge/phase-0%20foundation-blue)
![Progress](https://img.shields.io/badge/progress-90%25-green)

---

## 🎯 Project Overview

**AI Council Portal** is a web-based platform where users can:
- Create custom AI councils with 5 specialized agents (coder, designer, analyst, researcher, writer)
- Collaborate with multiple AI agents in real-time chat sessions
- Benefit from shared memory across agents (remembers context)
- Export multimodal outputs (documents, code, images)

**Developer:** Revanth (BTech Final Year, Hyderabad)
**Timeline:** 25-day MVP
**Tech Stack:** Next.js 14, Express, PostgreSQL, Socket.io, OpenAI, Anthropic

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.17.0
- npm >= 9.0.0
- PostgreSQL (local or cloud)
- Git

### Installation

```bash
# Clone repository (if shared)
git clone <repository-url>
cd Ai-Council

# Install all dependencies
npm install

# Set up database
cd apps/api
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npx prisma migrate dev --name init

# Start development servers
cd ../..
npm run dev
```

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Health:** http://localhost:3001/health

---

## 📁 Project Structure

```
E:\Ai-Council\
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── app/               # App router pages
│   │   ├── components/        # React components
│   │   ├── lib/              # Utilities
│   │   └── stores/           # Zustand state
│   │
│   └── api/                   # Express backend
│       ├── src/
│       │   ├── routes/       # API endpoints
│       │   ├── controllers/  # Business logic
│       │   ├── services/     # AI integrations
│       │   └── socket/       # Real-time handlers
│       └── prisma/           # Database schema
│
├── packages/
│   ├── shared-types/         # TypeScript types
│   ├── ai-agents/            # Agent definitions
│   ├── ui/                   # Shared UI components
│   └── config/               # Shared configuration
│
├── .data-center/             # Bulletproof systems data
│   ├── errors.json           # Error tracking
│   ├── patterns.json         # Working patterns
│   ├── decisions.md          # Architecture decisions
│   └── checkpoints.json      # Saved states
│
├── docs/
│   ├── PROGRESS.md           # Development progress
│   ├── API.md                # API documentation
│   └── AGENTS.md             # Agent definitions
│
└── scripts/                  # Helper scripts
    ├── checkpoint.js         # Auto-checkpoint system
    ├── error-tracker.js      # Error tracking
    ├── validate.js           # Build validator
    └── progress-tracker.js   # Progress tracker
```

---

## 🛠️ Available Commands

### Development

```bash
npm run dev              # Start all apps in dev mode
npm run build            # Build all packages
npm run lint             # Lint all packages
npm run type-check       # TypeScript validation
```

### Bulletproof Systems

```bash
# Checkpoint System
npm run checkpoint:save     # Save current state
npm run checkpoint:list     # Show all checkpoints
npm run checkpoint:restore  # Restore to previous state

# Error Tracking
npm run error:log          # Log new error + solution
npm run error:search       # Search for similar errors
npm run error:solve        # Show all solutions

# Validation
npm run validate:all       # Run all validations
npm run validate:api       # Validate API only
npm run validate:web       # Validate web only

# Dependencies
npm run deps:check         # Check missing dependencies
npm run deps:install       # Auto-install missing deps
npm run deps:clean         # Remove unused deps

# Progress Tracking
npm run progress:report    # Show current progress
npm run progress:timeline  # Show timeline estimate
```

---

## 🏗️ Development Phases

| Phase | Description | Timeline | Status |
|-------|-------------|----------|--------|
| **Phase 0** | Foundation Systems | Days 1-3 | 🔄 90% |
| **Phase 1** | Authentication & User Management | Days 4-6 | 📋 Pending |
| **Phase 2** | AI Agent System | Days 7-10 | 📋 Pending |
| **Phase 3** | Council Session UI | Days 11-14 | 📋 Pending |
| **Phase 4** | Shared Memory System | Days 15-17 | 📋 Pending |
| **Phase 5** | Output Generation | Days 18-20 | 📋 Pending |
| **Phase 6** | Polish & Testing | Days 21-25 | 📋 Pending |

---

## 🤖 AI Agents

The platform includes 5 predefined AI agents:

1. **CodeMaster** (Coder) - Expert software engineer
2. **DesignPro** (Designer) - UI/UX specialist
3. **DataSage** (Analyst) - Strategic analyst
4. **InfoSeeker** (Researcher) - Research specialist
5. **WordSmith** (Writer) - Content creation expert

See [AGENTS.md](docs/AGENTS.md) for detailed descriptions.

---

## 🎯 Bulletproof Systems

This project uses 6 systems to prevent errors and ensure quality:

1. **Auto-Checkpoint** - Save/restore project states
2. **Error Tracking** - Log errors and solutions
3. **Type Safety** - Strict TypeScript with 0 'any' types
4. **Dependency Predictor** - Auto-detect missing packages
5. **Build Validator** - Enforce 0 errors before commit
6. **Progress Tracker** - Monitor development progress

These systems prevent the 910+ TypeScript errors experienced in previous projects.

---

## 📚 Documentation

- [API Documentation](docs/API.md) - API endpoints reference
- [Agent Definitions](docs/AGENTS.md) - AI agent specifications
- [Development Progress](docs/PROGRESS.md) - Current status & timeline
- [Architecture Decisions](.data-center/decisions.md) - Key decisions

---

## 🔒 Environment Variables

### API (.env)

```env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/ai_council"
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

See `.env.example` files for full configuration.

---

## 🧪 Testing

```bash
# Unit tests (Phase 6)
npm run test

# E2E tests (Phase 6)
npm run test:e2e

# Coverage (Phase 6)
npm run test:coverage
```

---

## 🚢 Deployment

**Frontend:** Vercel
**Backend:** Railway or Render
**Database:** Supabase or Railway PostgreSQL

Detailed deployment guide coming in Phase 6.

---

## 📈 Progress

Track development progress: `npm run progress:report`

Current: **Phase 0 - 90% Complete**

---

## 🤝 Contributing

This is a learning project by Revanth. Feedback and suggestions welcome!

---

## 📄 License

Private project - All rights reserved

---

## 🙏 Acknowledgments

- Inspired by the learnings from Rydon V4 project
- Built with guidance from Claude Code (Autonomous Project Leader)
- Following proven Multi-Agent System architecture

---

**Built with ❤️ by Revanth | Powered by Claude Code**
