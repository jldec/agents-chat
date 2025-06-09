import { renderRealtimeClients } from 'rwsdk/realtime/worker'
import { route } from 'rwsdk/router'
import { env } from 'cloudflare:workers'
import { time } from '@/lib/time'

async function handleBump() {
  await renderRealtimeClients({
    durableObjectNamespace: env.REALTIME_DURABLE_OBJECT,
    key: 'rwsdk-realtime-demo'
  })
  return new Response(time())
}

async function handleTime() {
  return new Response(time())
}

export const timeApiRoutes = [
  route('/api/time', handleTime),
  route('/api/bump', handleBump)
]