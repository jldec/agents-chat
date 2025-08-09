import { MessageList } from '../shared/MessageList'
import { MessageInput } from '../shared/MessageInput'
import { ChatLayout } from '../shared/ChatLayout'
import { getMessages, newMessage, clearMessages } from './server-functions'
import { Connect } from './Connect'

export async function ChatRSC() {
  return (
    <ChatLayout title="RedwoodSDK RSC Chat">
      <Connect />
      <MessageList messages={await getMessages()} />
      <MessageInput newMessage={newMessage} onClear={clearMessages} />
    </ChatLayout>
  )
}
