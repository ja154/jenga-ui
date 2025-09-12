/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {memo, useEffect, useState, forwardRef} from 'react'

const Renderer = forwardRef(function Renderer({mode, code, onViewFullScreen}, ref) {
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    setShowError(false); // Reset error state on code change
    if (ref && ref.current) {
      const iframe = ref.current;
      const handleLoad = () => {
        if (iframe.contentWindow) {
          // A short delay to allow scripts to execute
          const timer = setTimeout(() => {
            // If the iframe is still blank, it might indicate a render-blocking error
            if (iframe.contentDocument && iframe.contentDocument.body.innerHTML.trim() === '') {
              setShowError(true);
            }
          }, 500);
          iframe.contentWindow.onerror = () => {
            clearTimeout(timer);
            setShowError(true);
          };
        }
      };
      iframe.addEventListener('load', handleLoad);
      return () => {
        iframe.removeEventListener('load', handleLoad);
      };
    }
  }, [code, ref]);


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
    <div className={mode === 'html' ? 'htmlRenderer' : 'w-full h-full bg-bg-primary'} onClick={onViewFullScreen}>
      <iframe
        className={mode === 'html' ? '' : 'w-full h-full object-contain'}
        sandbox="allow-same-origin allow-scripts"
        loading="lazy"
        srcDoc={getSrcDoc()}
        ref={ref}
        style={{
          border: 'none',
          background: 'var(--bg-primary)',
          ...(mode === 'html' ? {
            aspectRatio: '4/3',
            transformOrigin: '0 0',
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'hidden',
          } : {})
        }}
      />

      {showError && (
        <div className="error">
          <div className="p-5 bg-bg-primary/90 z-20 flex items-center justify-center flex-col gap-1.5 text-center text-text-secondary backdrop-blur-sm h-full w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error/10 mb-2">
              <span className="icon text-error text-3xl">code_off</span>
            </div>
            <h4 className="font-bold text-text-primary">Rendering Error</h4>
            <p className="text-xs max-w-xs">
              The generated code has a script error and could not be rendered correctly.
            </p>
          </div>
        </div>
      )}
    </div>
  )
});

export default memo(Renderer)
