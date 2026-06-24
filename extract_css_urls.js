const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'public', 'main.a21eb6d38ba217cdcbea4c08d03d6c49.css');
const content = fs.readFileSync(cssPath, 'utf8');

const urlRegex = /url\(['"]?([^'")]+)['"]?\)/g;
const urls = new Set();
let match;

while ((match = urlRegex.exec(content)) !== null) {
  urls.add(match[1]);
}

console.log(`Found ${urls.size} unique URLs in CSS file:`);
for (let u of urls) {
  console.log(u);
}
