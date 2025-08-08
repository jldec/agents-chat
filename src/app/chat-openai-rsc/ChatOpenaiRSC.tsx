import { MessageList } from '../shared/MessageList'
import { MessageInput } from '../shared/MessageInput'
import { ChatLayout } from '../shared/ChatLayout'
import { getMessages, newMessage, clearMessages } from './server-functions'

export async function ChatOpenaiRSC() {
  return (
    <ChatLayout title="OpenaAI Chat with RedwoodSDK RSC">
      <MessageList messages={await getMessages()} />
      <MessageInput newMessage={newMessage} onClear={clearMessages} />
    </ChatLayout>
  )
}
