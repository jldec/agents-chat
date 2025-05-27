'use client'
import { useState } from 'react'
import { newMessage, clearMessages } from './functions'

export function MessageInput() {
  const [input, setInput] = useState('')
  const [lastId, setLastId] = useState('')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (input.trim() === '') return
    const lastId = await newMessage(input)
    setLastId(lastId)
    setInput('')
  }
  async function clear(e: React.FormEvent<HTMLButtonElement>) {
    e.preventDefault()
    await clearMessages()
  }
  return (
    <form onSubmit={submit} className='mt-2 flex flex-row items-end gap-2'>
      <input onChange={(e) => setInput(e.target.value)} className="border border-gray-700 p-2" value={input} />
      <button type="submit" className="p-2 bg-blue-500 text-white rounded-md">
        Submit
      </button>
      <button onClick={clear} className='p-2 rounded-md border border-gray-400'>Clear</button>
      <span className="text-gray-500">{lastId}</span>
    </form>
  )
}
