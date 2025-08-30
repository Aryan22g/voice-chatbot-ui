import React, { useEffect, useRef, useState } from 'react'

export default function Composer({ onSend, inputRef }){
  const [value, setValue] = useState('')
  const [files, setFiles] = useState([])
  const dzRef = useRef(null)

  function handleFiles(selected){
    const arr = Array.from(selected || [])
    if(arr.length === 0) return
    const proms = arr.map(file => {
      return new Promise(resolve => {
        if(file.type.startsWith('image/')){
          const fr = new FileReader()
          fr.onload = () => resolve({ kind: 'image', name: file.name, size: file.size, type: file.type, preview: fr.result })
          fr.readAsDataURL(file)
        }else{
          resolve({ kind: 'file', name: file.name, size: file.size, type: file.type })
        }
      })
    })
    Promise.all(proms).then(prepared => setFiles(prev => [...prev, ...prepared]))
  }

  useEffect(() => {
    const dz = dzRef.current
    const onDrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); dz.classList.remove('drag') }
    const onDragOver = (e) => { e.preventDefault(); dz.classList.add('drag') }
    const onDragLeave = () => dz.classList.remove('drag')
    dz.addEventListener('drop', onDrop)
    dz.addEventListener('dragover', onDragOver)
    dz.addEventListener('dragleave', onDragLeave)
    return () => {
      dz.removeEventListener('drop', onDrop)
      dz.removeEventListener('dragover', onDragOver)
      dz.removeEventListener('dragleave', onDragLeave)
    }
  }, [])

  function submit(){
    onSend(value.trim(), files)
    setValue('')
    setFiles([])
    inputRef?.current?.focus()
  }

  function onKeyDown(e){
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="composer">
      <div className="input-wrap" ref={dzRef} title="Drop files here">
        <label className="icon-btn" style={{ gap: 6, cursor: 'pointer' }}>
          <input type="file" multiple hidden onChange={e => handleFiles(e.target.files)} />
          <span>📎</span> Attach
        </label>
        <textarea
          ref={inputRef}
          className="input"
          rows={1}
          placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
          value={value}
          onInput={e => {
            setValue(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
          }}
          onKeyDown={onKeyDown}
        />
        <div className="dropzone">Drop files</div>
      </div>
      <button className="send-btn" onClick={submit} title="Send">
        Send ➤
      </button>
    </div>
  )
}
