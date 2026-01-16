'use client'

import { useState, useEffect, useRef } from 'react'
import { SoundFullIcon, SoundMidIcon, SoundOffIcon } from '@/components/ui/player-icons'

interface VolumeSliderProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
}

export function VolumeSlider({ videoRef }: VolumeSliderProps) {
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync with video element
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    video.addEventListener('volumechange', handleVolumeChange)
    // Initialize state
    setVolume(video.volume)
    setIsMuted(video.muted)

    return () => {
      video.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [videoRef])

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
  }

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const rect = sliderRef.current?.getBoundingClientRect()
    if (!rect) return

    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const video = videoRef.current
    if (!video) return

    video.volume = percent
    if (percent > 0 && video.muted) {
      video.muted = false
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return
    handleSliderClick(e)
  }

  const VolumeIcon = isMuted || volume === 0
    ? SoundOffIcon
    : volume < 0.5
      ? SoundMidIcon
      : SoundFullIcon

  const displayVolume = isMuted ? 0 : volume

  return (
    <div
      ref={containerRef}
      className="flex items-center hover:bg-white/10 rounded transition-colors"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <button
        onClick={toggleMute}
        className="w-8 h-8 flex items-center justify-center"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon className="w-5 h-5 text-white" />
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ease-out ${
          isExpanded ? 'w-20 mr-2' : 'w-0'
        }`}
      >
        {/* Expanded clickable area for better precision */}
        <div
          ref={sliderRef}
          className="h-5 flex items-center cursor-pointer relative"
          onClick={handleSliderClick}
          onMouseMove={handleMouseMove}
        >
          {/* Visual track */}
          <div className="w-full h-1 bg-white/20 rounded-full relative">
            {/* Volume fill */}
            <div
              className="absolute inset-y-0 left-0 bg-white rounded-full transition-all"
              style={{ width: `${displayVolume * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
