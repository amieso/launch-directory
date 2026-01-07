# Restart Dev Server

Kill any running Next.js dev server and restart it.

## Steps

1. Find and kill any process running on port 3000:
   ```bash
   lsof -ti:3000 | xargs kill -9 2>/dev/null || true
   ```

2. Start the dev server in the background:
   ```bash
   npm run dev
   ```
   Run this as a background task so the conversation can continue.

## Notes
- The dev server runs on port 3000 by default
- Uses `npm run dev` which runs `next dev --turbopack`
