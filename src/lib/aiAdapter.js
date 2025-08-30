// Simple pluggable AI adapter.
// Replace 'USE_MOCK' with false and implement your API call if you have a backend.

const USE_MOCK = true

export async function chat(history, attachments){
  if(!USE_MOCK){
    // Example:
    // const res = await fetch('/api/chat', {
    //   method: 'POST',
    //   headers: { 'content-type': 'application/json' },
    //   body: JSON.stringify({ history, attachments })
    // })
    // const data = await res.json()
    // return data.reply
  }

  const last = history.filter(m => m.role === 'user').slice(-1)[0]
  const text = (last?.text || '').trim()
  const attCount = (last?.attachments || []).length

  // cute mock behaviors
  if(text.toLowerCase().includes('help')){
    return [
      'Here are a few things you can try:',
      '• Speak out loud — toggle Voice to start/stop listening',
      '• Drag & drop images or files; I will acknowledge them',
      '• Open Settings to change my voice, rate and pitch',
      '• Use shortcuts: Ctrl/Cmd+K to focus, M to toggle mic'
    ].join('\n')
  }
  if(text.match(/(hi|hello|hey)\b/i)){
    return 'Hello! 👋 How can I help today? You can also press M to talk.'
  }
  if(attCount > 0){
    const names = last.attachments.map(a => a.name).join(', ')
    return `Got ${attCount} attachment${attCount>1?'s':''}: ${names}. I can\'t analyze content locally, but your backend could!`
  }
  if(text.endsWith('?')){
    return 'Great question! In this demo I\'m a local mock. Connect me to your API in src/lib/aiAdapter.js to answer for real.'
  }
  if(text.length < 2){
    return 'Say anything — I\'m listening 👂'
  }
  // default playful echo
  return 'You said: ' + text
}
