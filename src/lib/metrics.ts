import metricsData from '@/data/metrics.json'

export interface TweetMetrics {
  likes: number
  replies: number
  retweets: number
  quotes: number
  bookmarks: number
  impressions: number
  fetchedAt: string
}

const metrics = metricsData as Record<string, Partial<TweetMetrics>>

/** Extract the numeric tweet ID from an x.com / twitter.com status URL. */
export function tweetIdFromUrl(url?: string): string | null {
  if (!url) return null
  const match = url.match(/status\/(\d+)/)
  return match ? match[1] : null
}

/** Look up cached X metrics for a video's sourceUrl, or null if none. */
export function getMetrics(sourceUrl?: string): TweetMetrics | null {
  const id = tweetIdFromUrl(sourceUrl)
  if (!id) return null
  const m = metrics[id]
  if (!m) return null
  return {
    likes: m.likes ?? 0,
    replies: m.replies ?? 0,
    retweets: m.retweets ?? 0,
    quotes: m.quotes ?? 0,
    bookmarks: m.bookmarks ?? 0,
    impressions: m.impressions ?? 0,
    fetchedAt: m.fetchedAt ?? '',
  }
}

/** Compact human count: 7087 -> "7.1k", 2547681 -> "2.5M". */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}
