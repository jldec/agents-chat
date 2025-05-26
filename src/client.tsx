import { initRealtimeClient } from 'rwsdk/realtime/client'

switch (window.location.pathname) {
  case '/chat':
    initRealtimeClient({
      key: 'rwsdk-realtime-chat',
    })
    break
  case '/time':
    initRealtimeClient({
      key: 'rwsdk-realtime-demo',
    })
}
