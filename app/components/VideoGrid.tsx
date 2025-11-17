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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
