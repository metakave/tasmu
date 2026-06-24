const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ARCHIVE_PREFIX = 'http://web.archive.org/web/20220621003153im_/http://smart.gov.qa';
const PUBLIC_DIR = path.join(__dirname, 'public');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const assets = [
  'assets/landing/logo.png',
  'assets/landing/logo-white.png',
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
  'assets/landing/skyline.svg',
  'assets/fonts/Avenir-Book.otf',
  'assets/fonts/Avenir-Medium.otf',
  'assets/fonts/Avenir-Roman.otf',
  'assets/fonts/Avenir-Heavy.otf',
  'assets/fonts/cairo-regular-webfont.woff2',
  'assets/fonts/cairo-bold-webfont.woff2',
  'assets/img/hero images/stars.png',
  'assets/img/hero images/satellites.png',
  'assets/img/hero images/bars.png',
  'assets/img/hero images/layer05.png',
  'assets/img/hero images/layer04.png',
  'assets/img/hero images/layer03.png',
  'assets/img/hero images/layer02.png',
  'assets/img/hero images/trees.png',
  'assets/img/hero images/layer01.png',
  'assets/img/hero images/shadow-overlay.png',
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
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
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
  console.log(`Starting slow download of ${assets.length} assets...`);
  let successCount = 0;
  for (let asset of assets) {
    const remoteUrl = `${ARCHIVE_PREFIX}/${asset}`;
    const localPath = path.join(PUBLIC_DIR, asset);
    
    console.log(`Downloading: ${remoteUrl} -> ${localPath}`);
    const success = await download(remoteUrl, localPath);
    if (success) {
      successCount++;
    }
    
    // Sleep for 3 seconds between downloads
    console.log('Sleeping 3 seconds...');
    await sleep(3000);
  }
  console.log(`Completed. Successfully downloaded ${successCount}/${assets.length} assets.`);
}

run();
