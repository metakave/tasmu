const fs = require('fs');
const path = require('path');
const axios = require('axios');

const PUBLIC_DIR = path.join(__dirname, 'public');
const missingFiles = fs.readFileSync('missing_images_to_fetch.txt', 'utf8').split('\n').filter(Boolean);

async function downloadFile(url, filepath) {
  const dir = path.dirname(filepath);
  fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(filepath) && fs.statSync(filepath).size > 0) {
    return true;
  }

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
  console.log(`Starting download for ${missingFiles.length} missing files...`);
  let successCount = 0;
  for (let [i, asset] of missingFiles.entries()) {
    // decode the URL so the local file name has spaces
    const decodedAsset = decodeURIComponent(asset);
    // remove leading slash
    const cleanAsset = decodedAsset.startsWith('/') ? decodedAsset.substring(1) : decodedAsset;
    
    // Remote URL needs to be encoded for the HTTP request to Wayback
    // We can just use the original encoded asset string
    const remoteUrl = `http://web.archive.org/web/http://smart.gov.qa${asset}`;
    const retryUrl = `http://web.archive.org/web/20220621003153im_/http://smart.gov.qa${asset}`;
    
    const localPath = path.join(PUBLIC_DIR, cleanAsset);
    
    let success = await downloadFile(remoteUrl, localPath);
    if (!success) {
      success = await downloadFile(retryUrl, localPath);
    }
    if (success) {
      successCount++;
      console.log(`[${i+1}/${missingFiles.length}] SUCCESS: ${cleanAsset}`);
    } else {
      console.log(`[${i+1}/${missingFiles.length}] FAILED: ${cleanAsset}`);
    }
    // wait a tiny bit to not overwhelm wayback
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`Finished! Successfully grabbed ${successCount}/${missingFiles.length} files.`);
}

run();
