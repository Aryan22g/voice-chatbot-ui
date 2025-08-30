import React, { useEffect, useMemo, useRef, useState } from 'react'
import ChatWindow from './components/ChatWindow.jsx'
import Composer from './components/Composer.jsx'
import Toolbar from './components/Toolbar.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import { speak, listVoices, supportsRecognition, startRecognition, stopRecognition } from './lib/speech.js'
import { chat as callAI } from './lib/aiAdapter.js'

const initialBotMsg = {
  id: crypto.randomUUID(),
  role: 'bot',
  text: 'Hey! I\'m your voice-enabled chat. Type, talk, or drop files — I\'ll respond and read replies out loud if you like.',
  ts: Date.now()
}

export default function App(){
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chat.history')
    return saved ? JSON.parse(saved) : [initialBotMsg]
  })
  const [listening, setListening] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [voices, setVoices] = useState([])
  const [voiceName, setVoiceName] = useState(localStorage.getItem('voice.name') || '')
  const [speechRate, setSpeechRate] = useState(Number(localStorage.getItem('voice.rate') || 1))
  const [speechPitch, setSpeechPitch] = useState(Number(localStorage.getItem('voice.pitch') || 1))
  const [autoSpeak, setAutoSpeak] = useState(localStorage.getItem('voice.auto') === 'true')
  const [streamTyping, setStreamTyping] = useState(localStorage.getItem('typing.stream') !== 'false')
  const inputRef = useRef(null)

  useEffect(() => {
    const v = listVoices()
    setVoices(v)
    const onChange = () => setVoices(listVoices())
    window.speechSynthesis?.addEventListener('voiceschanged', onChange)
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', onChange)
  }, [])

  useEffect(() => {
    localStorage.setItem('chat.history', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    localStorage.setItem('voice.name', voiceName)
    localStorage.setItem('voice.rate', String(speechRate))
    localStorage.setItem('voice.pitch', String(speechPitch))
    localStorage.setItem('voice.auto', String(autoSpeak))
    localStorage.setItem('typing.stream', String(streamTyping))
  }, [voiceName, speechRate, speechPitch, autoSpeak, streamTyping])

  // Speech recognition handlers
  useEffect(() => {
    if(!supportsRecognition()) return
    if(listening){
      startRecognition({
        onResult: (finalText) => {
          handleSend(finalText)
        },
        onError: (err) => {
          console.error('Recognition error', err)
          setListening(false)
        },
        interimCb: (txt) => {
          // could show interim text somewhere if desired
        }
      })
    }else{
      stopRecognition()
    }
    return () => stopRecognition()
  }, [listening])

  const handleSend = async (text, attachments=[]) => {
    if(!text && attachments.length === 0) return
    const userMsg = { id: crypto.randomUUID(), role: 'user', text, ts: Date.now(), attachments }
    setMessages(prev => [...prev, userMsg, { id: 'typing', role: 'bot', text: '…', typing: true, ts: Date.now() }])

    try{
      const responseText = await callAI([...messages, userMsg], attachments)
      if(streamTyping){
        await streamIn(responseText)
      }else{
        setMessages(prev => prev.filter(m => m.id !== 'typing').concat({ id: crypto.randomUUID(), role: 'bot', text: responseText, ts: Date.now() }))
      }
      if(autoSpeak && responseText) speak(responseText, { voiceName, rate: speechRate, pitch: speechPitch })
    }catch(e){
      console.error(e)
      setMessages(prev => prev.filter(m => m.id !== 'typing').concat({ id: crypto.randomUUID(), role: 'bot', text: 'Oops, something went wrong.', ts: Date.now() }))
    }
  }

  async function streamIn(full){
    const tokens = full.split(/(\s+)/)
    let acc = ''
    for(const t of tokens){
      acc += t
      await new Promise(r => setTimeout(r, Math.min(40 + Math.random()*60, 120)))
      setMessages(prev => prev.map(m => m.id === 'typing' ? { ...m, text: acc } : m))
    }
    setMessages(prev => prev.map(m => m.id === 'typing' ? { ...m, id: crypto.randomUUID(), typing: false, text: acc, ts: Date.now() } : m))
  }

  function clearChat(){
    setMessages([initialBotMsg])
  }

  function toggleListening(){
    if(!supportsRecognition()){
      alert('Speech recognition is not supported in this browser. Try Chrome on desktop.')
      return
    }
    setListening(v => !v)
  }

  function focusInput(){
    inputRef.current?.focus()
  }

  useEffect(() => {
    const onKey = (e) => {
      if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); focusInput() }
      if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'l'){ e.preventDefault(); clearChat() }
      if(e.key.toLowerCase() === 'm' && !e.metaKey && !e.ctrlKey){ e.preventDefault(); toggleListening() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="app-wrap">
      <Toolbar
        listening={listening}
        onToggleListening={toggleListening}
        onClear={clearChat}
        onOpenSettings={() => setShowSettings(s => !s)}
      />
      <div className="content">
        {messages.length === 0 ? (
          <div className="empty">Start chatting…</div>
        ) : (
          <ChatWindow messages={messages} />
        )}
      </div>
      <Composer
        onSend={handleSend}
        inputRef={inputRef}
      />
      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          voices={voices}
          voiceName={voiceName} onVoiceName={setVoiceName}
          rate={speechRate} onRate={setSpeechRate}
          pitch={speechPitch} onPitch={setSpeechPitch}
          autoSpeak={autoSpeak} onAutoSpeak={setAutoSpeak}
          streamTyping={streamTyping} onStreamTyping={setStreamTyping}
        />
      )}
    </div>
  )
}
