'use client'

import { SkipForwardIcon, SkipBackwardIcon } from '@/components/ui/player-icons'

interface SkipButtonProps {
  direction: 'forward' | 'backward'
  seconds?: number
  onSkip: (seconds: number) => void
}

export function SkipButton({ direction, seconds = 5, onSkip }: SkipButtonProps) {
  const handleClick = () => {
    onSkip(direction === 'forward' ? seconds : -seconds)
  }

  const Icon = direction === 'forward' ? SkipForwardIcon : SkipBackwardIcon

  return (
    <button
      onClick={handleClick}
      className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
      aria-label={`Skip ${direction} ${seconds} seconds`}
    >
      <Icon className="w-5 h-5 text-white" />
    </button>
  )
}
