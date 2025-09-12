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
import { tools } from './tools'
import type { UIMessage, ModelMessage } from 'ai'

import { systemMessageText } from '@/lib/systemMessageText'

const decoder = new TextDecoder()

export class ChatAgentAgentDO extends AIChatAgent<Env> {
  isSubAgent: boolean = false // see newMessage()
  async onChatMessage(onFinish: StreamTextOnFinishCallback<{}>) {
    // Collect all tools, including MCP tools
    const allTools = {
      ...tools,
      ...this.mcp.getAITools()
    }
    // Prevent recursion - subagents cannot use subagent tools
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

  // Non-streaming subagent call
  async newMessage(message: string) {
    let whenDone: (value: ModelMessage[]) => void
    let response = new Promise<ModelMessage[]>((resolve) => {
      whenDone = resolve
    })
    this.isSubAgent = true // racey
    const uiMessage: UIMessage = {
      id: nanoid(8),
      role: 'user',
      parts: [{ type: 'text', text: message }]
    }
    await this.saveMessages([uiMessage])
    // could be improved by processing the response stream returned by onChatMessage
    await this.onChatMessage((llmResult) => {
      // block until finished
      whenDone(llmResult.response.messages)
    })
    return JSON.stringify(await response, null, 2)
  }

  async clearMessages() {
    await this.saveMessages([])
  }

  async getTime() {
    return `The current time for the agent is ${new Date().toLocaleTimeString()}`
  }
}
