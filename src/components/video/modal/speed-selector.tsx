'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SpeedSelectorProps {
  currentSpeed: number
  onSpeedChange: (speed: number) => void
}

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' },
]

export function SpeedSelector({ currentSpeed, onSpeedChange }: SpeedSelectorProps) {
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

  const handleSelect = (speed: number) => {
    onSpeedChange(speed)
    setIsOpen(false)
  }

  // Format display - show "1x" not "1.00x"
  const formatSpeed = (speed: number) => {
    return speed === 1 ? '1x' : `${speed}x`
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 px-2 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-xs text-white font-mono"
        aria-label="Playback speed"
      >
        {formatSpeed(currentSpeed)}
      </button>

      {/* Dropdown - opens upward */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 min-w-[72px] rounded-lg bg-black/90 backdrop-blur-sm p-1 shadow-lg">
          {SPEED_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                'w-full rounded px-3 py-1.5 text-left text-xs font-mono transition-colors',
                currentSpeed === option.value
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
