import { Video } from '@/types/video'

/**
 * Find related videos based on matching style and productType.
 * Scoring: +2 for matching style, +1 for matching productType.
 * Excludes current video and ghost cards (empty videoUrl).
 */
export function getRelatedVideos(current: Video, all: Video[], limit = 6): Video[] {
  return all
    .filter(v => v.id !== current.id && v.videoUrl) // Exclude current and ghosts
    .map(v => {
      let score = 0
      if (v.style === current.style) score += 2
      if (v.productType === current.productType) score += 1
      return { video: v, score }
    })
    .sort((a, b) => b.score - a.score) // Higher score first
    .slice(0, limit)
    .map(({ video }) => video)
}
