

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useEffect, useState, useCallback, useRef} from 'react'
import shuffle from 'lodash.shuffle'
import c from 'clsx'
import modes from '../lib/modes'
import models from '../lib/models'
import useStore from '../lib/store'
import {
  addRound,
  setBatchMode,
  setBatchModel,
  setBatchSize,
  setVersusModel,
  reset,
  setOutputMode,
  setTemperature
} from '../lib/actions'
import {isTouch, isIframe} from '../lib/consts'
import FeedItem from './FeedItem'
import Intro from './Intro'
import FullScreenViewer from './FullScreenViewer'
import Editor from './Editor'

export default function App() {
  const feed = useStore.use.feed()
  const outputMode = useStore.use.outputMode()
  const batchModel = useStore.use.batchModel()
  const versusModels = useStore.use.versusModels()
  const batchMode = useStore.use.batchMode()
  const batchSize = useStore.use.batchSize()
  const temperature = useStore.use.temperature()
  const editingOutput = useStore.use.editingOutput()

  const [presets, setPresets] = useState([])
  const [showPresets, setShowPresets] = useState(false)
  const [showModels, setShowModels] = useState(false)
  const [showOutputModes, setShowOutputModes] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [fullscreenOutput, setFullscreenOutput] = useState(null)
  const [cloneUrl, setCloneUrl] = useState('')

  const inputRef = useRef(null)

  const shufflePresets = useCallback(
    () => setPresets(shuffle(modes[outputMode].presets)),
    [outputMode]
  )

  const onModifyPrompt = useCallback(prompt => {
    inputRef.current.value = prompt
    inputRef.current.focus()
  }, [])

  const handleGenerate = useCallback(() => {
    const prompt = inputRef.current.value;
    if (outputMode === 'clone') {
      addRound(prompt, { cloneUrl });
    } else {
      addRound(prompt);
    }
    inputRef.current.blur();
  }, [outputMode, cloneUrl]);

  const toggleTheme = useCallback(() => {
    setIsDark(!isDark)
  }, [isDark])

  useEffect(() => {
    shufflePresets()
  }, [shufflePresets])

  useEffect(() => {
    if (isTouch) {
      addEventListener('touchstart', () => {
        setShowModels(false)
        setShowPresets(false)
        setShowOutputModes(false)
      })
    }
  }, [])

  useEffect(() => {
    if (!isIframe) {
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
    }
  }, [isDark])

  const inputSection = (
    <section className="input-area">
      <div
        className="selectorWrapper"
        onMouseEnter={!isTouch && (() => setShowOutputModes(true))}
        onMouseLeave={!isTouch && (() => setShowOutputModes(false))}
        onTouchStart={
          isTouch
            ? e => {
                e.stopPropagation()
                setShowOutputModes(true)
                setShowModels(false)
                setShowPresets(false)
              }
            : null
        }
      >
        <p>
          {modes[outputMode].emoji} {modes[outputMode].name}
        </p>
        <div className={c('selector', {active: showOutputModes})}>
          <ul>
            {Object.keys(modes).map(key => (
              <li key={key}>
                <button
                  className={c('chip', {primary: key === outputMode})}
                  onClick={() => {
                    setOutputMode(key)
                    setShowOutputModes(false)
                  }}
                >
                  {modes[key].emoji} {modes[key].name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="label">Output</div>
      </div>

      <div
        className="selectorWrapper"
        onMouseEnter={!isTouch && (() => setShowModels(true))}
        onMouseLeave={!isTouch && (() => setShowModels(false))}
        onTouchStart={
          isTouch
            ? e => {
                e.stopPropagation()
                setShowModels(true)
                setShowPresets(false)
                setShowOutputModes(false)
              }
            : null
        }
      >
        <p>
          {batchMode
            ? models[batchModel].name
            : Object.keys(versusModels).filter(key => versusModels[key])
                .length + ' selected'}
        </p>
        <div className={c('selector', {active: showModels})}>
          <ul>
            {Object.keys(models).map(key => (
              <li key={key}>
                <button
                  className={c('chip', {
                    primary: batchMode
                      ? key === batchModel
                      : versusModels[key]
                  })}
                  onClick={() => {
                    if (batchMode) {
                      setBatchModel(key)
                      setShowModels(false)
                    } else {
                      setVersusModel(key, !versusModels[key])
                    }
                  }}
                >
                  {models[key].name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="label">Model{batchMode ? '' : 's'}</div>
      </div>

      <div>
        <div className="rangeWrap">
          <div className="temperatureControl">
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={temperature}
              onChange={e => setTemperature(e.target.valueAsNumber)}
            />{' '}
            {temperature.toFixed(1)}
          </div>
        </div>
        <div className="label">Creativity</div>
      </div>

      <div
        className="selectorWrapper prompt"
        onMouseEnter={!isTouch && (() => setShowPresets(true))}
        onMouseLeave={!isTouch && (() => setShowPresets(false))}
        onTouchStart={
          isTouch
            ? e => {
                e.stopPropagation()
                setShowPresets(true)
                setShowModels(false)
                setShowOutputModes(false)
              }
            : null
        }
      >
        <div className="prompt-input-container">
          {outputMode === 'clone' && (
            <input
              className="promptInput url-input"
              placeholder="URL to clone or Figma frame link"
              value={cloneUrl}
              onChange={e => setCloneUrl(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  inputRef.current.focus();
                }
              }}
            />
          )}

          {['refactor', 'clone'].includes(outputMode) ? (
            <textarea
              className="promptInput"
              placeholder={
                outputMode === 'clone'
                  ? 'Describe your desired changes... (Cmd/Ctrl+Enter)'
                  : 'Paste your code here to refactor it... (Cmd/Ctrl+Enter)'
              }
              onFocus={!isTouch && (() => setShowPresets(false))}
              ref={inputRef}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
          ) : (
            <input
              className="promptInput"
              placeholder="e.g., a futuristic dashboard UI"
              onFocus={!isTouch && (() => setShowPresets(false))}
              ref={inputRef}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
          )}
        </div>
        <div className={c('selector', {active: showPresets})}>
          <ul className="presets wrapped">
            {outputMode === 'html' && (
              <li>
                <button
                  onClick={() => {
                    const randomPrompt =
                      presets[Math.floor(Math.random() * presets.length)]
                        .prompt;
                    onModifyPrompt(randomPrompt);
                    addRound(randomPrompt);
                    setShowPresets(false);
                  }}
                  className="chip primary"
                >
                  <span className="icon">Ifl</span>
                  Random prompt
                </button>
              </li>
            )}

            {presets.map(({label, prompt}) => (
              <li key={label}>
                <button
                  onClick={() => {
                    onModifyPrompt(prompt);
                    if (outputMode !== 'clone') {
                      addRound(prompt);
                    }
                    setShowPresets(false);
                  }}
                  className="chip"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="label">
          {outputMode === 'clone' ? 'URL & Prompt' :
          outputMode === 'refactor' ? 'Code' :
          'Prompt'}
        </div>
      </div>

      <div>
        <button
          className="button primary floating"
          onClick={handleGenerate}
          aria-label="Generate output"
        >
          <span className="icon">auto_awesome</span>
          Generate
          <span className="tooltip right">Cmd/Ctrl + Enter</span>
        </button>
      </div>

      {batchMode && (
        <div>
          <div className="rangeWrap">
            <div className="batchSize">
              <input
                type="range"
                min={1}
                max={9}
                value={batchSize}
                onChange={e => setBatchSize(e.target.valueAsNumber)}
              />{' '}
              {batchSize}
            </div>
          </div>
          <div className="label">Batch size</div>
        </div>
      )}
    </section>
  );


  return (
    <div className={isIframe ? '' : isDark ? 'dark' : 'light'}>
      <header>
        <div>
          <h1>
            <p>
              Jenga<span>🧱</span>
            </p>
            <p>Ui</p>
          </h1>
        </div>

        <div>
          <div className="toggle">
            <button
              className={c('button', {primary: batchMode})}
              onClick={() => setBatchMode(true)}
            >
              <span className="icon">stacks</span> Batch
            </button>
            <button
              className={c('button', {primary: !batchMode})}
              onClick={() => setBatchMode(false)}
            >
              <span className="icon">swords</span> Versus
            </button>
          </div>
          <div className="label">Mode</div>
        </div>

        <div style={{display: 'flex', gap: '15px'}}>
          <div>
            <button
              className="circleButton resetButton"
              aria-label="Reset session"
              onClick={() => {
                reset()
                inputRef.current.value = ''
                setCloneUrl('');
              }}
            >
              <span className="icon">replay</span>
            </button>
            <div className="label">Reset</div>
          </div>

          {!isIframe && (
            <div>
              <button
                className="circleButton resetButton"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                <span className="icon">
                  {isDark ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
              <div className="label">Theme</div>
            </div>
          )}
        </div>
      </header>

      <main>
        {feed.length === 0 ? (
          <Intro inputSection={inputSection} />
        ) : (
          <>
            {inputSection}
            <ul className="feed">
              {feed.map(round => (
                <FeedItem
                  key={round.id}
                  round={round}
                  onModifyPrompt={onModifyPrompt}
                  onViewFullScreen={setFullscreenOutput}
                />
              ))}
            </ul>
          </>
        )}
      </main>
        
      {fullscreenOutput && (
        <FullScreenViewer
          htmlContent={fullscreenOutput}
          onClose={() => setFullscreenOutput(null)}
        />
      )}

      {editingOutput && <Editor />}
    </div>
  )
}