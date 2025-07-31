import { getAgentByName } from 'agents'
import { AIChatAgent } from 'agents/ai-chat-agent'
// import { createWorkersAI } from 'workers-ai-provider'
// import { env } from 'cloudflare:workers'
import { createDataStreamResponse, streamText, type StreamTextOnFinishCallback, type ToolSet } from 'ai'
import { processToolCalls } from './utils'
import { openai } from '@ai-sdk/openai'
import { nanoid } from 'nanoid'
import { env } from 'cloudflare:workers'
import { tool } from 'ai'
import { z } from 'zod'
import { IS_DEV } from 'rwsdk/constants'
import { systemMessageText } from '@/lib/systemMessageText'

export class ChatAgentAgentDO extends AIChatAgent<Env> {
  isSubAgent: boolean = false // see newMessage()
  async onChatMessage(onFinish: StreamTextOnFinishCallback<ToolSet>) {
    // const workersai = createWorkersAI({ binding: env.AI })
    const model = openai('gpt-4o-2024-11-20')

    // Collect all tools, including MCP tools
    const allTools = {
      ...this.tools,
      ...this.mcp.unstable_getAITools()
    }

    // subagents cannot use subagent tools
    Object.keys(allTools).forEach((key) => {
      if (this.isSubAgent && key.startsWith('subagent')) {
        // @ts-ignore
        delete allTools[key]
      }
    })

    // Create a streaming response that handles both text and tool outputs
    // credit https://github.com/cloudflare/agents-starter
    const dataStreamResponse = createDataStreamResponse({
      execute: async (dataStream) => {
        // Process any pending tool calls from previous messages
        // This handles human-in-the-loop confirmations for tools
        const processedMessages = await processToolCalls({
          messages: this.messages,
          dataStream,
          tools: allTools,
          executions: this.executions
        })

        // Stream the AI response
        const result = streamText({
          // ts-expect-error (this 🦙 is not typed in ts)
          // model: workersai('@cf/meta/llama-3.1-8b-instruct-fp8-fast'),
          model,
          system: systemMessageText('Agent Agent Chat'),
          messages: processedMessages,
          tools: allTools,
          onFinish: async (args) => {
            onFinish(args as Parameters<StreamTextOnFinishCallback<ToolSet>>[0])
          },
          onError: (error) => {
            console.error('Error while streaming:', error)
          },
          maxSteps: 5,
          maxTokens: 2048
        })

        // Merge the AI response stream with tool execution outputs
        result.mergeIntoDataStream(dataStream)
      }
    })
    return dataStreamResponse
  }

  async getMessages() {
    console.log('getMessages', this.messages)
    return this.messages
  }

  async newMessage(isSubAgent: boolean, message: string) {
    console.log('newMessage', isSubAgent, message)
    this.isSubAgent = isSubAgent // racey
    // https://github.com/cloudflare/agents/blob/398c7f5411f3a63f450007f83db7e3f29b6ed4c2/packages/agents/src/ai-chat-agent.ts#L185
    await this.saveMessages([
      ...this.messages,
      {
        id: nanoid(8),
        content: message,
        role: 'user' // TODO: add role for agent calling subagent
        // TODO check timestamps etc.
      }
    ])
    return this.messages
  }

  async clearMessages() {
    await this.saveMessages([])
  }

  async getTime() {
    return `The current time for the agent is ${new Date().toLocaleTimeString()}`
  }

  // Built-in tools below can operate on this or other agent instances
  // by passing the name of the agent to the tool
  // Unfortunatelythis.name is not available in subagents
  // see  https://github.com/cloudflare/workerd/issues/2240
  private async agentByName(
    name: string,
    options?: {
      jurisdiction?: DurableObjectJurisdiction
      locationHint?: DurableObjectLocationHint
    }
  ): Promise<DurableObjectStub<ChatAgentAgentDO>> {
    return await getAgentByName<Env, ChatAgentAgentDO>(env.CHAT_AGENT_AGENT_DURABLE_OBJECT, name, options)
  }

