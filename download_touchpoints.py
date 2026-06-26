import urllib.request
import urllib.parse
import os
import json

cdx_url = "http://web.archive.org/cdx/search/cdx?url=smart.gov.qa/assets/icon/touchPoints/*&output=json&collapse=urlkey"
# Also query lowercase touchpoints just in case
cdx_url_2 = "http://web.archive.org/cdx/search/cdx?url=smart.gov.qa/assets/icon/touchpoints/*&output=json&collapse=urlkey"

def fetch_cdx(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"Failed to get CDX from {url}:", e)
        return []

data = fetch_cdx(cdx_url)
data2 = fetch_cdx(cdx_url_2)

# Combine ignoring headers
all_rows = []
if len(data) > 1:
    all_rows.extend(data[1:])
if len(data2) > 1:
    all_rows.extend(data2[1:])

out_dir = "public/assets/icon/touchpoints"
os.makedirs(out_dir, exist_ok=True)

if not all_rows:
    print("No CDX results found.")
    exit(0)

for row in all_rows:
    timestamp = row[1]
    original_url = row[2]
    
    if not original_url.lower().endswith('.svg'):
        continue
    
    filename = urllib.parse.unquote(original_url.split('/')[-1])
    # Prevent wayback toolbar insertion
    download_url = f"http://web.archive.org/web/{timestamp}id_/{original_url}"
    
    local_path = os.path.join(out_dir, filename)
    print(f"Downloading {filename} from {download_url}")
    
    try:
        req_dl = urllib.request.Request(download_url, headers={'User-Agent': 'Mozilla/5.0'})
        resp_dl = urllib.request.urlopen(req_dl, timeout=15)
        if resp_dl.status == 200:
            content = resp_dl.read()
            with open(local_path, "wb") as f:
                f.write(content)
            print(f"  [SUCCESS]")
        else:
            print(f"  [HTTP {resp_dl.status}]")
    except Exception as e:
        print(f"  [ERROR] {e}")

