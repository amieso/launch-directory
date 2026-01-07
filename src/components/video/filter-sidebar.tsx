'use client'

import { useState } from 'react'
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
import { getFilterCounts, getUniqueCompanies } from '@/lib/videos'

const STYLE_OPTIONS: VideoStyle[] = ['kinetic-text', '3d', 'motion-graphics', 'product-demo']
const STAGE_OPTIONS: CompanyStage[] = ['seed', 'series-a', 'series-b-plus', 'enterprise']
const DURATION_OPTIONS: DurationCategory[] = ['short', 'standard', 'long']
const PURPOSE_OPTIONS: VideoPurpose[] = ['launch', 'announcement', 'funding', 'demo', 'thought-leadership']

interface FilterSidebarProps {
  isOpen: boolean
}

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  debug?: boolean
}

function FilterSection({ title, children, isOpen, onToggle, debug }: FilterSectionProps) {
  return (
    <div className="mb-3">
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center w-full text-left group gap-2.5',
          debug ? (isOpen ? 'mb-5' : 'mb-0') : 'mb-5'
        )}
      >
        <h3 className="text-xs font-mono text-muted uppercase tracking-widest group-hover:text-foreground transition-colors">
          {title}
        </h3>
        <svg
          className={cn(
            'w-3 h-3 text-muted transition-transform',
            isOpen ? 'rotate-0' : '-rotate-90'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={cn(
          'space-y-1 overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
        )}
      >
        {children}
      </div>
    </div>
  )
}

