// Client → /api/watch reporting for the future "Popular" ranking and per-video
// session analytics. This is the one signal we can't backfill: how long people
// actually watch. It's best-effort and fires at moments the page may be tearing
// down (tab switch, modal close, navigation away), so it MUST survive teardown —
// hence `navigator.sendBeacon`, with a keepalive `fetch` fallback for the rare
// browser without it. Callers never await or branch on the result.

// Floor below which a report isn't worth sending. Accidental opens and instant
// dismissals shouldn't pollute the data, and they'd be clamped to noise anyway.
export const MIN_REPORTABLE_SECONDS = 2

export interface WatchReport {
  video_id: string
  /** Engaged seconds since the last flush — increments the all-time counter. */
  seconds: number
  /** Ties a watch session's flushes together so the stream can dedupe to one session. */
  session_id?: string
  /** Cumulative engaged seconds this session — the session's progress into the video. */
  watched?: number
}

/** Fire-and-forget a watch report. No-ops on the server. */
export function reportWatchTime(report: WatchReport): void {
  if (typeof navigator === 'undefined') return
  const body = JSON.stringify(report)
  try {
    const blob = new Blob([body], { type: 'application/json' })
    if (navigator.sendBeacon?.('/api/watch', blob)) return
  } catch {
    // sendBeacon unavailable or threw — fall through to fetch.
  }
  fetch('/api/watch', {
    method: 'POST',
    body,
    // keepalive lets the request outlive the page that fired it.
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}
