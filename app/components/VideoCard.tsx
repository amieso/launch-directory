'use client';

import { useState, useRef, useEffect } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import type { Video } from '../types';

interface VideoCardProps {
  video: Video;
  index: number;
}

export function VideoCard({ video, index }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadStartTimeRef = useRef<number | null>(null);

  // Detect when in viewport - with staggered delay
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // First video loads immediately, others have staggered delay
            const delay = index === 0 ? 0 : index * 100;
            setTimeout(() => {
              // Track load start time (localhost only)
              if (process.env.NODE_ENV === 'development') {
                loadStartTimeRef.current = performance.now();
              }
              setIsInView(true);
            }, delay);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '300px' } // Preload before entering viewport
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [index]);

  // Handle video playing - track load time
  const handlePlaying = () => {
    setIsPlaying(true);

    // Log load time (localhost only)
    if (process.env.NODE_ENV === 'development' && loadStartTimeRef.current !== null) {
      const loadTime = Math.round(performance.now() - loadStartTimeRef.current);
      console.log(`📹 Video loaded: "${video.title}" - ${loadTime}ms`);
      loadStartTimeRef.current = null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video overflow-hidden rounded-lg bg-gray-100 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Instant: Dominant color background */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ backgroundColor: video.placeholder }}
      />

      {/* Mux Player - optimized HLS streaming */}
      {video.playbackId && isInView && (
        <div className={`absolute inset-0 w-full h-full transition-all duration-500 ${
          isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.1]'
        }`}>
          <MuxPlayer
            playbackId={video.playbackId}
            streamType="on-demand"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            startTime={0}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              '--controls': 'none',
              '--media-object-fit': 'cover',
              '--media-object-position': 'center',
            } as any}
            onPlaying={handlePlaying}
          />
        </div>
      )}

      {/* Status badge for non-ready videos */}
      {(!video.playbackId || video.status !== 'ready') && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
          {video.status === 'preparing'
            ? 'Processing...'
            : video.status === 'errored'
            ? 'Error'
            : 'Processing...'}
        </div>
      )}

      {/* Title overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <h3 className="text-white font-medium text-sm line-clamp-2">
          {video.title}
        </h3>
        <p className="text-white/70 text-xs mt-1">
          {Math.round(video.duration)}s
        </p>
      </div>
    </div>
  );
}
