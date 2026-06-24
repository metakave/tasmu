const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ARCHIVE_PREFIX = 'http://web.archive.org/web/http://smart.gov.qa';
const PUBLIC_DIR = path.join(__dirname, 'public');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const failedAssets = [
  'assets/landing/logo.png',
  'assets/landing/logo-white.png',
  'assets/landing/ic-transportation-active.png',
  'assets/landing/ic-logistics-active.png',
  'assets/landing/ic-healthcare-active.png',
  'assets/landing/ic-environment-active.png',
  'assets/landing/ic-sports-active.png',
  'assets/landing/bg-pattern.png',
  'assets/landing/skyline.png',
  'assets/landing/skyline.svg',
  'assets/fonts/cairo-regular-webfont.woff2',
  'assets/fonts/cairo-bold-webfont.woff2',
  'assets/img/hero images/border.png',
  'assets/img/hero images/crane.png',
  'assets/img/hero images/ship.png'
];

async function download(url, filepath) {
  const dir = path.dirname(filepath);
  fs.mkdirSync(dir, { recursive: true });

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
  console.log(`Starting generic retry of ${failedAssets.length} failed assets...`);
  let successCount = 0;
  for (let asset of failedAssets) {
    const remoteUrl = `${ARCHIVE_PREFIX}/${asset}`;
    const localPath = path.join(PUBLIC_DIR, asset);
    
    console.log(`Downloading: ${remoteUrl} -> ${localPath}`);
    const success = await download(remoteUrl, localPath);
    if (success) {
      successCount++;
    }
    
    console.log('Sleeping 3 seconds...');
    await sleep(3000);
  }
  console.log(`Completed retry. Successfully downloaded ${successCount}/${failedAssets.length} assets.`);
}

run();
