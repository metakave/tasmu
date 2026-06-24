#!/usr/bin/env bash
# download_external_assets_fixed.sh
# Downloads required CDN assets and stores them under public/assets/external

set -e
BASE_DIR="$(dirname "$0")/public/assets/external"
mkdir -p "$BASE_DIR"

# Define assets as pairs: filename URL
assets=(
  "modernizr.js https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.js"
  "material-icons.css https://fonts.googleapis.com/icon?family=Material+Icons"
  "jquery.min.js https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"
  "bootstrap.min.js https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"
  "core.js https://cdnjs.cloudflare.com/ajax/libs/core-js/2.4.1/core.js"
  "owl.carousel.min.js https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.2.0/owl.carousel.min.js"
  "jquery.parallax.min.js https://cdnjs.cloudflare.com/ajax/libs/parallax/2.1.3/jquery.parallax.min.js"
)

for entry in "${assets[@]}"; do
  # split into filename and url
  set -- $entry
  file="$1"
  url="$2"
  echo "Downloading $file..."
  curl -L -o "$BASE_DIR/$file" "$url" --fail --silent --show-error
done

echo "All external assets downloaded to $BASE_DIR"
