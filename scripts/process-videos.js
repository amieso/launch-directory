import Mux from '@mux/mux-node';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const execPromise = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Configuration
const UPLOADS_DIR = path.join(projectRoot, '..', 'uploads');
const PROCESSED_DIR = path.join(UPLOADS_DIR, 'processed');
const DUPLICATES_DIR = path.join(UPLOADS_DIR, 'duplicates');
const FAILED_DIR = path.join(UPLOADS_DIR, 'failed');
const PREVIEWS_DIR = path.join(projectRoot, 'public', 'previews');
const DATA_FILE = path.join(projectRoot, 'app', 'videos.json');

// Create previews directory if it doesn't exist
if (!fs.existsSync(PREVIEWS_DIR)) {
  fs.mkdirSync(PREVIEWS_DIR, { recursive: true });
}

// Command line args
const isDryRun = process.argv.includes('--dry-run');
const skipPolling = process.argv.includes('--no-poll');

// Initialize Mux client
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

/**
 * Calculate MD5 checksum of a file
 */
function calculateChecksum(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(fileBuffer).digest('hex');
}

/**
 * Extract dominant color from video's first frame
 */
async function extractDominantColor(videoPath) {
  const tempPath = path.join(UPLOADS_DIR, `temp_${Date.now()}.rgb`);
  const escapedVideoPath = videoPath.replace(/'/g, "'\\''");
  const escapedTempPath = tempPath.replace(/'/g, "'\\''");

  // Extract first frame, scale to 1x1 pixel (averages all colors), output as raw RGB
  const command = `ffmpeg -i '${escapedVideoPath}' -vf "select=eq(n\\,0),scale=1:1" -frames:v 1 -f rawvideo -pix_fmt rgb24 '${escapedTempPath}'`;

  try {
    await execPromise(command);

    // Read the 3 bytes (RGB values)
    const buffer = fs.readFileSync(tempPath);
    const r = buffer[0];
    const g = buffer[1];
    const b = buffer[2];

    // Clean up temp file
    fs.unlinkSync(tempPath);

    // Return as hex color
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } catch (error) {
    throw new Error(`Failed to extract dominant color: ${error.message}`);
  }
}

/**
 * Generate preview MP4 with fast start for progressive playback
 */
async function generatePreviewMP4(videoPath, outputPath) {
  const escapedVideoPath = videoPath.replace(/'/g, "'\\''");
  const escapedOutputPath = outputPath.replace(/'/g, "'\\''");

  // Generate 480p MP4 with fast start (moov atom at beginning for streaming)
  // -movflags +faststart: moves metadata to beginning for progressive playback
  // -preset fast: faster encoding
  // -crf 23: good quality/size balance
  const command = `ffmpeg -i '${escapedVideoPath}' -vf scale=854:480:force_original_aspect_ratio=decrease,pad=854:480:(ow-iw)/2:(oh-ih)/2 -c:v libx264 -preset fast -crf 23 -movflags +faststart -c:a aac -b:a 128k -r 30 '${escapedOutputPath}'`;

  try {
    await execPromise(command);
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to generate preview MP4: ${error.message}`);
  }
}

/**
 * Get video metadata using ffprobe
 */
async function getVideoMetadata(videoPath) {
  const escapedPath = videoPath.replace(/'/g, "'\\''");
  const command = `ffprobe -v quiet -print_format json -show_format -show_streams '${escapedPath}'`;

  try {
    const { stdout } = await execPromise(command);
    const metadata = JSON.parse(stdout);
    const videoStream = metadata.streams.find(s => s.codec_type === 'video');

    return {
      duration: parseFloat(metadata.format.duration),
      width: videoStream?.width,
      height: videoStream?.height,
      size: parseInt(metadata.format.size),
    };
  } catch (error) {
    throw new Error(`Failed to get video metadata: ${error.message}`);
  }
}

/**
 * Upload video to Mux via direct upload URL
 */
async function uploadToMux(videoPath, metadata) {
  console.log(`  📤 Uploading to Mux...`);

  // Create a direct upload
  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      playback_policy: ['public'],
      video_quality: 'plus', // Better quality encoding
    },
  });

  // Read file into buffer before uploading
  const fileBuffer = fs.readFileSync(videoPath);

  // Upload using fetch
  const response = await fetch(upload.url, {
    method: 'PUT',
    body: fileBuffer,
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Length': fileBuffer.length.toString(),
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  console.log(`  ✅ Uploaded to Mux (Upload ID: ${upload.id})`);

  // Note: Direct uploads don't have an asset_id until Mux processes the video
  // We'll use the upload ID as the temporary ID and fetch the asset ID later
  return {
    assetId: upload.asset_id || null,
    uploadId: upload.id,
  };
}

/**
 * Process a single video file
 */
async function processVideo(videoPath, data) {
  const filename = path.basename(videoPath);
  console.log(`\n🎬 Processing: ${filename}`);

  // Calculate checksum
  console.log(`  🔍 Calculating checksum...`);
  const checksum = calculateChecksum(videoPath);

  // Check for duplicates
  const existing = data.videos.find(v => v.checksum === checksum);
  if (existing) {
    console.log(`  ⏭️  Duplicate detected (already processed)`);
    if (!isDryRun) {
      fs.renameSync(videoPath, path.join(DUPLICATES_DIR, filename));
    }
    return null;
  }

  if (isDryRun) {
    console.log(`  [DRY RUN] Would process this video`);
    return null;
  }

  try {
    // Get video metadata
    console.log(`  📊 Extracting metadata...`);
    const metadata = await getVideoMetadata(videoPath);

    // Extract dominant color
    console.log(`  🎨 Extracting dominant color...`);
    const placeholder = await extractDominantColor(videoPath);

    // Generate preview MP4 with fast start
    console.log(`  🎥 Generating preview MP4 (480p, fast start)...`);
    const previewFilename = `${checksum}.mp4`;
    const previewPath = path.join(PREVIEWS_DIR, previewFilename);
    await generatePreviewMP4(videoPath, previewPath);
    const previewUrl = `/previews/${previewFilename}`;

    // Upload to Mux
    const muxData = await uploadToMux(videoPath, metadata);

    // Generate clean title from filename
    const title = path.parse(filename).name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    // Create video entry
    const videoEntry = {
      id: muxData.assetId || muxData.uploadId, // Use uploadId as fallback
      title,
      muxAssetId: muxData.assetId,
      muxUploadId: muxData.uploadId,
      playbackId: null, // Will be populated once Mux processes
      previewUrl, // Fast-start MP4 for instant playback
      placeholder,
      checksum,
      sourceFile: filename,
      duration: metadata.duration,
      width: metadata.width,
      height: metadata.height,
      size: metadata.size,
      uploadedAt: new Date().toISOString(),
      status: muxData.assetId ? 'preparing' : 'uploading',
    };

    // Move to processed folder
    fs.renameSync(videoPath, path.join(PROCESSED_DIR, filename));

    console.log(`  ✅ Complete!`);
    return videoEntry;

  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    // Move to failed folder
    fs.renameSync(videoPath, path.join(FAILED_DIR, filename));
    return null;
  }
}

/**
 * Poll Mux for video status updates until all videos are ready
 */
async function pollForPlaybackIds(intervalSeconds = 30, maxAttempts = 20) {
  console.log('\n🔄 Auto-polling for playback IDs...\n');
  console.log(`   Checking every ${intervalSeconds} seconds (max ${maxAttempts} attempts)`);

  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;

    // Load current data
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

    // Find videos without playback IDs
    const pendingVideos = data.videos.filter(v => !v.playbackId);

    if (pendingVideos.length === 0) {
      console.log('\n✅ All videos have playback IDs!');
      return;
    }

    console.log(`\n⏳ Attempt ${attempt}/${maxAttempts} - Checking ${pendingVideos.length} video(s)...`);

    let updated = 0;

    for (const video of pendingVideos) {
      try {
        // If we don't have an asset ID yet, try to get it from the upload
        if (!video.muxAssetId && video.muxUploadId) {
          const upload = await mux.video.uploads.retrieve(video.muxUploadId);

          if (upload.asset_id) {
            video.muxAssetId = upload.asset_id;
            video.id = upload.asset_id;
            console.log(`   ${video.title}: Got asset ID`);
          } else {
            console.log(`   ${video.title}: Still uploading...`);
            continue;
          }
        }

        // Fetch asset from Mux
        const asset = await mux.video.assets.retrieve(video.muxAssetId);

        if (asset.status === 'ready' && asset.playback_ids?.length > 0) {
          video.playbackId = asset.playback_ids[0].id;
          video.status = 'ready';
          console.log(`   ${video.title}: ✅ Ready!`);
          updated++;
        } else if (asset.status === 'preparing') {
          console.log(`   ${video.title}: Preparing...`);
          video.status = 'preparing';
        } else if (asset.status === 'errored') {
          console.log(`   ${video.title}: ❌ Error`);
          video.status = 'errored';
        }

      } catch (error) {
        console.error(`   ${video.title}: ❌ ${error.message}`);
      }
    }

    // Save updated data
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    if (updated > 0) {
      console.log(`\n   Updated ${updated} video(s)`);
    }

    // Check if we're done
    const stillPending = data.videos.filter(v => !v.playbackId);
    if (stillPending.length === 0) {
      console.log('\n✅ All videos are ready!');
      return;
    }

    // Wait before next attempt (unless this is the last attempt)
    if (attempt < maxAttempts) {
      console.log(`\n   Waiting ${intervalSeconds} seconds before next check...`);
      await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
    }
  }

  console.log('\n⚠️  Max attempts reached. Some videos may still be processing.');
  console.log('   Run "npm run update-playback-ids" to check again later.');
}

/**
 * Main processing function
 */
async function main() {
  console.log('🚀 Video Processing Pipeline\n');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}\n`);

  // Check Mux credentials
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    console.error('❌ Error: Mux credentials not found!');
    console.error('Please create a .env file with MUX_TOKEN_ID and MUX_TOKEN_SECRET');
    console.error('See .env.example for reference');
    process.exit(1);
  }

  // Check for ffmpeg
  try {
    await execPromise('ffmpeg -version');
  } catch (error) {
    console.error('❌ Error: ffmpeg not found!');
    console.error('Please install ffmpeg: https://ffmpeg.org/download.html');
    console.error('macOS: brew install ffmpeg');
    process.exit(1);
  }

  // Load existing data
  let data = { videos: [] };
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  }

  // Get all video files in uploads directory
  const files = fs.readdirSync(UPLOADS_DIR)
    .filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.mp4', '.mov', '.webm', '.avi'].includes(ext);
    })
    .map(f => path.join(UPLOADS_DIR, f));

  if (files.length === 0) {
    console.log('📭 No videos found in uploads/ directory');
    console.log(`Drop video files into: ${UPLOADS_DIR}`);
    return;
  }

  console.log(`📦 Found ${files.length} video(s) to process\n`);
  console.log('─'.repeat(50));

  // Process videos sequentially (can be parallelized later)
  const results = [];
  for (const videoPath of files) {
    const result = await processVideo(videoPath, data);
    if (result) {
      results.push(result);
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`   Processed: ${results.length}`);
  console.log(`   Skipped: ${files.length - results.length}`);

  // Update data.json
  if (results.length > 0 && !isDryRun) {
    data.videos.push(...results);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`\n✅ Updated ${DATA_FILE}`);
  }

  console.log('\n🎉 Done!\n');

  // Auto-poll for playback IDs if videos were uploaded
  if (results.length > 0 && !isDryRun && !skipPolling) {
    console.log('⚠️  Note: Mux is still processing your videos.');
    console.log('   Starting auto-polling...\n');

    await pollForPlaybackIds();
  } else if (results.length > 0 && skipPolling) {
    console.log('⚠️  Note: Mux is still processing your videos.');
    console.log('   Playback URLs will be available in a few minutes.');
    console.log('   Run "npm run update-playback-ids" to fetch playback IDs.');
  }
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
