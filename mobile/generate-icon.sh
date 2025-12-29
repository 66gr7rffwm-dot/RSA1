#!/bin/bash
# Generate app icon using ImageMagick or create a simple one
# This creates a 1024x1024 PNG icon with carpooling theme

# Check if ImageMagick is available
if command -v convert &> /dev/null; then
  echo "Creating icon with ImageMagick..."
  convert -size 1024x1024 xc:"#6366F1" \
    -fill "#8B5CF6" -draw "circle 512,512 512,200" \
    -fill white -font Arial-Bold -pointsize 200 -gravity center \
    -annotate +0-100 "🚗" \
    assets/icon-new.png 2>/dev/null && \
    mv assets/icon-new.png assets/icon.png && \
    echo "✅ Icon created successfully"
else
  echo "ImageMagick not found. Using existing icon or creating placeholder..."
  # Copy existing icon or create a note
  if [ -f assets/icon.png ]; then
    echo "✅ Using existing icon.png"
  else
    echo "⚠️  Please create icon.png manually (1024x1024 PNG)"
  fi
fi
