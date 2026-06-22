import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Video } from '@/types/video'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Canonical path for a video. The single place URLs are built, so links can't
// drift from the route. Keyed off stored slugs — never derived from display names.
export function videoPath(video: Pick<Video, 'companySlug' | 'slug'>): string {
  return `/${video.companySlug}/${video.slug}`
}

// Mux serves the full-resolution frame by default — a single grid thumbnail can
// be ~470KB, and dozens loading at once saturate the connection (delaying both
// the placeholder paint and the HLS segments behind it). Cap the width so each
// one is ~80KB. Each (asset, width) is cached separately at Mux's edge for a
// week. No-op for non-Mux URLs or ones already carrying a width.
export function sizedThumbnail(url: string, width: number): string {
  if (!url.includes('image.mux.com') || /[?&]width=/.test(url)) return url
  return `${url}${url.includes('?') ? '&' : '?'}width=${width}`
}

// Turns a company slug back into a display name for pages we don't have data
// for (e.g. the request page). Display-only — never used as a key.
export function unslugifyCompany(slug: string): string {
  return slug
    .split('-')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ')
}
