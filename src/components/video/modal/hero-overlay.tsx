'use client'

import { Video } from '@/types/video'
import { Play, Volume2, VolumeX, ExternalLink } from 'lucide-react'
import { CompanyLink } from '@/components/ui/company-link'

interface HeroOverlayProps {
  video: Video
  isMuted: boolean
  onMuteToggle: () => void
  onPlayWithSound: () => void
}

export function HeroOverlay({ video, isMuted, onMuteToggle, onPlayWithSound }: HeroOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Bottom fade gradient */}
      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-modal-black via-modal-black/70 to-transparent" />

      {/* Content positioned at bottom */}
      <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 pointer-events-auto">
        {/* Company name */}
        <CompanyLink
          company={video.company}
          className="text-[10px] md:text-xs text-white/60 uppercase tracking-[0.2em] font-mono mb-1 hover:text-white transition-colors inline-block"
        />

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-medium text-white mb-4 md:mb-6 tracking-tight">
          {video.title}
        </h1>

        {/* Action buttons row */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Play with sound button */}
          <button
            onClick={onPlayWithSound}
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-white text-black font-medium rounded text-sm md:text-base hover:bg-white/90 transition-colors"
          >
            <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
            Play
          </button>

          {/* Website link */}
          {video.websiteUrl && (
            <a
              href={video.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-white/20 text-white rounded text-sm md:text-base hover:bg-white/30 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Website</span>
            </a>
          )}
        </div>
      </div>

      {/* Mute button - bottom right */}
      <button
        onClick={onMuteToggle}
        className="pointer-events-auto absolute bottom-6 right-6 md:bottom-10 md:right-10 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center border border-white/40 rounded-full hover:border-white transition-colors bg-black/20"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-white" />
        ) : (
          <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
        )}
      </button>
    </div>
  )
}
