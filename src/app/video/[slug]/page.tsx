'use client'

import { useEffect, useState } from 'react'
import { notFound, useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Header } from '@/components/layout/header'
import { VideoPlayer } from '@/components/video/video-player'
import { InfoPane } from '@/components/video/info-pane'
import { getVideoBySlug } from '@/lib/videos'

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const { authState } = useAuth()
  const slug = params.slug as string
  const video = getVideoBySlug(slug)

  // Redirect to home if not authenticated
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

  if (authState !== 'authenticated') {
    return null
  }

  if (!video) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          {/* Back Link */}
          <div className="py-4 border-b border-border">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </Link>
          </div>

          {/* Two Column Layout */}
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] py-6">
            {/* Video Column */}
            <div>
              <VideoPlayer
                src={video.videoUrl}
                poster={video.thumbnailUrl}
                aspectRatio={video.aspectRatio}
              />
            </div>

            {/* Info Column */}
            <InfoPane video={video} />
          </div>
        </div>
      </main>
    </div>
  )
}
