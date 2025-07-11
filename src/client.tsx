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
  default:
    if (!document.getElementById('404')) {
      initClient()
    }
    break
}
