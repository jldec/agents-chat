/**
 * Tool definitions for the AI chat agent
 * Tools can either require human confirmation or execute automatically
 * credit https://github.com/cloudflare/agents-starter
 */
import { tool } from 'ai'
import { z } from 'zod'

/**
 * Local time tool that executes automatically
 * Since it includes an execute function, it will run without user confirmation
 * This is suitable for low-risk operations that don't need oversight
 */
const getLocalTime = tool({
  description: 'get the local time for a specified location',
  parameters: z.object({ location: z.string() }),
  execute: async ({ location }) => {
    console.log(`Getting local time for ${location}`)
    return `The current time in ${location} is ${new Date().toLocaleTimeString()}`
  }
})

/**
 * Export all available tools
 * These will be provided to the AI model to describe available capabilities
 */
export const tools = {
  getLocalTime,
}

/**
 * Implementation of confirmation-required tools
 * This object contains the actual logic for tools that need human approval
 * Each function here corresponds to a tool above that doesn't have an execute function
 */
export const executions = {
}
