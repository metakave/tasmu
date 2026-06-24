#!/usr/bin/env bash
# download_extra_assets.sh
# Downloads external CDN assets required for the offline clone and saves them under public/assets/external

set -e
BASE_DIR="$(dirname "$0")/public/assets/external"
mkdir -p "$BASE_DIR"

declare -A assets=(
  [modernizr.js]="https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.js"
  [material-icons.css]="https://fonts.googleapis.com/icon?family=Material+Icons"
  [jquery.min.js]="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"
  [bootstrap.min.js]="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"
  [core.js]="https://cdnjs.cloudflare.com/ajax/libs/core-js/2.4.1/core.js"
  [owl.carousel.min.js]="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.2.0/owl.carousel.min.js"
  [jquery.parallax.min.js]="https://cdnjs.cloudflare.com/ajax/libs/parallax/2.1.3/jquery.parallax.min.js"
)

for file in "${!assets[@]}"; do
  echo "Downloading $file..."
  curl -L -o "$BASE_DIR/$file" "${assets[$file]}" --fail --silent --show-error
done

echo "All extra assets downloaded to $BASE_DIR"
