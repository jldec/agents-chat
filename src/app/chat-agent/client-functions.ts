export async function newMessage(prompt: string): Promise<void> {
  const response = await fetch('/api/chat-agent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  })
  if (!response.ok) {
    throw new Error('Failed to send message')
  }
}

export async function getMessages() {
  const response = await fetch('/api/chat-agent')
  if (!response.ok) {
    throw new Error('Failed to get messages')
  }
  return response.json()
}

export async function clearMessages(): Promise<void> {
  const response = await fetch('/api/chat-agent', {
    method: 'DELETE'
  })
  if (!response.ok) {
    throw new Error('Failed to clear messages')
  }
}
