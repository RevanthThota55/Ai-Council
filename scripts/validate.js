#!/usr/bin/env node

/**
 * Build Validator
 * Runs all validation checks before marking work as "Done"
 *
 * Why this matters:
 * - Ensures 0 TypeScript errors before committing
 * - Catches ESLint issues early
 * - Verifies builds succeed
 * - Enforces quality standards
 *
 * This is the gatekeeper that prevents broken code from being committed.
 *
 * Commands:
 * - npm run validate:all - Run all validations
 * - npm run validate:api - Validate API only
 * - npm run validate:web - Validate web only
 */

const { execSync } = require('child_process')
const path = require('path')

const ROOT_DIR = path.join(__dirname, '..')

/**
 * Run a command and capture result
 */
function runCommand(command, cwd = ROOT_DIR) {
  try {
    execSync(command, { cwd, stdio: 'inherit' })
    return true
  } catch (error) {
    return false
  }
}

/**
 * Validate TypeScript types
 */
function validateTypes(workspace = null) {
  console.log('\n🔍 TypeScript Type Check...\n')

  if (workspace) {
    const workspacePath = path.join(ROOT_DIR, workspace)
    const success = runCommand('npx tsc --noEmit', workspacePath)
    return success
  } else {
    // Check all workspaces
    let allSuccess = true
    allSuccess = runCommand('npx tsc --noEmit', path.join(ROOT_DIR, 'apps/web')) && allSuccess
    allSuccess = runCommand('npx tsc --noEmit', path.join(ROOT_DIR, 'apps/api')) && allSuccess
    return allSuccess
  }
}

/**
 * Validate ESLint
 */
function validateLint(workspace = null) {
  console.log('\n🔍 ESLint Check...\n')

  if (workspace) {
    const workspacePath = path.join(ROOT_DIR, workspace)
    const success = runCommand('npm run lint', workspacePath)
    return success
  } else {
    // Turbo run lint
    const success = runCommand('npx turbo run lint')
    return success
  }
}

/**
 * Validate Builds
 */
function validateBuilds(workspace = null) {
  console.log('\n🔍 Build Check...\n')

  if (workspace) {
    const workspacePath = path.join(ROOT_DIR, workspace)
    const success = runCommand('npm run build', workspacePath)
    return success
  } else {
    // Turbo run build
    const success = runCommand('npx turbo run build')
    return success
  }
}

/**
 * Run all validations
 */
function validateAll() {
  console.log('🚀 Running Full Validation Suite\n')
  console.log('=' .repeat(60))

  const results = {
    types: false,
    lint: false,
    build: false,
  }

  // 1. Type Check
  results.types = validateTypes()

  // 2. Lint Check
  results.lint = validateLint()

  // 3. Build Check
  results.build = validateBuilds()

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Validation Summary:\n')
  console.log(`   TypeScript: ${results.types ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   ESLint:     ${results.lint ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   Build:      ${results.build ? '✅ PASS' : '❌ FAIL'}`)

  const allPassed = results.types && results.lint && results.build

  if (allPassed) {
    console.log('\n✅ ALL VALIDATIONS PASSED!')
    console.log('   Your code is ready to commit.\n')
    process.exit(0)
  } else {
    console.log('\n❌ VALIDATION FAILED!')
    console.log('   Fix the errors above before committing.\n')
    process.exit(1)
  }
}

/**
 * Validate API workspace
 */
function validateAPI() {
  console.log('🚀 Validating API Workspace\n')
  console.log('='.repeat(60))

  const results = {
    types: validateTypes('apps/api'),
    lint: validateLint('apps/api'),
    build: validateBuilds('apps/api'),
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n📊 API Validation Summary:\n')
  console.log(`   TypeScript: ${results.types ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   ESLint:     ${results.lint ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   Build:      ${results.build ? '✅ PASS' : '❌ FAIL'}`)

  const allPassed = results.types && results.lint && results.build

  if (allPassed) {
    console.log('\n✅ API VALIDATION PASSED!\n')
    process.exit(0)
  } else {
    console.log('\n❌ API VALIDATION FAILED!\n')
    process.exit(1)
  }
}

/**
 * Validate Web workspace
 */
function validateWeb() {
  console.log('🚀 Validating Web Workspace\n')
  console.log('='.repeat(60))

  const results = {
    types: validateTypes('apps/web'),
    lint: validateLint('apps/web'),
    build: validateBuilds('apps/web'),
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Web Validation Summary:\n')
  console.log(`   TypeScript: ${results.types ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   ESLint:     ${results.lint ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   Build:      ${results.build ? '✅ PASS' : '❌ FAIL'}`)

  const allPassed = results.types && results.lint && results.build

  if (allPassed) {
    console.log('\n✅ WEB VALIDATION PASSED!\n')
    process.exit(0)
  } else {
    console.log('\n❌ WEB VALIDATION FAILED!\n')
    process.exit(1)
  }
}

// Command routing
const command = process.argv[2]

switch (command) {
  case 'all':
    validateAll()
    break
  case 'api':
    validateAPI()
    break
  case 'web':
    validateWeb()
    break
  default:
    console.log('Build Validator')
    console.log('\nCommands:')
    console.log('  npm run validate:all - Run all validations')
    console.log('  npm run validate:api - Validate API workspace')
    console.log('  npm run validate:web - Validate web workspace')
    console.log('\nValidation Checks:')
    console.log('  ✓ TypeScript: 0 errors')
    console.log('  ✓ ESLint: 0 warnings')
    console.log('  ✓ Build: successful')
    break
}
