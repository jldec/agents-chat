'use client'
import { useState, useRef, useEffect } from 'react'
import { newMessage, clearMessages } from './functions'

export function MessageInput() {
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
    setInput('')
    await newMessage(input)
  }
  async function clear(e: React.FormEvent<HTMLButtonElement>) {
    e.preventDefault()
    await clearMessages()
  }
  return (
    <form onSubmit={submit} className="mt-2 mb-[10vh] flex flex-row gap-2 max-w-2xl">
      <input
        ref={inputRef}
        onChange={(e) => setInput(e.target.value)}
        className="flex-grow border-1 border-gray-700 p-2"
        value={input}
      />
      <button type="submit" className="p-2 bg-blue-500 text-white rounded-md">
        Submit
      </button>
      <button onClick={clear} className="p-2 rounded-md border border-gray-400">
        Clear
      </button>
    </form>
  )
}
