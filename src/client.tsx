import { initRealtimeClient } from 'rwsdk/realtime/client'
import { initClient } from 'rwsdk/client'

switch (window.location.pathname) {
  case '/time':
    initRealtimeClient({
      key: 'rwsdk-realtime-demo'
    })
    break
  default:
    initClient()
}
