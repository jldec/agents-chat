// https://grok.com/share/bGVnYWN5_021e85a1-a199-4ac9-bcfb-29233b50a72e
export async function* streamToText(stream: ReadableStream<Uint8Array>): AsyncIterableIterator<string> {
  const decoder = new TextDecoder()
  const reader = stream.getReader()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        console.log('Stream completed')
        break
      }

      // Decode chunk and append to buffer
      const chunkText = decoder.decode(value, { stream: true })
      buffer += chunkText

      // Process complete SSE lines
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

    // Process any remaining buffer
    if (buffer.startsWith('data: ')) {
      const data = buffer.slice(6).trim()
      if (data && data !== '[DONE]') {
        console.log('Surprising data at the end of the SSE stream', data)
        try {
          const parsed = JSON.parse(data)
          const text = parsed.response || ''
          if (text) {
            yield text
          }
        } catch (e) {
          console.error('Error parsing remaining SSE data:', e)
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
