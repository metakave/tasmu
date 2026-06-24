# retry_missing_assets.py
"""
Python script to download assets that previously failed when using the Wayback archive.
It attempts to fetch each URL directly from the live internet (CDNs, original host) and
stores the file under the project's `public/` directory preserving the original path.
"""
import os
import urllib.request
from urllib.parse import urlparse

# List of URLs that failed in the previous run (live URLs)
MISSING_URLS = [
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js",
    "http://smart.gov.qa/vendor.2fcf97624505bbbe6a5f.bundle.js",
    "http://smart.gov.qa/assets/manifest.json",
    "http://smart.gov.qa/assets/icon/apple-icon-76x76.png",
    "http://smart.gov.qa/assets/icon/favicon.png",
    "http://smart.gov.qa/main.2a315ec838f889106e32.bundle.js",
    "http://smart.gov.qa/assets/icon/apple-icon-60x60.png",
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    "https://cdnjs.cloudflare.com/ajax/libs/core-js/2.4.1/core.js",
    "http://smart.gov.qa/assets/icon/android-icon-192x192.png",
    "http://smart.gov.qa/",
    "https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.js",
    "http://smart.gov.qa/main.a21eb6d38ba217cdcbea4c08d03d6c49.css",
    "http://smart.gov.qa/assets/icon/apple-icon-144x144.png",
]

PUBLIC_DIR = os.path.join(os.getcwd(), "public")

def download(url):
    parsed = urlparse(url)
    # Preserve path; if URL ends with '/', use 'index.html'
    path = parsed.path.lstrip('/')
    if not path or path.endswith('/'):
        path = os.path.join(path, "index.html")
    local_path = os.path.join(PUBLIC_DIR, path)
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    try:
        urllib.request.urlretrieve(url, local_path)
        print(f"Downloaded {url} -> {local_path}")
    except Exception as e:
        print(f"Failed to download {url}: {e}")

def main():
    for url in MISSING_URLS:
        download(url)

if __name__ == "__main__":
    main()
