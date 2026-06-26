import re
import json
import os

def parse_bundle():
    with open('public/main.2a315ec838f889106e32.bundle.js', 'r', encoding='utf-8') as f:
        text = f.read()

    usecases = set()
    for match in re.finditer(r'\{[^{}]*\"Use Case ID\":\"([LHEST]\d+)\"[^{}]*\}', text):
        try:
            data = json.loads(match.group(0))
            uid = data['Use Case ID']
            if (uid.startswith('L') and 1 <= int(uid[1:]) <= 21) or \
               (uid.startswith('H') and 1 <= int(uid[1:]) <= 23) or \
               (uid.startswith('E') and 1 <= int(uid[1:]) <= 19) or \
               (uid.startswith('S') and 1 <= int(uid[1:]) <= 19) or \
               (uid.startswith('T') and 1 <= int(uid[1:]) <= 25):
                usecases.add(uid)
        except Exception as e:
            pass
    return sorted(list(usecases))

def main():
    uids = parse_bundle()
    print(f"Found {len(uids)} unique usecase IDs in bundle.")
    
    base_url = "https://tasmu.vercel.app"
    
    # Static pages
    pages = [
        "",
        "/en",
        "/ar",
        "/en/home",
        "/ar/home",
        "/en/story",
        "/ar/story",
        "/en/contact-us",
        "/ar/contact-us",
        "/en/news-events",
        "/ar/news-events",
        "/en/news-events/news/7",
        "/ar/news-events/news/7"
    ]
    
    # Add usecases
    for uid in uids:
        pages.append(f"/en/usecase/{uid}")
        pages.append(f"/ar/usecase/{uid}")
        
    # Generate XML
    xml = []
    xml.append('<?xml version="1.0" encoding="UTF-8"?>')
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    for p in pages:
        url = base_url + p
        # Set priority and changefreq based on path
        if p == "" or p == "/en" or p == "/ar":
            priority = "1.0"
            changefreq = "daily"
        elif "/usecase/" in p:
            priority = "0.8"
            changefreq = "weekly"
        else:
            priority = "0.5"
            changefreq = "monthly"
            
        xml.append('  <url>')
        xml.append(f'    <loc>{url}</loc>')
        xml.append(f'    <changefreq>{changefreq}</changefreq>')
        xml.append(f'    <priority>{priority}</priority>')
        xml.append('  </url>')
        
    xml.append('</urlset>')
    
    sitemap_content = '\n'.join(xml)
    
    # Save under public/sitemap.xml
    os.makedirs('public', exist_ok=True)
    with open('public/sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(sitemap_content)
        
    print(f"Generated public/sitemap.xml with {len(pages)} URLs successfully.")

if __name__ == '__main__':
    main()
