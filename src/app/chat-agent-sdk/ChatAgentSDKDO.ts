import { AIChatAgent } from 'agents/ai-chat-agent'
import { openai } from '@ai-sdk/openai'
import { systemMessageText } from '@/lib/systemMessageText'

// workers-ai not supported yet wil ai sdk v5
// https://github.com/cloudflare/ai/issues/173
import { env } from 'cloudflare:workers'
import { createWorkersAI } from 'workers-ai-provider'
const modelName = '@cf/meta/llama-3.1-8b-instruct-fp8-fast'

import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type StreamTextOnFinishCallback,
  streamText
} from 'ai'

export class ChatAgentSDKDO extends AIChatAgent<Env> {
  async onChatMessage(onFinish: StreamTextOnFinishCallback<{}>) {
    const workersai = createWorkersAI({ binding: env.AI })
    const systemMessage = systemMessageText('Agent SDK Chat (ai sdk v5)', modelName)
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          messages: convertToModelMessages(this.messages),
          model: workersai(modelName),
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
