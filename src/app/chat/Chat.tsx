import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { requestInfo } from 'rwsdk/worker'
import { getMessages } from './functions'
import { ChatClient } from './ChatClient'
import { ObserveDOM } from './ObserveDOM'

export async function Chat() {
  const isRSC = !requestInfo.request.url.includes('/chat-client')
  return (
    <div className="text-sm p-2 relative max-w-2xl mx-auto">
      <a href="/" className="text-blue-600 underline text-base absolute top-0 right-0 pt-4 pr-3">
        Home
      </a>
      <h1 className="text-xl font-bold my-2">RedwoodSDK {isRSC ? 'RSC' : 'WIP Client'} Chat</h1>
      <div className="w-full text-left">
        {isRSC ? (
          <>
            <MessageList messages={await getMessages()} />
            <MessageInput />
          </>
        ) : (
          <ChatClient />
        )}
      </div>
      <ObserveDOM nodeId="message-list" />
    </div>
  )
}
