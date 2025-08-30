import React from 'react'

export default function SettingsPanel({
  onClose,
  voices, voiceName, onVoiceName,
  rate, onRate,
  pitch, onPitch,
  autoSpeak, onAutoSpeak,
  streamTyping, onStreamTyping
}){
  return (
    <div className="settings">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h3>Assistant Settings</h3>
        <button className="icon-btn" onClick={onClose}>✕ Close</button>
      </div>

      <label>Voice</label>
      <select value={voiceName} onChange={e => onVoiceName(e.target.value)}>
        <option value="">System Default</option>
        {voices.map(v => <option key={v.name} value={v.name}>{v.name} {v.lang ? `(${v.lang})` : ''}</option>)}
      </select>

      <label>Speech rate: {rate.toFixed(2)}</label>
      <input type="range" min="0.5" max="1.8" step="0.05" value={rate} onChange={e => onRate(Number(e.target.value))} />

      <label>Speech pitch: {pitch.toFixed(2)}</label>
      <input type="range" min="0.5" max="2" step="0.05" value={pitch} onChange={e => onPitch(Number(e.target.value))} />

      <div className="row">
        <label>Auto speak replies</label>
        <input type="checkbox" checked={autoSpeak} onChange={e => onAutoSpeak(e.target.checked)} />
      </div>

      <div className="row">
        <label>Type-out animation</label>
        <input type="checkbox" checked={streamTyping} onChange={e => onStreamTyping(e.target.checked)} />
      </div>

      <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 10 }}>
        Tip: Press <span className="kbd">M</span> to toggle voice listening.
      </p>
    </div>
  )
}
