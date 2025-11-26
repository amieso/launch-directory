import type { Video } from '../types';
import { VideoCard } from './VideoCard';

interface VideoGridProps {
  videos: Video[];
}

export function VideoGrid({ videos }: VideoGridProps) {
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
        <VideoCard key={video.id} video={video} index={index} />
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
