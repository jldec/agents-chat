'use client'
import { useEffect } from 'react'

interface ObserveDOMProps {
  nodeId: string
}

export function ObserveDOM({ nodeId }: ObserveDOMProps) {
  useEffect(() => {
    const node = document.getElementById(nodeId)
    if (!node) return

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const target = mutation.target
        const id = (target as HTMLElement).id
        const content_length = (target as HTMLElement).textContent?.length
        console.log(target.nodeName, id || content_length || '')
      })
    })

    observer.observe(node, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    })

    return () => observer.disconnect()
  }, [nodeId])

  return <div></div>
}
