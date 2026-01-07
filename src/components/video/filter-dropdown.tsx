'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  VideoStyle,
  VideoPurpose,
  CompanyStage,
  DurationCategory,
  PURPOSE_LABELS,
  STYLE_LABELS,
  COMPANY_STAGE_LABELS,
  DURATION_LABELS,
} from '@/types/video'
import { getUniqueCompanies } from '@/lib/videos'

const STYLE_OPTIONS: VideoStyle[] = ['kinetic-text', '3d', 'motion-graphics', 'product-demo']
const STAGE_OPTIONS: CompanyStage[] = ['seed', 'series-a', 'series-b-plus', 'enterprise']
const DURATION_OPTIONS: DurationCategory[] = ['short', 'standard', 'long']
const PURPOSE_OPTIONS: VideoPurpose[] = ['launch', 'announcement', 'funding', 'demo', 'thought-leadership']

export function FilterDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const companies = getUniqueCompanies()

  const currentStyle = searchParams.get('style') as VideoStyle | null
  const currentStage = searchParams.get('stage') as CompanyStage | null
  const currentDuration = searchParams.get('duration') as DurationCategory | null
  const currentPurpose = searchParams.get('purpose') as VideoPurpose | null
  const currentCompany = searchParams.get('company')

  const activeCount = [currentStyle, currentStage, currentDuration, currentPurpose, currentCompany].filter(Boolean).length

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }

  const clearAllFilters = () => {
    router.push(pathname, { scroll: false })
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 text-sm transition-colors',
          activeCount > 0
            ? 'text-foreground'
            : 'text-muted hover:text-foreground'
        )}
      >
        <span>Filter{activeCount > 0 ? ` (${activeCount})` : ''}</span>
        <svg
          className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-[220px] max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-background p-3 shadow-lg">
          {/* Clear all */}
          {activeCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="w-full text-left text-xs text-muted hover:text-foreground mb-3 underline underline-offset-2"
            >
              Clear all filters
            </button>
          )}

          {/* Style Section */}
          <div className="mb-3">
            <h4 className="text-[10px] font-mono text-muted uppercase tracking-widest mb-3.5">Style</h4>
            <div className="space-y-1">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style}
                  onClick={() => updateFilter('style', currentStyle === style ? null : style)}
                  className={cn(
                    'w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
                    currentStyle === style
                      ? 'bg-surface text-foreground'
                      : 'text-muted hover:bg-surface hover:text-foreground'
                  )}
                >
                  {STYLE_LABELS[style]}
                </button>
              ))}
            </div>
          </div>

          {/* Stage Section */}
          <div className="mb-3">
            <h4 className="text-[10px] font-mono text-muted uppercase tracking-widest mb-3.5">Stage</h4>
            <div className="space-y-1">
              {STAGE_OPTIONS.map((stage) => (
                <button
                  key={stage}
                  onClick={() => updateFilter('stage', currentStage === stage ? null : stage)}
                  className={cn(
                    'w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
                    currentStage === stage
                      ? 'bg-surface text-foreground'
                      : 'text-muted hover:bg-surface hover:text-foreground'
                  )}
                >
                  {COMPANY_STAGE_LABELS[stage]}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Section */}
          <div className="mb-3">
            <h4 className="text-[10px] font-mono text-muted uppercase tracking-widest mb-3.5">Duration</h4>
            <div className="space-y-1">
              {DURATION_OPTIONS.map((duration) => (
                <button
                  key={duration}
                  onClick={() => updateFilter('duration', currentDuration === duration ? null : duration)}
                  className={cn(
                    'w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
                    currentDuration === duration
                      ? 'bg-surface text-foreground'
                      : 'text-muted hover:bg-surface hover:text-foreground'
                  )}
                >
                  {DURATION_LABELS[duration]}
                </button>
              ))}
            </div>
          </div>

          {/* Purpose Section */}
          <div className="mb-3">
            <h4 className="text-[10px] font-mono text-muted uppercase tracking-widest mb-3.5">Purpose</h4>
            <div className="space-y-1">
              {PURPOSE_OPTIONS.map((purpose) => (
                <button
                  key={purpose}
                  onClick={() => updateFilter('purpose', currentPurpose === purpose ? null : purpose)}
                  className={cn(
                    'w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
                    currentPurpose === purpose
                      ? 'bg-surface text-foreground'
                      : 'text-muted hover:bg-surface hover:text-foreground'
                  )}
                >
                  {PURPOSE_LABELS[purpose]}
                </button>
              ))}
            </div>
          </div>

          {/* Company Section */}
          <div>
            <h4 className="text-[10px] font-mono text-muted uppercase tracking-widest mb-3.5">Company</h4>
            <div className="space-y-1">
              {companies.map((company) => (
                <button
                  key={company}
                  onClick={() => updateFilter('company', currentCompany === company ? null : company)}
                  className={cn(
                    'w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors truncate',
                    currentCompany === company
                      ? 'bg-surface text-foreground'
                      : 'text-muted hover:bg-surface hover:text-foreground'
                  )}
                >
                  {company}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
