#!/bin/bash
FILES=(
  "Smart Glasses" "Smart Lights" "Smart Meters" "Smart Pills" "Smart TV" "Smart Watch" "Speaker" "Tablet" "Telepresence" "Traffic Screens" "Vehicle Screen" "Video Feed" "Web"
)
for f in "${FILES[@]}"; do
  ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''$f'''))")
  # Use the generic latest wayback url since we don't have the exact id_ timestamp, wait, I can just use the standard one
  URL="http://web.archive.org/web/20220720123347/http://smart.gov.qa/assets/icon/touchpoints/${ENCODED}.svg"
  echo "Downloading $f..."
  curl -s -L "$URL" -o "public/assets/icon/touchpoints/${f}.svg"
done
