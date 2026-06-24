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

// Human-readable platform name for a source URL, used for "View on X" links.
// Falls back to "Source" for hosts we don't recognize.
export function platformName(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    if (host === 'x.com' || host === 'twitter.com') return 'X'
    if (host === 'youtube.com' || host === 'youtu.be' || host.endsWith('.youtube.com')) return 'YouTube'
    if (host === 'vimeo.com' || host.endsWith('.vimeo.com')) return 'Vimeo'
    if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) return 'LinkedIn'
    if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) return 'TikTok'
    if (host === 'instagram.com' || host.endsWith('.instagram.com')) return 'Instagram'
    return 'Source'
  } catch {
    return 'Source'
  }
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
