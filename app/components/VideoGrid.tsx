'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Video } from '../types';
import { VideoCard } from './VideoCard';

interface VideoGridProps {
  videos: Video[];
}

export function VideoGrid({ videos }: VideoGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);

  // On mount, check URL for video ID and expand if present
  useEffect(() => {
    const videoIdFromUrl = searchParams.get('v');
    if (videoIdFromUrl) {
      // Verify the video ID exists in our videos list
      const videoExists = videos.some(video => video.id === videoIdFromUrl);
      if (videoExists) {
        setExpandedVideoId(videoIdFromUrl);
      }
    }
  }, [searchParams, videos]);

  // Handle expanding a video - update URL
  const handleVideoExpand = (videoId: string) => {
    setExpandedVideoId(videoId);
    // Update URL without page reload
    router.push(`?v=${videoId}`, { scroll: false });
  };

  // Handle closing expanded video - remove from URL
  const handleVideoClose = () => {
    setExpandedVideoId(null);
    // Remove query param from URL
    router.push('/', { scroll: false });
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">No videos yet</p>
        <p className="text-gray-400 text-sm mt-2">
          Add videos to the uploads folder and run the processing script
        </p>
      </div>
    );
  }

  // Calculate empty cells needed to fill the grid
  // We'll aim for many rows to extend gridlines down the entire page
  const minCells = 100; // Extend grid significantly to fill page height
  const emptyCellsNeeded = Math.max(0, minCells - videos.length);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-l border-t border-gray-200">
      {videos.map((video, index) => (
        <VideoCard 
          key={video.id} 
          video={video} 
          index={index}
          isExpanded={expandedVideoId === video.id}
          hasExpandedVideo={expandedVideoId !== null}
          onVideoClick={() => handleVideoExpand(video.id)}
          onClose={handleVideoClose}
        />
      ))}
      {/* Empty cells to extend gridlines */}
      {Array.from({ length: emptyCellsNeeded }).map((_, index) => (
        <div
          key={`empty-${index}`}
          className="aspect-video border-r border-b border-gray-200 bg-gray-50"
        />
      ))}
    </div>
  );
}
