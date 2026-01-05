'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Chapter } from '@/types/video'
import { formatDuration } from '@/lib/utils'

interface SegmentedSeekBarProps {
  chapters: Chapter[]
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  onSeekStart: () => void
  onSeekEnd: () => void
}

export function SegmentedSeekBar({
  chapters,
  currentTime,
  duration,
  onSeek,
  onSeekStart,
  onSeekEnd,
}: SegmentedSeekBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [hoverX, setHoverX] = useState<number | null>(null)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoveredSegmentIndex, setHoveredSegmentIndex] = useState<number | null>(null)

  // Fallback to single segment if no chapters
  const segments = chapters.length > 0
    ? chapters
    : [{ id: 'default', title: '', startTime: 0 }]

  // Get the end time for a segment
  const getSegmentEndTime = (index: number) => {
    return segments[index + 1]?.startTime ?? duration
  }

  // Calculate segment width as percentage
  const getSegmentWidth = (index: number) => {
    const start = segments[index].startTime
    const end = getSegmentEndTime(index)
    return ((end - start) / duration) * 100
  }

  // Calculate fill percentage within a segment
  const getSegmentFill = (index: number) => {
    const start = segments[index].startTime
    const end = getSegmentEndTime(index)

    if (currentTime <= start) return 0
    if (currentTime >= end) return 100
    return ((currentTime - start) / (end - start)) * 100
  }

  // Find which segment index a time falls into
  const getSegmentIndexAtTime = useCallback((time: number) => {
    for (let i = segments.length - 1; i >= 0; i--) {
      if (time >= segments[i].startTime) {
        return i
      }
    }
    return 0
  }, [segments])

  // Find chapter at a given time
  const getChapterAtTime = useCallback((time: number) => {
    const index = getSegmentIndexAtTime(time)
    return segments[index]?.title || null
  }, [segments, getSegmentIndexAtTime])

  // Calculate time from x position
  const getTimeFromX = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || duration <= 0) return null

    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return percent * duration
  }, [duration])

  // Update hover state
  const updateHover = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = clientX - rect.left
    const time = getTimeFromX(clientX)

    setHoverX(x)
    setHoverTime(time)

    if (time !== null) {
      setHoveredSegmentIndex(getSegmentIndexAtTime(time))
    }
  }, [getTimeFromX, getSegmentIndexAtTime])

  // Seek to position
  const seekTo = useCallback((clientX: number) => {
    const time = getTimeFromX(clientX)
    if (time !== null) {
      onSeek(time)
    }
  }, [getTimeFromX, onSeek])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    updateHover(e.clientX)
    if (isDragging) {
      seekTo(e.clientX)
    }
  }, [updateHover, isDragging, seekTo])

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    setIsHovered(true)
    updateHover(e.clientX)
  }, [updateHover])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setHoverX(null)
    setHoverTime(null)
    setHoveredSegmentIndex(null)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    onSeekStart()
    seekTo(e.clientX)
  }, [onSeekStart, seekTo])

  // Global mouse events for dragging
  useEffect(() => {
    if (!isDragging) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      seekTo(e.clientX)
      updateHover(e.clientX)
    }

    const handleGlobalMouseUp = () => {
      setIsDragging(false)
      onSeekEnd()
    }

    window.addEventListener('mousemove', handleGlobalMouseMove)
    window.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, seekTo, updateHover, onSeekEnd])

  // Get tooltip content
  const getTooltipContent = () => {
    if (hoverTime === null) return null

    const chapter = getChapterAtTime(hoverTime)
    const time = formatDuration(Math.floor(hoverTime))

    return { chapter, time }
  }

  // Clamp tooltip position
  const getTooltipLeft = () => {
    if (hoverX === null || !containerRef.current) return 0

    const containerWidth = containerRef.current.offsetWidth
    const tooltipHalfWidth = 60
    const padding = 8

    return Math.max(
      tooltipHalfWidth + padding,
      Math.min(hoverX, containerWidth - tooltipHalfWidth - padding)
    )
  }

  const tooltipContent = getTooltipContent()
  const showTooltip = (isHovered || isDragging) && tooltipContent

  return (
    <div className="relative pb-1">
      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute -top-[60px] -translate-x-1/2 px-3 py-2 bg-neutral-800/90 backdrop-blur-md rounded-md pointer-events-none z-10 shadow-xl"
          style={{ left: getTooltipLeft() }}
        >
          {tooltipContent.chapter && (
            <div className="text-[11px] text-white font-medium whitespace-nowrap text-center">
              {tooltipContent.chapter}
            </div>
          )}
          <div className="text-[10px] text-white/60 font-mono whitespace-nowrap text-center">
            {tooltipContent.time}
          </div>
        </div>
      )}

      {/* Seek bar */}
      <div
        ref={containerRef}
        className="relative flex gap-1 cursor-pointer items-center"
        style={{ height: '10px' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
      >
        {segments.map((segment, index) => {
          const width = getSegmentWidth(index)
          const fill = getSegmentFill(index)
          const isFirst = index === 0
          const isLast = index === segments.length - 1
          const isHoveredSegment = (isHovered || isDragging) && hoveredSegmentIndex === index

          return (
            <div
              key={segment.id}
              className="relative bg-white/30 overflow-hidden transition-[height] duration-100 ease-out"
              style={{
                width: `${width}%`,
                height: isHoveredSegment ? '10px' : '6px',
                borderRadius: isFirst ? '9999px 0 0 9999px' : isLast ? '0 9999px 9999px 0' : '0',
              }}
            >
              {/* Fill */}
              {fill > 0 && (
                <div
                  className="absolute left-0 top-0 bottom-0 bg-white"
                  style={{
                    width: `${fill}%`,
                    borderRadius: isFirst ? '9999px 0 0 9999px' : '0',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
