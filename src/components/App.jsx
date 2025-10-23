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
  setTemperature,
  toggleTheme
} from '../lib/actions'
import {isTouch, isIframe, figmaUrlRegex} from '../lib/consts'
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
  const isDark = useStore.use.isDark();

  const [presets, setPresets] = useState([])
  const [showPresets, setShowPresets] = useState(false)
  const [showModels, setShowModels] = useState(false)
  const [showOutputModes, setShowOutputModes] = useState(false)
  const [fullscreenOutput, setFullscreenOutput] = useState(null)
  const [cloneUrl, setCloneUrl] = useState('')
  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  const inputRef = useRef(null)

  const shufflePresets = useCallback(
    () => setPresets(shuffle(modes[outputMode].presets)),
    [outputMode]
  )

  const onModifyPrompt = useCallback(prompt => {
    inputRef.current.value = prompt
    inputRef.current.focus()
    setErrors({});
  }, [])

  const validateInputs = useCallback(() => {
    const newErrors = {};
    const promptValue = inputRef.current.value.trim();

    if (!promptValue) {
      if (outputMode === 'clone') {
        newErrors.prompt = 'Please describe your desired changes.';
      } else if (outputMode === 'refactor') {
        newErrors.prompt = 'Please paste your code to refactor.';
      } else {
        newErrors.prompt = 'Please enter a prompt.';
      }
    }

    if (outputMode === 'clone') {
      const url = cloneUrl.trim();
      const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6}\.?)(\/[\w.-]*)*\/?$/i;

      if (!url) {
        newErrors.cloneUrl = 'Please enter a URL to clone or a Figma link.';
      } else if (!urlRegex.test(url) && !figmaUrlRegex.test(url)) {
        newErrors.cloneUrl = 'Please enter a valid URL or Figma link.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [outputMode, cloneUrl]);

  const handleGenerate = useCallback(async () => {
    if (isGenerating || !validateInputs()) {
      return;
    }
    setIsGenerating(true);
    const prompt = inputRef.current.value;
    try {
      if (outputMode === 'clone') {
        await addRound(prompt, { cloneUrl });
      } else {
        await addRound(prompt);
      }
    } finally {
      setIsGenerating(false);
    }
    inputRef.current.blur();
  }, [outputMode, cloneUrl, validateInputs, isGenerating]);

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
  
  useEffect(() => {
    setErrors({});
  }, [outputMode]);

  const inputSection = (
    <div className="flex flex-col xl:flex-row gap-6 items-start w-full max-w-7xl">
      {/* Settings Card */}
      <div className="w-full xl:w-auto bg-glass-bg-secondary border border-glass-border-primary rounded-2xl p-5 backdrop-blur-xl glow-card">
        <h3 className="font-bold text-text-secondary mb-4 text-sm">Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-2 gap-4 items-end">
          {/* Output Mode */}
          <div
            className="flex flex-col gap-1.5 relative"
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
            <div className="text-xs text-text-tertiary">Output</div>
            <p className="flex items-center border border-border-primary whitespace-nowrap rounded-lg py-2.5 pr-9 pl-2.5 min-w-[145px] cursor-default h-10 after:content-['▾'] after:absolute after:scale-y-100 after:scale-x-140 after:top-1/2 after:right-2.5 after:-translate-y-1/2 after:text-text-tertiary">
              {modes[outputMode].emoji} {modes[outputMode].name}
            </p>
            <div className={c('absolute top-full mt-2 w-fit bg-bg-primary border border-border-primary rounded-lg p-2.5 max-h-[30vh] overflow-auto opacity-0 transition-all duration-200 ease-out pointer-events-none z-10 -translate-y-1.5 origin-top max-w-[70vw] shadow-lg', {'opacity-100 pointer-events-auto translate-y-0': showOutputModes})}>
              <ul className="flex flex-col gap-2">
                {Object.keys(modes).map(key => (
                  <li key={key}>
                    <button
                      className={c('py-2 px-2.5 rounded-lg bg-bg-quaternary text-text-primary text-left leading-normal whitespace-nowrap hover:brightness-[var(--hover-brightness)] w-full', {'bg-primary text-white': key === outputMode})}
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
          </div>
          {/* Model */}
          <div
            className="flex flex-col gap-1.5 relative"
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
            <div className="text-xs text-text-tertiary">Model{batchMode ? '' : 's'}</div>
            <p className="flex items-center border border-border-primary whitespace-nowrap rounded-lg py-2.5 pr-9 pl-2.5 min-w-[145px] cursor-default h-10 after:content-['▾'] after:absolute after:scale-y-100 after:scale-x-140 after:top-1/2 after:right-2.5 after:-translate-y-1/2 after:text-text-tertiary">
              {batchMode
                ? models[batchModel].name
                : Object.keys(versusModels).filter(key => versusModels[key])
                    .length + ' selected'}
            </p>
            <div className={c('absolute top-full mt-2 w-fit bg-bg-primary border border-border-primary rounded-lg p-2.5 max-h-[30vh] overflow-auto opacity-0 transition-all duration-200 ease-out pointer-events-none z-10 -translate-y-1.5 origin-top max-w-[70vw] shadow-lg', {'opacity-100 pointer-events-auto translate-y-0': showModels})}>
              <ul className="flex flex-col gap-2">
                {Object.keys(models).map(key => (
                  <li key={key}>
                    <button
                      className={c('py-2 px-2.5 rounded-lg bg-bg-quaternary text-text-primary text-left leading-normal whitespace-nowrap hover:brightness-[var(--hover-brightness)] w-full', {
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
          </div>
          {/* Creativity */}
          <div className="flex flex-col gap-1.5 min-w-[150px]">
            <div className="text-xs text-text-tertiary">Creativity</div>
            <div className="flex items-center gap-3 w-full h-10">
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={temperature}
                onChange={e => setTemperature(e.target.valueAsNumber)}
              />
              {temperature.toFixed(1)}
            </div>
          </div>
          {/* Batch Size */}
          {batchMode && (
            <div className="flex flex-col gap-1.5">
              <div className="text-xs text-text-tertiary">Batch size</div>
              <div className="flex items-center gap-2 h-10">
                <input
                  type="range"
                  min={1}
                  max={9}
                  value={batchSize}
                  onChange={e => setBatchSize(e.target.valueAsNumber)}
                  className="w-[70px] p-0"
                />
                {batchSize}
              </div>
            </div>
          )}
        </div>
      </div>
  
      {/* Prompt Card */}
      <div className="w-full flex-grow bg-glass-bg-secondary border border-glass-border-primary rounded-2xl p-5 backdrop-blur-xl glow-card">
        <h3 className="font-bold text-text-secondary mb-4 text-sm">
          {outputMode === 'clone' ? 'URL & Prompt' :
          outputMode === 'refactor' ? 'Code' :
          'Prompt'}
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div
            className="relative flex flex-col gap-1.5 flex-grow w-full"
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
                <div className="flex flex-col">
                  <input
                    className={c("border p-2.5 rounded-lg text-xs w-full h-10 overflow-hidden focus:bg-white/5 focus:ring-2 focus:ring-primary/50", errors.cloneUrl ? 'border-error' : 'border-primary')}
                    placeholder="URL to clone or Figma frame link"
                    value={cloneUrl}
                    onChange={e => {
                      setCloneUrl(e.target.value);
                      if (errors.cloneUrl) setErrors(prev => ({...prev, cloneUrl: null}));
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        inputRef.current.focus();
                      }
                    }}
                    aria-invalid={!!errors.cloneUrl}
                    aria-describedby={errors.cloneUrl ? 'clone-url-error' : undefined}
                  />
                  {errors.cloneUrl && <p id="clone-url-error" className="text-error text-xs mt-1" role="alert">{errors.cloneUrl}</p>}
                </div>
              )}
              <div className="flex flex-col">
                <textarea
                  ref={inputRef}
                  className={c("border p-2.5 rounded-lg text-xs w-full overflow-hidden focus:bg-white/5 focus:ring-2 focus:ring-primary/50", errors.prompt ? 'border-error' : 'border-primary', outputMode === 'refactor' ? 'min-h-[120px] font-mono' : 'min-h-[60px]')}
                  placeholder={
                    modes[outputMode].presets[
                      Math.floor(Math.random() * modes[outputMode].presets.length)
                    ].prompt
                  }
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleGenerate();
                    }
                  }}
                  aria-invalid={!!errors.prompt}
                  aria-describedby={errors.prompt ? 'prompt-error' : undefined}
                />
                {errors.prompt && <p id="prompt-error" className="text-error text-xs mt-1" role="alert">{errors.prompt}</p>}
              </div>
            </div>
            <div className={c('absolute bottom-full mb-2 w-full max-w-full bg-bg-primary border border-border-primary rounded-lg p-2.5 h-auto max-h-[30vh] overflow-auto opacity-0 transition-all duration-200 ease-out pointer-events-none z-10 translate-y-1.5 origin-bottom', {'opacity-100 pointer-events-auto translate-y-0': showPresets})}>
              <ul className="flex flex-wrap flex-row gap-2">
                {presets.map(({label, prompt}) => (
                  <li key={label}>
                    <button
                      onClick={() => onModifyPrompt(prompt)}
                      className="whitespace-normal py-2 px-2.5 rounded-lg bg-bg-quaternary text-text-primary text-left leading-normal hover:brightness-[var(--hover-brightness)]"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button
            className="inline-flex py-2.5 px-4 rounded-lg gap-1.5 items-center justify-center bg-primary text-white font-semibold relative transition-all filter hover:brightness-110 active:scale-[0.98] h-10"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <span className="icon animate-spin">progress_activity</span>
            ) : (
              <>
                <span className="icon">auto_awesome</span>
                <span>Generate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full min-h-screen bg-bg-primary text-text-primary flex flex-col items-center">
      <header className="sticky top-0 z-20 w-full flex items-center justify-between p-4 px-5 bg-glass-bg-primary border-b border-glass-border-primary backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <h1>
            <span role="img" aria-label="Jenga blocks">🧱</span>
            <span>JengaUI</span>
          </h1>
          <div className="w-px h-6 bg-border-primary hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-bg-tertiary">
            <button
              className={c(
                'py-1.5 px-3 rounded-md gap-1 flex items-center justify-center relative transition-all text-xs font-semibold',
                {
                  'bg-bg-secondary shadow-sm text-text-primary': batchMode,
                  'text-text-tertiary hover:text-text-primary': !batchMode
                }
              )}
              onClick={() => setBatchMode(true)}
            >
              <span className="icon text-base">dashboard</span> Batch
            </button>
            <button
              className={c(
                'py-1.5 px-3 rounded-md gap-1 flex items-center justify-center relative transition-all text-xs font-semibold',
                {
                  'bg-bg-secondary shadow-sm text-text-primary': !batchMode,
                  'text-text-tertiary hover:text-text-primary': !batchMode
                }
              )}
              onClick={() => setBatchMode(false)}
            >
              <span className="icon text-base">compare_arrows</span> Versus
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center justify-center bg-bg-quaternary text-text-senary rounded-full w-10 h-10 text-2xl transition-all duration-200 ease-out hover:bg-bg-quinary hover:text-text-primary"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <span className="icon">{isDark ? 'light_mode' : 'dark_mode'}</span>
            <span className="tooltip">{isDark ? 'Light' : 'Dark'} mode</span>
          </button>
          {feed.length > 0 && (
            <button
              className="flex items-center justify-center bg-bg-quaternary text-text-senary rounded-full w-10 h-10 text-2xl transition-all duration-200 ease-out hover:bg-bg-quinary hover:text-text-primary"
              aria-label="Clear all"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all rounds?')) {
                  reset();
                }
              }}
            >
              <span className="icon">clear_all</span>
              <span className="tooltip">Clear all</span>
            </button>
          )}
        </div>
      </header>

      <main className="w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        {feed.length === 0 ? (
          <Intro inputSection={inputSection} />
        ) : (
          <div className="w-full flex flex-col gap-10">
            {inputSection}
            <ul className="w-full flex flex-col gap-10">
              {feed.map(round => (
                <FeedItem
                  key={round.id}
                  round={round}
                  onModifyPrompt={onModifyPrompt}
                  onViewFullScreen={setFullscreenOutput}
                />
              ))}
            </ul>
          </div>
        )}
      </main>

      {fullscreenOutput && (
        <FullScreenViewer
          htmlContent={fullscreenOutput}
          isDark={isDark}
          onClose={() => setFullscreenOutput(null)}
        />
      )}

      {editingOutput && <Editor />}
    </div>
  )
}