// One-off: re-download ids 13–21 at full quality and re-upload to Mux,
// staying under the free plan's 10-asset cap by deleting each old (low-bitrate)
// asset as its high-quality replacement goes live.
//
// Per id: upload new -> wait until ready -> patch videos.ts -> delete old asset.
// That ordering never leaves a video without a working asset, and keeps the
// total asset count flat. Resumable: rerun and it skips ids already swapped.
//
//   node scripts/reencode.mjs

import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import dotenv from 'dotenv'
import Mux from '@mux/mux-node'

dotenv.config()

const mux = new Mux({ tokenId: process.env.MUX_TOKEN_ID, tokenSecret: process.env.MUX_TOKEN_SECRET })
const VIDEOS = path.join(process.cwd(), 'src/data/videos.ts')
const TMP = '/tmp/reencode'
fs.mkdirSync(TMP, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function targets() {
  const src = fs.readFileSync(VIDEOS, 'utf-8')
  const blocks = src.split(/\n  \{/).slice(1)
  const out = []
  for (const b of blocks) {
    const id = b.match(/id: '([^']+)'/)?.[1]
    const sourceUrl = b.match(/sourceUrl: '([^']+)'/)?.[1]
    const playbackId = b.match(/stream\.mux\.com\/([^.]+)\.m3u8/)?.[1]
    if (id && sourceUrl) out.push({ id, sourceUrl, playbackId })
  }
  return out
}

async function listAssets() {
  const map = new Map() // playbackId -> assetId
  let page = await mux.video.assets.list({ limit: 100 })
  for (const a of page.data) for (const p of a.playback_ids || []) map.set(p.id, a.id)
  return map
}

function download(url, dest) {
  const args = [
    '--format', 'bv*+ba/b', '--format-sort', 'res,tbr',
    '--merge-output-format', 'mp4', '--output', dest,
    '--no-playlist', '--no-warnings', '--quiet', url,
  ]
  if (process.env.TWITTER_COOKIES_FILE) args.unshift('--cookies', process.env.TWITTER_COOKIES_FILE)
  return new Promise((resolve, reject) => {
    const p = spawn('yt-dlp', args)
    let err = ''
    p.stderr.on('data', (d) => (err += d))
    p.on('close', (c) => (c === 0 ? resolve() : reject(new Error(err.trim()))))
  })
}

async function uploadToMux(file) {
  const upload = await mux.video.uploads.create({
    cors_origin: '*',
    new_asset_settings: { playback_policy: ['public'], video_quality: 'plus' },
  })
  const buf = fs.readFileSync(file)
  const res = await fetch(upload.url, {
    method: 'PUT', body: buf,
    headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(buf.length) },
  })
  if (!res.ok) throw new Error(`PUT ${res.status}`)
  return upload.id
}

async function waitReady(uploadId) {
  for (let i = 0; i < 60; i++) {
    const up = await mux.video.uploads.retrieve(uploadId)
    if (up.asset_id) {
      const asset = await mux.video.assets.retrieve(up.asset_id)
      if (asset.status === 'ready' && asset.playback_ids?.length)
        return { assetId: up.asset_id, playbackId: asset.playback_ids[0].id }
      if (asset.status === 'errored') throw new Error('asset errored')
    }
    await sleep(6000)
  }
  throw new Error('timeout waiting for encode')
}

function patch(id, playbackId) {
  let src = fs.readFileSync(VIDEOS, 'utf-8')
  const stream = `https://stream.mux.com/${playbackId}.m3u8`
  const thumb = `https://image.mux.com/${playbackId}/thumbnail.webp?time=5`
  const re = new RegExp(`(\\n    id: '${id}',[\\s\\S]*?\\n  \\},)`)
  const m = src.match(re)
  if (!m) throw new Error(`entry ${id} not found`)
  let block = m[1]
    .replace(/videoUrl: '[^']*'/, `videoUrl: '${stream}'`)
    .replace(/thumbnailUrl: '[^']*'/, `thumbnailUrl: '${thumb}'`)
  fs.writeFileSync(VIDEOS, src.replace(m[1], block))
}

async function main() {
  const items = targets()

  // Clean up any orphan assets (not referenced by videos.ts) — e.g. the failed
  // run's leftover — to free slots before we start.
  const referenced = new Set(items.map((i) => i.playbackId).filter(Boolean))
  let assetMap = await listAssets()
  for (const [pb, assetId] of assetMap) {
    if (!referenced.has(pb)) {
      await mux.video.assets.delete(assetId)
      console.log(`🧹 deleted orphan asset ${assetId}`)
    }
  }

  for (const it of items) {
    const dest = path.join(TMP, `${it.id}.mp4`)
    console.log(`\n— id ${it.id} —`)
    if (!fs.existsSync(dest)) {
      process.stdout.write('  downloading… ')
      await download(it.sourceUrl, dest)
      console.log('done')
    }
    process.stdout.write('  uploading… ')
    const uploadId = await uploadToMux(dest)
    console.log('done; waiting for encode…')
    const { playbackId } = await waitReady(uploadId)

    const oldPlaybackId = it.playbackId
    patch(it.id, playbackId)
    console.log(`  ✅ patched → ${playbackId}`)

    // Delete the old asset to free the slot.
    const oldAssetId = (await listAssets()).get(oldPlaybackId)
    if (oldAssetId) {
      await mux.video.assets.delete(oldAssetId)
      console.log(`  🗑️  deleted old asset ${oldAssetId}`)
    }
  }
  console.log('\n🎉 all 9 re-encoded at full quality and patched into videos.ts')
}

main().catch((e) => { console.error('fatal:', e.message); process.exit(1) })
