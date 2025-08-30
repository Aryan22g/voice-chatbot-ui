import React, { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble.jsx'

export default function ChatWindow({ messages }){
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if(!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div className="chat" ref={ref}>
      {messages.map(m => <MessageBubble key={m.id} msg={m} />)}
    </div>
  )
}
