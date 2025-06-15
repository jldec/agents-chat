import { AIChatAgent } from 'agents/ai-chat-agent'
import { createWorkersAI } from 'workers-ai-provider'
import { env } from 'cloudflare:workers'
import { createDataStreamResponse, streamText, type StreamTextOnFinishCallback, type ToolSet } from 'ai'

export class ChatAgentSDKDO extends AIChatAgent<Env> {
  async onChatMessage(onFinish: StreamTextOnFinishCallback<ToolSet>) {
    const workersai = createWorkersAI({ binding: env.AI })

    // 
    const dataStreamResponse = createDataStreamResponse({
      execute: async (dataStream) => {
        const result = streamText({
          // @ts-expect-error (this 🦙 is not typed in ts)
          model: workersai('@cf/meta/llama-3.1-8b-instruct-fp8-fast'),
          messages: [
            {
              role: 'system',
              content: 'You are a helpful and delightful assistant'
            },
            ...this.messages
          ],
          maxTokens: 4096,
          onFinish
        })
        result.mergeIntoDataStream(dataStream)
      }
    })
    return dataStreamResponse
  }
}
