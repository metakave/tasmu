# scrape_perfect.py
"""
Python script to download the Smart Qatar homepage and all referenced assets
from the Wayback Machine (id_ snapshot) and save them locally preserving the
original directory structure under the project's `public/` folder.

The script performs the following steps:
1. Fetch the raw archived HTML from the id_ snapshot URL.
2. Extract all asset URLs from `src`, `href`, `srcset` and CSS `url(...)`.
3. Convert each asset URL to a Wayback download URL.
4. Download each asset, creating necessary sub‑directories under `public/`.
5. Rewrite the HTML to reference the locally saved assets and write it to
   `public/index.html` (or appropriate language folder).

This script uses only the Python standard library (`urllib`, `re`, `os`,
`html.parser`) to avoid external dependencies.
"""
import os
import re
import urllib.request
from urllib.parse import urljoin, urlparse
from html.parser import HTMLParser

# Configuration – snapshot base URL (id_ version)
SNAPSHOT_URL = "https://web.archive.org/web/20220621003153id_/http://smart.gov.qa/en"
# Base URL of the original site for replacing asset paths
ORIGINAL_BASE = "http://smart.gov.qa"
# Local public directory where assets will be stored
PUBLIC_DIR = os.path.join(os.getcwd(), "public")

class AssetHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.assets = []
        self.html_parts = []

    def handle_starttag(self, tag, attrs):
        # Reconstruct the original tag
        attr_str = " ".join(f'{k}="{v}"' for k, v in attrs)
        self.html_parts.append(f"<{tag} {attr_str}>" if attr_str else f"<{tag}>")
        for name, value in attrs:
            if name in ("src", "href", "srcset"):
                # Split srcset if present
                for src in value.split(','):
                    url = src.strip().split(' ')[0]
                    if url:
                        self.assets.append(url)

    def handle_endtag(self, tag):
        self.html_parts.append(f"</{tag}>")

    def handle_data(self, data):
        self.html_parts.append(data)

    def handle_comment(self, data):
        self.html_parts.append(f"<!--{data}-->")

    def get_html(self):
        return "".join(self.html_parts)

def download_url(url, local_path):
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    try:
        urllib.request.urlretrieve(url, local_path)
        print(f"Downloaded {url} -> {local_path}")
    except Exception as e:
        print(f"Failed to download {url}: {e}")

def main():
    # 1. Fetch archived HTML
    with urllib.request.urlopen(SNAPSHOT_URL) as response:
        html_bytes = response.read()
    html = html_bytes.decode('utf-8', errors='ignore')

    parser = AssetHTMLParser()
    parser.feed(html)
    assets = parser.assets

    # Additionally capture CSS url(...) patterns from inline style blocks and stylesheets
    css_url_pattern = re.compile(r'url\([\'\"]?(.*?)[\'\"]?\)')
    for match in css_url_pattern.finditer(html):
        assets.append(match.group(1))

    # Normalise and dedupe asset URLs
    assets = list({a for a in assets if a})

    # 2. Process each asset
    for asset_url in assets:
        # Resolve relative URLs against the original base URL
        if asset_url.startswith('http'):
            full_original = asset_url
        else:
            # Preserve leading '/' for absolute paths
            full_original = urljoin(ORIGINAL_BASE + '/', asset_url.lstrip('/'))
        # Convert to Wayback download URL
        wayback_url = f"https://web.archive.org/web/20220621003153id_/{full_original}"
        # Determine local file path under public directory (strip leading protocol and domain)
        parsed = urlparse(full_original)
        local_path = os.path.join(PUBLIC_DIR, parsed.path.lstrip('/'))
        download_url(wayback_url, local_path)

    # 3. Rewrite HTML to point to local assets
    rewritten_html = html
    for asset_url in assets:
        if asset_url.startswith('http'):
            full_original = asset_url
        else:
            full_original = urljoin(ORIGINAL_BASE + '/', asset_url.lstrip('/'))
        parsed = urlparse(full_original)
        local_rel = parsed.path.lstrip('/')
        rewritten_html = rewritten_html.replace(asset_url, f"/{local_rel}")
        # Also replace the full original URL if present
        rewritten_html = rewritten_html.replace(full_original, f"/{local_rel}")

    # 4. Write rewritten HTML to appropriate location
    index_path = os.path.join(PUBLIC_DIR, "index.html")
    os.makedirs(os.path.dirname(index_path), exist_ok=True)
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(rewritten_html)
    print(f"Rewritten HTML saved to {index_path}")

if __name__ == "__main__":
    main()
