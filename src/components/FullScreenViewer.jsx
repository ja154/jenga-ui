/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useEffect} from 'react'

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 flex items-center justify-center p-5 animate-fadeIn" onClick={onClose}>
      <button className="absolute top-5 right-5 z-40 bg-bg-senary text-text-quinary w-10 h-10 text-xl flex items-center justify-center bg-bg-quaternary text-text-senary rounded-full transition-all duration-200 ease-out hover:bg-bg-quinary hover:text-text-primary" onClick={onClose}>
        <span className="icon">close</span>
      </button>
      <iframe
        className="w-full h-full rounded-lg border border-border-primary bg-bg-primary"
        srcDoc={htmlContent}
        sandbox="allow-same-origin allow-scripts"
        onClick={e => e.stopPropagation()}
      />
    </div>
  )
}
