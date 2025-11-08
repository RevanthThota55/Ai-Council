#!/usr/bin/env node

/**
 * Progress Tracker
 * Tracks development progress across all phases
 *
 * Why this matters:
 * - Provides visibility into what's done and what's left
 * - Helps estimate remaining time
 * - Shows overall project health
 * - Keeps Revanth informed of progress
 *
 * Commands:
 * - npm run progress:update - Update progress manually
 * - npm run progress:report - Show current progress
 * - npm run progress:timeline - Show timeline estimate
 */

const fs = require('fs')
const path = require('path')

const PROGRESS_FILE = path.join(__dirname, '..', 'docs', 'PROGRESS.md')

/**
 * Show current progress
 */
function showProgress() {
  if (!fs.existsSync(PROGRESS_FILE)) {
    console.log('❌ PROGRESS.md not found.')
    return
  }

  const content = fs.readFileSync(PROGRESS_FILE, 'utf8')

  // Extract phase completion percentages
  const phaseRegex = /## Phase (\d+):.*?\((\d+)%\)/g
  const phases = []
  let match

  while ((match = phaseRegex.exec(content)) !== null) {
    phases.push({
      number: parseInt(match[1]),
      completion: parseInt(match[2]),
    })
  }

  console.log('\n📊 AI Council Development Progress\n')
  console.log('='.repeat(60))

  phases.forEach(phase => {
    const barLength = 30
    const filled = Math.floor((phase.completion / 100) * barLength)
    const empty = barLength - filled
    const bar = '█'.repeat(filled) + '░'.repeat(empty)

    console.log(`\nPhase ${phase.number}: ${bar} ${phase.completion}%`)
  })

  const overall = Math.floor(phases.reduce((sum, p) => sum + p.completion, 0) / phases.length)
  const overallFilled = Math.floor((overall / 100) * 30)
  const overallEmpty = 30 - overallFilled
  const overallBar = '█'.repeat(overallFilled) + '░'.repeat(overallEmpty)

  console.log('\n' + '='.repeat(60))
  console.log(`\nOverall:  ${overallBar} ${overall}%\n`)
}

/**
 * Show timeline estimate
 */
function showTimeline() {
  console.log('\n📅 AI Council Timeline (25-Day MVP)\n')
  console.log('Phase 0: Foundation (Days 1-3) ✅ In Progress')
  console.log('Phase 1: Authentication (Days 4-6)')
  console.log('Phase 2: AI Agent System (Days 7-10)')
  console.log('Phase 3: Council Session UI (Days 11-14)')
  console.log('Phase 4: Shared Memory (Days 15-17)')
  console.log('Phase 5: Output Generation (Days 18-20)')
  console.log('Phase 6: Polish & Testing (Days 21-25)')
  console.log()
}

/**
 * Update progress (placeholder for manual updates)
 */
function updateProgress() {
  console.log('📝 Progress Update')
  console.log('\nTo update progress, edit: docs/PROGRESS.md')
  console.log('Update the percentage in phase headers: ## Phase X: Name (XX%)\n')
}

// Command routing
const command = process.argv[2]

switch (command) {
  case 'update':
    updateProgress()
    break
  case 'report':
    showProgress()
    break
  case 'timeline':
    showTimeline()
    break
  default:
    console.log('Progress Tracker')
    console.log('\nCommands:')
    console.log('  npm run progress:update   - Update progress manually')
    console.log('  npm run progress:report   - Show current progress')
    console.log('  npm run progress:timeline - Show timeline estimate')
    break
}
