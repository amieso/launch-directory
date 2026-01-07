'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { videos } from '@/data/videos'
import { Header } from '@/components/layout/header'
import { useAuth } from '@/contexts/auth-context'

interface CreatorInfo {
  name: string
  handle: string
  role: string
  videoCount: number
  imageUrl?: string
}

export default function CreatorsPage() {
  const router = useRouter()
  const { authState } = useAuth()

  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.push('/')
    }
  }, [authState, router])

  // Get unique creators with their info
  const creatorsMap = new Map<string, CreatorInfo>()

  videos.forEach(video => {
    if (!video.videoUrl) return

    video.credits.forEach(credit => {
      if (!credit.handle) return

      const existing = creatorsMap.get(credit.handle)

      if (existing) {
        existing.videoCount++
      } else {
        creatorsMap.set(credit.handle, {
          name: credit.name,
          handle: credit.handle,
          role: credit.role,
          videoCount: 1,
          imageUrl: credit.imageUrl,
        })
      }
    })
  })

  const creators = Array.from(creatorsMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  // Count by role type
  const agencyCount = creators.filter(c => c.role === 'Agency').length
  const inHouseCount = creators.filter(c => c.role === 'In-house').length
  const creatorCount = creators.filter(c => c.role === 'Creator').length

  // Build meta string
  const metaParts: string[] = []
  if (agencyCount > 0) metaParts.push(`${agencyCount} ${agencyCount === 1 ? 'AGENCY' : 'AGENCIES'}`)
  if (inHouseCount > 0) metaParts.push(`${inHouseCount} IN-HOUSE`)
  if (creatorCount > 0) metaParts.push(`${creatorCount} ${creatorCount === 1 ? 'CREATIVE' : 'CREATIVES'}`)

  if (authState !== 'authenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-4 md:px-6 py-8">
        {/* Page header */}
        <div className="mb-[60px]">
          <h1 className="text-2xl font-normal text-foreground tracking-tight">
            Creators
          </h1>
          <p className="text-[12px] text-muted font-mono uppercase tracking-wide mt-2">
            {metaParts.join(' · ')}
          </p>
        </div>

        {/* Creators list */}
        <div className="flex flex-col gap-2">
          {creators.map(creator => (
            <Link
              key={creator.handle}
              href={`/creator/${creator.handle}`}
              className="group flex items-center gap-4 p-3 pr-6 rounded-[6px] bg-surface hover:bg-[#2a2a2a] transition-colors"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-background flex items-center justify-center flex-shrink-0">
                {creator.imageUrl ? (
                  <img
                    src={creator.imageUrl}
                    alt={creator.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = `<span class="text-xs font-medium text-muted">${creator.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>`
                    }}
                  />
                ) : (
                  <span className="text-xs font-medium text-muted">
                    {creator.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{creator.name}</p>
              </div>
              <p className="text-[12px] text-muted font-mono uppercase">
                {creator.videoCount} {creator.videoCount === 1 ? 'VIDEO' : 'VIDEOS'}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
