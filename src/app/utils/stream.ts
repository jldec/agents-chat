// https://grok.com/share/bGVnYWN5_021e85a1-a199-4ac9-bcfb-29233b50a72e
//
// TODO: validate special cases, like comments or other line terminators
// see https://github.com/rexxars/eventsource-parser/blob/main/src/parse.ts

export async function* streamToText(stream: ReadableStream<Uint8Array>): AsyncIterableIterator<string> {
  const decoder = new TextDecoder()
  const reader = stream.getReader()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            return // End iteration
          }
          try {
            const parsed = JSON.parse(data)
            const text = parsed.response || ''
            if (text) {
              yield text // Yield the text string
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e)
          }
        }
      }
    }
    // Ignore any remaining buffer
  } finally {
    reader.releaseLock()
  }
}
