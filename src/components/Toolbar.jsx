import React from 'react'

export default function Toolbar({ listening, onToggleListening, onClear, onOpenSettings }){
  return (
    <div className="toolbar">
      <div className="brand">
        <img className="brand-icon" src="/icon.svg" alt="logo" />
        <h1>OM - Your Personal AI</h1>
      </div>
      <div className="spacer" />
      <button className={['icon-btn', listening && 'active'].join(' ')} onClick={onToggleListening} title="Toggle voice chat (M)">
        <span className={['dot', listening ? 'on':''].join(' ')}></span>
        {listening ? 'Listening…' : 'Voice'}
      </button>
      <button className="icon-btn" onClick={onOpenSettings} title="Settings">
        ⚙︎ Settings
      </button>
      <button className="icon-btn" onClick={onClear} title="Clear chat (Ctrl/Cmd+L)">
        🧹 Clear
      </button>
      <span className="icon-btn" title="Shortcuts">
        ⌨︎ <span className="kbd">Ctrl/Cmd+K</span> focus
      </span>
    </div>
  )
}
