export interface Video {
  id: string;
  title: string;
  muxAssetId: string;
  muxUploadId: string;
  playbackId: string | null;
  previewUrl?: string; // Fast-start MP4 for instant playback
  placeholder: string;
  checksum: string;
  sourceFile: string;
  duration: number;
  width: number;
  height: number;
  size: number;
  uploadedAt: string;
  status?: 'ready' | 'preparing' | 'errored';
}

export interface VideoData {
  videos: Video[];
}
