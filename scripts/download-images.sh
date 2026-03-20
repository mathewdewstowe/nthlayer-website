#!/bin/bash
# Download original images from nthlayer.co.uk
# Run this after cloning: bash scripts/download-images.sh

DEST="src/assets/images"
mkdir -p "$DEST"

echo "Downloading images from nthlayer.co.uk..."

curl -sL "https://nthlayer.co.uk/wp-content/uploads/2025/11/2055900a05479a0244eb9ffe4759eec4f70197ed.png" -o "$DEST/logo.png"
curl -sL "https://nthlayer.co.uk/wp-content/uploads/2025/11/nth-layer-logo-3-691399bbe2d7a-e1763471574293.webp" -o "$DEST/logo-light.webp"
curl -sL "https://nthlayer.co.uk/wp-content/uploads/2026/01/icon-1.png" -o "$DEST/icon-investors.png"
curl -sL "https://nthlayer.co.uk/wp-content/uploads/2026/01/icon-2.png" -o "$DEST/icon-operators.png"
curl -sL "https://nthlayer.co.uk/wp-content/uploads/2025/11/hero-image-scaled.webp" -o "$DEST/hero-tree.webp"
curl -sL "https://nthlayer.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-29-at-7.38.08-PM.jpeg" -o "$DEST/headshot.jpg"

echo "Done! Images saved to $DEST"
ls -la "$DEST"
