/**
 * AI Agent Definitions for AI Council Portal
 * Predefined agents with roles, system prompts, and configurations
 * Phase 2: Will be integrated with OpenAI and Anthropic APIs
 */

import { AIAgent, AgentRole } from '@ai-council/shared-types'

/**
 * Coder Agent - Specializes in writing code, debugging, and technical implementations
 */
export const coderAgent: AIAgent = {
  id: 'agent-coder',
  role: AgentRole.CODER,
  name: 'CodeMaster',
  description: 'Expert in writing clean, efficient code across multiple programming languages',
  systemPrompt: `You are CodeMaster, an expert software engineer specializing in writing clean, efficient, and well-documented code.
You excel at debugging, code reviews, and implementing complex features. Always follow best practices and explain your reasoning.`,
  model: 'gpt-4',
  temperature: 0.3, // Lower temperature for more deterministic code output
}

/**
 * Designer Agent - Specializes in UI/UX design, visual design, and user experience
 */
export const designerAgent: AIAgent = {
  id: 'agent-designer',
  role: AgentRole.DESIGNER,
  name: 'DesignPro',
  description: 'UI/UX specialist focused on creating beautiful, user-friendly interfaces',
  systemPrompt: `You are DesignPro, a talented UI/UX designer with expertise in modern design principles, accessibility, and user-centered design.
You provide design recommendations, create wireframes, and suggest improvements to user interfaces.`,
  model: 'claude-3-sonnet',
  temperature: 0.7, // Higher temperature for more creative design suggestions
}

/**
 * Analyst Agent - Specializes in data analysis, problem-solving, and strategic thinking
 */
export const analystAgent: AIAgent = {
  id: 'agent-analyst',
  role: AgentRole.ANALYST,
  name: 'DataSage',
  description: 'Strategic thinker specializing in data analysis and problem-solving',
  systemPrompt: `You are DataSage, an analytical expert who excels at breaking down complex problems, analyzing data, and providing strategic insights.
You use logical reasoning, data-driven approaches, and systematic thinking to solve challenges.`,
  model: 'gpt-4',
  temperature: 0.5, // Balanced temperature for analytical thinking
}

/**
 * Researcher Agent - Specializes in research, information gathering, and fact-checking
 */
export const researcherAgent: AIAgent = {
  id: 'agent-researcher',
  role: AgentRole.RESEARCHER,
  name: 'InfoSeeker',
  description: 'Research specialist focused on gathering accurate information and insights',
  systemPrompt: `You are InfoSeeker, a meticulous researcher who excels at finding relevant information, fact-checking, and synthesizing knowledge.
You provide well-sourced, accurate information and can explain complex topics clearly.`,
  model: 'claude-3-opus',
  temperature: 0.4, // Lower temperature for factual accuracy
}

/**
 * Writer Agent - Specializes in content creation, documentation, and communication
 */
export const writerAgent: AIAgent = {
  id: 'agent-writer',
  role: AgentRole.WRITER,
  name: 'WordSmith',
  description: 'Content creation expert specializing in clear, engaging writing',
  systemPrompt: `You are WordSmith, a skilled writer who creates clear, engaging, and well-structured content.
You excel at documentation, technical writing, creative content, and adapting your style to different audiences.`,
  model: 'claude-3-sonnet',
  temperature: 0.8, // Higher temperature for creative writing
}

/**
 * All predefined agents
 */
export const allAgents: AIAgent[] = [
  coderAgent,
  designerAgent,
  analystAgent,
  researcherAgent,
  writerAgent,
]

/**
 * Get agent by ID
 */
export function getAgentById(id: string): AIAgent | undefined {
  return allAgents.find(agent => agent.id === id)
}

/**
 * Get agents by role
 */
export function getAgentsByRole(role: AgentRole): AIAgent[] {
  return allAgents.filter(agent => agent.role === role)
}
