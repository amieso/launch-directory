'use client'

import { useSyncExternalStore } from 'react'

// Shared page-visibility signal. A single `visibilitychange` listener backs
// every subscriber (the grid mounts dozens of video cards) instead of each one
// attaching its own. Lets cards pause playback — and stop streaming from Mux —
// while the tab is backgrounded, which is the common "left it open for a while"
// case where previews would otherwise keep decoding and fetching forever.
function subscribe(callback: () => void) {
  document.addEventListener('visibilitychange', callback)
  return () => document.removeEventListener('visibilitychange', callback)
}

export function usePageVisible() {
  return useSyncExternalStore(
    subscribe,
    () => !document.hidden,
    () => true, // assume visible during SSR
  )
}
