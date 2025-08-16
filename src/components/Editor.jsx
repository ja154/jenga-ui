/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useState, useRef, useEffect} from 'react'
import c from 'clsx'
import useStore from '../lib/store'
import {
  updateEditingCode,
  saveAndStopEditing,
  stopEditing,
  applyAIChatEdit
} from '../lib/actions'

export default function Editor() {
  const editingOutput = useStore.use.editingOutput()
  const [chatPrompt, setChatPrompt] = useState('')
  const [iframeKey, setIframeKey] = useState(0)
  const [isListening, setIsListening] = useState(false)

  const iframeRef = useRef(null)
  const recognitionRef = useRef(null)

  const {code, isEditingBusy} = editingOutput || {}
  const isBusy = isEditingBusy

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onresult = event => {
        const transcript = event.results[0][0].transcript
        setChatPrompt(transcript)
        setIsListening(false)
      }

      recognition.onerror = event => {
        console.error('Speech recognition error', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  useEffect(() => {
    setIframeKey(k => k + 1)
  }, [code])

  const handleTextSubmit = e => {
    e.preventDefault()
    if (!chatPrompt.trim() || isBusy) return
    applyAIChatEdit(chatPrompt)
    setChatPrompt('')
  }

  const handleVoiceCommand = () => {
    if (!recognitionRef.current || isBusy) return

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (e) {
        console.error('Could not start speech recognition', e)
        // Might happen if already started, etc.
        setIsListening(false)
      }
    }
  }

  if (!editingOutput) return null

  return (
    <div className="editor-overlay">
      <header className="editor-header">
        <h2>
          <span className="icon">edit_note</span>
          Live Editor
        </h2>
        <div>
          <button className="button" onClick={stopEditing}>
            <span className="icon">close</span> Close
          </button>
          <button
            className="button primary"
            onClick={saveAndStopEditing}
            disabled={isBusy}
          >
            <span className="icon">save</span> Save &amp; Close
          </button>
        </div>
      </header>
      <div className="editor-panes">
        <div className="editor-main-pane">
          <div className="editor-code-pane">
            <textarea
              value={code}
              onChange={e => updateEditingCode(e.target.value)}
              spellCheck="false"
              autoFocus
            />
          </div>
          <div className="editor-chat-pane">
            <form onSubmit={handleTextSubmit}>
              <input
                type="text"
                value={chatPrompt}
                onChange={e => setChatPrompt(e.target.value)}
                placeholder={isListening ? 'Listening...' : "e.g., make the button blue"}
                disabled={isBusy || isListening}
              />
               <button
                type="button"
                className={c('iconButton voice-button', {listening: isListening})}
                onClick={handleVoiceCommand}
                disabled={isBusy || !recognitionRef.current}
                title="Use Voice Command"
              >
                <span className="icon">mic</span>
              </button>
              <button
                type="submit"
                className={c('button primary', {loading: isEditingBusy})}
                disabled={isBusy || isListening}
              >
                <span className="icon">auto_fix_high</span> Apply
              </button>
            </form>
          </div>
        </div>
        <div className="editor-preview-pane">
          <iframe
            key={iframeKey}
            ref={iframeRef}
            srcDoc={code}
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </div>
    </div>
  )
}
