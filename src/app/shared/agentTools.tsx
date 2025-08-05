// shared agent-specific tools
import { IS_DEV } from 'rwsdk/constants'
import { z } from 'zod'
import { tool } from 'ai'
import type { ChatAgentAgentDO } from '../chat-agent-agent/ChatAgentAgentDO'
import type { ChatPubsubAgentDO } from '../chat-agent-pubsub/ChatPubsubAgentDO'

export function agentTools(namespace: DurableObjectNamespace<ChatAgentAgentDO | ChatPubsubAgentDO>) {
  return {
    getAgentTime: getAgentTime(namespace),
    subagentGetMessages: subagentGetMessages(namespace),
    subagentNewMessage: subagentNewMessage(namespace),
    subagentClearMessages: subagentClearMessages(namespace),
    ...(IS_DEV ? { addMCPServerUrl: addMCPServerUrl(namespace) } : {}), // unsafe without auth
    removeMCPServerUrl: removeMCPServerUrl(namespace),
    listMCPServers: listMCPServers(namespace)
  }
}

function agentByName(namespace: DurableObjectNamespace<ChatAgentAgentDO | ChatPubsubAgentDO>, name: string) {
  return namespace.get(namespace.idFromName(name))
}

function getAgentTime(namespace: DurableObjectNamespace<ChatAgentAgentDO | ChatPubsubAgentDO>) {
  return tool({
    description: 'get the time',
    parameters: z.object({
      name: z.string().describe('The name of the agent').default('main')
    }),
    execute: async ({ name }) => {
      try {
        const agent = agentByName(namespace, name)
        return await agent.getTime()
      } catch (error) {
        console.error(`Error calling agent ${name}`, error)
        return `Error calling agent ${name}: ${error}`
      }
    }
  })
}

function subagentGetMessages(namespace: DurableObjectNamespace<ChatAgentAgentDO | ChatPubsubAgentDO>) {
  return tool({
    description: 'get the messages of a subagent',
    parameters: z.object({
      name: z.string().describe('The name of the subagent').default('subagent')
    }),
    execute: async ({ name }) => {
      try {
        const agent = agentByName(namespace, name)
        // @ts-ignore
        return await agent.getMessages()
      } catch (error) {
        console.error(`Error calling subagent ${name}`, error)
        return `Error calling subagent ${name}: ${error}`
      }
    }
  })
}

function subagentNewMessage(namespace: DurableObjectNamespace<ChatAgentAgentDO | ChatPubsubAgentDO>) {
  return tool({
    description: 'send a message to a subagent',
    parameters: z.object({
      name: z.string().describe('The name of the subagent').default('subagent'),
      message: z.string().describe('The message to send to the subagent')
    }),
    execute: async ({ name, message }) => {
      const agent = agentByName(namespace, name)
      try {
        if (name === 'main') throw new Error('Cannot recursively message the main agent')
        // @ts-ignore
        return await agent.newMessage(true, message)
      } catch (error) {
        console.error(`Error calling subagent ${name}`, error)
        return `Error calling subagent ${name}: ${error}`
      } finally {
        await agent.clearMessages()
      }
    }
  })
}

function subagentClearMessages(namespace: DurableObjectNamespace<ChatAgentAgentDO | ChatPubsubAgentDO>) {
  return tool({
    description: 'clear the messages of a subagent',
    parameters: z.object({
      name: z.string().describe('The name of the subagent').default('subagent')
    }),
    execute: async ({ name }) => {
      try {
        const agent = agentByName(namespace, name)
        await agent.clearMessages()
        return `Cleared messages of subagent ${name}`
      } catch (error) {
        console.error(`Error calling subagent ${name}`, error)
        return `Error calling subagent ${name}: ${error}`
      }
    }
  })
}

function addMCPServerUrl(namespace: DurableObjectNamespace<ChatAgentAgentDO | ChatPubsubAgentDO>) {
  return tool({
    description: 'add a MCP server URL to the MCP client in the named (or default) agent',
    parameters: z.object({
      name: z.string().describe('The name of the subagent, default = main agent').default('main'),
      url: z.string()
    }),
    execute: async ({ name, url }) => {
      try {
        const agent = agentByName(namespace, name)
        const { id } = await agent.addMcpServer(url, url, 'mcp-demo-host')
        return `Added MCP url: ${url} with id: ${id}`
      } catch (error) {
        console.error('Error adding MCP server', error)
        return `Error adding MCP at ${url}: ${error}`
      }
    }
  })
}

function removeMCPServerUrl(namespace: DurableObjectNamespace<ChatAgentAgentDO | ChatPubsubAgentDO>) {
  return tool({
    description: 'remove a MCP server by id from the MCP client in the named (or default) agent',
    parameters: z.object({
      name: z.string().describe('The name of the subagent, default = main agent').default('main'),
      id: z.string()
    }),
    execute: async ({ name, id }) => {
      try {
        const agent = agentByName(namespace, name)
        await agent.removeMcpServer(id)
        return `Removed MCP server with id: ${id}`
      } catch (error) {
        console.error('Error removing MCP server', error)
        return `Error removing MCP server: ${error}`
      }
    }
  })
}

function listMCPServers(namespace: DurableObjectNamespace<ChatAgentAgentDO | ChatPubsubAgentDO>) {
  return tool({
    description: 'List all MCP server URLs known to the MCP client in the named (or default) agent',
    parameters: z.object({
      name: z.string().describe('The name of the subagent, default = main agent').default('main')
    }),
    execute: async ({ name }) => {
      try {
        const agent = agentByName(namespace, name)
        return agent.getMcpServers()
      } catch (error) {
        console.error('Error getting MCP servers', error)
        return `Error getting MCP servers: ${error}`
      }
    }
  })
}
