'use client'

import { useState, useEffect } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

interface FullscreenButtonProps {
  containerRef: React.RefObject<HTMLElement | null>
}

export function FullscreenButton({ containerRef }: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Sync state with fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = async () => {
    const element = containerRef.current
    if (!element) return

    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (element.requestFullscreen) {
          await element.requestFullscreen()
        } else if ((element as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          // Safari
          await (element as HTMLElement & { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen()
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as Document & { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
          await (document as Document & { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen()
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }

  return (
    <button
      onClick={toggleFullscreen}
      className="p-1.5 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {isFullscreen ? (
        <Minimize2 className="w-4 h-4 text-white" />
      ) : (
        <Maximize2 className="w-4 h-4 text-white" />
      )}
    </button>
  )
}
