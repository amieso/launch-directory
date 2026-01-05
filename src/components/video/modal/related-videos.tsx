'use client'

import { Video } from '@/types/video'
import { getRelatedVideos } from '@/lib/get-related-videos'

interface RelatedVideosProps {
  currentVideo: Video
  allVideos: Video[]
  onVideoSelect: (video: Video) => void
}

export function RelatedVideos({ currentVideo, allVideos, onVideoSelect }: RelatedVideosProps) {
  const relatedVideos = getRelatedVideos(currentVideo, allVideos, 6)

  if (relatedVideos.length === 0) return null

  return (
    <div className="px-6 md:px-10 py-6 bg-modal-black border-t border-white/10">
      <h2 className="text-base md:text-lg font-medium text-white mb-4">Related Videos</h2>

      {/* Horizontal scroll container */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x scrollbar-hide">
        {relatedVideos.map(video => (
          <button
            key={video.id}
            onClick={() => onVideoSelect(video)}
            className="flex-shrink-0 w-[150px] md:w-[200px] snap-start group text-left"
          >
            {/* Thumbnail */}
            <div className="aspect-video rounded overflow-hidden bg-surface mb-2">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            {/* Title */}
            <p className="text-xs md:text-sm text-white/80 truncate group-hover:text-white transition-colors">
              {video.title}
            </p>
            <p className="text-[10px] md:text-xs text-white/50">{video.company}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
