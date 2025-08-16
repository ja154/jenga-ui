/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {useEffect, useState, memo} from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import * as styles from 'react-syntax-highlighter/dist/esm/styles/hljs'
import c from 'clsx'
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
              mode={outputMode}
              code={outputData}
              onViewFullScreen={() => onViewFullScreen(outputData)}
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
            <button className="iconButton" onClick={handleDownload}>
              <span className="icon">download</span>
              <span className="tooltip">Download SVG</span>
            </button>
          )}

          <button
            className="iconButton"
            onClick={() => startEditing(roundId, id)}
          >
            <span className="icon">edit_note</span>
            <span className="tooltip">Live edit</span>
          </button>

          {outputMode !== 'wireframe' && (
            <button
              className="iconButton"
              onClick={() => onViewFullScreen(outputData)}
            >
              <span className="icon">fullscreen</span>
              <span className="tooltip">View fullscreen</span>
            </button>
          )}

          <button
            className="iconButton"
            onClick={() => setShowSource(!showSource)}
          >
            <span className="icon">{showSource ? 'visibility' : 'code'}</span>
            <span className="tooltip">
              View {showSource ? 'rendering' : 'source'}
            </span>
          </button>

          <button className="iconButton" onClick={copySource}>
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