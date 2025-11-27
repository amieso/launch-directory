'use client';

import { useState, useRef, useEffect } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import type { Video } from '../types';

interface VideoCardProps {
  video: Video;
  index: number;
  isExpanded?: boolean;
  onVideoClick?: () => void;
  onClose?: () => void;
}

export function VideoCard({ video, index, isExpanded = false, onVideoClick, onClose }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadStartTimeRef = useRef<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

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

  // Track animation state
  useEffect(() => {
    if (isExpanded) {
      setIsAnimating(true);
    } else if (isAnimating) {
      // Keep z-index high during close animation
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300); // Match the animation duration
      return () => clearTimeout(timer);
    }
  }, [isExpanded, isAnimating]);

  // Handle click - capture position before expanding
  const handleClick = () => {
    if (containerRef.current && !isExpanded) {
      const currentRect = containerRef.current.getBoundingClientRect();
      setRect(currentRect);
      onVideoClick?.();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        onClose?.();
      }
    };

    if (isExpanded) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded, onClose]);

  // Calculate transform for expansion
  const getTransform = () => {
    if (!rect || !isExpanded) return {};
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const targetWidth = viewportWidth * 0.8;
    const targetHeight = viewportHeight * 0.8;
    
    const scale = Math.min(targetWidth / rect.width, targetHeight / rect.height);
    const translateX = (viewportWidth / 2) - (rect.left + rect.width / 2);
    const translateY = (viewportHeight / 2) - (rect.top + rect.height / 2);
    
    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
    };
  };

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/80 transition-opacity duration-300"
          style={{ zIndex: 9998 }}
          onClick={onClose}
        />
      )}
      
      <div
        ref={containerRef}
        className={`group relative aspect-video overflow-hidden bg-gray-100 cursor-pointer border-r border-b border-gray-200 transition-all duration-300 ease-out ${
          isAnimating ? 'fixed' : ''
        }`}
        style={{
          ...(isExpanded ? getTransform() : {}),
          ...(isAnimating ? { zIndex: 9999 } : {}),
        }}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => !isExpanded && setIsHovered(false)}
        onClick={handleClick}
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
            muted={!isExpanded}
            loop={!isExpanded}
            playsInline
            preload="auto"
            startTime={0}
            style={isExpanded ? {
              width: '100%',
              height: '100%',
            } : {
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

      {/* Source link badge */}
      {video.sourceUrl && (
        <a
          href={video.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded hover:bg-black/90 transition-colors flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {video.sourcePlatform === 'youtube' && (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          )}
          {video.sourcePlatform === 'twitter' && (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          )}
          <span>Source</span>
        </a>
      )}

      {/* Close button when expanded */}
      {isExpanded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
          style={{ zIndex: 10000 }}
          aria-label="Close"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Title overlay */}
      {!isExpanded && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
          <h3 className="text-white font-medium text-sm line-clamp-2">
            {video.title}
          </h3>
          <p className="text-white/70 text-xs mt-1">
            {Math.round(video.duration)}s
          </p>
        </div>
      )}
      </div>
    </>
  );
}
