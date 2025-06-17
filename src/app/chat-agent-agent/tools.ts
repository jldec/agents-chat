/**
 * Tool definitions for the AI chat agent
 * Tools can either require human confirmation or execute automatically
 * credit https://github.com/cloudflare/agents-starter
 */
import { tool } from 'ai'
import { z } from 'zod'

/**
 * Weather information tool that requires human confirmation
 * When invoked, this will present a confirmation dialog to the user
 * The actual implementation is in the executions object below
 */
const getWeatherInformation = tool({
  description: 'show the weather in a given city to the user',
  parameters: z.object({ city: z.string() }),
  execute: async ({ city }: { city: string }) => {
    console.log(`Getting weather information for ${city}`)
    // In a real application, you'd call a weather API here
    return `The weather in ${city} is sunny with a temperature of 72°F`
  }
  // move execute function to executions object to make this tool require human confirmation
})

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
 * Calculator tool that executes automatically
 * Performs basic mathematical operations
 */
const calculate = tool({
  description: 'perform basic mathematical calculations',
  parameters: z.object({
    operation: z.string().describe('The mathematical operation to perform (e.g., "2 + 3", "10 * 5")')
  }),
  execute: async ({ operation }) => {
    try {
      // Note: Using Function constructor is generally not recommended for security
      // In a real application, you'd want to use a proper math expression parser
      const result = Function(`"use strict"; return (${operation})`)()
      return `The result of ${operation} is ${result}`
    } catch (error) {
      return `Error calculating ${operation}: ${error}`
    }
  }
})

/**
 * Export all available tools
 * These will be provided to the AI model to describe available capabilities
 */
export const tools = {
  getWeatherInformation,
  getLocalTime,
  calculate
}

/**
 * Implementation of confirmation-required tools
 * This object contains the actual logic for tools that need human approval
 * Each function here corresponds to a tool above that doesn't have an execute function
 */
export const executions = {
  // getWeatherInformation: async ({ city }: { city: string }) => {
  //   console.log(`Getting weather information for ${city}`)
  //   // In a real application, you'd call a weather API here
  //   return `The weather in ${city} is sunny with a temperature of 72°F`
  // }
}
