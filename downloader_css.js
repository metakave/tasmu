const fs = require('fs');
const path = require('path');
const axios = require('axios');

const PUBLIC_DIR = path.join(__dirname, 'public');
const cssPath = path.join(PUBLIC_DIR, 'main.a21eb6d38ba217cdcbea4c08d03d6c49.css');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function downloadFile(url, filepath) {
  const dir = path.dirname(filepath);
  fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(filepath) && fs.statSync(filepath).size > 0) {
    return true; // Already exists
  }

  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      writer.on('finish', () => resolve(true));
      writer.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    });
  } catch (err) {
    console.error(`Failed: ${url} - Error: ${err.message}`);
    return false;
  }
}

async function run() {
  if (!fs.existsSync(cssPath)) {
    console.error(`CSS file not found at ${cssPath}`);
    return;
  }

  const content = fs.readFileSync(cssPath, 'utf8');
  const urlRegex = /url\(['"]?([^'")]+)['"]?\)/g;
  const urls = new Set();
  let match;

  while ((match = urlRegex.exec(content)) !== null) {
    urls.add(match[1]);
  }

  console.log(`Found ${urls.size} unique URLs in CSS file. Starting downloads...`);

  let successCount = 0;
  let attemptCount = 0;

  for (let rawUrl of urls) {
    attemptCount++;
    
    // Ignore external font cdns
    if (rawUrl.startsWith('http') && !rawUrl.includes('smart.gov.qa')) {
      continue;
    }

    // Extract the clean relative path starting from /assets/
    let assetPath;
    if (rawUrl.includes('/assets/')) {
      assetPath = 'assets/' + rawUrl.split('/assets/')[1].split('?')[0].split('#')[0];
    } else {
      // Direct file under root like f4769f9bdb7466be65088239c12046d1.eot
      const parts = rawUrl.split('/');
      const filename = parts[parts.length - 1].split('?')[0].split('#')[0];
      if (filename.endsWith('.eot') || filename.endsWith('.woff') || filename.endsWith('.woff2') || filename.endsWith('.ttf') || filename.endsWith('.svg') || filename.endsWith('.png')) {
        assetPath = filename; // root asset
      } else {
        continue;
      }
    }

    // Try multiple Wayback formats:
    // 1. Closest redirect format
    // 2. Specific timestamp fallback
    const remoteUrl = `http://web.archive.org/web/http://smart.gov.qa/${assetPath}`;
    const localPath = path.join(PUBLIC_DIR, assetPath);

    console.log(`[${attemptCount}/${urls.size}] Downloading: ${remoteUrl} -> ${localPath}`);
    const success = await downloadFile(remoteUrl, localPath);
    if (success) {
      successCount++;
    } else {
      // Retry with 20220621003153 capture
      const retryUrl = `http://web.archive.org/web/20220621003153im_/http://smart.gov.qa/${assetPath}`;
      console.log(`Retrying with capture stamp: ${retryUrl}`);
      const retrySuccess = await downloadFile(retryUrl, localPath);
      if (retrySuccess) {
        successCount++;
      }
    }

    await sleep(2000);
  }

  console.log(`Finished downloading CSS assets: ${successCount} successful.`);
}

run();
