import { AIChatAgent } from 'agents/ai-chat-agent'
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type StreamTextOnFinishCallback,
  streamText
} from 'ai'
import { hasToolConfirmation, processToolCalls } from './utils'
import { openai } from '@ai-sdk/openai'
import { nanoid } from 'nanoid'
import { env } from 'cloudflare:workers'
import { agentTools } from './agentTools'
import type { UIMessage, ModelMessage } from 'ai'

import { systemMessageText } from '@/lib/systemMessageText'

const decoder = new TextDecoder()

export class ChatAgentAgentDO extends AIChatAgent<Env> {
  isSubAgent: boolean = false // see newMessage()
  async onChatMessage(onFinish: StreamTextOnFinishCallback<{}>) {
    // Collect all tools, including MCP tools
    const allTools = {
      ...agentTools(env.CHAT_AGENT_AGENT_DURABLE_OBJECT),
      ...this.mcp.getAITools()
    }
    // subagents cannot use subagent tools
    Object.keys(allTools).forEach((key) => {
      if (this.isSubAgent && key.startsWith('subagent')) {
        // @ts-ignore
        delete allTools[key]
      }
    })
    const systemMessage = systemMessageText('Agent Agent Chat (ai sdk v5)', 'gpt-4o')
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const lastMessage = this.messages[this.messages.length - 1]
        if (hasToolConfirmation(lastMessage)) {
          await processToolCalls({ writer, messages: this.messages, tools: allTools }, {})
          return
        }
        const result = streamText({
          messages: convertToModelMessages(this.messages),
          system: systemMessage,
          model: openai('gpt-4o'),
          onFinish,
          tools: allTools
        })
        writer.merge(result.toUIMessageStream())
      }
    })
    return createUIMessageStreamResponse({ stream })
  }

  async getMessages() {
    return this.messages
  }

  // packages/agents/src/ai-chat-agent.ts
  async newMessage(isSubAgent: boolean, message: string) {
    this.isSubAgent = isSubAgent // racey
    const uiMessage: UIMessage = {
      id: nanoid(8),
      role: 'user',
      parts: [{ type: 'text', text: message }]
    }
    try {
      await this.saveMessages([uiMessage])
      // TODO: fix the onFinish callback
      const response = await this.onChatMessage(() => {})
      if (response.body) {
        const reader = response.body.getReader()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              console.log('newMessage response done')
              break
            }
            const chunk = decoder.decode(value)
            console.log('newMessage response chunk', chunk)
          }
        } finally {
          reader.releaseLock()
        }
      }
    } catch (error) {
      console.error('newMessage saveMessages', error)
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
