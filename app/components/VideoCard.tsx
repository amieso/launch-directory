'use client';

import { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import type { Video } from '../types';

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Get Mux URLs
  const thumbnailUrl = video.playbackId
    ? `https://image.mux.com/${video.playbackId}/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop`
    : null;

  // Use Mux HLS stream for preview (works everywhere, adaptive quality)
  const videoUrl = video.playbackId
    ? `https://stream.mux.com/${video.playbackId}.m3u8`
    : null;

  // Initialize HLS player
  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;

    const video = videoRef.current;

    // Check if HLS is natively supported (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    } else if (Hls.isSupported()) {
      // Use hls.js for other browsers
      const hls = new Hls({
        maxBufferLength: 10, // Lower buffer for faster start
        maxMaxBufferLength: 15,
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed');
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
      });

      hlsRef.current = hls;

      return () => {
        hls.destroy();
      };
    }
  }, [videoUrl]);

  // No hover control - video autoplays with autoPlay attribute

  return (
    <div
      className="group relative aspect-video overflow-hidden rounded-lg bg-gray-100 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Instant: Dominant color placeholder (base64) */}
      <img
        src={video.placeholder}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'blur(20px)', transform: 'scale(1.2)' }}
        alt=""
      />

      {video.playbackId && (
        <>
          {/* Static thumbnail - shows while video is loading */}
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={video.title}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
                isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-xl'
              }`}
              onLoad={() => setIsLoaded(true)}
            />
          )}

          {/* Video preview - autoplays when loaded */}
          {videoUrl && (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              loop
              muted
              playsInline
              autoPlay
            />
          )}
        </>
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
