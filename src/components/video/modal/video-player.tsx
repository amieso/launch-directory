'use client'

import { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from 'react'
import Hls from 'hls.js'

export interface QualityLevel {
  height: number
  index: number
}

export interface VideoPlayerHandle {
  play: () => void
  pause: () => void
  setMuted: (muted: boolean) => void
  getVideoElement: () => HTMLVideoElement | null
  getQualityLevels: () => QualityLevel[]
  getCurrentQuality: () => number
  setQuality: (index: number) => void
  /** Pre-fetch the top rendition (hover/expand) so it's already sharp by click. */
  setUpscale: (on: boolean) => void
}

interface VideoPlayerProps {
  src: string
  className?: string
  startMuted?: boolean
  initialTime?: number
  /** Expanded (watching) vs collapsed grid preview — deepens the buffer when true. */
  expanded?: boolean
  /** Another video is focused — freeze segment loading so the focused player gets the whole pipe. */
  backgrounded?: boolean
  onQualityLevelsChange?: (levels: QualityLevel[]) => void
}

// Shallow buffer for looping grid previews (less wasted data); deeper once a
// video is expanded and actually being watched.
const PREVIEW_BUFFER_LENGTH = 6
const WATCHING_BUFFER_LENGTH = 30

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ src, className = '', startMuted = true, initialTime = 0, expanded = false, backgrounded = false, onQualityLevelsChange }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const hlsRef = useRef<Hls | null>(null)
    const upscaleRef = useRef(false)
    const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([])
    const [currentQuality, setCurrentQuality] = useState(-1) // -1 = auto

    const getQualityLevels = useCallback(() => qualityLevels, [qualityLevels])
    const getCurrentQuality = useCallback(() => currentQuality, [currentQuality])

    const setQuality = useCallback((index: number) => {
      const hls = hlsRef.current
      if (hls) {
        hls.currentLevel = index
        setCurrentQuality(index)
      }
    }, [])

    // Lift the player-size cap and queue the top rendition so the high-quality
    // segments are buffered before the card is even clicked. Reverting drops
    // back to size-capped auto. No-op until levels are known (re-applied on
    // MANIFEST_PARSED), and harmless on Safari's native HLS (no hls instance).
    const applyUpscale = useCallback(() => {
      const hls = hlsRef.current
      if (!hls || hls.levels.length === 0) return
      if (upscaleRef.current) {
        hls.config.capLevelToPlayerSize = false
        hls.nextLevel = hls.levels.length - 1
      } else {
        hls.nextLevel = -1
        hls.config.capLevelToPlayerSize = true
      }
    }, [])

    const setUpscale = useCallback((on: boolean) => {
      upscaleRef.current = on
      applyUpscale()
    }, [applyUpscale])

    useImperativeHandle(ref, () => ({
      play: () => videoRef.current?.play().catch(() => {}),
      pause: () => videoRef.current?.pause(),
      setMuted: (muted: boolean) => {
        if (videoRef.current) {
          videoRef.current.muted = muted
        }
      },
      getVideoElement: () => videoRef.current,
      getQualityLevels,
      getCurrentQuality,
      setQuality,
      setUpscale,
    }), [getQualityLevels, getCurrentQuality, setQuality, setUpscale])

    useEffect(() => {
      const videoEl = videoRef.current
      if (!videoEl || !src) return
      let hasAppliedInitialTime = false

      const applyInitialTime = () => {
        if (hasAppliedInitialTime || !Number.isFinite(initialTime) || initialTime <= 0) return

        const duration = videoEl.duration
        const maxTime = Number.isFinite(duration) && duration > 0
          ? Math.max(0, duration - 0.1)
          : initialTime
        const targetTime = Math.min(initialTime, maxTime)

        if (targetTime <= 0) {
          hasAppliedInitialTime = true
          return
        }

        try {
          videoEl.currentTime = targetTime
          hasAppliedInitialTime = true
        } catch {
          // Wait for metadata/canplay and retry
        }
      }

      const handleLoadedMetadata = () => {
        applyInitialTime()
      }

      videoEl.addEventListener('loadedmetadata', handleLoadedMetadata)

      if (Hls.isSupported()) {
        const hls = new Hls({
          // Start at the lowest rendition so the first frame paints fast, then
          // let ABR ramp up. The biggest perceptible-load win for the grid.
          startLevel: 0,
          // Never fetch a rendition larger than the element: tiny in the grid,
          // full resolution once expanded — adjusts automatically, no reload.
          capLevelToPlayerSize: true,
          // Skip the bandwidth probe; commit to the start level immediately.
          testBandwidth: false,
          maxBufferLength: PREVIEW_BUFFER_LENGTH,
        })
        hlsRef.current = hls
        hls.loadSource(src)
        hls.attachMedia(videoEl)

        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          const levels: QualityLevel[] = data.levels.map((level, index) => ({
            height: level.height,
            index,
          }))
          setQualityLevels(levels)
          onQualityLevelsChange?.(levels)
          applyInitialTime()
          applyUpscale()
          videoEl.play().catch(() => {})
        })

        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          if (hls.autoLevelEnabled) {
            setCurrentQuality(-1)
          } else {
            setCurrentQuality(data.level)
          }
        })

        return () => {
          videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata)
          hls.destroy()
          hlsRef.current = null
          setQualityLevels([])
        }
      } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support - no quality control available
        videoEl.src = src
        applyInitialTime()
        videoEl.play().catch(() => {})

        return () => {
          videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata)
        }
      }

      return () => {
        videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
    }, [src, initialTime, onQualityLevelsChange, applyUpscale])

    // Deepen the buffer once expanded (and shrink it back on collapse) by
    // mutating the live config — HLS.js reads this continuously, so no reload.
    useEffect(() => {
      const hls = hlsRef.current
      if (!hls) return
      hls.config.maxBufferLength = expanded ? WATCHING_BUFFER_LENGTH : PREVIEW_BUFFER_LENGTH
    }, [expanded])

    // While another video is focused, halt this player's segment fetching so the
    // focused player gets the entire bandwidth budget — the grid previews are
    // hidden behind the backdrop anyway. Resume the moment nothing else is
    // focused. No-op on Safari's native HLS (no hls instance to control).
    useEffect(() => {
      const hls = hlsRef.current
      if (!hls) return
      if (backgrounded) hls.stopLoad()
      else hls.startLoad()
    }, [backgrounded])

    return (
      <video
        ref={videoRef}
        muted={startMuted}
        loop
        playsInline
        preload="auto"
        className={`h-full w-full object-cover rounded-lg ${className}`}
      />
    )
  }
)
