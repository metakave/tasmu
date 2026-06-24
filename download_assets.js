const fs = require('fs');
const path = require('path');
const axios = require('axios');

const TARGET_URL = 'http://web.archive.org/web/20220621003153/http://smart.gov.qa/en';
const ARCHIVE_PREFIX = 'http://web.archive.org';

const destDir = path.join(__dirname, 'public', 'assets');
const imgDir = path.join(destDir, 'images');
const iconDir = path.join(destDir, 'icons');

fs.mkdirSync(imgDir, { recursive: true });
fs.mkdirSync(iconDir, { recursive: true });

async function downloadFile(url, filepath) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 20000,
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
    console.error(`Failed to download: ${url}. Error: ${err.message}`);
    return false;
  }
}

async function run() {
  console.log(`Fetching page: ${TARGET_URL}`);
  let html;
  try {
    const res = await axios.get(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    html = res.data;
  } catch (err) {
    console.error(`Failed to fetch main page: ${err.message}`);
    return;
  }

  // Regex to extract wayback style image URLs
  const waybackImgRegex = /\/web\/\d+im_\/[^"'\s]+/g;
  const urls = new Set();

  let match;
  while ((match = waybackImgRegex.exec(html)) !== null) {
    urls.add(match[0]);
  }

  // Add key assets with clean redirected Wayback URLs (no date stamp for closest match)
  const manualAssets = [
    'http://web.archive.org/web/20220621003153im_/http://smart.gov.qa/themes/custom/smart/logo.png',
    'http://web.archive.org/web/http://smart.gov.qa/themes/custom/smart/logo.png',
    'http://web.archive.org/web/http://smart.gov.qa/themes/custom/smart/logo-en-footer.png',
    'http://web.archive.org/web/http://smart.gov.qa/sites/default/files/styles/banner_image/public/2020-03/banner.jpg',
    'http://web.archive.org/web/http://smart.gov.qa/themes/custom/smart/images/transportation-icon.png',
    'http://web.archive.org/web/http://smart.gov.qa/themes/custom/smart/images/logistics-icon.png',
    'http://web.archive.org/web/http://smart.gov.qa/themes/custom/smart/images/healthcare-icon.png',
    'http://web.archive.org/web/http://smart.gov.qa/themes/custom/smart/images/environment-icon.png',
    'http://web.archive.org/web/http://smart.gov.qa/themes/custom/smart/images/sports-icon.png',
    'http://web.archive.org/web/http://smart.gov.qa/themes/custom/smart/images/transportation-icon-active.png',
    'http://web.archive.org/web/http://smart.gov.qa/themes/custom/smart/images/logistics-icon-active.png',
    'http://web.archive.org/web/http://smart.gov.qa/themes/custom/smart/images/healthcare-icon-active.png',
    'http://web.archive.org/web/http://smart.gov.qa/themes/custom/smart/images/environment-icon-active.png',
    'http://web.archive.org/web/http://smart.gov.qa/themes/custom/smart/images/sports-icon-active.png',
    // Background overlay pattern or slider items
    'http://web.archive.org/web/http://smart.gov.qa/themes/custom/smart/images/bg-pattern.png',
    'http://web.archive.org/web/http://smart.gov.qa/themes/custom/smart/images/nav-bg.png'
  ];

  manualAssets.forEach(u => urls.add(u));

  console.log(`Found ${urls.size} potential asset URLs. Downloading...`);

  let count = 0;
  const mapping = {};

  for (let rawUrl of urls) {
    let fullUrl = rawUrl;
    if (rawUrl.startsWith('/')) {
      fullUrl = ARCHIVE_PREFIX + rawUrl;
    }

    // Try to get clean file name
    const parts = rawUrl.split('/');
    let filename = parts[parts.length - 1];
    
    // Clean up wayback stamps or queries
    filename = filename.replace(/\?.*$/, '').replace(/[^a-zA-Z0-9_.-]/g, '_');
    
    // De-duplicate if needed, e.g. logo.png vs logo-en-footer.png
    if (filename.startsWith('logo_png') || filename.startsWith('logo')) {
      if (rawUrl.includes('footer')) {
        filename = 'logo-footer.png';
      } else {
        filename = 'logo.png';
      }
    }

    if (filename.includes('transportation-icon')) {
      filename = filename.includes('active') ? 'transportation-icon-active.png' : 'transportation-icon.png';
    } else if (filename.includes('logistics-icon')) {
      filename = filename.includes('active') ? 'logistics-icon-active.png' : 'logistics-icon.png';
    } else if (filename.includes('healthcare-icon')) {
      filename = filename.includes('active') ? 'healthcare-icon-active.png' : 'healthcare-icon.png';
    } else if (filename.includes('environment-icon')) {
      filename = filename.includes('active') ? 'environment-icon-active.png' : 'environment-icon.png';
    } else if (filename.includes('sports-icon')) {
      filename = filename.includes('active') ? 'sports-icon-active.png' : 'sports-icon.png';
    } else if (filename.includes('banner')) {
      filename = 'banner.jpg';
    }

    if (!filename || filename.length < 3) {
      filename = `asset_${count}_${Date.now()}`;
    }

    let destPath = path.join(imgDir, filename);
    mapping[rawUrl] = `assets/images/${filename}`;

    console.log(`Downloading ${fullUrl} -> ${destPath}`);
    const success = await downloadFile(fullUrl, destPath);
    if (success) {
      count++;
    }
  }

  fs.writeFileSync(
    path.join(destDir, 'mapping.json'),
    JSON.stringify(mapping, null, 2)
  );

  console.log(`Download finished. Successfully downloaded ${count} assets.`);
}

run();
