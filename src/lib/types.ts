// Minimal message type
export type Message = {
  id: string
  role: 'system' | 'user' | 'assistant' | 'data'
  content: string
}