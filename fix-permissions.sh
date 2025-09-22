#!/bin/bash

# Fix permissions for random background images
# This script ensures that all static assets have proper read permissions

echo "🔧 Fixing file permissions for static assets..."

# Fix permissions for random background images
if [ -d "public/bg/random" ]; then
    echo "📁 Setting permissions for random background images..."
    chmod 644 public/bg/random/*.jpg
    echo "✅ Random background images permissions fixed"
else
    echo "⚠️  Random background images directory not found"
fi

# Fix permissions for all static assets
echo "📁 Setting permissions for all static assets..."
find public -type f -name "*.jpg" -o -name "*.png" -o -name "*.svg" -o -name "*.gif" -o -name "*.webp" | xargs chmod 644
find public -type d | xargs chmod 755

echo "✅ All static assets permissions fixed"

# Verify permissions
echo "🔍 Verifying permissions..."
ls -la public/bg/random/ 2>/dev/null || echo "Random directory not found"

echo "🎉 Permission fix complete!"
