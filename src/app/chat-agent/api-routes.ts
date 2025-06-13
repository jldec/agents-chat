import { env } from 'cloudflare:workers'
import { nanoid } from 'nanoid'
import type { Message } from '../shared/ChatStore'
import { askAI } from '@/lib/askAI'
import { streamToText } from '@/lib/streamToText'

import { route } from 'rwsdk/router'
import type { RequestInfo } from 'rwsdk/worker'
import { routeAgentRequest } from 'agents'
import type { WebsocketAgent } from './WebsocketAgent'

async function GET() {
  try {
    const chatStore = resolveChatStore(env.AGENTS_CHATSTORE)
    const messages = await chatStore.getMessages()
    return Response.json(messages)
  } catch (error) {
    return Response.json({ error: 'Failed to get messages' }, { status: 500 })
  }
}

async function DELETE() {
  try {
    const chatStore = resolveChatStore(env.AGENTS_CHATSTORE)
    await chatStore.clearMessages()
    const agent = resolveWebsocketAgent()
    await agent.bumpClients()
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: 'Failed to clear messages' }, { status: 500 })
  }
}

async function POST(request: Request) {
  try {
    const { prompt }: { prompt: string } = await request.json()
    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 })
    }
    await newMessage(prompt)
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: 'Failed to create message' }, { status: 500 })
  }
}

export const chatAgentApiRoutes = [
  route('/api/chat-agent', (requestInfo: RequestInfo) => {
    switch (requestInfo.request.method) {
      case 'GET':
        return GET()
      case 'DELETE':
        return DELETE()
      case 'POST':
        return POST(requestInfo.request)
      default:
        return Response.json({ error: 'unsupported method' }, { status: 405 })
    }
  })
]

async function newMessage(prompt: string) {
  const promptMessage: Message = {
    id: nanoid(8),
    role: 'user',
    content: prompt
  }
  const aiResponse: Message = {
    id: nanoid(8),
    role: 'assistant',
    content: '...'
  }
  const chatStore = resolveChatStore(env.AGENTS_CHATSTORE)
  const agent = resolveWebsocketAgent()
  await chatStore.setMessage(promptMessage)
  await chatStore.setMessage(aiResponse)
  await agent.bumpClients()

  const stream = await askAI(await chatStore.getMessages())
  aiResponse.content = '' // remove ... when stream starts
  for await (const chunk of streamToText(stream)) {
    aiResponse.content += chunk
    agent.syncMessage(aiResponse)
  }
  await chatStore.setMessage(aiResponse)
}

function resolveChatStore(chatID: string) {
  const id: DurableObjectId = env.CHATSTORE_DURABLE_OBJECT.idFromName(chatID)
  return env.CHATSTORE_DURABLE_OBJECT.get(id)
}

function resolveWebsocketAgent() {
  const id = env.WEBSOCKET_DURABLE_OBJECT.idFromName(env.WEBSOCKET_AGENT_NAME)
  const agent = env.WEBSOCKET_DURABLE_OBJECT.get(id)
  return agent
}
