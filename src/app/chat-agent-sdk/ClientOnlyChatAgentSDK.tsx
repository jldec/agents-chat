import { ClientOnly } from '../shared/ClientOnly'
import { ChatAgentSDK } from './ChatAgentSDK'

export function ClientOnlyChatAgentSDK() {
  return (
    <ClientOnly>
      <ChatAgentSDK />
    </ClientOnly>
  )
}