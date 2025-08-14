/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {useEffect} from 'react'

export default function FullScreenViewer({htmlContent, onClose}) {
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = 'auto'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div className="fullscreen-overlay" onClick={onClose}>
      <button className="close-button iconButton" onClick={onClose}>
        <span className="icon">close</span>
      </button>
      <iframe
        srcDoc={htmlContent}
        sandbox="allow-same-origin allow-scripts"
        onClick={e => e.stopPropagation()}
      />
    </div>
  )
}