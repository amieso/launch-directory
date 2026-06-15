'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { Video } from '@/types/video'
import {
  TestConfig,
  CardResult,
  buildSrc,
  thumbnailSrc,
} from './config'

interface TestCardProps {
  video: Video
  config: TestConfig
  /** Performance.now() captured when the run started — all timings are relative to it. */
  runStart: number
  onResult: (result: CardResult) => void
}

export function TestCard({ video, config, runStart, onResult }: TestCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<CardResult>({
    videoId: video.id,
    tManifest: null,
    tFirstFrag: null,
    tFirstFrame: null,
    tPlaceholder: null,
    bytesToFirstFrame: null,
    startHeight: null,
  })
  const bytesRef = useRef(0)
  const [hasFrame, setHasFrame] = useState(false)
  const [started, setStarted] = useState(config.gating === 'all')

  // Viewport gating: defer loading until the card is near the viewport.
  useEffect(() => {
    if (config.gating === 'all' || started) return
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [config.gating, started])

  useEffect(() => {
    if (!started) return
    const videoEl = videoRef.current
    if (!videoEl) return

    const src = buildSrc(video.videoUrl, config.maxResolution)
    const report = () => onResult({ ...resultRef.current })

    const markFirstFrame = () => {
      if (resultRef.current.tFirstFrame != null) return
      resultRef.current.tFirstFrame = performance.now() - runStart
      resultRef.current.bytesToFirstFrame = bytesRef.current
      setHasFrame(true)
      report()
    }
    videoEl.addEventListener('loadeddata', markFirstFrame)
    videoEl.addEventListener('playing', markFirstFrame)

    if (Hls.isSupported()) {
      const hls = new Hls({
        startLevel: config.startLevel === 'lowest' ? 0 : -1,
        capLevelToPlayerSize: config.capToPlayerSize,
        testBandwidth: config.testBandwidth,
        maxBufferLength: config.maxBufferLength,
      })
      hls.loadSource(src)
      hls.attachMedia(videoEl)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        resultRef.current.tManifest = performance.now() - runStart
        report()
        videoEl.play().catch(() => {})
      })
      hls.on(Hls.Events.FRAG_BUFFERED, (_e, data) => {
        bytesRef.current += data.frag.stats?.total ?? 0
        if (resultRef.current.tFirstFrag == null) {
          resultRef.current.tFirstFrag = performance.now() - runStart
          report()
        }
      })
      hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
        if (resultRef.current.startHeight == null) {
          resultRef.current.startHeight = hls.levels[data.level]?.height ?? null
          report()
        }
      })

      return () => {
        videoEl.removeEventListener('loadeddata', markFirstFrame)
        videoEl.removeEventListener('playing', markFirstFrame)
        hls.destroy()
      }
    }

    // Safari native HLS — no per-level instrumentation available.
    videoEl.src = src
    videoEl.play().catch(() => {})
    return () => {
      videoEl.removeEventListener('loadeddata', markFirstFrame)
      videoEl.removeEventListener('playing', markFirstFrame)
    }
  }, [started, video.videoUrl, config, runStart, onResult])

  const thumbWidth = config.placeholder === 'tiny-blur' ? 32 : undefined
  const placeholderUrl =
    config.placeholder === 'none' ? null : thumbnailSrc(video.videoUrl, thumbWidth)

  return (
    <div ref={containerRef} className="relative aspect-video overflow-hidden rounded bg-surface">
      {placeholderUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={placeholderUrl}
          alt=""
          aria-hidden="true"
          onLoad={() => {
            if (resultRef.current.tPlaceholder == null) {
              resultRef.current.tPlaceholder = performance.now() - runStart
              onResult({ ...resultRef.current })
            }
          }}
          className={`absolute inset-0 z-10 h-full w-full object-cover transition-opacity duration-150 ${
            hasFrame ? 'opacity-0' : 'opacity-100'
          } ${config.placeholder === 'tiny-blur' ? 'scale-110 blur-lg' : ''}`}
        />
      )}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {!started && (
        <div className="absolute inset-0 z-20 flex items-center justify-center text-[10px] font-mono text-muted">
          waiting for viewport
        </div>
      )}
      <div className="absolute bottom-1 left-1 z-30 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white">
        {video.company}
      </div>
    </div>
  )
}
