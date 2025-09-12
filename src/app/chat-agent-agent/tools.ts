// shared agent-specific tools
import { env } from 'cloudflare:workers'
import { z } from 'zod'
import { tool, InferUITools, ToolSet } from 'ai'

function agentByName(name: string) {
  const id = env.CHAT_AGENT_AGENT_DURABLE_OBJECT.idFromName(name)
  return env.CHAT_AGENT_AGENT_DURABLE_OBJECT.get(id)
}

const getAgentTime = tool({
  description: 'get the time',
  inputSchema: z.object({
    name: z.string().describe('The name of the agent').default('main')
  }),
  execute: async ({ name }) => {
    try {
      const agent = agentByName(name)
      return await agent.getTime()
    } catch (error) {
      console.error(`Error calling agent ${name}`, error)
      return `Error calling agent ${name}: ${error}`
    }
  }
})

const subagentGetMessages = tool({
  description: 'get the messages of a subagent',
  inputSchema: z.object({
    name: z.string().describe('The name of the subagent').default('subagent')
  }),
  execute: async ({ name }) => {
    try {
      const agent = agentByName(name)
      return await agent.getMessages()
    } catch (error) {
      console.error(`Error calling subagent ${name}`, error)
      return `Error calling subagent ${name}: ${error}`
    }
  }
})

const subagentNewMessage = tool({
  description: 'send a message to a subagent',
  inputSchema: z.object({
    name: z.string().describe('The name of the subagent').default('subagent'),
    message: z.string().describe('The message to send to the subagent')
  }),
  execute: async ({ name, message }) => {
    const agent = agentByName(name)
    try {
      if (name === 'main') throw new Error('Cannot recursively message the main agent')
      return await agent.newMessage(true, message)
    } catch (error) {
      console.error(`Error calling subagent ${name}`, error)
      return `Error calling subagent ${name}: ${error}`
    } finally {
      // await agent.clearMessages()
    }
  }
})

const subagentClearMessages = tool({
  description: 'clear the messages of a subagent',
  inputSchema: z.object({
    name: z.string().describe('The name of the subagent').default('subagent')
  }),
  execute: async ({ name }) => {
    try {
      const agent = agentByName(name)
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
  inputSchema: z.object({
    name: z.string().describe('The name of the subagent, default = main agent').default('main'),
    url: z.string()
  }),
  execute: async ({ name, url }) => {
    try {
      const agent = agentByName(name)
      const { id } = await agent.addMcpServer(url, url, 'mcp-demo-host')
      return `Added MCP url: ${url} with id: ${id}`
    } catch (error) {
      console.error('Error adding MCP server', error)
      return `Error adding MCP at ${url}: ${error}`
    }
  }
})

const removeMCPServerUrl = tool({
  description: 'remove a MCP server by id from the MCP client in the named (or default) agent',
  inputSchema: z.object({
    name: z.string().describe('The name of the subagent, default = main agent').default('main'),
    id: z.string()
  }),
  execute: async ({ name, id }) => {
    try {
      const agent = agentByName(name)
      await agent.removeMcpServer(id)
      return `Removed MCP server with id: ${id}`
    } catch (error) {
      console.error('Error removing MCP server', error)
      return `Error removing MCP server: ${error}`
    }
  }
})

const listMCPServers = tool({
  description: 'List all MCP server URLs known to the MCP client in the named (or default) agent',
  inputSchema: z.object({
    name: z.string().describe('The name of the subagent, default = main agent').default('main')
  }),
  execute: async ({ name }) => {
    try {
      const agent = agentByName(name)
      return agent.getMcpServers()
    } catch (error) {
      console.error('Error getting MCP servers', error)
      return `Error getting MCP servers: ${error}`
    }
  }
})

export const tools = {
  getAgentTime,
  subagentGetMessages,
  subagentNewMessage,
  subagentClearMessages,
  addMCPServerUrl,
  removeMCPServerUrl,
  listMCPServers
} satisfies ToolSet;

export type UITools = InferUITools<typeof tools>;
