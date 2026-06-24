import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { videos } from '@/data/videos'

// Watch-time collection for the future "Popular" ranking + per-video session
// analytics. State lives in Upstash Redis in two shapes:
//   • `video:{id}` hash → { seconds } — an all-time engaged-seconds counter,
//     O(1) to read, the fast path for ranking. Incremented by per-flush deltas.
//   • `video:{id}:sessions` stream → one entry per flush, fields { sid, s, p }.
//     Entry IDs are millisecond timestamps (free chronological/time-window
//     reads). A reader groups by `sid` and takes max(`s`) to reconstruct each
//     session's watch-time — so the multiple flushes a session may emit (tab
//     switch, then close) collapse to one session, and the session COUNT is the
//     number of distinct sids (no overcount). Length-capped so it can't grow
//     without bound.
// Counters/streams, not a relational store — the right shape and write profile
// for bursty increments fired from every viewer. The eventual ranking script
// reads these and writes a `popularity` field onto videos.ts, mirroring the
// existing X-metrics prebuild flow.
//
// This endpoint is public and unauthenticated (anonymous visitors have no
// credential), so it can't trust the caller. Two guards keep casual abuse cheap
// to repel: every report is clamped to the video's own length, and writes are
// rate-limited per IP. A determined attacker rotating IPs can still nudge a
// counter — acceptable for a vanity ranking on a curated showcase. When that
// stops being acceptable, the signed-ticket layer drops into `verifyTicket`
// below without touching the rest of this route.

// video_id → max seconds one report may add (the video's length). One forged
// call then can't claim more watching than the video physically contains.
const durationById = new Map(videos.map((v) => [v.id, v.duration]))

const bodySchema = z.object({
  video_id: z.string(),
  seconds: z.number().positive(),
  // Optional so an older deployed client (counter-only) still validates during a
  // deploy rollover; the current client always sends both.
  session_id: z.string().optional(),
  watched: z.number().positive().optional(),
})

// Bound per-video stream growth. ~10k sessions is years of history at this
// site's scale; `~` lets Redis trim cheaply at radix-tree-node boundaries.
const SESSIONS_MAXLEN = 10_000

// Built lazily so the route stays importable — and the app keeps building —
// when Redis isn't configured. Local dev without creds simply no-ops.
//
// Accepts either env naming so provisioning is one click: Upstash's own
// (UPSTASH_REDIS_REST_*) or the legacy Vercel-KV names (KV_REST_API_*) that the
// Vercel Marketplace integration injects automatically.
function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

let ratelimit: Ratelimit | null = null
function getRatelimit(redis: Redis): Ratelimit {
  // A genuine viewer flushes a handful of times per video (tab-switch, close).
  // 30/min/IP leaves ample room for fast browsing while capping scripted
  // inflation hard.
  ratelimit ??= new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '60 s'),
    prefix: 'ratelimit:watch',
  })
  return ratelimit
}

// Seam for the future signed-ticket layer: once we issue short-lived HMAC
// tickets on page load, verify them here before counting. Today the endpoint is
// open (clamp + rate-limit only), so this passes everything.
function verifyTicket(_request: Request): boolean {
  return true
}

export async function POST(request: Request) {
  const redis = getRedis()
  if (!redis) return NextResponse.json({ skipped: true })

  if (!verifyTicket(request)) {
    return NextResponse.json({ error: 'Invalid ticket' }, { status: 403 })
  }

  // sendBeacon delivers the body as an opaque blob, so read raw text and parse
  // rather than trusting a content-type header to route JSON parsing.
  let payload: unknown
  try {
    payload = JSON.parse(await request.text())
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const maxSeconds = durationById.get(parsed.data.video_id)
  if (maxSeconds === undefined) {
    return NextResponse.json({ error: 'Unknown video' }, { status: 400 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { success } = await getRatelimit(redis).limit(ip)
  if (!success) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
  }

  const key = `video:${parsed.data.video_id}`
  // Clamp the delta to the video's length so one report can't claim more
  // watching than the video physically contains.
  const delta = Math.min(Math.round(parsed.data.seconds), maxSeconds)
  const ops: Promise<unknown>[] = [redis.hincrby(key, 'seconds', delta)]

  // Per-session record. `s` is this session's progress into the video (capped at
  // its length); `p` is that as a percentage. Multiple flushes share `sid`, so a
  // reader takes max(`s`) per `sid` for the session's watch-time.
  if (parsed.data.session_id && parsed.data.watched !== undefined) {
    const progress = Math.min(Math.round(parsed.data.watched), maxSeconds)
    const pct = maxSeconds > 0 ? Math.min(100, Math.round((progress / maxSeconds) * 100)) : 0
    ops.push(
      redis.xadd(
        `${key}:sessions`,
        '*',
        { sid: parsed.data.session_id, s: progress, p: pct },
        { trim: { type: 'MAXLEN', threshold: SESSIONS_MAXLEN, comparison: '~' } },
      ),
    )
  }

  await Promise.all(ops)
  return NextResponse.json({ ok: true })
}
