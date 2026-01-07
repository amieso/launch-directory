'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { videos } from '@/data/videos'
import { Header } from '@/components/layout/header'
import { useAuth } from '@/contexts/auth-context'

interface CompanyInfo {
  name: string
  slug: string
  logoUrl?: string
  videoCount: number
  industry: string
}

export default function CompaniesPage() {
  const router = useRouter()
  const { authState } = useAuth()

  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.push('/')
    }
  }, [authState, router])

  // Get unique companies with their info
  const companiesMap = new Map<string, CompanyInfo>()

  videos.forEach(video => {
    if (!video.videoUrl) return

    const slug = video.company.toLowerCase().replace(/\s+/g, '-')
    const existing = companiesMap.get(slug)

    if (existing) {
      existing.videoCount++
    } else {
      companiesMap.set(slug, {
        name: video.company,
        slug,
        logoUrl: video.companyLogoUrl,
        videoCount: 1,
        industry: video.industry,
      })
    }
  })

  const companies = Array.from(companiesMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )

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
            Companies
          </h1>
          <p className="text-[12px] text-muted font-mono uppercase tracking-wide mt-2">
            {companies.length} COMPANIES
          </p>
        </div>

        {/* Companies list */}
        <div className="flex flex-col gap-2">
          {companies.map(company => (
            <Link
              key={company.slug}
              href={`/company/${company.slug}`}
              className="group flex items-center gap-4 p-3 pr-6 rounded-[6px] bg-surface hover:bg-[#2a2a2a] transition-colors"
            >
              <div className="w-10 h-10 rounded-[4px] overflow-hidden bg-background flex items-center justify-center flex-shrink-0">
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = `<span class="text-xs font-medium text-muted">${company.name.slice(0, 2).toUpperCase()}</span>`
                    }}
                  />
                ) : (
                  <span className="text-xs font-medium text-muted">
                    {company.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{company.name}</p>
              </div>
              <p className="text-[12px] text-muted font-mono uppercase">
                {company.videoCount} {company.videoCount === 1 ? 'VIDEO' : 'VIDEOS'}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
