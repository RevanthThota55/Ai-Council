#!/usr/bin/env node

/**
 * Error Tracking System
 * Logs errors and their solutions to prevent repeating the same mistakes
 *
 * Why this matters:
 * - In previous projects, Revanth encountered the same errors repeatedly
 * - This system builds a database of errors and their solutions
 * - Before fixing an error, check if we've seen it before
 * - Learn from past mistakes instead of repeating them
 *
 * Commands:
 * - npm run error:log - Log a new error and its solution
 * - npm run error:search - Search for similar errors
 * - npm run error:solve - Show solution for an error
 */

const fs = require('fs')
const path = require('path')

const DATA_CENTER = path.join(__dirname, '..', '.data-center')
const ERRORS_FILE = path.join(DATA_CENTER, 'errors.json')

// Ensure .data-center directory exists
if (!fs.existsSync(DATA_CENTER)) {
  fs.mkdirSync(DATA_CENTER, { recursive: true })
}

/**
 * Load existing errors
 */
function loadErrors() {
  if (!fs.existsSync(ERRORS_FILE)) {
    return []
  }
  try {
    const data = fs.readFileSync(ERRORS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading errors database:', error.message)
    return []
  }
}

/**
 * Save errors to file
 */
function saveErrors(errors) {
  try {
    fs.writeFileSync(ERRORS_FILE, JSON.stringify(errors, null, 2))
  } catch (error) {
    console.error('Error saving errors database:', error.message)
  }
}

/**
 * Log a new error
 */
function logError() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  console.log('\n📝 Log New Error\n')

  const errorData = {}

  readline.question('Error message or description: ', (errorMessage) => {
    if (!errorMessage.trim()) {
      console.log('❌ Error logging cancelled: Message required')
      readline.close()
      return
    }
    errorData.message = errorMessage

    readline.question('Error type (e.g., TypeScript, ESLint, Runtime): ', (errorType) => {
      errorData.type = errorType || 'Unknown'

      readline.question('File or location (optional): ', (location) => {
        errorData.location = location || 'N/A'

        readline.question('What caused this error?: ', (cause) => {
          errorData.cause = cause || 'Unknown'

          readline.question('Solution that worked: ', (solution) => {
            if (!solution.trim()) {
              console.log('❌ Error logging cancelled: Solution required')
              readline.close()
              return
            }
            errorData.solution = solution

            // Save the error
            const errors = loadErrors()
            errors.push({
              id: `error-${Date.now()}`,
              timestamp: new Date().toISOString(),
              ...errorData,
              tags: extractTags(errorMessage + ' ' + errorType),
            })
            saveErrors(errors)

            console.log('\n✅ Error logged successfully!')
            console.log(`   Total errors in database: ${errors.length}`)
            console.log('   This solution is now saved for future reference.')
            readline.close()
          })
        })
      })
    })
  })
}

/**
 * Extract tags from error message for better searching
 */
function extractTags(text) {
  const tags = []
  const commonKeywords = [
    'typescript', 'eslint', 'import', 'export', 'module', 'type',
    'interface', 'class', 'function', 'error', 'warning', 'cannot',
    'undefined', 'null', 'any', 'promise', 'async', 'await'
  ]

  const lowerText = text.toLowerCase()
  commonKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      tags.push(keyword)
    }
  })

  return tags
}

/**
 * Search for similar errors
 */
function searchErrors() {
  const errors = loadErrors()

  if (errors.length === 0) {
    console.log('📝 No errors in database yet.')
    console.log('   Log one with: npm run error:log')
    return
  }

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  readline.question('\nSearch for error (enter keywords): ', (query) => {
    if (!query.trim()) {
      console.log('❌ Search cancelled.')
      readline.close()
      return
    }

    const queryLower = query.toLowerCase()
    const matches = errors.filter(error => {
      const searchText = `${error.message} ${error.type} ${error.cause} ${error.tags.join(' ')}`.toLowerCase()
      return searchText.includes(queryLower)
    })

    if (matches.length === 0) {
      console.log('\n❌ No matching errors found.')
      console.log('   Try different keywords or log this as a new error.')
    } else {
      console.log(`\n✅ Found ${matches.length} similar error(s):\n`)
      matches.forEach((error, index) => {
        const date = new Date(error.timestamp).toLocaleString()
        console.log(`${index + 1}. [${error.type}] ${error.message}`)
        console.log(`   Cause: ${error.cause}`)
        console.log(`   Solution: ${error.solution}`)
        console.log(`   Date: ${date}\n`)
      })
    }

    readline.close()
  })
}

/**
 * Show all errors and solutions
 */
function showAllErrors() {
  const errors = loadErrors()

  if (errors.length === 0) {
    console.log('📝 No errors in database yet.')
    return
  }

  console.log(`\n📋 Error Database (${errors.length} errors):\n`)
  errors.forEach((error, index) => {
    const date = new Date(error.timestamp).toLocaleString()
    console.log(`${index + 1}. [${error.type}] ${error.message}`)
    console.log(`   Location: ${error.location}`)
    console.log(`   Cause: ${error.cause}`)
    console.log(`   ✅ Solution: ${error.solution}`)
    console.log(`   Date: ${date}\n`)
  })
}

// Command routing
const command = process.argv[2]

switch (command) {
  case 'log':
    logError()
    break
  case 'search':
    searchErrors()
    break
  case 'solve':
    showAllErrors()
    break
  default:
    console.log('Error Tracking System')
    console.log('\nCommands:')
    console.log('  npm run error:log    - Log a new error and solution')
    console.log('  npm run error:search - Search for similar errors')
    console.log('  npm run error:solve  - Show all errors and solutions')
    break
}
