'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { videos } from '@/data/videos'
import { useMemo } from 'react'

export function DirectoryCards() {
  const { companyCount, agencyCount, creativeCount } = useMemo(() => {
    const companies = new Set<string>()
    const agencies = new Set<string>()
    const creatives = new Set<string>()

    videos.forEach(video => {
      if (!video.videoUrl) return
      companies.add(video.company)
      video.credits.forEach(credit => {
        if (!credit.handle) return
        if (credit.role === 'Agency') {
          agencies.add(credit.handle)
        } else {
          creatives.add(credit.handle)
        }
      })
    })

    return {
      companyCount: companies.size,
      agencyCount: agencies.size,
      creativeCount: creatives.size
    }
  }, [])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 mb-10 md:mb-12">
      <Link
        href="/companies"
        className="group relative h-24 rounded-[6px] overflow-hidden bg-surface hover:ring-1 hover:ring-white/[0.08] transition-all"
      >
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <ArrowUpRight className="w-3.5 h-3.5 text-muted group-hover:text-foreground transition-colors self-end" />
          <div>
            <h3 className="text-base font-normal text-foreground tracking-tight">Companies</h3>
            <p className="text-xs font-mono text-muted uppercase mt-1.5">{companyCount} startups</p>
          </div>
        </div>
      </Link>

      <Link
        href="/creators"
        className="group relative h-24 rounded-[6px] overflow-hidden bg-surface hover:ring-1 hover:ring-white/[0.08] transition-all"
      >
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <ArrowUpRight className="w-3.5 h-3.5 text-muted group-hover:text-foreground transition-colors self-end" />
          <div>
            <h3 className="text-base font-normal text-foreground tracking-tight">Creators</h3>
            <p className="text-xs font-mono text-muted uppercase mt-1.5">{agencyCount} {agencyCount === 1 ? 'agency' : 'agencies'} · {creativeCount} {creativeCount === 1 ? 'creative' : 'creatives'}</p>
          </div>
        </div>
      </Link>
    </div>
  )
}
