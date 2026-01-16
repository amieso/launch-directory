'use client'

import Link from 'next/link'
import { Video, STYLE_LABELS, PRODUCT_TYPE_LABELS } from '@/types/video'
import { formatDuration } from '@/lib/utils'

interface VideoMetadataProps {
  video: Video
}

export function VideoMetadata({ video }: VideoMetadataProps) {
  const year = new Date(video.publishedDate).getFullYear()

  return (
    <div className="px-6 md:px-10 py-6 bg-modal-black">
      {/* Row 1: Badges */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm mb-5">
        {/* Year - green */}
        <span className="text-green-500 font-medium">{year}</span>

        {/* HD badge */}
        <span className="px-1.5 py-0.5 border border-white/40 text-[10px] text-white/70 font-medium tracking-wide">
          HD
        </span>

        {/* Style badge */}
        <span className="px-2 py-0.5 border border-white/30 rounded text-xs text-white/70">
          {STYLE_LABELS[video.style]}
        </span>

        {/* Duration */}
        <span className="text-white/60 font-mono text-xs">
          {formatDuration(video.duration)}
        </span>
      </div>

      {/* Row 2: Two columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
        {/* Left: Description */}
        <div>
          <p className="text-sm md:text-base text-white/90 leading-relaxed">
            {video.description}
          </p>
        </div>

        {/* Right: Credits */}
        <div className="space-y-3 text-sm">
          {/* Credits */}
          {video.credits.length > 0 && (
            <div>
              <span className="text-white/50">Created by: </span>
              <span className="text-white/90">
                {video.credits.map((c, i) => (
                  <span key={i}>
                    {c.url ? (
                      <Link
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {c.name}
                      </Link>
                    ) : (
                      c.name
                    )}
                    {i < video.credits.length - 1 && ', '}
                  </span>
                ))}
              </span>
            </div>
          )}

          {/* Product Type */}
          <div>
            <span className="text-white/50">Type: </span>
            <span className="text-white/90">{PRODUCT_TYPE_LABELS[video.productType]}</span>
          </div>

          {/* Style */}
          <div>
            <span className="text-white/50">Style: </span>
            <span className="text-white/90">{STYLE_LABELS[video.style]}</span>
          </div>

          {/* Links */}
          {(video.websiteUrl || video.twitterUrl || video.youtubeUrl) && (
            <div className="flex flex-wrap gap-3 pt-2">
              {video.websiteUrl && (
                <Link
                  href={video.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Website
                </Link>
              )}
              {video.twitterUrl && (
                <Link
                  href={video.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Twitter
                </Link>
              )}
              {video.youtubeUrl && (
                <Link
                  href={video.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  YouTube
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
