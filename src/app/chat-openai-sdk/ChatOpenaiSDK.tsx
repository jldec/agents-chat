import { MessageListOpenAI } from '../components/MessageListOpenAI'
import { MessageInput } from '../components/MessageInput'
import { ChatLayout } from '../components/ChatLayout'
import { getMessages, newMessage, clearMessages } from './server-functions'
import { Connect } from '../chat-rsc/Connect'

export async function ChatOpenaiSDK() {
  return (
    <ChatLayout title="OpenaAI Chat">
      <Connect />
      <MessageListOpenAI messages={await getMessages()} />
      <MessageInput newMessage={newMessage} onClear={clearMessages} />
    </ChatLayout>
  )
}
