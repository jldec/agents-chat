import { AIChatAgent } from 'agents/ai-chat-agent'
import { openai } from '@ai-sdk/openai'
import { systemMessageText } from '@/lib/systemMessageText'

// workers-ai not supported yet wil ai sdk v5
// https://github.com/cloudflare/ai/issues/173
// import { env } from 'cloudflare:workers'
// import { createWorkersAI } from 'workers-ai-provider'
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type StreamTextOnFinishCallback,
  streamText
} from 'ai'

export class ChatAgentSDKDO extends AIChatAgent<Env> {
  async onChatMessage(onFinish: StreamTextOnFinishCallback<{}>) {
    const systemMessage = systemMessageText('Agent SDK Chat (ai sdk v5)', 'gpt-4o')
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          messages: convertToModelMessages(this.messages),
          model: openai('gpt-4o'),
          system: systemMessage,
          onFinish,
          tools: {}
        })
        writer.merge(result.toUIMessageStream())
      }
    })

    return createUIMessageStreamResponse({ stream })
  }
}
