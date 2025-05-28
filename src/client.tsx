import { initRealtimeClient } from 'rwsdk/realtime/client'
import { initClient } from "rwsdk/client";

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
    break
  case '/chat-client':
    initClient();
    break
}
