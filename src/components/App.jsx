

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

  const [presets, setPresets] = useState([])
  const [showPresets, setShowPresets] = useState(false)
  const [showModels, setShowModels] = useState(false)
  const [showOutputModes, setShowOutputModes] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    if (isIframe) {
      return true; // Default to dark theme in iframes
    }
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
    } catch (e) {
      // localStorage can be blocked by browser settings
      console.warn('Could not access localStorage for theme', e);
    }
    // Check for system preference. Default to dark if not supported.
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });
  const [fullscreenOutput, setFullscreenOutput] = useState(null)
  const [cloneUrl, setCloneUrl] = useState('')
  const [errors, setErrors] = useState({});

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

  const handleGenerate = useCallback(() => {
    if (!validateInputs()) {
      return;
    }
    const prompt = inputRef.current.value;
    if (outputMode === 'clone') {
      addRound(prompt, { cloneUrl });
    } else {
      addRound(prompt);
    }
    inputRef.current.blur();
  }, [outputMode, cloneUrl, validateInputs]);

  const toggleTheme = useCallback(() => {
    setIsDark(prevIsDark => {
      const newIsDark = !prevIsDark;
      if (!isIframe) {
        try {
          localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
        } catch (e) {
          console.warn('Could not save theme to localStorage', e);
        }
      }
      return newIsDark;
    });
  }, []);

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
    <div className="flex flex-col lg:flex-row gap-4 items-start w-full max-w-6xl">
      {/* Settings Card */}
      <div className="w-full lg:w-auto bg-glass-bg-secondary border border-glass-border-primary rounded-2xl p-4 backdrop-blur-xl glow-card">
        <h3 className="font-bold text-text-secondary mb-4 text-sm">Configuration</h3>
        <div className="flex flex-wrap gap-4 items-end">
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
      <div className="w-full flex-grow bg-glass-bg-secondary border border-glass-border-primary rounded-2xl p-4 backdrop-blur-xl glow-card">
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
                    aria-describedby={errors.cloneUrl ? "clone-url-error" : undefined}
                  />
                  {errors.cloneUrl && <p id="clone-url-error" className="text-error text-xs mt-1.5" role="alert">{errors.cloneUrl}</p>}
                </div>
              )}
  
              {['refactor', 'clone'].includes(outputMode) ? (
                <div className="flex flex-col">
                  <textarea
                    className={c("border p-2.5 rounded-lg text-xs w-full h-20 min-h-10 resize-y focus:bg-white/5 font-mono focus:ring-2 focus:ring-primary/50", errors.prompt ? 'border-error' : 'border-primary')}
                    placeholder={
                      outputMode === 'clone'
                        ? 'Describe your desired changes... (Cmd/Ctrl+Enter)'
                        : 'Paste your code here to refactor it... (Cmd/Ctrl+Enter)'
                    }
                    onFocus={!isTouch && (() => setShowPresets(false))}
                    ref={inputRef}
                    onChange={() => {
                      if (errors.prompt) setErrors(prev => ({ ...prev, prompt: null }));
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                    aria-invalid={!!errors.prompt}
                    aria-describedby={errors.prompt ? "prompt-error" : undefined}
                  />
                  {errors.prompt && <p id="prompt-error" className="text-error text-xs mt-1.5" role="alert">{errors.prompt}</p>}
                </div>
              ) : (
                <div className="flex flex-col">
                  <input
                    className={c("border p-2.5 rounded-lg text-xs w-full h-10 overflow-hidden focus:bg-white/5 focus:ring-2 focus:ring-primary/50", errors.prompt ? 'border-error' : 'border-primary')}
                    placeholder="e.g., a futuristic dashboard UI"
                    onFocus={!isTouch && (() => setShowPresets(false))}
                    ref={inputRef}
                    onChange={() => {
                      if (errors.prompt) setErrors(prev => ({ ...prev, prompt: null }));
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                    aria-invalid={!!errors.prompt}
                    aria-describedby={errors.prompt ? "prompt-error" : undefined}
                  />
                  {errors.prompt && <p id="prompt-error" className="text-error text-xs mt-1.5" role="alert">{errors.prompt}</p>}
                </div>
              )}
            </div>
            <div className={c('absolute bottom-full mb-2 w-fit bg-bg-primary border border-border-primary rounded-lg p-2.5 max-h-[370px] overflow-auto opacity-0 transition-all duration-200 ease-out pointer-events-none z-10 -translate-y-1.5 origin-bottom max-w-[70vw] shadow-lg', {'opacity-100 pointer-events-auto translate-y-0': showPresets})}>
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
                      className="py-2 px-4 rounded-lg bg-primary text-white text-left leading-normal whitespace-nowrap flex items-center gap-1"
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
                      className="py-2 px-2.5 rounded-lg bg-bg-quaternary text-text-primary text-left leading-normal whitespace-nowrap hover:brightness-[var(--hover-brightness)]"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
  
          <div className="flex flex-col w-full sm:w-auto">
            <button
              className="inline-flex py-2.5 px-4 rounded-lg gap-1 items-center justify-center bg-primary text-white relative transition-all filter hover:brightness-110 active:top-px active:brightness-90 animate-float w-full"
              onClick={handleGenerate}
              aria-label="Generate output"
            >
              <span className="icon">auto_awesome</span>
              Generate
              <span className="tooltip right">Cmd/Ctrl + Enter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  

  return (
    <div className={isIframe ? '' : isDark ? 'dark' : 'light'}>
      <header className="sticky top-0 left-0 right-0 z-20 flex flex-wrap gap-4 items-center justify-between p-3 px-5 min-h-[72px] bg-glass-bg-primary border-b border-glass-border-primary backdrop-blur-xl text-text-primary">
        {/* Left side: Title */}
        <div className="flex-1 flex justify-start">
          <h1>
            <p>
              Jenga<span>🧱</span>
            </p>
            <p>Ui</p>
          </h1>
        </div>

        {/* Center: Mode Selector */}
        <div className="flex-none flex flex-col items-center gap-1.5">
          <div className="flex gap-px whitespace-nowrap">
            <button
              className={c('inline-flex py-2.5 px-3 rounded-lg gap-1 items-center justify-center relative transition-all filter hover:brightness-110 active:top-px active:brightness-90 text-xs rounded-r-none', batchMode ? 'bg-primary text-white' : 'bg-bg-quaternary text-text-tertiary')}
              onClick={() => setBatchMode(true)}
            >
              <span className="icon">stacks</span> Batch
            </button>
            <button
              className={c('inline-flex py-2.5 px-3 rounded-lg gap-1 items-center justify-center relative transition-all filter hover:brightness-110 active:top-px active:brightness-90 text-xs rounded-l-none', !batchMode ? 'bg-primary text-white' : 'bg-bg-quaternary text-text-tertiary')}
              onClick={() => setBatchMode(false)}
            >
              <span className="icon">swords</span> Versus
            </button>
          </div>
          <div className="text-xs text-text-tertiary">Mode</div>
        </div>

        {/* Right side: Controls */}
        <div className="flex-1 flex justify-end items-center gap-[15px]">
          <div className="flex flex-col items-center gap-1.5">
            <button
              className="flex items-center justify-center w-10 h-10 text-2xl rounded-full bg-bg-tertiary text-text-secondary border border-border-primary hover:bg-bg-quaternary hover:text-text-primary hover:border-border-secondary"
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
            <div className="flex flex-col items-center gap-1.5">
              <button
                className="flex items-center justify-center w-10 h-10 text-2xl rounded-full bg-bg-tertiary text-text-secondary border border-border-primary hover:bg-bg-quaternary hover:text-text-primary hover:border-border-secondary"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
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

      <main className="p-5 md:p-10">
        {feed.length === 0 ? (
          <Intro inputSection={inputSection} />
        ) : (
          <>
            {inputSection}
            <ul className="flex flex-col gap-8 items-center w-full mt-8">
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