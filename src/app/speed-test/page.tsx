'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { videos } from '@/data/videos'
import {
  TestConfig,
  CardResult,
  BASELINE,
  INSTANT_PRESET,
  MUX_HOSTS,
  median,
  percentile,
} from './config'
import { TestCard } from './test-card'

const PLAYABLE = videos.filter((v) => v.videoUrl)

const fmt = (ms: number | null) => (ms == null ? '—' : `${Math.round(ms)}ms`)
const fmtKb = (bytes: number | null) =>
  bytes == null ? '—' : `${(bytes / 1024).toFixed(0)}KB`

export default function SpeedTestPage() {
  const [config, setConfig] = useState<TestConfig>(BASELINE)
  const [runId, setRunId] = useState(0)
  const [runStart, setRunStart] = useState(() =>
    typeof performance !== 'undefined' ? performance.now() : 0,
  )
  const [results, setResults] = useState<Record<string, CardResult>>({})

  const cards = useMemo(() => PLAYABLE.slice(0, config.cardCount), [config.cardCount])

  // Warm DNS+TLS to the Mux hosts when preconnect is enabled.
  useEffect(() => {
    if (!config.preconnect) return
    const links = MUX_HOSTS.map((href) => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = href
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
      return link
    })
    return () => links.forEach((l) => l.remove())
  }, [config.preconnect, runId])

  const onResult = useCallback((result: CardResult) => {
    setResults((prev) => ({ ...prev, [result.videoId]: result }))
  }, [])

  const rerun = useCallback(() => {
    setResults({})
    setRunStart(performance.now())
    setRunId((n) => n + 1)
  }, [])

  const set = <K extends keyof TestConfig>(key: K, value: TestConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }))

  const applyPreset = (preset: TestConfig) => {
    setConfig(preset)
    setResults({})
    setRunStart(performance.now())
    setRunId((n) => n + 1)
  }

  // Aggregate the perceptible metric (first painted frame) across all cards.
  const firstFrames = cards
    .map((c) => results[c.id]?.tFirstFrame)
    .filter((v): v is number => v != null)
  const placeholders = cards
    .map((c) => results[c.id]?.tPlaceholder)
    .filter((v): v is number => v != null)
  const totalBytes = cards.reduce(
    (sum, c) => sum + (results[c.id]?.bytesToFirstFrame ?? 0),
    0,
  )
  const under = (ms: number) => firstFrames.filter((v) => v <= ms).length

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      <header className="mb-6">
        <h1 className="font-mono text-lg text-foreground">Grid preview speed test</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Measures time-to-first-painted-frame across a simulated grid. The
          placeholder is the &ldquo;instant impression&rdquo;; the gap between it
          and the first frame is the perceptible load. Re-run between changes —
          numbers are warmest on a hard reload.
        </p>
      </header>

      {/* Presets */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => applyPreset(BASELINE)} className={btn}>
          Baseline (production)
        </button>
        <button onClick={() => applyPreset(INSTANT_PRESET)} className={btn}>
          Instant preset
        </button>
        <button onClick={rerun} className={`${btn} border-foreground/40`}>
          ↻ Re-run
        </button>
      </div>

      {/* Controls */}
      <div className="mb-6 grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border border-border bg-surface p-4 font-mono text-xs sm:grid-cols-3 lg:grid-cols-4">
        <Select
          label="max_resolution (Mux)"
          value={config.maxResolution}
          options={['none', '480p', '540p', '720p', '1080p']}
          onChange={(v) => set('maxResolution', v as TestConfig['maxResolution'])}
        />
        <Select
          label="startLevel"
          value={config.startLevel}
          options={['auto', 'lowest']}
          onChange={(v) => set('startLevel', v as TestConfig['startLevel'])}
        />
        <Select
          label="placeholder"
          value={config.placeholder}
          options={['none', 'mux-thumb', 'tiny-blur']}
          onChange={(v) => set('placeholder', v as TestConfig['placeholder'])}
        />
        <Select
          label="gating"
          value={config.gating}
          options={['all', 'viewport']}
          onChange={(v) => set('gating', v as TestConfig['gating'])}
        />
        <Select
          label="maxBufferLength (s)"
          value={String(config.maxBufferLength)}
          options={['2', '4', '6', '15', '30']}
          onChange={(v) => set('maxBufferLength', Number(v))}
        />
        <Select
          label="cards"
          value={String(config.cardCount)}
          options={['4', '8', '12', String(PLAYABLE.length)]}
          onChange={(v) => set('cardCount', Number(v))}
        />
        <Toggle
          label="capToPlayerSize"
          value={config.capToPlayerSize}
          onChange={(v) => set('capToPlayerSize', v)}
        />
        <Toggle
          label="testBandwidth"
          value={config.testBandwidth}
          onChange={(v) => set('testBandwidth', v)}
        />
        <Toggle
          label="preconnect"
          value={config.preconnect}
          onChange={(v) => set('preconnect', v)}
        />
      </div>

      {/* Aggregates */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="median first frame" value={fmt(median(firstFrames))} primary />
        <Stat label="p95 first frame" value={fmt(percentile(firstFrames, 95))} />
        <Stat label="median placeholder" value={fmt(median(placeholders))} />
        <Stat label="painted ≤500ms" value={`${under(500)}/${cards.length}`} />
        <Stat label="painted ≤1s" value={`${under(1000)}/${cards.length}`} />
        <Stat label="total bytes" value={fmtKb(totalBytes)} />
      </div>

      {/* Grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((video) => (
          <TestCard
            key={`${video.id}-${runId}`}
            video={video}
            config={config}
            runStart={runStart}
            onResult={onResult}
          />
        ))}
      </div>

      {/* Per-card table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="py-2 pr-4">company</th>
              <th className="py-2 pr-4">manifest</th>
              <th className="py-2 pr-4">first frag</th>
              <th className="py-2 pr-4">first frame</th>
              <th className="py-2 pr-4">placeholder</th>
              <th className="py-2 pr-4">start res</th>
              <th className="py-2 pr-4">bytes→frame</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((video) => {
              const r = results[video.id]
              return (
                <tr key={video.id} className="border-b border-border/50">
                  <td className="py-1.5 pr-4 text-foreground">{video.company}</td>
                  <td className="py-1.5 pr-4 text-muted">{fmt(r?.tManifest ?? null)}</td>
                  <td className="py-1.5 pr-4 text-muted">{fmt(r?.tFirstFrag ?? null)}</td>
                  <td className="py-1.5 pr-4 text-foreground">{fmt(r?.tFirstFrame ?? null)}</td>
                  <td className="py-1.5 pr-4 text-muted">{fmt(r?.tPlaceholder ?? null)}</td>
                  <td className="py-1.5 pr-4 text-muted">
                    {r?.startHeight ? `${r.startHeight}p` : '—'}
                  </td>
                  <td className="py-1.5 pr-4 text-muted">{fmtKb(r?.bytesToFirstFrame ?? null)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const btn =
  'rounded-full border border-border bg-surface px-3 py-1.5 font-mono text-xs text-foreground transition-colors hover:bg-foreground/10'

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-border bg-background px-2 py-1 text-foreground"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 self-end py-1">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5"
      />
      <span className="text-muted">{label}</span>
    </label>
  )
}

function Stat({
  label,
  value,
  primary = false,
}: {
  label: string
  value: string
  primary?: boolean
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        primary ? 'border-foreground/40 bg-foreground/5' : 'border-border bg-surface'
      }`}
    >
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 font-mono text-lg text-foreground">{value}</div>
    </div>
  )
}
