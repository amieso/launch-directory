'use client'

import { Suspense, useState } from 'react'
import { Video } from '@/types/video'
import { VideoGrid } from './video-grid'
import { ControlBar } from './control-bar'
import { FilterSidebar } from './filter-sidebar'
import { DirectoryCards } from '@/components/navigation/directory-cards'
import { useGridSize } from '@/hooks/use-grid-size'
import { useAuth } from '@/contexts/auth-context'
import { useFilter } from '@/contexts/filter-context'

interface VideoSectionProps {
  videos: Video[]
}

export function VideoSection({ videos }: VideoSectionProps) {
  const { isFilterOpen, setIsFilterOpen } = useFilter()
  const [searchQuery, setSearchQuery] = useState('')
  const { authState } = useAuth()
  // Only treat as logged in when we KNOW they're authenticated
  // During loading, treat as logged out to prevent UI flash
  const isLoggedIn = authState === 'authenticated'
  const {
    columns,
    increase,
    decrease,
    canIncrease,
    canDecrease,
    isHydrated,
  } = useGridSize()

  const filteredVideos = videos.filter((video) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      video.title.toLowerCase().includes(query) ||
      video.company.toLowerCase().includes(query) ||
      video.description?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="px-4 md:px-6 mt-8 md:mt-10">
      {/* Directory Cards + Control Bar Row - only shown for logged in users */}
      {isLoggedIn && (
        <>
          <DirectoryCards />
          <div className="py-2 mb-6">
            <Suspense fallback={<div className="h-6" />}>
              <ControlBar
              onGridIncrease={increase}
              onGridDecrease={decrease}
              canGridIncrease={canIncrease}
              canGridDecrease={canDecrease}
              isFilterOpen={isFilterOpen}
              onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </Suspense>
          </div>
        </>
      )}

      {/* Content Area with Sidebar + Grid */}
      <div className="flex">
        {isLoggedIn && (
          <Suspense fallback={null}>
            <FilterSidebar isOpen={isFilterOpen} />
          </Suspense>
        )}
        <div className="flex-1 min-w-0">
          <VideoGrid
            videos={filteredVideos}
            columns={isHydrated ? columns : 4}
          />
        </div>
      </div>
    </div>
  )
}
