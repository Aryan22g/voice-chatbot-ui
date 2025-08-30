import React from 'react'

function BotAvatar(){
  return (
    <div className="avatar" title="Assistant">
      🤖
    </div>
  )
}
function UserAvatar(){
  return (
    <div className="avatar" title="You" style={{ background: '#22d3ee', color: '#003b49' }}>
      😊
    </div>
  )
}

export default function MessageBubble({ msg }){
  const isUser = msg.role === 'user'
  return (
    <div className={['msg', isUser ? 'user' : 'bot'].join(' ')}>
      {isUser ? <UserAvatar/> : <BotAvatar/>}
      <div>
        <div className="bubble">
          <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
          {!!msg.attachments?.length && (
            <div className="attachments">
              {msg.attachments.map((a, i) => (
                a.kind === 'image' ? (
                  <img key={i} src={a.preview} alt={a.name} className="preview-img" />
                ) : (
                  <span key={i} className="file-chip">📎 {a.name} <span style={{ color: 'var(--muted)' }}>({Math.round(a.size/1024)} KB)</span></span>
                )
              ))}
            </div>
          )}
        </div>
        <div className="meta">{new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>
  )
}
