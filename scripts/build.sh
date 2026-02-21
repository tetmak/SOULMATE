#!/bin/bash
# Build script: copies web assets to www/ for Capacitor
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
WWW_DIR="$PROJECT_DIR/www"

echo "Building web assets into $WWW_DIR..."

# Clean previous build
rm -rf "$WWW_DIR"
mkdir -p "$WWW_DIR"

# Copy HTML files
cp "$PROJECT_DIR"/*.html "$WWW_DIR/" 2>/dev/null || true

# Copy JavaScript
if [ -d "$PROJECT_DIR/js" ]; then
  cp -r "$PROJECT_DIR/js" "$WWW_DIR/js"
fi

# Copy API directory (serverless functions reference)
if [ -d "$PROJECT_DIR/api" ]; then
  cp -r "$PROJECT_DIR/api" "$WWW_DIR/api"
fi

# Copy images/assets if they exist
for dir in images assets img icons fonts css; do
  if [ -d "$PROJECT_DIR/$dir" ]; then
    cp -r "$PROJECT_DIR/$dir" "$WWW_DIR/$dir"
  fi
done

# Copy manifest and service worker if they exist
for file in manifest.json sw.js service-worker.js favicon.ico robots.txt; do
  if [ -f "$PROJECT_DIR/$file" ]; then
    cp "$PROJECT_DIR/$file" "$WWW_DIR/"
  fi
done

echo "Build complete! Files copied to www/"
ls -la "$WWW_DIR/" | head -30
