import { MessageList } from '../shared/MessageList'
import { MessageInput } from '../shared/MessageInput'
import { ChatLayout } from '../shared/ChatLayout'
import { getMessages, newMessage, clearMessages } from './server-functions'

export async function ChatRSC() {
  return (
    <ChatLayout title="RedwoodSDK RSC Chat">
      <MessageList messages={await getMessages()} />
      <MessageInput onSubmit={newMessage} onClear={clearMessages} />
    </ChatLayout>
  )
}
