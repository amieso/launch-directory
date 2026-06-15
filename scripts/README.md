# Video ingest pipeline

Turns an x.com / YouTube link (or a local file) into a draft entry in
`src/data/videos.ts`, uploaded and streamed via Mux. Adapted from the old
`videoDirectory` tooling, but tailored to lowkey's typed `Video` model.

## One-time setup

```bash
brew install yt-dlp ffmpeg          # download + probe
cp .env.example .env.local          # add MUX_TOKEN_ID / MUX_TOKEN_SECRET
```

Mux tokens: https://dashboard.mux.com/settings/access-tokens (Mux Video: Read + Write).

## Usage

```bash
# Download, upload to Mux, and scaffold a draft in videos.ts
npm run ingest "https://x.com/user/status/123456789"

# Several at once (x.com, twitter.com, youtube.com all work)
npm run ingest "https://x.com/a/status/1" "https://youtu.be/abc"

# A local file you already have
npm run ingest ./Downloads/launch.mp4

# Download + draft only, skip Mux
npm run ingest "<url>" --no-upload

# Fill in playback URLs once Mux finishes encoding (repeat until nothing pending)
npm run publish
```

## How it works

1. **`ingest`** — `yt-dlp` downloads to `uploads/`, `ffprobe` reads duration +
   aspect ratio, the file is uploaded to Mux, and a fully-typed `Video` draft is
   inserted into `videos.ts` above the `INGEST_ANCHOR` line. Editorial fields
   (title, company, description, style, credits, …) are written as `TODO`
   placeholders. `videoUrl`/`thumbnailUrl` start empty.
2. **`publish`** — Mux encodes asynchronously, so the draft has no playback id
   yet. This polls Mux for each pending upload and, once `ready`, rewrites the
   empty URLs with real Mux stream/thumbnail URLs.

A draft with an empty `videoUrl` is filtered out by `findCompanyVideos` /
`findVideo`, so **it stays invisible on the site until `publish` makes it live.**
That means you can ingest a batch, then fill in the `TODO` fields at your leisure.

## State & dedup

- In-flight Mux uploads are tracked in `scripts/.ingest-state.json` (gitignored).
  The runtime `Video` type never carries upload-id/status fields.
- Re-ingesting the same source URL (already in `videos.ts`) or the same file
  bytes (already pending) is skipped.
- Source files are moved to `uploads/processed/` on success, `uploads/failed/`
  on error. `uploads/` is gitignored.

## After ingesting

Search `videos.ts` for `TODO:` and fill in the editorial fields for each new
entry — `title`, `company`, `companyLogoUrl`, `description`, `credits`, and a
tidy `slug` / `companySlug`.
