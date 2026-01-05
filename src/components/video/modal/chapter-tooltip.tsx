'use client'

import { cn } from '@/lib/utils'

interface ChapterTooltipProps {
  title: string
  time: string
  x: number
  visible: boolean
  containerWidth: number
}

export function ChapterTooltip({
  title,
  time,
  x,
  visible,
  containerWidth,
}: ChapterTooltipProps) {
  // Clamp tooltip position to stay within bounds
  const tooltipWidth = 120
  const padding = 8
  const clampedX = Math.max(
    padding,
    Math.min(x, containerWidth - tooltipWidth - padding)
  )

  return (
    <div
      className={cn(
        'absolute bottom-full mb-2 px-2 py-1 rounded-sm bg-black/90 text-white text-xs pointer-events-none transition-opacity duration-150',
        visible ? 'opacity-100' : 'opacity-0'
      )}
      style={{
        left: clampedX,
        transform: 'translateX(-50%)',
        minWidth: tooltipWidth,
      }}
    >
      {title && (
        <div className="font-medium truncate">{title}</div>
      )}
      <div className="text-white/70 font-mono text-[10px]">{time}</div>
    </div>
  )
}
