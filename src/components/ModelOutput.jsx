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
  onViewFullScreen
}) {
  const [time, setTime] = useState(0)
  const [showSource, setShowSource] = useState(false)
  const [copied, setCopied] = useState(false)
  const rendererRef = useRef(null)

  const getFullScreenContent = () => {
    if (outputMode === 'wireframe') {
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
    a.download = 'wireframe.svg'
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
    <div className="modelOutput">
      <div className={c('outputRendering', {flipped: showSource})}>
        <div className="back">
          <SyntaxHighlighter
            language={modes[outputMode].syntax}
            style={styles.atomOneDark}
          >
            {outputData || ''}
          </SyntaxHighlighter>
        </div>

        <div className="front">
          {gotError && (
            <div className="error">
              <p>
                <span className="icon">error</span>
              </p>
              <p>
                {outputData && outputData.includes('Figma')
                  ? 'Figma Error'
                  : outputData && outputData.includes('Failed to fetch')
                    ? 'Fetch Error'
                    : 'Response Error'}
              </p>
              {outputData && <div className="error-details">{outputData}</div>}
            </div>
          )}

          {isBusy && (
            <div className="loader">
              <span className="icon">hourglass</span>
            </div>
          )}

          {outputData && !gotError && (
            <Renderer
              ref={rendererRef}
              mode={outputMode}
              code={outputData}
              onViewFullScreen={() => onViewFullScreen(getFullScreenContent())}
            />
          )}
        </div>
      </div>

      <div className="modelInfo">
        <div className="modelName">
          <div>
            {models[model].version} {models[model].name}
          </div>
          {(time || totalTime) && (
            <div className="timer">
              {((isBusy ? time : totalTime) / 1000).toFixed(2)}s
            </div>
          )}
        </div>

        <div className={c('outputActions', {active: outputData && !gotError})}>
          {outputMode === 'wireframe' && (
            <button
              className="iconButton"
              onClick={handleDownload}
              aria-label="Download SVG"
            >
              <span className="icon">download</span>
              <span className="tooltip">Download SVG</span>
            </button>
          )}

          {['html', 'background', 'refactor', 'clone'].includes(outputMode) && (
            <button
              className="iconButton"
              onClick={handleDownloadImage}
              aria-label="Download as Image"
            >
              <span className="icon">image</span>
              <span className="tooltip">Download as Image</span>
            </button>
          )}

          <button
            className="iconButton"
            onClick={() => startEditing(roundId, id)}
            aria-label="Live edit"
          >
            <span className="icon">edit_note</span>
            <span className="tooltip">Live edit</span>
          </button>

          <button
            className="iconButton"
            onClick={() => onViewFullScreen(getFullScreenContent())}
            aria-label="View fullscreen"
          >
            <span className="icon">fullscreen</span>
            <span className="tooltip">View fullscreen</span>
          </button>

          <button
            className="iconButton"
            onClick={() => setShowSource(!showSource)}
            aria-label={showSource ? 'View rendering' : 'View source'}
          >
            <span className="icon">{showSource ? 'visibility' : 'code'}</span>
            <span className="tooltip">
              View {showSource ? 'rendering' : 'source'}
            </span>
          </button>

          <button
            className="iconButton"
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
    </div>
  )
}

export default memo(ModelOutput)
