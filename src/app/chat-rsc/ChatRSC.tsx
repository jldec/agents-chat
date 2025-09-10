import { MessageList } from '../components/MessageList'
import { MessageInput } from '../components/MessageInput'
import { ChatLayout } from '../components/ChatLayout'
import { getMessages, newMessage, clearMessages } from './server-functions'
import { Connect } from './Connect'

export async function ChatRSC() {
  return (
    <ChatLayout title="RedwoodSDK realtime RSC Chat">
      <Connect />
      <MessageList messages={await getMessages()} />
      <MessageInput newMessage={newMessage} onClear={clearMessages} />
    </ChatLayout>
  )
}
