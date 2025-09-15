// shared agent-specific tools
import { env } from 'cloudflare:workers'
import { z } from 'zod'
import { tool, InferUITools, ToolSet } from 'ai'
import { ChatAgentAgentDO } from './ChatAgentAgentDO'

export function agentTools(self: ChatAgentAgentDO) {
  async function getAgent(name: string = 'self') {
    if (!name || name === 'self') return self
    const id = env.CHAT_AGENT_AGENT_DURABLE_OBJECT.idFromName(name)
    const agent = env.CHAT_AGENT_AGENT_DURABLE_OBJECT.get(id)
    await agent.setName(name)
    return agent
  }

  const getAgentTime = tool({
    description: 'get the time from this agent or another named agent',
    inputSchema: z.object({
      name: z.optional(z.string()).describe('The name of the agent, defaults to this agent (self)')
    }),
    execute: async ({ name }) => {
      try {
        const agent = await getAgent(name)
        console.log('getAgentTime', agent.name)
        return await agent.getTime()
      } catch (error) {
        console.error(`Error calling agent ${name}`, error)
        return `Error calling agent ${name}: ${error}`
      }
    }
  })

  const subagentGetMessages = tool({
    description: 'get the messages from this agent or another named agent',
    inputSchema: z.object({
      name: z.optional(z.string()).describe('The name of the agent, defaults to this agent (self)')
    }),
    execute: async ({ name }) => {
      try {
        const agent = await getAgent(name)
        console.log('subagentGetMessages', agent.name)
        return await agent.getMessages()
      } catch (error) {
        console.error(`Error calling subagent ${name}`, error)
        return `Error calling subagent ${name}: ${error}`
      }
    }
  })

  const subagentNewMessage = tool({
    description: 'send a message to a named subagent and return the response text',
    inputSchema: z.object({
      name: z.string().describe('The name of the subagent to message'),
      message: z.string().describe('The message to send to the subagent')
    }),
    execute: async ({ name, message }) => {
      const agent = await getAgent(name)
      console.log('subagentNewMessage', agent.name)
      try {
        if (agent === self) throw new Error('Cannot recursively message this agent')
        return await agent.newMessage(message)
      } catch (error) {
        console.error(`Error calling subagent ${name}`, error)
        return `Error calling subagent ${name}: ${error}`
      } finally {
        await agent.clearMessages()
      }
    }
  })

  const subagentClearMessages = tool({
    description: 'clear the messages of this agent or another named agent',
    inputSchema: z.object({
      name: z.optional(z.string()).describe('The name of the agent, defaults to this agent (self)')
    }),
    execute: async ({ name }) => {
      try {
        const agent = await getAgent(name)
        console.log('subagentClearMessages', agent.name)
        await agent.clearMessages()
        return `Cleared messages of subagent ${name}`
      } catch (error) {
        console.error(`Error calling subagent ${name}`, error)
        return `Error calling subagent ${name}: ${error}`
      }
    }
  })

  const addMCPServerUrl = tool({
    description: 'add an MCP server URL to this agent or another named agent',
    inputSchema: z.object({
      name: z.optional(z.string()).describe('The name of the agent, defaults to this agent (self)'),
      url: z.string()
    }),
    execute: async ({ name, url }) => {
      try {
        const agent = await getAgent(name)
        console.log('addMCPServerUrl', agent.name)
        const { id } = await agent.addMcpServer(url, url, 'mcp-demo-host')
        return `Added MCP url: ${url} with id: ${id} to ${agent.name}`
      } catch (error) {
        console.error('Error adding MCP server', error)
        return `Error adding MCP at ${url}: ${error}`
      }
    }
  })

  const removeMCPServerUrl = tool({
    description: 'remove an MCP server by id from this agent or another named agent',
    inputSchema: z.object({
      name: z.optional(z.string()).describe('The name of the agent, defaults to this agent (self)'),
      id: z.string()
    }),
    execute: async ({ name, id }) => {
      try {
        const agent = await getAgent(name)
        console.log('removeMCPServerUrl', agent.name)
        await await agent.removeMcpServer(id)
        return `Removed MCP server with id: ${id} from ${agent.name}`
      } catch (error) {
        console.error('Error removing MCP server', error)
        return `Error removing MCP server: ${error}`
      }
    }
  })

  const listMCPServers = tool({
    description: 'List all MCP server URLs known to this agent or another named agent',
    inputSchema: z.object({
      name: z.optional(z.string()).describe('The name of the agent, defaults to this agent (self)')
    }),
    execute: async ({ name }) => {
      try {
        const agent = await getAgent(name)
        console.log('listMCPServers', agent.name)
        return await agent.getMcpServers()
      } catch (error) {
        console.error('Error getting MCP servers', error)
        return `Error getting MCP servers: ${error}`
      }
    }
  })

  return {
    getAgentTime,
    subagentGetMessages,
    subagentNewMessage,
    subagentClearMessages,
    ...(import.meta.env.VITE_IS_DEV_SERVER ? { addMCPServerUrl } : {}),
    removeMCPServerUrl,
    listMCPServers
  } satisfies ToolSet
}

export type UITools = InferUITools<ReturnType<typeof agentTools>>
