import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const execPromise = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Configuration
const UPLOADS_DIR = path.join(projectRoot, '..', 'uploads');
const YOUTUBE_DIR = path.join(UPLOADS_DIR, 'youtube');
const TWITTER_DIR = path.join(UPLOADS_DIR, 'twitter');
const LOGS_DIR = path.join(projectRoot, 'data');

// Command line args
const urls = process.argv.slice(2);
const skipProcessing = urls.includes('--no-process');
const processAfterDownload = !skipProcessing; // Process by default
const filteredUrls = urls.filter(url => !url.startsWith('--'));

/**
 * Ensure directories exist
 */
function ensureDirectories() {
  [UPLOADS_DIR, YOUTUBE_DIR, TWITTER_DIR, LOGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Detect platform from URL
 */
function detectPlatform(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return 'twitter';
  }
  return 'unknown';
}

/**
 * Check if yt-dlp is installed
 */
async function checkYtDlp() {
  try {
    await execPromise('yt-dlp --version');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Download video from URL using yt-dlp
 */
async function downloadVideo(url, platform) {
  const outputDir = platform === 'youtube' ? YOUTUBE_DIR : TWITTER_DIR;
  const outputTemplate = path.join(outputDir, '%(title)s-%(id)s.%(ext)s');

  console.log(`  📥 Downloading from ${platform}...`);

  // yt-dlp options for best quality and compatibility
  const args = [
    '--format', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
    '--merge-output-format', 'mp4',
    '--output', outputTemplate,
    '--no-playlist',
    '--no-warnings',
    '--print', 'after_move:filepath',
    url
  ];

  // Add cookies for Twitter if available
  if (platform === 'twitter' && process.env.TWITTER_COOKIES_FILE) {
    args.unshift('--cookies', process.env.TWITTER_COOKIES_FILE);
  }

  return new Promise((resolve, reject) => {
    const ytdlp = spawn('yt-dlp', args);
    let stdout = '';
    let stderr = '';

    ytdlp.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ytdlp.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ytdlp.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Download failed with code ${code}: ${stderr}`));
        return;
      }

      try {
        // Extract the downloaded file path from output
        const lines = stdout.trim().split('\n');
        const filePath = lines[lines.length - 1].trim();

        if (!filePath || !fs.existsSync(filePath)) {
          reject(new Error('Downloaded file not found'));
          return;
        }

        console.log(`  ✅ Downloaded: ${path.basename(filePath)}`);
        resolve(filePath);
      } catch (error) {
        reject(new Error(`Failed to parse output: ${error.message}`));
      }
    });

    ytdlp.on('error', (error) => {
      reject(new Error(`Failed to spawn yt-dlp: ${error.message}`));
    });
  });
}

/**
 * Move file to main uploads directory for processing
 */
function moveToUploads(filePath) {
  const filename = path.basename(filePath);
  const destination = path.join(UPLOADS_DIR, filename);

  // If file already exists in uploads, add a number suffix
  let finalDestination = destination;
  let counter = 1;
  while (fs.existsSync(finalDestination)) {
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);
    finalDestination = path.join(UPLOADS_DIR, `${name}-${counter}${ext}`);
    counter++;
  }

  fs.renameSync(filePath, finalDestination);
  console.log(`  📦 Moved to uploads directory`);
  return finalDestination;
}

/**
 * Process a single URL
 */
async function processUrl(url) {
  console.log(`\n🔗 Processing URL: ${url}`);

  const platform = detectPlatform(url);

  if (platform === 'unknown') {
    console.error(`  ❌ Unsupported URL format`);
    return null;
  }

  console.log(`  📱 Platform: ${platform}`);

  try {
    const filePath = await downloadVideo(url, platform);
    const uploadPath = moveToUploads(filePath);

    return {
      url,
      platform,
      filePath: uploadPath,
      filename: path.basename(uploadPath),
      downloadedAt: new Date().toISOString(),
    };

  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    return null;
  }
}

/**
 * Run the processing script
 */
async function runProcessingScript() {
  console.log('\n🔄 Starting Mux processing pipeline...\n');

  try {
    const { stdout, stderr } = await execPromise('npm run process', {
      cwd: projectRoot,
      env: { ...process.env, FORCE_COLOR: '1' }
    });

    console.log(stdout);
    if (stderr) console.error(stderr);

  } catch (error) {
    console.error('❌ Processing failed:', error.message);
    throw error;
  }
}

/**
 * Log download history
 */
function logDownload(results) {
  const logFile = path.join(LOGS_DIR, 'download-history.json');
  let history = { downloads: [] };

  if (fs.existsSync(logFile)) {
    history = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
  }

  history.downloads.push(...results.filter(r => r !== null));
  fs.writeFileSync(logFile, JSON.stringify(history, null, 2));
}

/**
 * Main function
 */
async function main() {
  console.log('📹 Video Download Script\n');

  // Check if URLs provided
  if (filteredUrls.length === 0) {
    console.log('Usage: npm run download <url1> [url2] [...] [--no-process]');
    console.log('');
    console.log('Examples:');
    console.log('  npm run download "https://www.youtube.com/watch?v=dQw4w9WgXcQ"');
    console.log('  npm run download "https://twitter.com/user/status/123456789"');
    console.log('  npm run download "url1" "url2"');
    console.log('');
    console.log('Options:');
    console.log('  --no-process    Skip automatic Mux processing (downloads only)');
    console.log('');
    console.log('Note: Videos are processed and uploaded to Mux by default after download.');
    console.log('');
    console.log('Supported platforms:');
    console.log('  - YouTube (youtube.com, youtu.be)');
    console.log('  - Twitter/X (twitter.com, x.com)');
    return;
  }

  // Check for yt-dlp
  console.log('🔍 Checking dependencies...');
  const hasYtDlp = await checkYtDlp();

  if (!hasYtDlp) {
    console.error('❌ Error: yt-dlp not found!');
    console.error('');
    console.error('Please install yt-dlp:');
    console.error('  macOS:   brew install yt-dlp');
    console.error('  Linux:   pip install yt-dlp');
    console.error('  Windows: winget install yt-dlp');
    console.error('');
    console.error('Or visit: https://github.com/yt-dlp/yt-dlp#installation');
    process.exit(1);
  }

  console.log('✅ Dependencies OK\n');

  // Ensure directories exist
  ensureDirectories();

  console.log(`📁 Download locations:`);
  console.log(`   YouTube: ${YOUTUBE_DIR}`);
  console.log(`   Twitter: ${TWITTER_DIR}`);
  console.log(`   Uploads: ${UPLOADS_DIR}`);

  console.log('\n' + '─'.repeat(50));

  // Process all URLs
  const results = [];
  for (const url of filteredUrls) {
    const result = await processUrl(url);
    if (result) {
      results.push(result);
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`   Downloaded: ${results.length}`);
  console.log(`   Failed: ${filteredUrls.length - results.length}`);

  // Log download history
  if (results.length > 0) {
    logDownload(results);
    console.log(`\n✅ Download history saved`);
  }

  // Run processing script if requested
  if (processAfterDownload && results.length > 0) {
    try {
      await runProcessingScript();
    } catch (error) {
      console.error('\n⚠️  Download succeeded but processing failed');
      console.error('   You can manually run: npm run process');
      process.exit(1);
    }
  } else if (results.length > 0) {
    console.log('\n💡 Next step: Run "npm run process" to upload to Mux');
  }

  console.log('\n🎉 Done!\n');
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
