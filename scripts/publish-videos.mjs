// Resolve Mux playback IDs for pending ingests and fill them into videos.ts.
//
//   npm run publish
//
// Mux encodes asynchronously, so a freshly-ingested draft has an upload id but no
// playback id yet. This reads the sidecar state written by `ingest`, polls Mux for
// each pending upload, and once an asset is `ready` rewrites the draft's empty
// videoUrl/thumbnailUrl with real Mux URLs — which also makes it visible on the
// site (findCompanyVideos filters out entries with an empty videoUrl).
//
// Run it again every few minutes until nothing is left pending.

import path from 'path'
import dotenv from 'dotenv'
import Mux from '@mux/mux-node'

import { readState, writeState, publishEntry } from './ingest-lib.mjs'

dotenv.config()
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
  console.error('❌ MUX_TOKEN_ID / MUX_TOKEN_SECRET not set (see .env.example).')
  process.exit(1)
}

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
})

async function main() {
  const state = readState()
  if (state.pending.length === 0) {
    console.log('✅ Nothing pending. All ingested videos are published.')
    return
  }

  console.log(`🔄 Checking ${state.pending.length} pending upload(s)…\n`)

  const stillPending = []
  let published = 0

  for (const item of state.pending) {
    const label = `${item.companySlug}/${item.slug} (id ${item.id})`
    try {
      // Resolve the upload -> asset -> playback id chain.
      const upload = await mux.video.uploads.retrieve(item.uploadId)
      if (!upload.asset_id) {
        console.log(`  ⏳ ${label}: upload still in progress`)
        stillPending.push(item)
        continue
      }

      const asset = await mux.video.assets.retrieve(upload.asset_id)
      if (asset.status === 'ready' && asset.playback_ids?.length) {
        const playbackId = asset.playback_ids[0].id
        const ok = publishEntry(item.uploadId, playbackId)
        if (ok) {
          console.log(`  ✅ ${label}: live → ${playbackId}`)
          published++
        } else {
          console.log(`  ⚠️  ${label}: ready, but placeholders not found in videos.ts (already published?)`)
        }
      } else if (asset.status === 'errored') {
        console.log(`  ❌ ${label}: Mux asset errored — dropping from queue`)
      } else {
        console.log(`  ⏳ ${label}: asset ${asset.status}`)
        stillPending.push(item)
      }
    } catch (e) {
      console.log(`  ❌ ${label}: ${e.message}`)
      stillPending.push(item)
    }
  }

  writeState({ ...state, pending: stillPending })

  console.log(`\n📊 Published ${published} · ${stillPending.length} still pending`)
  if (stillPending.length > 0) {
    console.log('   Mux is still encoding. Run `npm run publish` again in a few minutes.')
  }
}

main().catch((e) => {
  console.error('\n❌ Fatal:', e)
  process.exit(1)
})
