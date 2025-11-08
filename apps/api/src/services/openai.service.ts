/**
 * OpenAI Service
 * Handles all interactions with OpenAI API (GPT-4, GPT-4-turbo)
 */

import OpenAI from 'openai'
import { AIMessage, AICompletionResponse } from '@ai-council/shared-types'

/**
 * OpenAI Client Configuration
 */
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is not defined in environment variables. Please add it to your .env file.'
    )
  }

  if (apiKey === 'your-openai-api-key-here') {
    throw new Error(
      'Please replace the placeholder OPENAI_API_KEY in your .env file with your actual OpenAI API key.'
    )
  }

  return new OpenAI({
    apiKey: apiKey,
  })
}

/**
 * Calculate estimated cost for OpenAI models
 * Pricing as of January 2025
 */
function calculateCost(model: string, tokensUsed: number): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 0.03, output: 0.06 }, // per 1K tokens
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
    'gpt-4-1106-preview': { input: 0.01, output: 0.03 },
  }

  const modelPricing = pricing[model] || pricing['gpt-4'] // Default to GPT-4 pricing

  // For simplicity, we'll use average of input and output pricing
  // In production, you'd track input and output tokens separately
  const avgPricePerToken = (modelPricing.input + modelPricing.output) / 2 / 1000

  return tokensUsed * avgPricePerToken
}

/**
 * Chat Completion with OpenAI
 *
 * @param systemPrompt - Agent's system prompt defining behavior
 * @param userPrompt - User's message/question
 * @param conversationHistory - Optional previous messages
 * @param model - OpenAI model to use (gpt-4 or gpt-4-turbo)
 * @param temperature - Creativity level (0-1)
 * @returns AI response with usage metadata
 */
export async function chatCompletion(
  systemPrompt: string,
  userPrompt: string,
  conversationHistory: AIMessage[] = [],
  model: 'gpt-4' | 'gpt-4-turbo' = 'gpt-4',
  temperature: number = 0.7
): Promise<AICompletionResponse> {
  try {
    const client = getOpenAIClient()

    // Build messages array
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userPrompt },
    ]

    // Map model name to actual OpenAI model identifier
    const modelMap: Record<string, string> = {
      'gpt-4': 'gpt-4',
      'gpt-4-turbo': 'gpt-4-turbo-preview',
    }

    const actualModel = modelMap[model] || 'gpt-4'

    // Call OpenAI API
    const response = await client.chat.completions.create({
      model: actualModel,
      messages: messages,
      temperature: temperature,
      max_tokens: 2000, // Reasonable limit
    })

    const choice = response.choices[0]
    const tokensUsed = response.usage?.total_tokens || 0

    return {
      content: choice.message.content || 'No response generated.',
      model: actualModel,
      tokensUsed: tokensUsed,
      estimatedCost: calculateCost(actualModel, tokensUsed),
      finishReason: choice.finish_reason || 'unknown',
    }
  } catch (error) {
    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env file.')
      }

      if (error.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again in a moment.')
      }

      if (error.status === 500 || error.status === 503) {
        throw new Error('OpenAI service is temporarily unavailable. Please try again later.')
      }

      throw new Error(`OpenAI API error: ${error.message}`)
    }

    // Unknown error
    throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Test OpenAI connection
 * Useful for health checks and debugging
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = getOpenAIClient()

    // Simple test request
    await client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5,
    })

    return true
  } catch (error) {
    console.error('OpenAI connection test failed:', error)
    return false
  }
}

/**
 * Get available OpenAI models
 * Used for model selection UI
 */
export function getAvailableModels(): Array<{ id: string; name: string; description: string }> {
  return [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      description: 'Most capable model, best for complex tasks',
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      description: 'Faster and more cost-effective than GPT-4',
    },
  ]
}
