#!/usr/bin/env node

/**
 * Auto-Checkpoint System
 * Creates save points for the project to enable rollback if things break
 *
 * Why this matters:
 * - In Rydon V4, Revanth had 910+ TypeScript errors with no way back
 * - This system creates "save points" like in a video game
 * - If something breaks, you can restore to the last working state
 *
 * Commands:
 * - npm run checkpoint:save - Save current state
 * - npm run checkpoint:list - Show all checkpoints
 * - npm run checkpoint:restore - Restore to a previous checkpoint
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const DATA_CENTER = path.join(__dirname, '..', '.data-center')
const CHECKPOINTS_FILE = path.join(DATA_CENTER, 'checkpoints.json')

// Ensure .data-center directory exists
if (!fs.existsSync(DATA_CENTER)) {
  fs.mkdirSync(DATA_CENTER, { recursive: true })
}

/**
 * Load existing checkpoints
 */
function loadCheckpoints() {
  if (!fs.existsSync(CHECKPOINTS_FILE)) {
    return []
  }
  try {
    const data = fs.readFileSync(CHECKPOINTS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading checkpoints:', error.message)
    return []
  }
}

/**
 * Save checkpoints to file
 */
function saveCheckpoints(checkpoints) {
  try {
    fs.writeFileSync(CHECKPOINTS_FILE, JSON.stringify(checkpoints, null, 2))
  } catch (error) {
    console.error('Error saving checkpoints:', error.message)
  }
}

/**
 * Create a new checkpoint
 */
function createCheckpoint() {
  try {
    // Check if there are uncommitted changes
    try {
      execSync('git diff-index --quiet HEAD --', { stdio: 'pipe' })
      console.log('⚠️  No changes to checkpoint. Working directory is clean.')
      return
    } catch {
      // There are changes, proceed with checkpoint
    }

    // Prompt for description
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    readline.question('Checkpoint description: ', (description) => {
      if (!description.trim()) {
        console.log('❌ Checkpoint cancelled: Description required')
        readline.close()
        return
      }

      const timestamp = new Date().toISOString()
      const checkpointId = `checkpoint-${Date.now()}`

      // Create git commit
      try {
        execSync('git add .', { stdio: 'inherit' })
        execSync(`git commit -m "checkpoint: ${description}"`, { stdio: 'inherit' })

        const gitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()

        // Save checkpoint metadata
        const checkpoints = loadCheckpoints()
        checkpoints.push({
          id: checkpointId,
          description,
          timestamp,
          gitHash,
        })
        saveCheckpoints(checkpoints)

        console.log(`\n✅ Checkpoint created successfully!`)
        console.log(`   ID: ${checkpointId}`)
        console.log(`   Git: ${gitHash.substring(0, 7)}`)
        console.log(`   Time: ${timestamp}`)
      } catch (error) {
        console.error('❌ Failed to create checkpoint:', error.message)
      }

      readline.close()
    })
  } catch (error) {
    console.error('Error creating checkpoint:', error.message)
  }
}

/**
 * List all checkpoints
 */
function listCheckpoints() {
  const checkpoints = loadCheckpoints()

  if (checkpoints.length === 0) {
    console.log('📝 No checkpoints found.')
    console.log('   Create one with: npm run checkpoint:save')
    return
  }

  console.log('\n📋 Available Checkpoints:\n')
  checkpoints.forEach((cp, index) => {
    const date = new Date(cp.timestamp).toLocaleString()
    console.log(`${index + 1}. [${cp.gitHash.substring(0, 7)}] ${cp.description}`)
    console.log(`   Created: ${date}`)
    console.log(`   ID: ${cp.id}\n`)
  })
}

/**
 * Restore to a checkpoint
 */
function restoreCheckpoint() {
  const checkpoints = loadCheckpoints()

  if (checkpoints.length === 0) {
    console.log('❌ No checkpoints available to restore.')
    return
  }

  // Show available checkpoints
  console.log('\n📋 Available Checkpoints:\n')
  checkpoints.forEach((cp, index) => {
    const date = new Date(cp.timestamp).toLocaleString()
    console.log(`${index + 1}. ${cp.description} (${date})`)
  })

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  readline.question('\nEnter checkpoint number to restore (or 0 to cancel): ', (answer) => {
    const index = parseInt(answer) - 1

    if (index < 0 || index >= checkpoints.length) {
      console.log('❌ Restore cancelled.')
      readline.close()
      return
    }

    const checkpoint = checkpoints[index]

    readline.question(`\n⚠️  This will reset to: "${checkpoint.description}"\nAre you sure? (yes/no): `, (confirm) => {
      if (confirm.toLowerCase() !== 'yes') {
        console.log('❌ Restore cancelled.')
        readline.close()
        return
      }

      try {
        // Reset to checkpoint
        execSync(`git reset --hard ${checkpoint.gitHash}`, { stdio: 'inherit' })
        console.log(`\n✅ Successfully restored to checkpoint: ${checkpoint.description}`)
        console.log(`   You are now at: ${checkpoint.gitHash.substring(0, 7)}`)
      } catch (error) {
        console.error('❌ Failed to restore checkpoint:', error.message)
      }

      readline.close()
    })
  })
}

// Command routing
const command = process.argv[2]

switch (command) {
  case 'save':
    createCheckpoint()
    break
  case 'list':
    listCheckpoints()
    break
  case 'restore':
    restoreCheckpoint()
    break
  default:
    console.log('Auto-Checkpoint System')
    console.log('\nCommands:')
    console.log('  npm run checkpoint:save    - Create a new checkpoint')
    console.log('  npm run checkpoint:list    - List all checkpoints')
    console.log('  npm run checkpoint:restore - Restore to a previous checkpoint')
    break
}
