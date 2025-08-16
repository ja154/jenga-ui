/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {useState} from 'react'
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

  if (!editingOutput) return null

  const {code, isEditingBusy} = editingOutput

  const handleSubmit = e => {
    e.preventDefault()
    if (!chatPrompt.trim() || isEditingBusy) return
    applyAIChatEdit(chatPrompt)
    setChatPrompt('')
  }

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
          <button className="button primary" onClick={saveAndStopEditing}>
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
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={chatPrompt}
                onChange={e => setChatPrompt(e.target.value)}
                placeholder="e.g., make the button blue"
                disabled={isEditingBusy}
              />
              <button
                type="submit"
                className={c('button primary', {loading: isEditingBusy})}
                disabled={isEditingBusy}
              >
                <span className="icon">auto_fix_high</span> Apply
              </button>
            </form>
          </div>
        </div>
        <div className="editor-preview-pane">
          <iframe srcDoc={code} sandbox="allow-same-origin allow-scripts" />
        </div>
      </div>
    </div>
  )
}
