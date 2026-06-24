const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BASE_CAPTURE_URL = 'http://web.archive.org/web/20220621003153id_/http://smart.gov.qa/en';
const ARCHIVE_PREFIX = 'http://web.archive.org/web/20220621003153im_/http://smart.gov.qa';
const PUBLIC_DIR = path.join(__dirname, 'public');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function downloadFileWithRetry(url, filepath, retries = 4, delay = 2000) {
  const dir = path.dirname(filepath);
  fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(filepath) && fs.statSync(filepath).size > 0) {
    return true; // Already downloaded
  }

  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        timeout: 25000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        }
      });

      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);
        writer.on('finish', () => resolve(true));
        writer.on('error', (err) => {
          fs.unlink(filepath, () => {});
          reject(err);
        });
      });

      // Cool down to prevent rate limit
      await sleep(1000);
      return true;
    } catch (err) {
      console.warn(`[Attempt ${i + 1}/${retries}] Failed to download: ${url}. Error: ${err.message}`);
      if (i < retries - 1) {
        const backoff = delay * Math.pow(2, i);
        console.log(`Waiting ${backoff}ms before retrying...`);
        await sleep(backoff);
      }
    }
  }
  return false;
}

async function run() {
  console.log('Step 1: Downloading clean HTML...');
  let html;
  try {
    const res = await axios.get(BASE_CAPTURE_URL);
    html = res.data;
  } catch (err) {
    console.error(`Failed to fetch HTML: ${err.message}`);
    return;
  }

  const cleanHtml = html
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, function(match, content) {
      if (content.includes('__wm') || content.includes('archive.org')) {
        return '';
      }
      return match;
    })
    .replace(/<!-- BEGIN WAYBACK TOOLBAR INSERT -->[\s\S]*?<!-- END WAYBACK TOOLBAR INSERT -->/g, '');

  fs.writeFileSync(path.join(PUBLIC_DIR, 'index.html'), cleanHtml, 'utf8');
  console.log('Saved index.html');

  // Core JS/CSS bundles
  const bundles = [
    'polyfills.763bf7719a16b115408c.bundle.js',
    'vendor.2fcf97624505bbbe6a5f.bundle.js',
    'main.2a315ec838f889106e32.bundle.js',
    'main.a21eb6d38ba217cdcbea4c08d03d6c49.css'
  ];

  for (let b of bundles) {
    console.log(`Downloading bundle: ${b}`);
    await downloadFileWithRetry(`${ARCHIVE_PREFIX}/${b}`, path.join(PUBLIC_DIR, b));
  }

  // Scan assets from sources
  const assetsToDownload = new Set();
  const assetRegex = /assets\/[a-zA-Z0-9_\-\.\/]+/g;

  let match;
  while ((match = assetRegex.exec(cleanHtml)) !== null) {
    assetsToDownload.add(match[0]);
  }

  const cssPath = path.join(PUBLIC_DIR, 'main.a21eb6d38ba217cdcbea4c08d03d6c49.css');
  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    let cssMatch;
    while ((cssMatch = assetRegex.exec(cssContent)) !== null) {
      assetsToDownload.add(cssMatch[0]);
    }
  }

  const jsPath = path.join(PUBLIC_DIR, 'main.2a315ec838f889106e32.bundle.js');
  if (fs.existsSync(jsPath)) {
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    let jsMatch;
    while ((jsMatch = assetRegex.exec(jsContent)) !== null) {
      assetsToDownload.add(jsMatch[0]);
    }
  }

  // Manual list of fallback assets
  const manualList = [
    'assets/icon/apple-icon-57x57.png',
    'assets/icon/apple-icon-60x60.png',
    'assets/icon/apple-icon-72x72.png',
    'assets/icon/apple-icon-76x76.png',
    'assets/icon/apple-icon-114x114.png',
    'assets/icon/apple-icon-120x120.png',
    'assets/icon/apple-icon-144x144.png',
    'assets/icon/apple-icon-152x152.png',
    'assets/icon/apple-icon-180x180.png',
    'assets/icon/android-icon-192x192.png',
    'assets/icon/favicon.png',
    'assets/icon/ms-icon-144x144.png',
    'assets/manifest.json',
    'assets/landing/logo.png',
    'assets/landing/logo-white.png',
    'assets/fonts/Avenir-Heavy.otf',
    'assets/fonts/Avenir-Medium.otf',
    'assets/fonts/Avenir-Roman.otf',
    'assets/fonts/Avenir-Light.otf',
    'assets/fonts/cairo-regular-webfont.woff2',
    'assets/fonts/cairo-regular-webfont.woff',
    'assets/fonts/cairo-regular-webfont.ttf',
    'assets/fonts/cairo-bold-webfont.woff2',
    'assets/fonts/cairo-bold-webfont.woff',
    'assets/fonts/cairo-bold-webfont.ttf',
    'assets/landing/ic-transportation.png',
    'assets/landing/ic-logistics.png',
    'assets/landing/ic-healthcare.png',
    'assets/landing/ic-environment.png',
    'assets/landing/ic-sports.png',
    'assets/landing/ic-transportation-active.png',
    'assets/landing/ic-logistics-active.png',
    'assets/landing/ic-healthcare-active.png',
    'assets/landing/ic-environment-active.png',
    'assets/landing/ic-sports-active.png',
    'assets/landing/bg-pattern.png',
    'assets/landing/skyline.png',
    'assets/landing/skyline.svg'
  ];

  manualList.forEach(item => assetsToDownload.add(item));

  console.log(`Step 4: Downloading ${assetsToDownload.size} unique assets...`);

  let successCount = 0;
  for (let assetPath of assetsToDownload) {
    const cleanAssetPath = assetPath.split('?')[0];
    const remoteUrl = `${ARCHIVE_PREFIX}/${cleanAssetPath}`;
    const localPath = path.join(PUBLIC_DIR, cleanAssetPath);

    console.log(`Downloading: ${remoteUrl} -> ${localPath}`);
    const success = await downloadFileWithRetry(remoteUrl, localPath);
    if (success) {
      successCount++;
    }
  }

  console.log(`Done. Successfully downloaded ${successCount} assets.`);
}

run();
