/**
 * Usage Tracking Utility
 * Tracks AI API usage, token consumption, and costs
 * Phase 2: In-memory tracking
 * Phase 6: Will be stored in database for billing
 */

import { SubscriptionTier } from '@ai-council/shared-types'

/**
 * Usage record for a single API call
 */
export interface UsageRecord {
  userId: string
  model: string
  tokensUsed: number
  estimatedCost: number
  timestamp: Date
  endpointType: 'chat' | 'recommendation' | 'test'
}

/**
 * User usage statistics
 */
export interface UserUsageStats {
  totalRequests: number
  totalTokens: number
  totalCost: number
  requestsThisHour: number
  lastRequest: Date | null
}

/**
 * In-memory usage storage
 * In Phase 6, this will be replaced with database storage
 */
const usageData: Map<string, UsageRecord[]> = new Map()
const hourlyRequestCounts: Map<string, number> = new Map()

/**
 * Track API usage for a user
 */
export function trackUsage(
  userId: string,
  model: string,
  tokensUsed: number,
  estimatedCost: number,
  endpointType: 'chat' | 'recommendation' | 'test' = 'chat'
): void {
  const record: UsageRecord = {
    userId,
    model,
    tokensUsed,
    estimatedCost,
    timestamp: new Date(),
    endpointType,
  }

  // Get or create user's usage records
  const userRecords = usageData.get(userId) || []
  userRecords.push(record)
  usageData.set(userId, userRecords)

  // Update hourly request count
  const hourKey = `${userId}-${new Date().getHours()}`
  const currentCount = hourlyRequestCounts.get(hourKey) || 0
  hourlyRequestCounts.set(hourKey, currentCount + 1)

  // Log for debugging
  console.log(
    `[Usage] User ${userId} | Model: ${model} | Tokens: ${tokensUsed} | Cost: $${estimatedCost.toFixed(4)}`
  )
}

/**
 * Get usage statistics for a user
 */
export function getUserUsageStats(userId: string): UserUsageStats {
  const userRecords = usageData.get(userId) || []

  const totalRequests = userRecords.length
  const totalTokens = userRecords.reduce((sum, record) => sum + record.tokensUsed, 0)
  const totalCost = userRecords.reduce((sum, record) => sum + record.estimatedCost, 0)

  const hourKey = `${userId}-${new Date().getHours()}`
  const requestsThisHour = hourlyRequestCounts.get(hourKey) || 0

  const lastRequest = userRecords.length > 0 ? userRecords[userRecords.length - 1].timestamp : null

  return {
    totalRequests,
    totalTokens,
    totalCost,
    requestsThisHour,
    lastRequest,
  }
}

/**
 * Check if user has exceeded rate limit
 * Returns true if user should be allowed to make request
 */
export function checkRateLimit(userId: string, subscriptionTier: SubscriptionTier): {
  allowed: boolean
  reason?: string
  requestsThisHour: number
  limit: number
} {
  // Define rate limits per subscription tier
  const rateLimits: Record<SubscriptionTier, number> = {
    FREE: 20, // 20 requests per hour
    PRO: 100, // 100 requests per hour
    BUSINESS: 500, // 500 requests per hour
  }

  const limit = rateLimits[subscriptionTier]
  const hourKey = `${userId}-${new Date().getHours()}`
  const requestsThisHour = hourlyRequestCounts.get(hourKey) || 0

  if (requestsThisHour >= limit) {
    return {
      allowed: false,
      reason: `Rate limit exceeded. You have ${requestsThisHour} requests this hour. Limit: ${limit} requests/hour for ${subscriptionTier} tier.`,
      requestsThisHour,
      limit,
    }
  }

  return {
    allowed: true,
    requestsThisHour,
    limit,
  }
}

/**
 * Reset hourly counters (called by scheduler every hour)
 * For now, this is manual - in production, use a cron job
 */
export function resetHourlyCounters(): void {
  hourlyRequestCounts.clear()
  console.log('[Usage Tracker] Hourly request counters reset')
}

/**
 * Get all usage records for a user (for admin/debugging)
 */
export function getUserUsageRecords(userId: string): UsageRecord[] {
  return usageData.get(userId) || []
}

/**
 * Clear all usage data (for testing purposes only)
 */
export function clearAllUsageData(): void {
  usageData.clear()
  hourlyRequestCounts.clear()
  console.log('[Usage Tracker] All usage data cleared')
}

/**
 * Get total system-wide usage statistics (for admin dashboard)
 */
export function getSystemUsageStats(): {
  totalUsers: number
  totalRequests: number
  totalTokens: number
  totalCost: number
} {
  let totalRequests = 0
  let totalTokens = 0
  let totalCost = 0

  for (const userRecords of usageData.values()) {
    totalRequests += userRecords.length
    totalTokens += userRecords.reduce((sum, record) => sum + record.tokensUsed, 0)
    totalCost += userRecords.reduce((sum, record) => sum + record.estimatedCost, 0)
  }

  return {
    totalUsers: usageData.size,
    totalRequests,
    totalTokens,
    totalCost,
  }
}
