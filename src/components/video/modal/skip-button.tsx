'use client'

import { RotateCcw, RotateCw } from 'lucide-react'

interface SkipButtonProps {
  direction: 'forward' | 'backward'
  seconds?: number
  onSkip: (seconds: number) => void
}

export function SkipButton({ direction, seconds = 5, onSkip }: SkipButtonProps) {
  const handleClick = () => {
    onSkip(direction === 'forward' ? seconds : -seconds)
  }

  const Icon = direction === 'forward' ? RotateCw : RotateCcw

  return (
    <button
      onClick={handleClick}
      className="relative p-1.5 hover:bg-white/10 rounded transition-colors"
      aria-label={`Skip ${direction} ${seconds} seconds`}
    >
      <Icon className="w-5 h-5 text-white" strokeWidth={2} />
      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">
        {seconds}
      </span>
    </button>
  )
}
