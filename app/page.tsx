import { VideoGrid } from './components/VideoGrid';
import type { VideoData } from './types';
import videosData from './videos.json';

export default function Home() {
  const data = videosData as VideoData;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Launch Videos
          </h1>
          <p className="text-gray-600 mt-2">
            A curated collection of product launch videos
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats */}
        <div className="mb-8 flex items-center gap-6 text-sm text-gray-600">
          <span>{data.videos.length} videos</span>
          {data.videos.filter(v => v.status === 'ready').length > 0 && (
            <span>
              {data.videos.filter(v => v.status === 'ready').length} ready
            </span>
          )}
        </div>

        {/* Video grid */}
        <VideoGrid videos={data.videos} />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-sm text-gray-500">
          Built with Next.js + Mux
        </div>
      </footer>
    </div>
  );
}
