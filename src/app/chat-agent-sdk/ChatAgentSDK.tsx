'use client'
import '../styles.css'
import { useAgent } from 'agents/react'
import { useAgentChat } from 'agents/ai-react'
import type { Message } from '@ai-sdk/react'

export function ChatAgentSDK() {
  const agent = useAgent({
    agent: 'chat-agent-sdk-durable-object', // kebab-cased binding name
    name: 'rwsdk-chat-agent-sdk'
  })

  //  return <div>Hello World</div>

  const { messages, input, handleInputChange, handleSubmit, clearHistory } = useAgentChat({
    agent,
    maxSteps: 5,
    // context(justinvdm): Avoid fetch() as side-effect of SSR render
    // https://github.com/cloudflare/agents/blob/398c7f5411f3a63f450007f83db7e3f29b6ed4c2/packages/agents/src/ai-react.tsx#L85-L88
    getInitialMessages: typeof window === 'undefined' ? null : undefined
  })

  return (
    <>
      <div className="controls-container">
        <button type="button" onClick={clearHistory} className="clear-history">
          🗑️ Clear History
        </button>
      </div>

      <div className="chat-container">
        <div className="messages-wrapper">
          {messages?.map((m: Message) => (
            <div key={m.id} className="message">
              <strong>{`${m.role}: `}</strong>
              {m.parts?.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return (
                      <div key={i} className="message-content">
                        {part.text}
                      </div>
                    )
                }
              })}
              <br />
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <input className="chat-input" value={input} placeholder="Say something..." onChange={handleInputChange} />
        </form>
      </div>
    </>
  )
}
