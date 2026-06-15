import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HomeContent } from '@/components/home-content'
import { VideoSection } from '@/components/video/video-section'
import { HomePageWrapper } from '@/components/home-page-wrapper'
import { videos } from '@/data/videos'

export default async function HomePage() {
  // Newest first by publish date (ISO YYYY-MM-DD sorts lexicographically).
  const allVideos = [...videos].sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))

  return (
    <HomePageWrapper>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1">
          <HomeContent />

          <div id="videos">
            <Suspense fallback={<div className="h-96" />}>
              <VideoSection videos={allVideos} />
            </Suspense>
          </div>
        </main>

        <Footer />
      </div>
    </HomePageWrapper>
  )
}
