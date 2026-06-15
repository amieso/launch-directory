// Self-contained config + helpers for the /speed-test harness.
// Everything here is throwaway/experimental — safe to delete once we've
// picked a winning grid-preview strategy and wired it into production.

export type MaxResolution = 'none' | '480p' | '540p' | '720p' | '1080p'
export type StartLevel = 'auto' | 'lowest'
export type Placeholder = 'none' | 'mux-thumb' | 'tiny-blur'
export type Gating = 'all' | 'viewport'

export interface TestConfig {
  /** Mux server-side cap: trims high renditions out of the manifest entirely. */
  maxResolution: MaxResolution
  /** HLS.js: never auto-pick a rendition larger than the player element. */
  capToPlayerSize: boolean
  /** HLS.js: start at the lowest rendition (fast first frame) vs ABR's choice. */
  startLevel: StartLevel
  /** HLS.js: probe bandwidth before committing to a start level. */
  testBandwidth: boolean
  /** HLS.js: seconds to buffer ahead. Lower = less data per looping preview. */
  maxBufferLength: number
  /** What to show before the first video frame paints. */
  placeholder: Placeholder
  /** Warm DNS+TLS to the Mux hosts via <link rel="preconnect">. */
  preconnect: boolean
  /** Mount every player at once (today's behaviour) vs only near the viewport. */
  gating: Gating
  /** How many cards to render — simulates real grid bandwidth contention. */
  cardCount: number
}

export const DEFAULT_CONFIG: TestConfig = {
  maxResolution: 'none',
  capToPlayerSize: false,
  startLevel: 'auto',
  testBandwidth: true,
  maxBufferLength: 30,
  placeholder: 'mux-thumb',
  preconnect: false,
  gating: 'all',
  cardCount: 8,
}

// Mirrors production defaults — the baseline we're trying to beat.
export const BASELINE: TestConfig = { ...DEFAULT_CONFIG }

// Hypothesis for a near-instant grid: cheap blurred placeholder, capped
// renditions, lowest start level, shallow buffer, warm connections, and only
// mount what's visible so the on-screen previews get all the bandwidth.
export const INSTANT_PRESET: TestConfig = {
  maxResolution: '540p',
  capToPlayerSize: true,
  startLevel: 'lowest',
  testBandwidth: false,
  maxBufferLength: 6,
  placeholder: 'tiny-blur',
  preconnect: true,
  gating: 'viewport',
  cardCount: 8,
}

const RESOLUTION_HEIGHT: Record<MaxResolution, string | null> = {
  none: null,
  '480p': '480p',
  '540p': '540p',
  '720p': '720p',
  '1080p': '1080p',
}

/** Pull the Mux playback ID out of a `stream.mux.com/{id}.m3u8` URL. */
export function muxPlaybackId(videoUrl: string): string | null {
  const match = videoUrl.match(/stream\.mux\.com\/([^.?/]+)\.m3u8/)
  return match ? match[1] : null
}

/** Apply Mux's server-side `max_resolution` cap to a playback URL. */
export function buildSrc(videoUrl: string, maxResolution: MaxResolution): string {
  const height = RESOLUTION_HEIGHT[maxResolution]
  if (!height) return videoUrl
  const join = videoUrl.includes('?') ? '&' : '?'
  return `${videoUrl}${join}max_resolution=${height}`
}

/** Mux thumbnail URL — `width` keeps the tiny-blur placeholder ~1KB. */
export function thumbnailSrc(videoUrl: string, width?: number): string | null {
  const id = muxPlaybackId(videoUrl)
  if (!id) return null
  const params = new URLSearchParams({ time: '5' })
  if (width) params.set('width', String(width))
  return `https://image.mux.com/${id}/thumbnail.webp?${params.toString()}`
}

export const MUX_HOSTS = ['https://stream.mux.com', 'https://image.mux.com'] as const

export interface CardResult {
  videoId: string
  /** ms from run start to MANIFEST_PARSED. */
  tManifest: number | null
  /** ms from run start to first segment buffered. */
  tFirstFrag: number | null
  /** ms from run start to first painted frame (the perceptible metric). */
  tFirstFrame: number | null
  /** ms from run start to placeholder image load. */
  tPlaceholder: number | null
  /** Bytes pulled by HLS.js up to the first painted frame. */
  bytesToFirstFrame: number | null
  /** Resolution height of the first rendition that played. */
  startHeight: number | null
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)
  return sorted[Math.max(0, idx)]
}
