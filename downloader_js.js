const fs = require('fs');
const path = require('path');
const axios = require('axios');

const PUBLIC_DIR = path.join(__dirname, 'public');
const jsPath = path.join(PUBLIC_DIR, 'main.2a315ec838f889106e32.bundle.js');

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
        'User-Agent': 'Mozilla/5.0'
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
    return false;
  }
}

async function run() {
  const content = fs.readFileSync(jsPath, 'utf8');
  const urlRegex = /assets\/[^"'\\]+\.(png|svg|jpg|jpeg|gif)/g;
  const urls = new Set();
  let match;

  while ((match = urlRegex.exec(content)) !== null) {
    urls.add(match[0]);
  }

  console.log(`Found ${urls.size} unique image URLs in JS bundle. Starting downloads...`);

  let successCount = 0;
  let attemptCount = 0;

  for (let assetPath of urls) {
    attemptCount++;
    if (assetPath.includes('{{')) continue; // Skip Angular bindings

    const remoteUrl = `http://web.archive.org/web/http://smart.gov.qa/${assetPath}`;
    const localPath = path.join(PUBLIC_DIR, assetPath);

    console.log(`[${attemptCount}/${urls.size}] Downloading: ${remoteUrl} -> ${localPath}`);
    const success = await downloadFile(remoteUrl, localPath);
    if (success) {
      successCount++;
    } else {
      const retryUrl = `http://web.archive.org/web/20220621003153im_/http://smart.gov.qa/${assetPath}`;
      const retrySuccess = await downloadFile(retryUrl, localPath);
      if (retrySuccess) {
        successCount++;
      }
    }
    await sleep(1000);
  }

  console.log(`Finished downloading JS assets: ${successCount} successful.`);
}

run();
