'use client'
import { useEffect, useState } from 'react'

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  fallback = fallback ?? <div className="flex justify-center items-center h-screen">Loading...</div>

  return isClient ? children : fallback
}
