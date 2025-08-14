/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {memo, useEffect, useRef, useState} from 'react'

function Renderer({mode, code, onViewFullScreen}) {
  const iframeRef = useRef(null)
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.onerror = () => setShowError(true)
    }
  }, [iframeRef])

  return (
    <div className={`renderer ${mode}Renderer`} onClick={onViewFullScreen}>
      <iframe
        sandbox="allow-same-origin allow-scripts"
        loading="lazy"
        srcDoc={code}
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