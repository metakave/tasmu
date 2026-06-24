# download_missing_from_wayback.py
"""
Python utility that attempts to retrieve assets which were missing when
trying to download directly from the live site. For each URL it:
1. Queries the Wayback CDX API for the latest snapshot (status 200).
2. If a snapshot is found, downloads the file and stores it under the
   project's `public/` folder preserving the original path.
3. Logs successes and failures.
"""
import os
import json
import urllib.request
from urllib.parse import urlparse, quote_plus

MISSING_URLS = [
    "http://smart.gov.qa/vendor.2fcf97624505bbbe6a5f.bundle.js",
    "http://smart.gov.qa/assets/manifest.json",
    "http://smart.gov.qa/assets/icon/apple-icon-76x76.png",
    "http://smart.gov.qa/assets/icon/favicon.png",
    "http://smart.gov.qa/main.2a315ec838f889106e32.bundle.js",
    "http://smart.gov.qa/assets/icon/apple-icon-60x60.png",
    "http://smart.gov.qa/assets/icon/android-icon-192x192.png",
    "http://smart.gov.qa/",
    "http://smart.gov.qa/main.a21eb6d38ba217cdcbea4c08d03d6c49.css",
    "http://smart.gov.qa/assets/icon/apple-icon-144x144.png",
]

PUBLIC_DIR = os.path.join(os.getcwd(), "public")

def cdx_latest_snapshot(url):
    # CDX API: return the most recent snapshot with a 200 status
    query = f"https://web.archive.org/cdx/search/cdx?url={quote_plus(url)}&output=json&filter=statuscode:200&limit=1&collapse=timestamp:8"
    try:
        with urllib.request.urlopen(query) as resp:
            data = json.loads(resp.read().decode())
        if len(data) >= 2:
            # First row is field names, second row is the snapshot record
            record = data[1]
            timestamp = record[1]
            original = record[2]
            return f"https://web.archive.org/web/{timestamp}id_/{original}"
    except Exception as e:
        print(f"CDX query failed for {url}: {e}")
    return None

def download(url, local_path):
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    try:
        urllib.request.urlretrieve(url, local_path)
        print(f"Downloaded {url} -> {local_path}")
    except Exception as e:
        print(f"Failed to download {url}: {e}")

def main():
    for src_url in MISSING_URLS:
        snapshot_url = cdx_latest_snapshot(src_url)
        if not snapshot_url:
            print(f"No Wayback snapshot found for {src_url}")
            continue
        parsed = urlparse(src_url)
        path = parsed.path.lstrip('/')
        if not path:
            path = "index.html"
        local_path = os.path.join(PUBLIC_DIR, path)
        download(snapshot_url, local_path)

if __name__ == "__main__":
    main()
