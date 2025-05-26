import { renderRealtimeClients } from 'rwsdk/realtime/worker'
import { route } from 'rwsdk/router'
import { env } from 'cloudflare:workers'
import { time } from './utils'

async function handleBump() {
  console.log('handle /api/bump')
  await renderRealtimeClients({
    durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
    key: 'rwsdk-realtime-demo'
  })
  return new Response(time())
}

async function handleTime() {
  console.log('handle /api/time')
  return new Response(time())
}

export const timeApi = [
  route('/api/time', handleTime),
  route('/api/bump', handleBump)
]