'use client'
import { useState, useRef, useEffect } from 'react'

interface MessageInputProps {
  onSubmit: (prompt: string) => Promise<void>
  onClear: () => Promise<void>
}

export function MessageInput({ onSubmit, onClear }: MessageInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const observer = new window.ResizeObserver(() => {
      if (inputRef.current) {
        window.scrollTo({ top: document.body.scrollHeight * 2, behavior: 'smooth' })
      }
    })
    observer.observe(document.getElementById('message-list')!)
    inputRef.current?.focus()
    return () => observer.disconnect()
  }, [])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (input.trim() === '') return
    const prompt = input
    setInput('') // TODO: disable input and keep showing prompt while waiting for response
    await onSubmit(prompt)
  }

  async function clear(e: React.FormEvent<HTMLButtonElement>) {
    e.preventDefault()
    await onClear()
  }
  return (
    <form onSubmit={submit} className="mt-2 mb-[10vh] flex flex-row gap-2">
      <input
        ref={inputRef}
        onChange={(e) => setInput(e.target.value)}
        className="flex-grow border-2 border-gray-400 p-2 w-full rounded-md"
        value={input}
      />
      <button type="submit" className="p-2 bg-blue-500 text-white rounded-md cursor-pointer">
        Submit
      </button>
      <button onClick={clear} className="p-2 rounded-md border border-gray-400 cursor-pointer">
        Clear
      </button>
    </form>
  )
}
