#!/usr/bin/env node

/**
 * Dependency Predictor
 * Scans imports and detects missing dependencies
 *
 * Why this matters:
 * - "Module not found" errors waste time and break builds
 * - This script scans all imports and checks if packages are installed
 * - Auto-detects missing dependencies before you run into errors
 *
 * Commands:
 * - npm run deps:check - Check for missing dependencies
 * - npm run deps:install - Auto-install missing dependencies
 * - npm run deps:clean - Remove unused dependencies
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const ROOT_DIR = path.join(__dirname, '..')

/**
 * Get all TypeScript/JavaScript files in a directory
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      // Skip node_modules, dist, .next, etc.
      if (!['node_modules', 'dist', '.next', '.turbo', 'build'].includes(file)) {
        getAllFiles(filePath, fileList)
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      fileList.push(filePath)
    }
  })

  return fileList
}

/**
 * Extract imports from a file
 */
function extractImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const imports = []

  // Match import statements
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g

  let match
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1])
  }
  while ((match = requireRegex.exec(content)) !== null) {
    imports.push(match[1])
  }

  return imports
}

/**
 * Get package name from import
 * e.g., '@ai-council/shared-types' -> '@ai-council/shared-types'
 * e.g., 'react/jsx-runtime' -> 'react'
 */
function getPackageName(importPath) {
  // Skip relative imports
  if (importPath.startsWith('.') || importPath.startsWith('/')) {
    return null
  }

  // Scoped packages
  if (importPath.startsWith('@')) {
    const parts = importPath.split('/')
    return `${parts[0]}/${parts[1]}`
  }

  // Regular packages
  return importPath.split('/')[0]
}

/**
 * Get installed packages from package.json
 */
function getInstalledPackages(packageJsonPath) {
  if (!fs.existsSync(packageJsonPath)) {
    return new Set()
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }

  return new Set(Object.keys(deps))
}

/**
 * Check for missing dependencies
 */
function checkDependencies() {
  console.log('🔍 Scanning for dependencies...\n')

  const workspaces = ['apps/web', 'apps/api', 'packages/shared-types', 'packages/ai-agents', 'packages/ui', 'packages/config']
  let totalMissing = 0

  workspaces.forEach(workspace => {
    const workspacePath = path.join(ROOT_DIR, workspace)
    if (!fs.existsSync(workspacePath)) {
      return
    }

    console.log(`📦 Checking ${workspace}...`)

    const packageJsonPath = path.join(workspacePath, 'package.json')
    const installed = getInstalledPackages(packageJsonPath)

    const files = getAllFiles(workspacePath)
    const usedPackages = new Set()

    files.forEach(file => {
      const imports = extractImports(file)
      imports.forEach(imp => {
        const pkgName = getPackageName(imp)
        if (pkgName) {
          usedPackages.add(pkgName)
        }
      })
    })

    const missing = Array.from(usedPackages).filter(pkg => !installed.has(pkg))

    if (missing.length > 0) {
      console.log(`   ❌ Missing dependencies:`)
      missing.forEach(pkg => console.log(`      - ${pkg}`))
      totalMissing += missing.length
    } else {
      console.log(`   ✅ All dependencies installed`)
    }
    console.log()
  })

  if (totalMissing > 0) {
    console.log(`\n⚠️  Total missing dependencies: ${totalMissing}`)
    console.log('   Run: npm run deps:install to install them\n')
  } else {
    console.log('✅ All dependencies are installed!\n')
  }
}

/**
 * Install missing dependencies (placeholder for now)
 */
function installDependencies() {
  console.log('🔧 Auto-install feature coming soon!')
  console.log('   For now, manually install missing packages using:')
  console.log('   npm install <package-name>\n')
}

/**
 * Clean unused dependencies (placeholder for now)
 */
function cleanDependencies() {
  console.log('🧹 Auto-clean feature coming soon!')
  console.log('   This will remove dependencies not found in any imports.\n')
}

// Command routing
const command = process.argv[2]

switch (command) {
  case 'check':
    checkDependencies()
    break
  case 'install':
    installDependencies()
    break
  case 'clean':
    cleanDependencies()
    break
  default:
    console.log('Dependency Predictor')
    console.log('\nCommands:')
    console.log('  npm run deps:check   - Check for missing dependencies')
    console.log('  npm run deps:install - Auto-install missing dependencies')
    console.log('  npm run deps:clean   - Remove unused dependencies')
    break
}
