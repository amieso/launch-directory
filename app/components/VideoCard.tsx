'use client';

import { useState, useRef, useEffect } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import type { Video } from '../types';

interface VideoCardProps {
  video: Video;
  index: number;
  isExpanded?: boolean;
  hasExpandedVideo?: boolean;
  onVideoClick?: () => void;
  onClose?: () => void;
}

export function VideoCard({ video, index, isExpanded = false, hasExpandedVideo = false, onVideoClick, onClose }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadStartTimeRef = useRef<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const scrollAccumulatorRef = useRef<number>(0);
  const scrollPositionRef = useRef<number>(0);
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [scrollOffsetX, setScrollOffsetX] = useState<number>(0);
  const scrollAccumulatorXRef = useRef<number>(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isBouncingBack, setIsBouncingBack] = useState(false);
  const [shouldShowControls, setShouldShowControls] = useState(false);

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
    setHasError(false);

    // Log load time (localhost only)
    if (process.env.NODE_ENV === 'development' && loadStartTimeRef.current !== null) {
      const loadTime = Math.round(performance.now() - loadStartTimeRef.current);
      console.log(`📹 Video loaded: "${video.title}" - ${loadTime}ms`);
      loadStartTimeRef.current = null;
    }
  };

  // Handle HLS/playback errors
  const handleError = (error: any) => {
    setHasError(true);
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ Video error: "${video.title}"`, error);
    }
  };

  // Track animation state
  useEffect(() => {
    if (isExpanded) {
      setIsAnimating(true);
    } else if (isAnimating) {
      // Keep z-index and scroll block during close animation + extra buffer
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 550); // 300ms animation + 250ms buffer
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

  // Capture rect when expanded from URL (no click happened)
  useEffect(() => {
    if (isExpanded && !rect && containerRef.current) {
      const currentRect = containerRef.current.getBoundingClientRect();
      setRect(currentRect);
      // Force video to be in view when expanded from URL
      setIsInView(true);
    }
  }, [isExpanded, rect]);

  // Show controls when expanded (after animation starts)
  useEffect(() => {
    if (isExpanded) {
      // Delay showing controls until after animation starts
      const timer = setTimeout(() => {
        setShouldShowControls(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShouldShowControls(false);
    }
  }, [isExpanded]);

  // Handle escape key, scroll blocking, and scroll-to-close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        onClose?.();
      }
    };

    // Prevent scroll on wheel events and accumulate scroll distance
    const handleWheel = (e: WheelEvent) => {
      // Block scroll during entire animation period
      if (isAnimating) {
        e.preventDefault();
        
        // Only allow closing if still expanded (not already closing)
        if (isExpanded) {
          // Clear any existing bounce-back timeout
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }
          setIsBouncingBack(false);
          
          // Accumulate vertical scroll distance (both up and down)
          scrollAccumulatorRef.current += e.deltaY;
          
          // Accumulate horizontal scroll distance
          scrollAccumulatorXRef.current += e.deltaX;
          
          // Update visual offsets (scroll distance / 10)
          setScrollOffset(scrollAccumulatorRef.current / 10);
          setScrollOffsetX(scrollAccumulatorXRef.current / 10);
          
          // Set timeout to bounce back horizontal offset when scrolling stops
          scrollTimeoutRef.current = setTimeout(() => {
            setIsBouncingBack(true);
            scrollAccumulatorXRef.current = 0;
            setScrollOffsetX(0);
            // Reset bouncing flag after animation completes
            setTimeout(() => setIsBouncingBack(false), 300);
          }, 150);
          
          // Close if scrolled vertically in either direction more than 150px total
          if (Math.abs(scrollAccumulatorRef.current) > 150) {
            onClose?.();
            scrollAccumulatorRef.current = 0;
            scrollAccumulatorXRef.current = 0;
            setScrollOffset(0);
            setScrollOffsetX(0);
            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current);
            }
          }
        }
      }
    };

    // Prevent scroll on touch events (mobile)
    const handleTouchMove = (e: TouchEvent) => {
      // Block touch during entire animation period
      if (isAnimating) {
        e.preventDefault();
      }
    };

    if (isExpanded) {
      scrollAccumulatorRef.current = 0; // Reset on open
      scrollAccumulatorXRef.current = 0;
      setScrollOffset(0);
      setScrollOffsetX(0);
      setIsBouncingBack(false);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    }

    if (isAnimating) {
      window.addEventListener('keydown', handleEscape);
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isExpanded, isAnimating, onClose]);

  // Separate effect for body scroll blocking - controlled by isAnimating to persist during close animation
  useEffect(() => {
    if (isAnimating) {
      // Save current scroll position
      scrollPositionRef.current = window.scrollY;
      
      // Apply fixed positioning with negative top to maintain visual position
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll blocking styles
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.top = 'unset';
      document.body.style.width = 'unset';
      
      // Restore scroll position
      window.scrollTo(0, scrollPositionRef.current);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.top = 'unset';
      document.body.style.width = 'unset';
    };
  }, [isAnimating]);

  // Calculate transform for expansion
  const getTransform = () => {
    if (!rect || !isExpanded) return {};
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxWidth = viewportWidth * 0.8;
    const maxHeight = viewportHeight * 0.8;
    
    // Calculate final dimensions based on video's actual aspect ratio
    const videoAspectRatio = video.width / video.height;
    let finalWidth, finalHeight;
    
    if (maxWidth / maxHeight > videoAspectRatio) {
      // Height is the limiting factor
      finalHeight = maxHeight;
      finalWidth = maxHeight * videoAspectRatio;
    } else {
      // Width is the limiting factor
      finalWidth = maxWidth;
      finalHeight = maxWidth / videoAspectRatio;
    }
    
    // Calculate scale
    const scale = finalWidth / rect.width;
    
    // Calculate the expanded container's height (after aspect ratio change but before scaling)
    const expandedContainerHeight = rect.width / videoAspectRatio;
    
    // Calculate translation to center both horizontally and vertically
    const translateX = (viewportWidth / 2) - (rect.left + rect.width / 2) + scrollOffsetX;
    const translateY = (viewportHeight / 2) - (rect.top + expandedContainerHeight / 2) + scrollOffset;
    
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
        className={`group relative overflow-hidden bg-gray-100 cursor-pointer transition-all duration-300 ease-inäout ${
          isAnimating ? 'fixed' : ''
        } ${!isExpanded ? 'border-r border-b border-gray-200 aspect-video' : ''}`}
        style={{
          ...(isExpanded && { aspectRatio: `${video.width} / ${video.height}` }),
          ...(isExpanded ? getTransform() : {}),
          ...(isAnimating ? { zIndex: 9999 } : {}),
          // Scale down other videos when one is expanded
          ...(!isExpanded && hasExpandedVideo ? { transform: 'scale(0.95)' } : {}),
          // Add responsive transition for scroll offset feedback
          ...(isExpanded && (scrollOffset !== 0 || scrollOffsetX !== 0) 
            ? { transition: isBouncingBack ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 0.1s ease-out' } 
            : {}),
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
      {video.playbackId && isInView && !hasError && (
        <div className={`absolute inset-0 w-full h-full transition-all duration-500 ${
          isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.1]'
        }`}>
          <MuxPlayer
            playbackId={video.playbackId}
            streamType="on-demand"
            autoPlay={!isExpanded}
            muted
            loop={!isExpanded}
            playsInline
            preload="auto"
            startTime={0}
            style={{
              width: '100%',
              height: '100%',
              '--controls': shouldShowControls ? 'auto' : 'none',
              '--media-object-fit': isExpanded ? 'contain' : 'cover',
              '--media-object-position': 'center',
            } as any}
            onPlaying={handlePlaying}
            onError={handleError}
          />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <div className="text-gray-400 text-sm">Unable to load video</div>
          </div>
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
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
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
