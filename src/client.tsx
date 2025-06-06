import { initRealtimeClient } from 'rwsdk/realtime/client'
import { initClient } from 'rwsdk/client'

switch (window.location.pathname) {
  case '/chat-rsc':
    initRealtimeClient({
      key: 'rwsdk-realtime-chat'
    })
    break
  case '/time':
    initRealtimeClient({
      key: 'rwsdk-realtime-demo'
    })
    break
  case '/chat-agent':
  case '/chat-tinybase':
  case '/':
    initClient()
    break
  default:
    console.error(new Error(`no rwsdk client init for ${window.location.pathname}`))
}
