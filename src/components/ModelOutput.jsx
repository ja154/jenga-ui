/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useEffect, useState, memo, useRef} from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import * as styles from 'react-syntax-highlighter/dist/esm/styles/hljs'
import c from 'clsx'
import html2canvas from 'html2canvas'
import modes from '../lib/modes'
import models from '../lib/models'
import {startEditing} from '../lib/actions'
import Renderer from './Renderer'

function ModelOutput({
  id,
  roundId,
  model,
  outputData,
  outputMode,
  isBusy,
  startTime,
  totalTime,
  gotError,
  onViewFullScreen,
  groundingChunks
}) {
  const [time, setTime] = useState(0)
  const [showSource, setShowSource] = useState(false)
  const [copied, setCopied] = useState(false)
  const rendererRef = useRef(null)

  const getFullScreenContent = () => {
    if (['wireframe', 'favicon'].includes(outputMode)) {
      return `
        <html>
          <head>
            <style>
              body { 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                background-color: transparent; 
                margin: 0;
                height: 100vh;
                padding: 20px;
                box-sizing: border-box;
              }
              svg { 
                width: 100%; 
                height: 100%;
                max-width: 1400px;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              }
            </style>
          </head>
          <body>
            ${outputData}
          </body>
        </html>
      `
    }
    return outputData
  }

  const copySource = () => {
    navigator.clipboard.writeText(outputData.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  const handleDownload = () => {
    const blob = new Blob([outputData], {type: 'image/svg+xml'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${outputMode}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadImage = async () => {
    if (!rendererRef.current) {
      console.error('Renderer ref not available');
      return;
    }

    try {
      const iframe = rendererRef.current;
      // Giving the iframe a moment to ensure all content is rendered.
      await new Promise(resolve => setTimeout(resolve, 200));
      const canvas = await html2canvas(iframe.contentWindow.document.body);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${outputMode}-design.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to capture image:', error);
      alert('Sorry, there was an error downloading the image.');
    }
  };

  useEffect(() => {
    let interval

    if (isBusy) {
      interval = setInterval(() => setTime(Date.now() - startTime), 10)
    } else {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [startTime, isBusy])

  return (
    <div className="flex flex-col gap-2.5">
      <div className={c('z-10 flex-1 aspect-[4/3] relative [perspective:2000px] [transform-style:preserve-3d] rounded-md', {'[transform:rotateY(180deg)]': showSource})}>
        <div className="flex items-center justify-center outline-3 outline-transparent transition-all duration-200 ease-out border border-border-secondary rounded-inherit overflow-hidden absolute inset-0 [backface-visibility:hidden] [transform:rotateY(-180deg)] bg-bg-tertiary z-[1]">
          <pre className="w-full h-full p-2.5 text-xs leading-relaxed overflow-auto">
          <SyntaxHighlighter
            language={modes[outputMode].syntax}
            style={styles.atomOneDark}
            customStyle={{background: 'transparent', padding: 0}}
          >
            {outputData || ''}
          </SyntaxHighlighter>
          </pre>
        </div>

        <div className={c("flex items-center justify-center outline-3 outline-transparent transition-all duration-200 ease-out border border-border-secondary rounded-inherit overflow-hidden absolute inset-0 [backface-visibility:hidden] transition-transform", {'[transform:rotateY(0deg)]': showSource})}>
          {gotError && (
            <div className="absolute inset-0 p-5 bg-bg-primary z-20 flex items-center justify-center flex-col gap-1.5 text-center">
              <p className="flex items-center gap-1.5 p-1.5 text-text-secondary leading-normal">
                <span className="icon text-text-primary text-2xl">error</span>
              </p>
              <p className="flex items-center gap-1.5 p-1.5 text-text-secondary leading-normal">
                {outputData && outputData.includes('Figma')
                  ? 'Figma Error'
                  : outputData && outputData.includes('Failed to fetch')
                    ? 'Fetch Error'
                    : 'Response Error'}
              </p>
              {outputData && <div className="text-xs text-text-tertiary bg-bg-tertiary p-2.5 rounded-md max-w-full overflow-auto text-left whitespace-pre-wrap break-all">{outputData}</div>}
            </div>
          )}

          {isBusy && (
            <div className="text-2xl origin-center animate-spin leading-none">
              <span className="icon">hourglass</span>
            </div>
          )}

          {outputData && !gotError && (
            <div className="relative w-full h-full animate-fadeIn cursor-zoom-in">
              <Renderer
                ref={rendererRef}
                mode={outputMode}
                code={outputData}
                onViewFullScreen={() => onViewFullScreen(getFullScreenContent())}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-start text-xs text-text-primary gap-4">
        <div className="flex flex-col gap-1.5">
          <div>
            {models[model].version} {models[model].name}
          </div>
          {(time || totalTime) && (
            <div className="text-text-tertiary">
              {((isBusy ? time : totalTime) / 1000).toFixed(2)}s
            </div>
          )}
        </div>

        <div className={c('flex items-center gap-2 opacity-0 transition-opacity duration-200 ease-out pointer-events-none', {'opacity-100 pointer-events-auto': outputData && !gotError})}>
          {['wireframe', 'favicon'].includes(outputMode) && (
            <button
              className="flex items-center justify-center bg-bg-quaternary text-text-senary rounded-full w-11 h-11 text-2xl transition-all duration-200 ease-out hover:bg-bg-quinary hover:text-text-primary"
              onClick={handleDownload}
              aria-label="Download SVG"
            >
              <span className="icon">download</span>
              <span className="tooltip">Download SVG</span>
            </button>
          )}

          {['html', 'background', 'refactor', 'clone'].includes(outputMode) && (
            <button
              className="flex items-center justify-center bg-bg-quaternary text-text-senary rounded-full w-11 h-11 text-2xl transition-all duration-200 ease-out hover:bg-bg-quinary hover:text-text-primary"
              onClick={handleDownloadImage}
              aria-label="Download as Image"
            >
              <span className="icon">image</span>
              <span className="tooltip">Download as Image</span>
            </button>
          )}

          <button
            className="flex items-center justify-center bg-bg-quaternary text-text-senary rounded-full w-11 h-11 text-2xl transition-all duration-200 ease-out hover:bg-bg-quinary hover:text-text-primary"
            onClick={() => startEditing(roundId, id)}
            aria-label="Live edit"
          >
            <span className="icon">edit_note</span>
            <span className="tooltip">Live edit</span>
          </button>

          <button
            className="flex items-center justify-center bg-bg-quaternary text-text-senary rounded-full w-11 h-11 text-2xl transition-all duration-200 ease-out hover:bg-bg-quinary hover:text-text-primary"
            onClick={() => onViewFullScreen(getFullScreenContent())}
            aria-label="View fullscreen"
          >
            <span className="icon">fullscreen</span>
            <span className="tooltip">View fullscreen</span>
          </button>

          <button
            className="flex items-center justify-center bg-bg-quaternary text-text-senary rounded-full w-11 h-11 text-2xl transition-all duration-200 ease-out hover:bg-bg-quinary hover:text-text-primary"
            onClick={() => setShowSource(!showSource)}
            aria-label={showSource ? 'View rendering' : 'View source'}
          >
            <span className="icon">{showSource ? 'visibility' : 'code'}</span>
            <span className="tooltip">
              View {showSource ? 'rendering' : 'source'}
            </span>
          </button>

          <button
            className="flex items-center justify-center bg-bg-quaternary text-text-senary rounded-full w-11 h-11 text-2xl transition-all duration-200 ease-out hover:bg-bg-quinary hover:text-text-primary"
            onClick={copySource}
            aria-label="Copy source"
          >
            <span className="icon">content_copy</span>
            <span className="tooltip">
              {copied
                ? 'Copied!'
                : 'Copy source'}
            </span>
          </button>
        </div>
      </div>

      {groundingChunks && groundingChunks.length > 0 && (
        <div className="mt-2.5 border-t border-border-primary pt-2.5">
          <h4 className="text-xs font-bold text-text-secondary mb-1.5 flex items-center gap-1.5">
            <span className="icon">travel_explore</span>
            Inspiration from the web
          </h4>
          <ul className="flex flex-col gap-1 text-xs">
            {groundingChunks.map((chunk, index) => (
              chunk.web?.uri && (
                <li key={index} className="flex items-start gap-1.5">
                  <span className="icon text-sm text-text-tertiary relative top-px">link</span>
                  <a
                    href={chunk.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    title={chunk.web.title || chunk.web.uri}
                  >
                    {chunk.web.title || new URL(chunk.web.uri).hostname}
                  </a>
                </li>
              )
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default memo(ModelOutput)
