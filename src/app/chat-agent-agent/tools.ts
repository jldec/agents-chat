/**
 * Tool definitions for the AI chat agent
 * Tools can either require human confirmation or execute automatically
 * credit https://github.com/cloudflare/agents-starter
 */
import { env } from 'cloudflare:workers'
import { tool } from 'ai'
import { z } from 'zod'
import { getCurrentAgent, getAgentByName } from 'agents'
import { ChatAgentAgentDO } from './ChatAgentAgentDO'

const getLocalTime = tool({
  description: 'get the local time for a specified location',
  parameters: z.object({ location: z.string() }),
  execute: async ({ location }) => {
    console.log(`Getting local time for ${location}`)
    return `The current time in ${location} is ${new Date().toLocaleTimeString()}`
  }
})

const getAgentMessages = tool({
  description: 'get the messages of an agent or subagent',
  parameters: z.object({
    name: z.string().describe('The name of the agent or subagent').default('main')
  }),
  execute: async ({ name }) => {
    const agent = await getAgentByName(env.CHAT_AGENT_AGENT_DURABLE_OBJECT, name)
    try {
      // @ts-expect-error
      return await agent.getMessages()
    } catch (error) {
      console.error(`Error calling subagent ${name}`, error)
      return `Error calling subagent ${name}: ${error}`
    }
  }
})

const subagentGetMessages = tool({
  description: 'get the messages of a subagent',
  parameters: z.object({
    name: z.string().describe('The name of the subagent').default('subagent')
  }),
  execute: async ({ name }) => {
    const agent = await getAgentByName(env.CHAT_AGENT_AGENT_DURABLE_OBJECT, name)
    try {
      return await agent.getMessages()
    } catch (error) {
      console.error(`Error calling subagent ${name}`, error)
      return `Error calling subagent ${name}: ${error}`
    }
  }
})

// const agentNewMessage = tool({
//   description: 'send a message to the main agent',
//   parameters: z.object({
//     message: z.string().describe('The message to send to the main agent')
//   }),
//   execute: async ({ message }) => {
//     const agent = await getAgentByName(env.CHAT_AGENT_AGENT_DURABLE_OBJECT, 'main')
//     try {
//       return await agent.newMessage(message)
//     } catch (error) {
//       console.error(`Error calling main agent`, error)
//       return `Error calling main agent: ${error}`
//     }
//   }
// })

// @ts-expect-error
const subagentNewMessage = tool({
  description: 'send a message to a subagent',
  parameters: z.object({
    name: z.string().describe('The name of the subagent').default('subagent'),
    message: z.string().describe('The message to send to the subagent')
  }),
  execute: async ({ name, message }) => {
    const agent = await getAgentByName(env.CHAT_AGENT_AGENT_DURABLE_OBJECT, name)
    try {
      return await agent.newMessage(message)
    } catch (error) {
      console.error(`Error calling subagent ${name}`, error)
      return `Error calling subagent ${name}: ${error}`
    }
  }
})

const subagentClearMessages = tool({
  description: 'clear the messages of a subagent',
  parameters: z.object({
    name: z.string().describe('The name of the subagent').default('subagent')
  }),
  execute: async ({ name }) => {
    const agent = await getAgentByName(env.CHAT_AGENT_AGENT_DURABLE_OBJECT, name)
    try {
      await agent.clearMessages()
      return `Cleared messages of subagent ${name}`
    } catch (error) {
      console.error(`Error calling subagent ${name}`, error)
      return `Error calling subagent ${name}: ${error}`
    }
  }
})

const addMCPServerUrl = tool({
  description: 'add a MCP server URL to the MCP client in the named (or default) agent',
  parameters: z.object({
    name: z.string().describe('The name of the subagent, default = main agent').default('main'),
    url: z.string()
  }),
  execute: async ({ name, url }) => {
    const agent = await getAgentByName(env.CHAT_AGENT_AGENT_DURABLE_OBJECT, name)
    try {
      const { id } = await agent!.addMcpServer(url, url, 'mcp-demo-host')
      return `Added MCP url: ${url} with id: ${id}`
    } catch (error) {
      console.error('Error adding MCP server', error)
      return `Error adding MCP at ${url}: ${error}`
    }
  }
})

const removeMCPServerUrl = tool({
  description: 'remove a MCP server by id from the MCP client in the named (or default) agent',
  parameters: z.object({
    name: z.string().describe('The name of the subagent, default = main agent').default('main'),
    id: z.string()
  }),
  execute: async ({ name, id }) => {
    const agent = await getAgentByName(env.CHAT_AGENT_AGENT_DURABLE_OBJECT, name)
    try {
      await agent!.removeMcpServer(id)
      return `Removed MCP server with id: ${id}`
    } catch (error) {
      console.error('Error removing MCP server', error)
      return `Error removing MCP server: ${error}`
    }
  }
})

const listMCPServers = tool({
  description: 'List all MCP server URLs known to the MCP client in the named (or default) agent',
  parameters: z.object({
    name: z.string().describe('The name of the subagent, default = main agent').default('main')
  }),
  execute: async ({ name }) => {
    const agent = await getAgentByName(env.CHAT_AGENT_AGENT_DURABLE_OBJECT, name)
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
  getAgentMessages,
  subagentGetMessages,
  subagentNewMessage,
  subagentClearMessages,
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
