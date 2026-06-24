const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, 'public', 'main.2a315ec838f889106e32.bundle.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

const targetStr = '<img src="/assets/images/logo-big.png" />';
const replacementStr = '<img src="/assets/images/logo-big.png" class="default-logo" /><img src="/assets/images/l-o-g-o-v-b.svg" class="scrolled-logo" />';

bundle = bundle.split(targetStr).join(replacementStr);
fs.writeFileSync(bundlePath, bundle);
console.log('Replaced successfully.');
