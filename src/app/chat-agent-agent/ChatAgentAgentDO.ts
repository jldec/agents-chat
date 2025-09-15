import { AIChatAgent } from 'agents/ai-chat-agent'
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type StreamTextOnFinishCallback,
  streamText,
  stepCountIs
} from 'ai'
import { hasToolConfirmation, processToolCalls } from './utils'
import { openai } from '@ai-sdk/openai'
import { nanoid } from 'nanoid'
import { agentTools } from './tools'
import type { UIMessage, ModelMessage } from 'ai'

import { systemMessageText } from '@/lib/systemMessageText'

export class ChatAgentAgentDO extends AIChatAgent<Env> {
  isSubAgent: boolean = false // see newMessage()
  async onChatMessage(onFinish: StreamTextOnFinishCallback<{}>) {
    // Collect all tools, including MCP tools
    const allTools = {
      ...agentTools(this),
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
        console.log(`Agent ${this.name} calling gpt-4o with tools ${JSON.stringify(Object.keys(allTools))}`)
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
          tools: allTools,
          stopWhen: stepCountIs(5)
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
    return this.subagentResponseToText(await response)
  }

  // https://ai-sdk.dev/docs/reference/ai-sdk-core/model-message
  subagentResponseToText(msgs: ModelMessage[]) {
    return msgs
      .map((msg) => {
        switch (msg.role) {
          case 'system':
            return `system: ${msg.content}`
          case 'user':
            return `user: ${msg.content}`
          case 'assistant':
            switch (typeof msg.content) {
              case 'string':
                return `${this.name ?? 'assistant'}: ${msg.content}`
              case 'object':
                return msg.content
                  .map((c) => {
                    switch (c.type) {
                      case 'text':
                        return `${this.name ?? 'assistant'}: ${c.text}`
                      case 'tool-call':
                        return `tool-call: ${c.toolName} ${JSON.stringify(c.input)}`
                      default:
                        return `${this.name ?? 'assistant'}: ${JSON.stringify(c)}`
                    }
                  })
                  .join('\n')
              default:
                return `${this.name ?? 'assistant'}: ${JSON.stringify(msg.content)}`
            }
          case 'tool':
            return msg.content
              .map((toolResultPart) => {
                switch (toolResultPart.output.type) {
                  case 'text':
                    return `tool-result: ${toolResultPart.output.value}`
                  default:
                    return JSON.stringify(toolResultPart.output)
                }
              })
              .join('\n')
          default:
            return JSON.stringify(msg)
        }
      })
      .join('\n')
  }

  async clearMessages() {
    await this.saveMessages([])
  }

  async getTime() {
    return `The current time for ${this.name ?? 'assistant'} is ${new Date().toLocaleTimeString()}`
  }
}
