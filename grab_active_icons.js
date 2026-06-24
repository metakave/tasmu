const fs = require('fs');
const path = require('path');
const axios = require('axios');

const PUBLIC_DIR = path.join(__dirname, 'public');
const assets = [
  'assets/landing/ic-transportation-active.png',
  'assets/landing/ic-logistics-active.png',
  'assets/landing/ic-healthcare-active.png',
  'assets/landing/ic-environment-active.png',
  'assets/landing/ic-sports-active.png',
  'assets/icon/triangle.svg',
  'assets/icon/arrow-scroll.svg'
];

async function downloadFile(url, filepath) {
  const dir = path.dirname(filepath);
  fs.mkdirSync(dir, { recursive: true });

  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
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
    return false;
  }
}

async function run() {
  for (let asset of assets) {
    const remoteUrl = `http://web.archive.org/web/http://smart.gov.qa/${asset}`;
    const retryUrl = `http://web.archive.org/web/20220621003153im_/http://smart.gov.qa/${asset}`;
    const localPath = path.join(PUBLIC_DIR, asset);
    
    console.log(`Downloading ${asset}...`);
    let success = await downloadFile(remoteUrl, localPath);
    if (!success) {
      console.log(`Retrying ${asset}...`);
      success = await downloadFile(retryUrl, localPath);
    }
    console.log(`${asset}: ${success ? 'SUCCESS' : 'FAILED'}`);
  }
}

run();
