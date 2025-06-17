/**
 * Tool definitions for the AI chat agent
 * Tools can either require human confirmation or execute automatically
 * credit https://github.com/cloudflare/agents-starter
 */
import { tool } from 'ai'
import { z } from 'zod'
import { getCurrentAgent } from 'agents'
import { ChatAgentAgentDO } from './ChatAgentAgentDO'
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
 * Add a MCP server URL to the MCP client
 */
const addMCPServerUrl = tool({
  description: 'add a MCP server URL to the MCP client',
  parameters: z.object({ url: z.string() }),
  execute: async ({ url }) => {
    const { agent } = getCurrentAgent<ChatAgentAgentDO>()
    try {
      const { id } = await agent!.addMcpServer(url, url, 'mcp-demo-host')
      return `Added MCP url: ${url} with id: ${id}`
    } catch (error) {
      console.error('Error adding MCP server', error)
      return `Error adding MCP at ${url}: ${error}`
    }
  }
})

/**
 * Remove a MCP server by id from the MCP client
 */
const removeMCPServerUrl = tool({
  description: 'remove a MCP server by id from the MCP client',
  parameters: z.object({ id: z.string() }),
  execute: async ({ id }) => {
    const { agent } = getCurrentAgent<ChatAgentAgentDO>()
    try {
      await agent!.removeMcpServer(id)
    } catch (error) {
      console.error('Error removing MCP server', error)
      return `Error removing MCP server: ${error}`
    }
  }
})

/**
 * List all MCP server URLs known to the MCP client
 */
const listMCPServers = tool({
  description: 'List all MCP server URLs known to the MCP client',
  parameters: z.object({}),
  execute: async () => {
    const { agent } = getCurrentAgent<ChatAgentAgentDO>()
    try {
      return agent!.getMcpServers()
    } catch (error) {
      console.error('Error getting MCP servers', error)
      return `Error getting MCP servers: ${error}`
    }
  }
})

/**
 * Export all available tools
 * These will be provided to the AI model to describe available capabilities
 */
export const tools = {
  getLocalTime,
  addMCPServerUrl,
  removeMCPServerUrl,
  listMCPServers
}

/**
 * Implementation of confirmation-required tools
 * This object contains the actual logic for tools that need human approval
 * Each function here corresponds to a tool above that doesn't have an execute function
 */
export const executions = {}
