import { videos } from '@/data/videos'
import {
  Video,
  VideoStyle,
  ProductType,
  VideoPurpose,
  Industry,
  CompanyStage,
  DurationCategory,
  getDurationCategory
} from '@/types/video'

export function getAllVideos(): Video[] {
  return videos
}

export function getVideoBySlug(slug: string): Video | undefined {
  return videos.find((v) => v.slug === slug)
}

export function getVideosByStyle(style: VideoStyle): Video[] {
  return videos.filter((v) => v.style === style)
}

export function getVideosByProductType(productType: ProductType): Video[] {
  return videos.filter((v) => v.productType === productType)
}

export function getVideosByPurpose(purpose: VideoPurpose): Video[] {
  return videos.filter((v) => v.purpose === purpose)
}

export function getVideosByIndustry(industry: Industry): Video[] {
  return videos.filter((v) => v.industry === industry)
}

export function getVideosByStage(stage: CompanyStage): Video[] {
  return videos.filter((v) => v.companyStage === stage)
}

export function getVideosByDuration(category: DurationCategory): Video[] {
  return videos.filter((v) => getDurationCategory(v.duration) === category)
}

export function getFeaturedVideos(): Video[] {
  return videos.filter((v) => v.featured)
}

interface FilterOptions {
  style?: VideoStyle | null
  productType?: ProductType | null
  purpose?: VideoPurpose | null
  industry?: Industry | Industry[] | null
  companyStage?: CompanyStage | null
  duration?: DurationCategory | null
  company?: string | string[] | null
}

export function getFilteredVideos(
  styleOrOptions?: VideoStyle | FilterOptions | null,
  productType?: ProductType | null
): Video[] {
  // Handle legacy single-argument call
  if (typeof styleOrOptions === 'string' || styleOrOptions === null || styleOrOptions === undefined) {
    const style = styleOrOptions as VideoStyle | null | undefined
    let result = videos
    if (style) {
      result = result.filter((v) => v.style === style)
    }
    if (productType) {
      result = result.filter((v) => v.productType === productType)
    }
    return result
  }

  // Handle options object
  const options = styleOrOptions as FilterOptions
  let result = videos

  if (options.style) {
    result = result.filter((v) => v.style === options.style)
  }
  if (options.productType) {
    result = result.filter((v) => v.productType === options.productType)
  }
  if (options.purpose) {
    result = result.filter((v) => v.purpose === options.purpose)
  }
  if (options.industry) {
    const industries = Array.isArray(options.industry) ? options.industry : [options.industry]
    result = result.filter((v) => industries.includes(v.industry))
  }
  if (options.companyStage) {
    result = result.filter((v) => v.companyStage === options.companyStage)
  }
  if (options.duration) {
    result = result.filter((v) => getDurationCategory(v.duration) === options.duration)
  }
  if (options.company) {
    const companies = Array.isArray(options.company) ? options.company : [options.company]
    result = result.filter((v) => companies.includes(v.company))
  }

  return result
}

// Helper to count videos per filter value
export function getFilterCounts(currentFilters?: FilterOptions) {
  const counts = {
    purpose: {} as Record<VideoPurpose, number>,
    style: {} as Record<VideoStyle, number>,
    industry: {} as Record<Industry, number>,
    companyStage: {} as Record<CompanyStage, number>,
    duration: {} as Record<DurationCategory, number>,
    company: {} as Record<string, number>,
  }

  // If no filters, count all videos
  if (!currentFilters) {
    for (const video of videos) {
      counts.purpose[video.purpose] = (counts.purpose[video.purpose] || 0) + 1
      counts.style[video.style] = (counts.style[video.style] || 0) + 1
      counts.industry[video.industry] = (counts.industry[video.industry] || 0) + 1
      counts.companyStage[video.companyStage] = (counts.companyStage[video.companyStage] || 0) + 1
      counts.company[video.company] = (counts.company[video.company] || 0) + 1

      const durationCat = getDurationCategory(video.duration)
      counts.duration[durationCat] = (counts.duration[durationCat] || 0) + 1
    }
    return counts
  }

  // For each filter category, count how many videos would match if that filter value was selected
  // (keeping all other current filters applied)

  // Helper to check if video matches filters (excluding one category)
  const matchesFilters = (video: Video, excludeCategory?: string) => {
    if (excludeCategory !== 'style' && currentFilters.style && video.style !== currentFilters.style) return false
    if (excludeCategory !== 'companyStage' && currentFilters.companyStage && video.companyStage !== currentFilters.companyStage) return false
    if (excludeCategory !== 'duration' && currentFilters.duration && getDurationCategory(video.duration) !== currentFilters.duration) return false
    if (excludeCategory !== 'purpose' && currentFilters.purpose && video.purpose !== currentFilters.purpose) return false
    if (excludeCategory !== 'company' && currentFilters.company) {
      const companies = Array.isArray(currentFilters.company) ? currentFilters.company : [currentFilters.company]
      if (!companies.includes(video.company)) return false
    }
    return true
  }

  for (const video of videos) {
    // Count for style (exclude style from filter check)
    if (matchesFilters(video, 'style')) {
      counts.style[video.style] = (counts.style[video.style] || 0) + 1
    }

    // Count for companyStage
    if (matchesFilters(video, 'companyStage')) {
      counts.companyStage[video.companyStage] = (counts.companyStage[video.companyStage] || 0) + 1
    }

    // Count for duration
    if (matchesFilters(video, 'duration')) {
      const durationCat = getDurationCategory(video.duration)
      counts.duration[durationCat] = (counts.duration[durationCat] || 0) + 1
    }

    // Count for purpose
    if (matchesFilters(video, 'purpose')) {
      counts.purpose[video.purpose] = (counts.purpose[video.purpose] || 0) + 1
    }

    // Count for company
    if (matchesFilters(video, 'company')) {
      counts.company[video.company] = (counts.company[video.company] || 0) + 1
    }

    // Count for industry
    if (matchesFilters(video, 'industry')) {
      counts.industry[video.industry] = (counts.industry[video.industry] || 0) + 1
    }
  }

  return counts
}

// Get unique company names sorted alphabetically
export function getUniqueCompanies(): string[] {
  const companies = new Set(videos.map((v) => v.company))
  return Array.from(companies).sort((a, b) => a.localeCompare(b))
}
