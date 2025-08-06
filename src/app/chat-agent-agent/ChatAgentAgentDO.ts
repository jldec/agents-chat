import { AIChatAgent } from 'agents/ai-chat-agent'
import {
  createDataStreamResponse,
  streamText,
  type StreamTextOnFinishCallback,
  type ToolSet,
  appendResponseMessages,
  type Message as ChatMessage
} from 'ai'
import { processToolCalls } from './utils'
import { openai } from '@ai-sdk/openai'
import { nanoid } from 'nanoid'
import { env } from 'cloudflare:workers'
import { agentTools } from '../shared/agentTools'

import { systemMessageText } from '@/lib/systemMessageText'

const decoder = new TextDecoder()

export class ChatAgentAgentDO extends AIChatAgent<Env> {
  isSubAgent: boolean = false // see newMessage()
  async onChatMessage(onFinish: StreamTextOnFinishCallback<ToolSet>) {
    // const workersai = createWorkersAI({ binding: env.AI })
    const model = openai('gpt-4o-2024-11-20')

    // Collect all tools, including MCP tools
    const allTools = {
      ...agentTools(env.CHAT_AGENT_AGENT_DURABLE_OBJECT),
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
          executions: {}
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

  // from https://github.com/cloudflare/agents/blob/398c7f5411f3a63f450007f83db7e3f29b6ed4c2/packages/agents/src/ai-chat-agent.ts#L185
  async newMessage(isSubAgent: boolean, message: string) {
    console.log('newMessage', isSubAgent, message)
    this.isSubAgent = isSubAgent // racey
    await this.persistMessages([
      ...this.messages,
      {
        id: nanoid(8),
        content: message,
        role: 'user'
      }
    ])
    const response = await this.onChatMessage(async ({ response }) => {
      const finalMessages = appendResponseMessages({
        messages: this.messages,
        responseMessages: response.messages
      })
      await this.persistMessages(finalMessages, [])
    })
    if (response) {
      // @ts-ignore TODO: fix this type error
      for await (const chunk of response.body!) {
        let decodedChunk = decoder.decode(chunk)
        console.log('chunk', decodedChunk)
      }
      response.body?.cancel()
    }
    return this.messages
  }

  async clearMessages() {
    await this.saveMessages([])
  }

  async getTime() {
    return `The current time for the agent is ${new Date().toLocaleTimeString()}`
  }
}
