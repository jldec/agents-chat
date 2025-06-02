import { MessageList } from '../chat/MessageList'
import { MessageInput } from '../chat/MessageInput'
import { ChatLayout } from '../chat/ChatLayout'
import { getMessages, newMessage, clearMessages } from './server-functions'

export async function ChatRSC() {
  return (
    <ChatLayout title="RedwoodSDK RSC Chat">
      <MessageList messages={await getMessages()} />
      <MessageInput onSubmit={newMessage} onClear={clearMessages} />
    </ChatLayout>
  )
}
