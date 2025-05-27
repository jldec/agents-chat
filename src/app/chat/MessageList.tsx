import { getMessages } from './functions'

export async function MessageList() {
  const messages = await getMessages()
  return (
    <div className="flex flex-col gap-2">
      {messages.map((message) => (
        <div className="border border-gray-200 p-2" key={message.id}>
          {message.content}
        </div>
      ))}
    </div>
  )
}
