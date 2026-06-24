// scrape_perfect.js
// Node.js script to download the full Smart Qatar homepage from Wayback Machine (raw id_ version)
// and save all referenced assets locally preserving original paths.

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configuration - change if you want a different snapshot
const SNAPSHOT = '20220621003153'; // yyyymmddhhmmss from Wayback URL
const BASE_ORIG = 'http://smart.gov.qa';
const WAYBACK_BASE = `http://web.archive.org/web/${SNAPSHOT}id_/${BASE_ORIG}`;

// Target directory (public folder of the project)
const PUBLIC_DIR = path.resolve(__dirname, 'public');

// Helper to ensure a directory exists
function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Download a single URL and write to localPath
async function downloadFile(remoteUrl, localPath) {
  try {
    const response = await axios.get(remoteUrl, { responseType: 'arraybuffer', timeout: 15000 });
    ensureDir(localPath);
    fs.writeFileSync(localPath, response.data);
    console.log(`✓ ${remoteUrl} → ${localPath}`);
  } catch (err) {
    console.warn(`⚠ Failed ${remoteUrl}: ${err.message}`);
  }
}

// Parse HTML for asset URLs (src, href, srcset) and CSS url(...)
function extractUrls(html) {
  const urls = new Set();
  // Simple regex for src/href attributes
  const attrRegex = /(?:src|href)\s*=\s*"([^\"]+)"/gi;
  let m;
  while ((m = attrRegex.exec(html)) !== null) {
    urls.add(m[1]);
  }
  // srcset handling (take first URL before space)
  const srcsetRegex = /srcset\s*=\s*"([^\"]+)"/gi;
  while ((m = srcsetRegex.exec(html)) !== null) {
    const parts = m[1].split(',');
    parts.forEach(p => {
      const urlPart = p.trim().split(' ')[0];
      if (urlPart) urls.add(urlPart);
    });
  }
  // CSS url(...)
  const cssUrlRegex = /url\((?:'|\")?([^'\")]+)(?:'|\")?\)/gi;
  while ((m = cssUrlRegex.exec(html)) !== null) {
    urls.add(m[1]);
  }
  return Array.from(urls);
}

(async () => {
  // 1. Download raw HTML
  const htmlUrl = `${WAYBACK_BASE}`;
  console.log('Downloading HTML from', htmlUrl);
  const htmlResp = await axios.get(htmlUrl, { timeout: 15000 });
  const rawHtml = htmlResp.data;

  // 2. Write HTML to public/index.html (or keep existing name)
  const htmlPath = path.join(PUBLIC_DIR, 'index.html');
  ensureDir(htmlPath);
  fs.writeFileSync(htmlPath, rawHtml);
  console.log('Saved HTML to', htmlPath);

  // 3. Extract asset URLs
  const assetUrls = extractUrls(rawHtml);
  console.log(`Found ${assetUrls.length} asset URLs`);

  // 4. Download each asset
  for (const assetUrl of assetUrls) {
    // Skip data URIs and external CDNs (already absolute http(s) not belonging to smart.gov.qa)
    if (assetUrl.startsWith('data:')) continue;
    let remote;
    // If URL is absolute (http/https) keep it, otherwise treat as relative to original site
    if (assetUrl.startsWith('http')) {
      remote = assetUrl;
    } else {
      // Remove leading slash for path join
      const clean = assetUrl.replace(/^\/+/,'');
      remote = `${WAYBACK_BASE}/${clean}`;
    }
    // Local path mirrors the URL path (remove leading slash)
    const localPath = path.join(PUBLIC_DIR, assetUrl.replace(/^\/+/,'') );
    await downloadFile(remote, localPath);
  }

  console.log('Download completed.');
})();
