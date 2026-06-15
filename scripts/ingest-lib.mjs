// Shared helpers for the lowkey video ingest pipeline.
//
// The pipeline mirrors the old videoDirectory tooling (yt-dlp -> Mux -> playback id),
// but instead of writing a thin videos.json it scaffolds a fully-typed `Video` draft
// straight into src/data/videos.ts with editorial fields left as TODO for a human.
//
// In-flight Mux uploads (which only have an upload id until transcoding finishes) are
// tracked in a sidecar state file so the `Video` type itself stays pristine — no
// muxUploadId/status fields leak into the runtime data.

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const projectRoot = path.join(__dirname, '..')
export const SCRIPTS_DIR = __dirname
export const UPLOADS_DIR = path.join(projectRoot, 'uploads')
export const PROCESSED_DIR = path.join(UPLOADS_DIR, 'processed')
export const FAILED_DIR = path.join(UPLOADS_DIR, 'failed')
export const VIDEOS_FILE = path.join(projectRoot, 'src', 'data', 'videos.ts')
export const STATE_FILE = path.join(SCRIPTS_DIR, '.ingest-state.json')

// Line we insert new drafts above. Added to videos.ts so writes are deterministic.
export const ANCHOR = '  // INGEST_ANCHOR'

export const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.avi']

export function ensureDirectories() {
  for (const dir of [UPLOADS_DIR, PROCESSED_DIR, FAILED_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  }
}

// ── Sidecar state (in-flight Mux uploads) ──────────────────────────────────

// Shape: { pending: [{ id, uploadId, checksum, slug, companySlug, sourceUrl, ... }] }
export function readState() {
  if (!fs.existsSync(STATE_FILE)) return { pending: [] }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'))
}

export function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n')
}

// ── videos.ts helpers ───────────────────────────────────────────────────────

export function readVideosFile() {
  return fs.readFileSync(VIDEOS_FILE, 'utf-8')
}

// Existing (companySlug/slug) paths and source URLs, for dedup. We parse the
// generated TS as text — good enough since we only read string literal fields.
export function existingVideoKeys() {
  const source = readVideosFile()
  const slugs = [...source.matchAll(/slug:\s*'([^']*)'/g)].map((m) => m[1])
  const companySlugs = [...source.matchAll(/companySlug:\s*'([^']*)'/g)].map((m) => m[1])
  const twitterUrls = [...source.matchAll(/twitterUrl:\s*'([^']*)'/g)].map((m) => m[1])
  const youtubeUrls = [...source.matchAll(/youtubeUrl:\s*'([^']*)'/g)].map((m) => m[1])
  const ids = [...source.matchAll(/\bid:\s*'([^']*)'/g)].map((m) => m[1])
  return {
    sourceUrls: new Set([...twitterUrls, ...youtubeUrls].filter(Boolean)),
    ids,
    // (companySlug + '/' + slug) is built per-entry below; we keep raw lists too.
    slugs,
    companySlugs,
  }
}

// Next numeric id (existing ids are sequential strings '1','2',...). Includes
// ids already reserved in the sidecar so concurrent drafts don't collide.
export function nextVideoId() {
  const { ids } = existingVideoKeys()
  const pendingIds = readState().pending.map((p) => p.id)
  const max = [...ids, ...pendingIds]
    .map((id) => parseInt(id, 10))
    .filter((n) => !Number.isNaN(n))
    .reduce((a, b) => Math.max(a, b), 0)
  return String(max + 1)
}

export function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Ensure (companySlug/slug) is unique against videos.ts and the sidecar.
export function uniqueSlug(companySlug, desired) {
  const source = readVideosFile()
  const taken = new Set()
  // Reconstruct existing pairs by walking entries in order.
  const blocks = source.split(/\n  \{/)
  for (const block of blocks) {
    const cs = block.match(/companySlug:\s*'([^']*)'/)?.[1]
    const s = block.match(/\bslug:\s*'([^']*)'/)?.[1]
    if (cs && s) taken.add(`${cs}/${s}`)
  }
  for (const p of readState().pending) taken.add(`${p.companySlug}/${p.slug}`)

  let slug = desired || 'video'
  let n = 2
  while (taken.has(`${companySlug}/${slug}`)) {
    slug = `${desired || 'video'}-${n++}`
  }
  return slug
}

// Build the TypeScript source for one draft Video entry. Editorial fields are
// TODO placeholders; videoUrl/thumbnailUrl stay empty until `publish` fills them
// (an empty videoUrl is filtered out by findCompanyVideos/findVideo, so the draft
// is invisible on the site until Mux is ready).
export function renderDraftEntry(v) {
  const today = new Date().toISOString().slice(0, 10)
  const sourceLine = v.sourceUrl ? `    sourceUrl: '${v.sourceUrl}',\n` : ''
  return `  {
    id: '${v.id}',
    slug: '${v.slug}',
    companySlug: '${v.companySlug}',
    title: 'TODO: ${escapeSingle(v.titleGuess || v.companySlug)}',
    company: 'TODO: ${escapeSingle(v.companyGuess || v.companySlug)}',
    description: 'TODO: write a 1-2 sentence editorial description.',
    videoUrl: '', // ingest:pending uploadId=${v.uploadId}
    thumbnailUrl: '', // ingest:pending uploadId=${v.uploadId}
    duration: ${v.duration},
    aspectRatio: '${v.aspectRatio}',
${sourceLine}    credits: [], // TODO: add credits
    featured: false,
    publishedDate: '${v.publishedDate || today}',
  },
`
}

function escapeSingle(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

// Insert a rendered entry just above the INGEST_ANCHOR line.
export function appendDraftEntry(entryText) {
  const source = readVideosFile()
  const anchorIndex = source.indexOf(ANCHOR)
  if (anchorIndex === -1) {
    throw new Error(`INGEST_ANCHOR not found in ${VIDEOS_FILE}. Cannot insert draft.`)
  }
  const updated = source.slice(0, anchorIndex) + entryText + source.slice(anchorIndex)
  fs.writeFileSync(VIDEOS_FILE, updated)
}

// Replace the pending placeholders for one uploadId with real Mux URLs.
export function publishEntry(uploadId, playbackId) {
  let source = readVideosFile()
  const videoUrl = `https://stream.mux.com/${playbackId}.m3u8`
  const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.webp?time=5`
  const before = source

  source = source.replace(
    `    videoUrl: '', // ingest:pending uploadId=${uploadId}`,
    `    videoUrl: '${videoUrl}',`,
  )
  source = source.replace(
    `    thumbnailUrl: '', // ingest:pending uploadId=${uploadId}`,
    `    thumbnailUrl: '${thumbnailUrl}',`,
  )

  if (source === before) return false
  fs.writeFileSync(VIDEOS_FILE, source)
  return true
}

export function calculateChecksum(filePath) {
  return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex')
}
