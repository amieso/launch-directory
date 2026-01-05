'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { QualityLevel } from './video-player'

interface ResolutionSelectorProps {
  levels: QualityLevel[]
  currentLevel: number // -1 = auto
  onLevelChange: (index: number) => void
}

export function ResolutionSelector({ levels, currentLevel, onLevelChange }: ResolutionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleSelect = (index: number) => {
    onLevelChange(index)
    setIsOpen(false)
  }

  // Format resolution label
  const formatResolution = (height: number) => {
    if (height >= 2160) return '4K'
    if (height >= 1440) return '1440p'
    if (height >= 1080) return '1080p'
    if (height >= 720) return '720p'
    if (height >= 480) return '480p'
    if (height >= 360) return '360p'
    return `${height}p`
  }

  // Get current display label
  const getCurrentLabel = () => {
    if (currentLevel === -1) return 'Auto'
    const level = levels.find(l => l.index === currentLevel)
    return level ? formatResolution(level.height) : 'Auto'
  }

  // Sort levels by height descending
  const sortedLevels = [...levels].sort((a, b) => b.height - a.height)

  if (levels.length === 0) return null

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 px-2 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-xs text-white font-mono"
        aria-label="Video quality"
      >
        {getCurrentLabel()}
      </button>

      {/* Dropdown - opens upward */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 min-w-[80px] rounded-lg bg-black/90 backdrop-blur-sm p-1 shadow-lg">
          {/* Auto option */}
          <button
            onClick={() => handleSelect(-1)}
            className={cn(
              'w-full rounded px-3 py-1.5 text-left text-xs font-mono transition-colors',
              currentLevel === -1
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            )}
          >
            Auto
          </button>
          {sortedLevels.map((level) => (
            <button
              key={level.index}
              onClick={() => handleSelect(level.index)}
              className={cn(
                'w-full rounded px-3 py-1.5 text-left text-xs font-mono transition-colors',
                currentLevel === level.index
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              {formatResolution(level.height)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
