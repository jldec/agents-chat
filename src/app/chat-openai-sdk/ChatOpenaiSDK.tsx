import { MessageList } from '../shared/MessageList'
import { MessageInput } from '../shared/MessageInput'
import { ChatLayout } from '../shared/ChatLayout'
import { getMessages, newMessage, clearMessages } from './server-functions'
import { Connect } from '../chat-rsc/Connect'

export async function ChatOpenaiSDK() {
  return (
    <ChatLayout title="OpenaAI Agents SDK Chat">
      <Connect />
      <MessageList messages={await getMessages()} />
      <MessageInput newMessage={newMessage} onClear={clearMessages} />
    </ChatLayout>
  )
}
