'use client'

import { useState, useEffect } from 'react'
import { notFound, useParams, useRouter } from 'next/navigation'
import { Share2, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { videos } from '@/data/videos'
import { Header } from '@/components/layout/header'
import { Video, Credit } from '@/types/video'
import { VideoCard } from '@/components/video/video-card'
import { VideoModal } from '@/components/video/video-modal'

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

export default function CreatorPage() {
  const params = useParams()
  const router = useRouter()
  const { authState } = useAuth()
  const handle = params.handle as string
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  // Redirect to home if not authenticated
  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.push('/')
    }
  }, [authState, router])

  // Find all videos with this creator
  const creatorVideos = videos.filter(
    video => video.videoUrl && video.credits.some(c => c.handle === handle)
  )

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    )
  }

  if (authState !== 'authenticated') {
    return null
  }

  if (creatorVideos.length === 0) {
    notFound()
  }

  // Get creator info from the first video's credits
  const creatorCredit = creatorVideos[0].credits.find(c => c.handle === handle) as Credit
  const creatorName = creatorCredit.name
  const creatorBio = creatorCredit.bio
  const creatorRole = creatorCredit.role

  // Get unique companies
  const companies = [...new Set(creatorVideos.map(v => v.company))]

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${creatorName} - Video Creator`,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 md:px-6 py-8">
        {/* Creator Header Section - centered */}
        <div className="flex flex-col items-center text-center mb-12">
          {/* Avatar */}
          <div className="mb-6">
            {creatorCredit.imageUrl ? (
              <img
                src={creatorCredit.imageUrl}
                alt={creatorName}
                className="w-[72px] h-[72px] rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const fallback = document.createElement('div')
                  fallback.className = 'w-[72px] h-[72px] rounded-full bg-surface border border-border flex items-center justify-center'
                  fallback.innerHTML = `<span class="text-2xl font-bold text-muted">${creatorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>`
                  target.parentElement!.appendChild(fallback)
                }}
              />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full bg-surface border border-border flex items-center justify-center">
                <span className="text-2xl font-bold text-muted">
                  {creatorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl font-normal text-foreground mb-4 tracking-tight">
            {creatorName}
          </h1>

          {/* Bio */}
          {creatorBio && (
            <p className="text-sm text-muted leading-relaxed mb-6 max-w-[440px] line-clamp-3">
              {creatorBio}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-2 text-sm mb-6">
            <div className="space-y-1.5">
              <span className="text-muted-dark font-mono text-[12px] uppercase tracking-wide block">Role</span>
              <p className="text-foreground">{creatorRole}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-muted-dark font-mono text-[12px] uppercase tracking-wide block">Videos</span>
              <p className="text-foreground">{creatorVideos.length}</p>
            </div>
            {creatorRole !== 'In-house' && (
              <div className="space-y-1.5">
                <span className="text-muted-dark font-mono text-[12px] uppercase tracking-wide block">Clients</span>
                <p className="text-foreground">{companies.length}</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {creatorCredit.twitterHandle && (
              <a
                href={`https://twitter.com/${creatorCredit.twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted bg-surface rounded-full transition-colors hover:text-foreground"
              >
                <TwitterIcon className="w-4 h-4" />
                Twitter
              </a>
            )}
            {creatorCredit.instagramHandle && (
              <a
                href={`https://instagram.com/${creatorCredit.instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted bg-surface rounded-full transition-colors hover:text-foreground"
              >
                <InstagramIcon className="w-4 h-4" />
                Instagram
              </a>
            )}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted bg-surface rounded-full transition-colors hover:text-foreground"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {creatorVideos.map(video => (
            <VideoCard
              key={video.id}
              video={video}
              onSelect={setSelectedVideo}
            />
          ))}
        </div>
      </main>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          allVideos={creatorVideos}
          onClose={() => setSelectedVideo(null)}
          onVideoChange={setSelectedVideo}
        />
      )}
    </div>
  )
}
