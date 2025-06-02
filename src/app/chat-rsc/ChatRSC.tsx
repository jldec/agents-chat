import { MessageList } from '../chat/MessageList'
import { MessageInput } from '../chat/MessageInput'
import { ChatLayout } from '../chat/ChatLayout'
import { getMessages } from '../chat-rsc/functions'

export async function ChatRSC() {
  return (
    <ChatLayout title="RedwoodSDK RSC Chat">
      <MessageList messages={await getMessages()} />
      <MessageInput />
    </ChatLayout>
  )
}
