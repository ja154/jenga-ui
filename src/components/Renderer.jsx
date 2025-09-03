/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {memo, useEffect, useState, forwardRef} from 'react'

const Renderer = forwardRef(function Renderer({mode, code, onViewFullScreen}, ref) {
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (ref && ref.current) {
      const iframe = ref.current;
      const handleLoad = () => {
        if (iframe.contentWindow) {
          iframe.contentWindow.onerror = () => setShowError(true);
        }
      };
      iframe.addEventListener('load', handleLoad);
      return () => {
        iframe.removeEventListener('load', handleLoad);
      };
    }
  }, [ref]);


  const getSrcDoc = () => {
    if (['wireframe', 'favicon'].includes(mode)) {
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
        ref={ref}
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
});

export default memo(Renderer)