  private getAgentTime = tool({
    description: 'get the time',
    parameters: z.object({
      name: z.string().describe('The name of the agent').default('main'),
      location: z
        .union([
          z.literal('wnam'),
          z.literal('enam'),
          z.literal('sam'),
          z.literal('weur'),
          z.literal('eeur'),
          z.literal('apac'),
          z.literal('oc'),
          z.literal('afr'),
          z.literal('me')
        ])
        .describe(
          'The optional DurableObjectLocationHint for this agent: "wnam" | "enam" | "sam" | "weur" | "eeur" | "apac" | "oc" | "afr" | "me"'
        )
        .optional()
    }),
    execute: async ({ name, location }) => {
      try {
        const agent = await this.agentByName(name, { locationHint: location ?? undefined })
        return await agent.getTime()
      } catch (error) {
        console.error(`Error calling agent ${name}`, error)
        return `Error calling agent ${name}: ${error}`
      }
    }
  })

  private subagentGetMessages = tool({
    description: 'get the messages of a subagent',
    parameters: z.object({
      name: z.string().describe('The name of the subagent').default('subagent')
    }),
    execute: async ({ name }) => {
      try {
        const agent = await this.agentByName(name)
        // @ts-ignore
        return await agent.getMessages()
      } catch (error) {
        console.error(`Error calling subagent ${name}`, error)
        return `Error calling subagent ${name}: ${error}`
      }
    }
  })


  private subagentNewMessage = tool({
    description: 'send a message to a subagent',
    parameters: z.object({
      name: z.string().describe('The name of the subagent').default('subagent'),
      message: z.string().describe('The message to send to the subagent')
    }),
    execute: async ({ name, message }) => {
      const agent = await this.agentByName(name)
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

  private subagentClearMessages = tool({
    description: 'clear the messages of a subagent',
    parameters: z.object({
      name: z.string().describe('The name of the subagent').default('subagent')
    }),
    execute: async ({ name }) => {
      try {
        const agent = await this.agentByName(name)
        await agent.clearMessages()
        return `Cleared messages of subagent ${name}`
      } catch (error) {
        console.error(`Error calling subagent ${name}`, error)
        return `Error calling subagent ${name}: ${error}`
      }
    }
  })

  private addMCPServerUrl = tool({
    description: 'add a MCP server URL to the MCP client in the named (or default) agent',
    parameters: z.object({
      name: z.string().describe('The name of the subagent, default = main agent').default('main'),
      url: z.string()
    }),
    execute: async ({ name, url }) => {
      try {
        const agent = await this.agentByName(name)
        const { id } = await agent.addMcpServer(url, url, 'mcp-demo-host')
        return `Added MCP url: ${url} with id: ${id}`
      } catch (error) {
        console.error('Error adding MCP server', error)
        return `Error adding MCP at ${url}: ${error}`
      }
    }
  })

  private removeMCPServerUrl = tool({
    description: 'remove a MCP server by id from the MCP client in the named (or default) agent',
    parameters: z.object({
      name: z.string().describe('The name of the subagent, default = main agent').default('main'),
      id: z.string()
    }),
    execute: async ({ name, id }) => {
      try {
        const agent = await this.agentByName(name)
        await agent.removeMcpServer(id)
        return `Removed MCP server with id: ${id}`
      } catch (error) {
        console.error('Error removing MCP server', error)
        return `Error removing MCP server: ${error}`
      }
    }
  })

  private listMCPServers = tool({
    description: 'List all MCP server URLs known to the MCP client in the named (or default) agent',
    parameters: z.object({
      name: z.string().describe('The name of the subagent, default = main agent').default('main')
    }),
    execute: async ({ name }) => {
      try {
        const agent = await this.agentByName(name)
        return agent.getMcpServers()
      } catch (error) {
        console.error('Error getting MCP servers', error)
        return `Error getting MCP servers: ${error}`
      }
    }
  })

  private tools = {
    getAgentTime: this.getAgentTime,
    subagentGetMessages: this.subagentGetMessages,
    subagentNewMessage: this.subagentNewMessage,
    subagentClearMessages: this.subagentClearMessages,
    ...(IS_DEV ? { addMCPServerUrl: this.addMCPServerUrl } : {}), // unsafe without auth
    removeMCPServerUrl: this.removeMCPServerUrl,
    listMCPServers: this.listMCPServers
  }

  private executions = {}
}
