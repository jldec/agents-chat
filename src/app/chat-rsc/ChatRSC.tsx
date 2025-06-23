import { MessageList } from '../shared/MessageList'
import { MessageInput } from '../shared/MessageInput'
import { ChatLayout } from '../shared/ChatLayout'
import { getMessages, newMessage, clearMessages } from './server-functions'
import { requestInfo } from 'rwsdk/worker'

export async function ChatRSC() {
  requestInfo.headers.set('cache-control', 'public, max-age=60')

  return (
    <ChatLayout title="RedwoodSDK RSC Chat">
      <MessageList messages={await getMessages()} />
      <MessageInput newMessage={newMessage} onClear={clearMessages} />
    </ChatLayout>
  )
}
