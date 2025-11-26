'use client';

import { useRef, useState } from 'react';
import { VideoGrid } from './components/VideoGrid';
import { HeroVideo } from './components/HeroVideo';
import Beach from './components/Beach';
import type { VideoData } from './types';
import videosData from './videos.json';

export default function Home() {
  const data = videosData as VideoData;
  const firstGridCellRef = useRef<HTMLDivElement>(null);
  const [heroIsVisible, setHeroIsVisible] = useState(true);

  // Get the first ready video for hero
  const heroVideo = data.videos.find(v => v.status === 'ready' && v.playbackId);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero video - morphs to track first grid cell on scroll */}
      {heroVideo && (
        <HeroVideo
          video={heroVideo}
          gridCellRef={firstGridCellRef}
          onVisibilityChange={setHeroIsVisible}
        />
      )}

      {/* Spacer to push content below hero video */}
      <div style={{ height: '100vh' }} />

      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            lowkey
          </h1>
          <p className="text-gray-600 mt-2">
            A curated collection of product launch videos
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="py-12">
        {/* Stats */}
        <div className="max-w-7xl mx-auto px-6 mb-8 flex items-center gap-6 text-sm text-gray-600">
          <span>{data.videos.length} videos</span>
          {data.videos.filter(v => v.status === 'ready').length > 0 && (
            <span>
              {data.videos.filter(v => v.status === 'ready').length} ready
            </span>
          )}
        </div>

        {/* Video grid - full width */}
        <VideoGrid
          videos={data.videos}
          firstCellRef={firstGridCellRef}
          hideFirstVideo={heroIsVisible}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-center">
          <Beach />
        </div>
      </footer>
    </div>
  );
}
