import Mux from '@mux/mux-node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const DATA_FILE = path.join(projectRoot, 'app', 'videos.json');

// Initialize Mux client
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

/**
 * Update playback IDs for videos that don't have them yet
 */
async function updatePlaybackIds() {
  console.log('🔄 Updating playback IDs from Mux...\n');

  // Load data
  if (!fs.existsSync(DATA_FILE)) {
    console.error('❌ Error: videos.json not found');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

  // Find videos without playback IDs
  const videosToUpdate = data.videos.filter(v => !v.playbackId);

  if (videosToUpdate.length === 0) {
    console.log('✅ All videos already have playback IDs!');
    return;
  }

  console.log(`Found ${videosToUpdate.length} video(s) to update\n`);

  let updated = 0;
  let pending = 0;

  for (const video of videosToUpdate) {
    try {
      console.log(`Checking: ${video.title}...`);

      // If we don't have an asset ID yet, try to get it from the upload
      if (!video.muxAssetId && video.muxUploadId) {
        console.log(`  Fetching asset ID from upload...`);
        const upload = await mux.video.uploads.retrieve(video.muxUploadId);

        if (upload.asset_id) {
          video.muxAssetId = upload.asset_id;
          video.id = upload.asset_id;
          console.log(`  Got asset ID: ${upload.asset_id}`);
        } else {
          console.log(`  Upload still in progress...`);
          video.status = 'uploading';
          pending++;
          continue;
        }
      }

      // Fetch asset from Mux
      const asset = await mux.video.assets.retrieve(video.muxAssetId);

      if (asset.status === 'ready' && asset.playback_ids?.length > 0) {
        // Update video entry with playback ID
        video.playbackId = asset.playback_ids[0].id;
        video.status = 'ready';
        console.log(`  ✅ Ready! Playback ID: ${video.playbackId}`);
        updated++;
      } else if (asset.status === 'preparing') {
        console.log(`  ⏳ Still processing...`);
        video.status = 'preparing';
        pending++;
      } else if (asset.status === 'errored') {
        console.log(`  ❌ Error during processing`);
        video.status = 'errored';
      } else {
        console.log(`  ⏳ Status: ${asset.status}`);
        video.status = asset.status;
        pending++;
      }

    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`);
    }
  }

  // Save updated data
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  console.log('\n' + '─'.repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Still processing: ${pending}`);
  console.log(`\n✅ Updated ${DATA_FILE}\n`);

  if (pending > 0) {
    console.log('⏳ Some videos are still processing.');
    console.log('   Run this script again in a few minutes.\n');
  }
}

// Run the script
updatePlaybackIds().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
