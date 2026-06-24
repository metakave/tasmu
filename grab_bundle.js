const fs = require('fs');
const axios = require('axios');
async function run() {
  const url = 'http://web.archive.org/web/http://smart.gov.qa/main.2a315ec838f889106e32.bundle.js';
  try {
    const response = await axios({url, responseType: 'stream'});
    const writer = fs.createWriteStream('public/main_original.js');
    response.data.pipe(writer);
    writer.on('finish', () => console.log('Downloaded original bundle'));
  } catch(e) {
    console.error(e);
  }
}
run();
