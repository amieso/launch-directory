'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Header } from '@/components/layout/header'
import { getVideoBySlug } from '@/lib/videos'
import { VideoCard } from '@/components/video/video-card'
import { VideoModal } from '@/components/video/video-modal'
import { Video } from '@/types/video'

export default function SavedPage() {
  const router = useRouter()
  const { user, authState, savedVideoSlugs } = useAuth()
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.push('/')
    }
  }, [authState, router])

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    )
  }

  if (authState !== 'authenticated' || !user) {
    return null
  }

  // Get actual video objects from slugs
  const savedVideos = savedVideoSlugs
    .map(slug => getVideoBySlug(slug))
    .filter((video): video is Video => video !== null)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 md:px-6 py-8">
        {/* Page header */}
        <div className="mb-[60px]">
          <h1 className="text-2xl font-normal text-foreground tracking-tight">
            Saved
          </h1>
          <p className="text-[12px] text-muted font-mono uppercase tracking-wide mt-2">
            {savedVideos.length} {savedVideos.length === 1 ? 'VIDEO' : 'VIDEOS'}
          </p>
        </div>

        {savedVideos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
              <Bookmark className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No saved videos yet</h3>
            <p className="text-muted max-w-sm mx-auto">
              Click the + icon on any video to save it here for quick access.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedVideos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                onSelect={setSelectedVideo}
              />
            ))}
          </div>
        )}
      </main>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          allVideos={savedVideos}
          onClose={() => setSelectedVideo(null)}
          onVideoChange={setSelectedVideo}
        />
      )}
    </div>
  )
}
