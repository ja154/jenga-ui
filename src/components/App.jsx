

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
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.classList.toggle('light', !isDark);
    }
  }, [isDark])

  const inputSection = (
    <section className="flex flex-wrap gap-[15px] items-end justify-center w-full max-w-6xl bg-glass-bg-secondary border border-glass-border-primary rounded-xl p-5 backdrop-blur-xl">
      <div
        className="relative flex flex-col gap-1.5"
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
        <p className="flex items-center border border-border-primary whitespace-nowrap rounded-md py-2.5 pr-9 pl-2.5 min-w-[145px] cursor-default h-9 after:content-['▾'] after:absolute after:scale-y-100 after:scale-x-140 after:top-1/2 after:right-2.5 after:-translate-y-1/2 after:text-text-tertiary">
          {modes[outputMode].emoji} {modes[outputMode].name}
        </p>
        <div className={c('absolute bottom-12 w-fit bg-bg-primary border border-border-primary rounded-md p-2.5 max-h-[30vh] overflow-auto opacity-0 transition-all duration-200 ease-out pointer-events-none z-10 translate-y-1.5 origin-bottom max-w-[70vw]', {'opacity-100 pointer-events-auto translate-y-0': showOutputModes})}>
          <ul className="flex flex-col gap-2">
            {Object.keys(modes).map(key => (
              <li key={key}>
                <button
                  className={c('py-2 px-2.5 rounded-md bg-bg-quaternary text-text-primary text-left leading-normal whitespace-nowrap hover:brightness-[var(--hover-brightness)]', {'bg-primary text-white': key === outputMode})}
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
        <div className="text-xs text-text-tertiary">Output</div>
      </div>

      <div
        className="relative flex flex-col gap-1.5"
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
        <p className="flex items-center border border-border-primary whitespace-nowrap rounded-md py-2.5 pr-9 pl-2.5 min-w-[145px] cursor-default h-9 after:content-['▾'] after:absolute after:scale-y-100 after:scale-x-140 after:top-1/2 after:right-2.5 after:-translate-y-1/2 after:text-text-tertiary">
          {batchMode
            ? models[batchModel].name
            : Object.keys(versusModels).filter(key => versusModels[key])
                .length + ' selected'}
        </p>
        <div className={c('absolute bottom-12 w-fit bg-bg-primary border border-border-primary rounded-md p-2.5 max-h-[30vh] overflow-auto opacity-0 transition-all duration-200 ease-out pointer-events-none z-10 translate-y-1.5 origin-bottom max-w-[70vw]', {'opacity-100 pointer-events-auto translate-y-0': showModels})}>
          <ul className="flex flex-col gap-2">
            {Object.keys(models).map(key => (
              <li key={key}>
                <button
                  className={c('py-2 px-2.5 rounded-md bg-bg-quaternary text-text-primary text-left leading-normal whitespace-nowrap hover:brightness-[var(--hover-brightness)]', {
                    'bg-primary text-white': batchMode
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
        <div className="text-xs text-text-tertiary">Model{batchMode ? '' : 's'}</div>
      </div>

      <div className="flex flex-col min-w-[150px]">
        <div className="flex-1 flex items-center">
          <div className="flex items-center gap-2 mb-1.5 w-full">
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
        <div className="text-xs text-text-tertiary">Creativity</div>
      </div>

      <div
        className="relative flex flex-col gap-1.5 flex-grow flex-shrink basis-52 min-w-52"
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
        <div className="flex flex-col gap-1.5">
          {outputMode === 'clone' && (
            <input
              className="border border-primary p-2.5 rounded-md text-xs w-full h-9 overflow-hidden focus:bg-white/5"
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
              className="border border-primary p-2.5 rounded-md text-xs w-full h-20 min-h-9 resize-y focus:bg-white/5"
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
              className="border border-primary p-2.5 rounded-md text-xs w-full h-9 overflow-hidden focus:bg-white/5"
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
        <div className={c('absolute bottom-12 w-fit bg-bg-primary border border-border-primary rounded-md p-2.5 max-h-[370px] overflow-auto opacity-0 transition-all duration-200 ease-out pointer-events-none z-10 translate-y-1.5 origin-bottom max-w-[70vw]', {'opacity-100 pointer-events-auto translate-y-0': showPresets})}>
          <ul className="flex flex-col gap-2 presets wrapped">
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
                  className="py-2 px-2.5 rounded-md bg-primary text-white text-left leading-normal whitespace-nowrap flex items-center gap-1"
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
                  className="py-2 px-2.5 rounded-md bg-bg-quaternary text-text-primary text-left leading-normal whitespace-nowrap hover:brightness-[var(--hover-brightness)]"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-xs text-text-tertiary">
          {outputMode === 'clone' ? 'URL & Prompt' :
          outputMode === 'refactor' ? 'Code' :
          'Prompt'}
        </div>
      </div>

      <div className="flex flex-col">
        <button
          className="inline-flex py-2.5 px-2.5 rounded-lg gap-1 items-center justify-center bg-primary text-white relative transition-all filter hover:brightness-110 active:top-px active:brightness-90 animate-float"
          onClick={handleGenerate}
          aria-label="Generate output"
        >
          <span className="icon">auto_awesome</span>
          Generate
          <span className="tooltip right">Cmd/Ctrl + Enter</span>
        </button>
      </div>

      {batchMode && (
        <div className="flex flex-col">
          <div className="flex-1 flex items-center">
            <div className="flex items-center gap-2 mb-1.5">
              <input
                type="range"
                min={1}
                max={9}
                value={batchSize}
                onChange={e => setBatchSize(e.target.valueAsNumber)}
                className="w-[70px] p-0"
              />{' '}
              {batchSize}
            </div>
          </div>
          <div className="text-xs text-text-tertiary">Batch size</div>
        </div>
      )}
    </section>
  );


  return (
    <div className={isIframe ? '' : isDark ? 'dark' : 'light'}>
      <header className="sticky top-0 left-0 right-0 z-20 flex flex-wrap gap-4 items-center justify-between p-3 px-5 min-h-[82px] bg-glass-bg-primary border-b border-glass-border-primary backdrop-blur-xl text-text-primary">
        <div>
          <h1>
            <p>
              Jenga<span>🧱</span>
            </p>
            <p>Ui</p>
          </h1>
        </div>

        <div className="flex flex-col justify-between gap-1.5">
          <div className="flex gap-px whitespace-nowrap">
            <button
              className={c('inline-flex py-2.5 px-2.5 rounded-lg gap-1 items-center justify-center relative transition-all filter hover:brightness-110 active:top-px active:brightness-90 text-xs rounded-r-none', batchMode ? 'bg-primary text-white' : 'bg-bg-quaternary text-text-tertiary')}
              onClick={() => setBatchMode(true)}
            >
              <span className="icon">stacks</span> Batch
            </button>
            <button
              className={c('inline-flex py-2.5 px-2.5 rounded-lg gap-1 items-center justify-center relative transition-all filter hover:brightness-110 active:top-px active:brightness-90 text-xs rounded-l-none', !batchMode ? 'bg-primary text-white' : 'bg-bg-quaternary text-text-tertiary')}
              onClick={() => setBatchMode(false)}
            >
              <span className="icon">swords</span> Versus
            </button>
          </div>
          <div className="text-xs text-text-tertiary">Mode</div>
        </div>

        <div style={{display: 'flex', gap: '15px'}}>
          <div className="flex flex-col justify-between gap-1.5">
            <button
              className="flex items-center justify-center w-11 h-11 text-2xl rounded-full bg-bg-tertiary text-text-secondary border border-border-primary hover:bg-bg-quaternary hover:text-text-primary hover:border-border-secondary"
              aria-label="Reset session"
              onClick={() => {
                reset()
                inputRef.current.value = ''
                setCloneUrl('');
              }}
            >
              <span className="icon">replay</span>
            </button>
            <div className="text-xs text-text-tertiary">Reset</div>
          </div>

          {!isIframe && (
            <div className="flex flex-col justify-between gap-1.5">
              <button
                className="flex items-center justify-center w-11 h-11 text-2xl rounded-full bg-bg-tertiary text-text-secondary border border-border-primary hover:bg-bg-quaternary hover:text-text-primary hover:border-border-secondary"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                <span className="icon">
                  {isDark ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
              <div className="text-xs text-text-tertiary">Theme</div>
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
            <ul className="flex flex-col gap-5 items-center w-full">
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