type FilterSectionId = 'style' | 'stage' | 'duration' | 'purpose' | 'company'

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-foreground ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function FilterSidebar({ isOpen }: FilterSidebarProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const companies = getUniqueCompanies()
  const [openSection, setOpenSection] = useState<FilterSectionId | null>('style')

  const currentStyle = searchParams.get('style') as VideoStyle | null
  const currentStage = searchParams.get('stage') as CompanyStage | null
  const currentDuration = searchParams.get('duration') as DurationCategory | null
  const currentPurpose = searchParams.get('purpose') as VideoPurpose | null
  const currentCompanies = searchParams.get('company')?.split(',').filter(Boolean) || []

  // Get dynamic counts based on current filters
  const counts = getFilterCounts({
    style: currentStyle,
    companyStage: currentStage,
    duration: currentDuration,
    purpose: currentPurpose,
    company: currentCompanies.length > 0 ? currentCompanies : null,
  })

  const toggleSection = (section: FilterSectionId) => {
    setOpenSection(openSection === section ? null : section)
  }

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

  const toggleCompany = (company: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const newCompanies = currentCompanies.includes(company)
      ? currentCompanies.filter((c) => c !== company)
      : [...currentCompanies, company]

    if (newCompanies.length === 0) {
      params.delete('company')
    } else {
      params.set('company', newCompanies.join(','))
    }
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }

  const clearAllFilters = () => {
    router.push(pathname, { scroll: false })
  }

  const hasAnyFilter = currentStyle || currentStage || currentDuration || currentPurpose || currentCompanies.length > 0

  return (
    <aside
      className={cn(
        'shrink-0 pr-6 overflow-hidden transition-all duration-300 ease-out',
        isOpen ? 'w-[224px] opacity-100' : 'w-0 pr-0 opacity-0'
      )}
    >
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* Style Section */}
        <FilterSection title="Style" isOpen={openSection === 'style'} onToggle={() => toggleSection('style')}>
          {STYLE_OPTIONS.map((style) => {
            const count = counts.style[style] || 0
            const isDisabled = count === 0 && currentStyle !== style
            return (
              <button
                key={style}
                onClick={() => !isDisabled && updateFilter('style', currentStyle === style ? null : style)}
                className={cn(
                  'flex items-center w-full text-left text-sm py-1 transition-colors',
                  currentStyle === style
                    ? 'text-foreground'
                    : isDisabled
                    ? 'text-muted-dark/30'
                    : 'text-muted hover:text-foreground'
                )}
              >
                <span>{STYLE_LABELS[style]}</span>
                {currentStyle === style ? (
                  <CheckIcon />
                ) : (
                  <span className={cn('font-mono text-xs ml-auto', isDisabled ? 'text-muted-dark/20' : 'text-muted-dark/50')}>{count}</span>
                )}
              </button>
            )
          })}
        </FilterSection>

        {/* Stage Section */}
        <FilterSection title="Stage" isOpen={openSection === 'stage'} onToggle={() => toggleSection('stage')}>
          {STAGE_OPTIONS.map((stage) => {
            const count = counts.companyStage[stage] || 0
            const isDisabled = count === 0 && currentStage !== stage
            return (
              <button
                key={stage}
                onClick={() => !isDisabled && updateFilter('stage', currentStage === stage ? null : stage)}
                className={cn(
                  'flex items-center w-full text-left text-sm py-1 transition-colors',
                  currentStage === stage
                    ? 'text-foreground'
                    : isDisabled
                    ? 'text-muted-dark/30'
                    : 'text-muted hover:text-foreground'
                )}
              >
                <span>{COMPANY_STAGE_LABELS[stage]}</span>
                {currentStage === stage ? (
                  <CheckIcon />
                ) : (
                  <span className={cn('font-mono text-xs ml-auto', isDisabled ? 'text-muted-dark/20' : 'text-muted-dark/50')}>{count}</span>
                )}
              </button>
            )
          })}
        </FilterSection>

        {/* Duration Section */}
        <FilterSection title="Duration" isOpen={openSection === 'duration'} onToggle={() => toggleSection('duration')}>
          {DURATION_OPTIONS.map((duration) => {
            const count = counts.duration[duration] || 0
            const isDisabled = count === 0 && currentDuration !== duration
            return (
              <button
                key={duration}
                onClick={() => !isDisabled && updateFilter('duration', currentDuration === duration ? null : duration)}
                className={cn(
                  'flex items-center w-full text-left text-sm py-1 transition-colors',
                  currentDuration === duration
                    ? 'text-foreground'
                    : isDisabled
                    ? 'text-muted-dark/30'
                    : 'text-muted hover:text-foreground'
                )}
              >
                <span>{DURATION_LABELS[duration]}</span>
                {currentDuration === duration ? (
                  <CheckIcon />
                ) : (
                  <span className={cn('font-mono text-xs ml-auto', isDisabled ? 'text-muted-dark/20' : 'text-muted-dark/50')}>{count}</span>
                )}
              </button>
            )
          })}
        </FilterSection>

        {/* Purpose Section */}
        <FilterSection title="Purpose" isOpen={openSection === 'purpose'} onToggle={() => toggleSection('purpose')}>
          {PURPOSE_OPTIONS.map((purpose) => {
            const count = counts.purpose[purpose] || 0
            const isDisabled = count === 0 && currentPurpose !== purpose
            return (
              <button
                key={purpose}
                onClick={() => !isDisabled && updateFilter('purpose', currentPurpose === purpose ? null : purpose)}
                className={cn(
                  'flex items-center w-full text-left text-sm py-1 transition-colors',
                  currentPurpose === purpose
                    ? 'text-foreground'
                    : isDisabled
                    ? 'text-muted-dark/30'
                    : 'text-muted hover:text-foreground'
                )}
              >
                <span>{PURPOSE_LABELS[purpose]}</span>
                {currentPurpose === purpose ? (
                  <CheckIcon />
                ) : (
                  <span className={cn('font-mono text-xs ml-auto', isDisabled ? 'text-muted-dark/20' : 'text-muted-dark/50')}>{count}</span>
                )}
              </button>
            )
          })}
        </FilterSection>

        {/* Company Section */}
        <FilterSection title="Company" isOpen={openSection === 'company'} onToggle={() => toggleSection('company')} debug>
          {companies.map((company) => {
            const count = counts.company[company] || 0
            const isSelected = currentCompanies.includes(company)
            const isDisabled = count === 0 && !isSelected
            return (
              <button
                key={company}
                onClick={() => !isDisabled && toggleCompany(company)}
                className={cn(
                  'flex items-center w-full text-left text-sm py-1 transition-colors',
                  isSelected
                    ? 'text-foreground'
                    : isDisabled
                    ? 'text-muted-dark/30'
                    : 'text-muted hover:text-foreground'
                )}
              >
                <div className={cn('w-5 h-5 rounded-full shrink-0', isDisabled ? 'bg-white/10' : 'bg-white/20')} />
                <span className="truncate ml-3">{company}</span>
                {isSelected ? (
                  <CheckIcon />
                ) : (
                  <span className={cn('font-mono text-xs ml-auto shrink-0', isDisabled ? 'text-muted-dark/20' : 'text-muted-dark/50')}>{count}</span>
                )}
              </button>
            )
          })}
        </FilterSection>

        {/* Clear All */}
        {hasAnyFilter && (
          <button
            onClick={clearAllFilters}
            className="w-full inline-flex items-center justify-center px-4 py-2 text-sm text-muted bg-surface rounded-full transition-colors hover:text-foreground mt-7"
          >
            Clear filters
          </button>
        )}
      </div>
    </aside>
  )
}
