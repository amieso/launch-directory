'use client';

import { useState, useEffect, useRef } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import type { Video } from '../types';

interface HeroVideoProps {
  video: Video;
  gridCellRef: React.RefObject<HTMLDivElement | null>;
  onVisibilityChange?: (isVisible: boolean) => void;
}

export function HeroVideo({ video, gridCellRef, onVisibilityChange }: HeroVideoProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevVisibility = useRef(true);

  useEffect(() => {
    const updateProgress = () => {
      if (!gridCellRef.current) return;

      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const gridRect = gridCellRef.current.getBoundingClientRect();

      // Calculate when the grid cell starts to become visible
      // Grid cell is at 100vh + header + stats height
      const gridCellTop = gridRect.top + scrollY;

      // Start transitioning early, complete when grid cell enters viewport
      const startScroll = viewportHeight * 0.3;
      const endScroll = gridCellTop - viewportHeight * 0.2; // Complete just before it naturally appears

      let progress = 0;
      if (scrollY > startScroll) {
        progress = Math.min((scrollY - startScroll) / (endScroll - startScroll), 1);
      }

      setScrollProgress(progress);

      // Notify parent of visibility change
      const isVisible = progress < 1;
      if (onVisibilityChange && prevVisibility.current !== isVisible) {
        onVisibilityChange(isVisible);
        prevVisibility.current = isVisible;
      }
    };

    let rafId: number;
    const onScroll = () => {
      rafId = requestAnimationFrame(updateProgress);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateProgress);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [gridCellRef, onVisibilityChange]);

  // Easing function - smooth acceleration and deceleration
  const easeInOutQuart = (t: number) => {
    return t < 0.5
      ? 8 * t * t * t * t
      : 1 - Math.pow(-2 * t + 2, 4) / 2;
  };
  const easedProgress = easeInOutQuart(scrollProgress);

  // Calculate transform to morph from fullscreen to grid position
  const getTransform = () => {
    if (!gridCellRef.current || scrollProgress === 0) {
      return { transform: 'none', opacity: 1 };
    }

    const gridRect = gridCellRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // IMPORTANT: Hero is position:fixed, so gridRect.top/left is relative to viewport
    // We need to translate to where the grid cell appears in the VIEWPORT
    const targetX = gridRect.left;
    const targetY = gridRect.top;

    // Calculate scale based on BOTH width and height to ensure full coverage
    // Use the larger scale to ensure the video fills the grid cell
    const scaleX = gridRect.width / viewportWidth;
    const scaleY = gridRect.height / viewportHeight;
    const targetScale = Math.max(scaleX, scaleY); // Use max to fill cell completely

    // Interpolate scale from 1.0 to targetScale
    const scale = 1 + (targetScale - 1) * easedProgress;

    // Translate to grid cell position (in viewport coordinates since we're fixed)
    const translateX = targetX * easedProgress;
    const translateY = targetY * easedProgress;

    // Fade out near the end
    const opacity = scrollProgress > 0.95 ? Math.max(0, 1 - (scrollProgress - 0.95) / 0.05) : 1;

    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      opacity,
    };
  };

  // Hide completely when transitioned
  if (scrollProgress >= 1) return null;

  if (!video.playbackId) return null;

  const transformStyle = getTransform();

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-screen h-screen z-50"
      style={{
        ...transformStyle,
        transformOrigin: 'top left',
        willChange: 'transform',
      }}
    >
      {/* Background color */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ backgroundColor: video.placeholder }}
      />

      {/* Mux Player */}
      <div className="absolute inset-0 w-full h-full">
        <MuxPlayer
          playbackId={video.playbackId}
          streamType="on-demand"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            '--controls': 'none',
            '--media-object-fit': 'cover',
            '--media-object-position': 'center',
          } as any}
        />
      </div>

      {/* Source link badge */}
      {(video as any).sourceUrl && (
        <a
          href={(video as any).sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 left-4 px-3 py-2 bg-black/70 text-white text-sm rounded hover:bg-black/90 transition-colors flex items-center gap-2 pointer-events-auto z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {(video as any).sourcePlatform === 'youtube' && (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          )}
          {((video as any).sourcePlatform === 'twitter' || (video as any).sourcePlatform === 'x') && (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          )}
          <span>Source</span>
        </a>
      )}

      {/* Title overlay - fades in as video shrinks */}
      <div
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-12"
        style={{
          opacity: scrollProgress > 0.3 ? scrollProgress : 0,
        }}
      >
        <h2 className="text-white font-semibold text-xl line-clamp-2">
          {video.title}
        </h2>
        <p className="text-white/70 text-sm mt-2">
          {Math.round(video.duration)}s
        </p>
      </div>
    </div>
  );
}
