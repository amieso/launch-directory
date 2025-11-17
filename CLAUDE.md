# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Video directory website showcasing product launch videos. Built with Next.js 16 + Mux for video hosting. Videos are displayed in a grid with HLS playback.

## Architecture

**Single Source of Truth:** `app/videos.json` contains all video metadata (Mux IDs, playback IDs, placeholders, status). This file is directly imported by the Next.js app and updated by processing scripts.

**Video Processing Pipeline:**
1. Download videos from YouTube/Twitter → `../uploads/`
2. Process videos → Upload to Mux, extract metadata/placeholder
3. Auto-poll Mux API every 30s (up to 10 min) → Update `app/videos.json` with playback IDs
4. Website reads updated JSON → Videos display automatically

**Key Files:**
- `scripts/download-media.js` - Downloads videos using yt-dlp, auto-triggers processing
- `scripts/process-videos.js` - Uploads to Mux, includes auto-polling (checks every 30s for playback IDs)
- `scripts/update-playback-ids.js` - Manual fallback to fetch Mux playback IDs
- `app/videos.json` - Video data (tracked in git)
- `app/types.ts` - Video interface definitions

**Video Status Flow:**
`uploading` (Mux processing upload) → `preparing` (Mux encoding) → `ready` (playback available)

## Development Commands

```bash
# Development
npm run dev              # Start Next.js dev server (port 3000)
npm run build           # Production build
npm run lint            # Run ESLint

# Video Processing (requires .env with MUX_TOKEN_ID and MUX_TOKEN_SECRET)
npm run download "url"              # Download from YouTube/Twitter, auto-process
npm run process                     # Process videos in ../uploads/, auto-poll for IDs
npm run process --no-poll          # Process without auto-polling
npm run process:dry-run            # Preview what would be processed
npm run update-playback-ids        # Manually fetch playback IDs from Mux
```

## Important Notes

- Git repo is rooted at `/website` (parent `/videoDirectory` is not tracked)
- Scripts reference `../uploads/` (outside git repo) for source videos
- Requires `.env` file with Mux credentials for video processing
- Auto-polling blocks for up to 10 minutes waiting for Mux to process videos
- Videos use MD5 checksum for duplicate detection
- Placeholders are 20x13px base64-encoded JPEGs extracted from first frame
