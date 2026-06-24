const fs = require('fs');
const path = require('path');
const axios = require('axios');
const PUBLIC_DIR = path.join(__dirname, 'public');
async function run() {
  const assets = ['assets/icon/triangle.svg', 'assets/icon/arrow-scroll.svg'];
  for (let asset of assets) {
    const remoteUrl = `http://web.archive.org/web/http://smart.gov.qa/${asset}`;
    const localPath = path.join(PUBLIC_DIR, asset);
    const response = await axios({url: remoteUrl, responseType: 'stream'});
    const writer = fs.createWriteStream(localPath);
    response.data.pipe(writer);
  }
}
run();
