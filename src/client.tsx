import { initRealtimeClient } from 'rwsdk/realtime/client'
import { initClient } from 'rwsdk/client'

switch (window.location.pathname) {
  case '/chat-rsc':
    initRealtimeClient({
      key: 'rwsdk-realtime-chat'
    })
    break
  case '/chat-openai-sdk':
    initRealtimeClient({
      key: 'openai-realtime-chat'
    })
    break
  case '/time':
    initRealtimeClient({
      key: 'rwsdk-realtime-demo'
    })
    break
  default:
    initClient()
}
