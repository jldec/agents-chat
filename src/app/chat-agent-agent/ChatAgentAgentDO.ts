import { AIChatAgent } from 'agents/ai-chat-agent'
// import { createWorkersAI } from 'workers-ai-provider'
// import { env } from 'cloudflare:workers'
import { createDataStreamResponse, streamText, type StreamTextOnFinishCallback, type ToolSet } from 'ai'
import { processToolCalls } from './utils'
import { tools, executions } from './tools'
import { openai } from '@ai-sdk/openai'

export class ChatAgentAgentDO extends AIChatAgent<Env> {
  async onChatMessage(onFinish: StreamTextOnFinishCallback<ToolSet>) {
    // const workersai = createWorkersAI({ binding: env.AI })
    const model = openai('gpt-4o-2024-11-20')

    // Collect all tools, including MCP tools
    const allTools = {
      ...tools,
      ...this.mcp.unstable_getAITools()
    }

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
          executions
        })

        // Stream the AI response
        const result = streamText({
          // ts-expect-error (this 🦙 is not typed in ts)
          // model: workersai('@cf/meta/llama-3.1-8b-instruct-fp8-fast'),
          model,
          system: 'You are a helpful and delightful assistant that can use tools to help users.',
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
}
