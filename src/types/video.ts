export type VideoStyle = 'kinetic-text' | '3d' | 'motion-graphics' | 'product-demo' | 'mixed'
export type ProductType = 'saas' | 'mobile' | 'fintech' | 'ecommerce' | 'dev-tools' | 'ai'

// New filter types
export type VideoPurpose = 'launch' | 'announcement' | 'funding' | 'demo' | 'thought-leadership'
export type Industry = 'ai-ml' | 'productivity' | 'developer-tools' | 'social' | 'hardware' | 'fintech' | 'design' | 'enterprise'
export type CompanyStage = 'seed' | 'series-a' | 'series-b-plus' | 'enterprise'
export type DurationCategory = 'short' | 'standard' | 'long'

export interface Chapter {
  id: string
  title: string
  startTime: number // in seconds
}

export interface Credit {
  role: string
  name: string
  handle?: string
  url?: string
  bio?: string
  contactUrl?: string
  imageUrl?: string
  twitterHandle?: string
  instagramHandle?: string
}

export type SegmentType = 'problem' | 'solution' | 'in-action' | 'cta' | 'intro' | 'outro'

export interface Segment {
  id: string
  type: SegmentType
  title: string
  description: string
  startTime: number
  endTime: number
}

export interface TranscriptEntry {
  id: string
  startTime: number
  text: string
}

export interface Comment {
  id: string
  author: string
  avatarUrl?: string
  text: string
  timestamp: string
  likes: number
}

export interface Video {
  id: string
  slug: string
  title: string
  company: string
  companyLogoUrl?: string
  companyFounded?: number // year founded
  description: string
  videoUrl: string
  thumbnailUrl: string
  style: VideoStyle
  duration: number // in seconds
  aspectRatio: '16:9' | '9:16'
  productType: ProductType
  // New filter properties
  purpose: VideoPurpose
  industry: Industry
  companyStage: CompanyStage
  websiteUrl?: string
  youtubeUrl?: string
  twitterUrl?: string
  credits: Credit[]
  featured: boolean
  publishedDate: string
  chapters?: Chapter[]
}

export const STYLE_LABELS: Record<VideoStyle, string> = {
  'kinetic-text': 'Kinetic Text',
  '3d': '3D',
  'motion-graphics': 'Motion Graphics',
  'product-demo': 'Product Demo',
  'mixed': 'Mixed',
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  'saas': 'SaaS',
  'mobile': 'Mobile',
  'fintech': 'Fintech',
  'ecommerce': 'E-commerce',
  'dev-tools': 'Dev Tools',
  'ai': 'AI',
}

export const PURPOSE_LABELS: Record<VideoPurpose, string> = {
  'launch': 'Launch',
  'announcement': 'Announcement',
  'funding': 'Funding',
  'demo': 'Walkthrough',
  'thought-leadership': 'Thought Leadership',
}

export const INDUSTRY_LABELS: Record<Industry, string> = {
  'ai-ml': 'AI/ML',
  'productivity': 'Productivity',
  'developer-tools': 'Developer Tools',
  'social': 'Social',
  'hardware': 'Hardware',
  'fintech': 'Fintech',
  'design': 'Design',
  'enterprise': 'Enterprise',
}

export const COMPANY_STAGE_LABELS: Record<CompanyStage, string> = {
  'seed': 'Seed',
  'series-a': 'Series A',
  'series-b-plus': 'Series B+',
  'enterprise': 'Enterprise',
}

export const DURATION_LABELS: Record<DurationCategory, string> = {
  'short': 'Short',
  'standard': 'Standard',
  'long': 'Long',
}

// Helper to compute duration category from seconds
export function getDurationCategory(seconds: number): DurationCategory {
  if (seconds < 60) return 'short'
  if (seconds <= 120) return 'standard'
  return 'long'
}
