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
  const [chatError, setChatError] = useState('');
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
    if (isBusy) return;

    const trimmedPrompt = chatPrompt.trim();
    if (!trimmedPrompt) {
      setChatError('Please enter an instruction to apply.');
      return;
    }
    
    applyAIChatEdit(trimmedPrompt);
    setChatPrompt('');
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
    <div className="fixed inset-0 z-30 bg-bg-primary flex flex-col animate-fadeIn">
      <header className="flex justify-between items-center p-3 px-5 border-b border-border-primary flex-shrink-0">
        <h2 className="text-base flex items-center gap-2.5">
          <span className="icon">edit_note</span>
          Live Editor
        </h2>
        <div className="flex gap-2.5">
          <button className="inline-flex py-2 px-4 rounded-lg gap-1.5 items-center justify-center bg-bg-tertiary text-text-secondary hover:bg-bg-quaternary hover:text-text-primary font-semibold relative transition-all" onClick={stopEditing}>
            <span className="icon">close</span> Close
          </button>
          <button
            className="inline-flex py-2 px-4 rounded-lg gap-1.5 items-center justify-center bg-primary text-white font-semibold relative transition-all filter hover:brightness-110 active:scale-[0.98]"
            onClick={saveAndStopEditing}
            disabled={isBusy}
          >
            <span className="icon">save</span> Save &amp; Close
          </button>
        </div>
      </header>
      <div className="flex flex-grow overflow-hidden">
        <div className="flex flex-col flex-1 min-w-[300px] border-r border-border-primary">
          <div className="flex-grow">
            <textarea
              className="w-full h-full p-4 border-none bg-bg-secondary text-text-primary font-mono text-sm leading-relaxed resize-none outline-none"
              value={code}
              onChange={e => updateEditingCode(e.target.value)}
              spellCheck="false"
              autoFocus
            />
          </div>
          <div className="flex-shrink-0 p-2.5 px-4 border-t border-border-primary bg-bg-tertiary">
            <form className="flex items-center gap-2.5" onSubmit={handleTextSubmit}>
              <div className="flex-grow flex flex-col">
                <input
                  className={c('w-full bg-bg-secondary p-2.5 rounded-lg border focus:border-primary', chatError ? 'border-error' : 'border-border-secondary')}
                  type="text"
                  value={chatPrompt}
                  onChange={e => {
                    setChatPrompt(e.target.value);
                    if (chatError) setChatError('');
                  }}
                  placeholder={isListening ? 'Listening...' : "e.g., make the button blue"}
                  disabled={isBusy || isListening}
                  aria-invalid={!!chatError}
                  aria-describedby={chatError ? "chat-error" : undefined}
                />
                {chatError && <p id="chat-error" className="text-error text-xs mt-1" role="alert">{chatError}</p>}
              </div>
               <button
                type="button"
                className={c('flex items-center justify-center bg-bg-quaternary text-text-senary rounded-full w-9 h-9 text-xl transition-all duration-200 ease-out hover:bg-bg-quinary hover:text-text-primary flex-shrink-0', {'bg-error text-white animate-pulse': isListening})}
                onClick={handleVoiceCommand}
                disabled={isBusy || !recognitionRef.current}
                title="Use Voice Command"
              >
                <span className="icon">mic</span>
              </button>
              <button
                type="submit"
                className="inline-flex h-10 w-24 justify-center items-center py-2.5 px-2.5 rounded-lg gap-1.5 bg-primary text-white font-semibold relative transition-all filter hover:brightness-110 active:scale-[0.98]"
                disabled={isBusy || isListening || !chatPrompt.trim()}
              >
                {isEditingBusy ? (
                  <span className="icon animate-spin">progress_activity</span>
                ) : (
                  <>
                    <span className="icon">auto_fix_high</span> Apply
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        <div className="flex-1 h-full relative">
          <iframe
            className="w-full h-full border-none bg-bg-primary"
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