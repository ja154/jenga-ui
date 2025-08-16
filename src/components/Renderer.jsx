/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {memo, useEffect, useRef, useState} from 'react'

function Renderer({mode, code, onViewFullScreen}) {
  const iframeRef = useRef(null)
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.onerror = () => setShowError(true)
    }
  }, [iframeRef])

  const getSrcDoc = () => {
    if (mode === 'wireframe') {
      return `
        <html>
          <head>
            <style>
              body { 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                background-color: #f0f0f0; 
                margin: 0;
                height: 100vh;
                font-family: sans-serif;
              }
              svg { 
                max-width: 95%; 
                max-height: 95%;
                background-color: white;
                border: 1px solid #ccc;
              }
            </style>
          </head>
          <body>
            ${code}
          </body>
        </html>
      `
    }
    return code
  }

  return (
    <div className={`renderer ${mode}Renderer`} onClick={onViewFullScreen}>
      <iframe
        sandbox="allow-same-origin allow-scripts"
        loading="lazy"
        srcDoc={getSrcDoc()}
        ref={iframeRef}
      />

      {showError && (
        <div className="error">
          <p>
            <span className="icon">error</span> This code produced an error.
          </p>
        </div>
      )}
    </div>
  )
}

export default memo(Renderer)