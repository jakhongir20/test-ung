#!/bin/bash

# Alternative deployment without Docker
# This builds the app and provides instructions for manual deployment

echo "Building application for production..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "Warning: .env file not found. Creating default..."
    echo "VITE_PUBLIC_API_URL=https://api.savollar.leetcode.uz:8443" > .env
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building production bundle..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "Production files are in the 'dist' folder."
    echo ""
    echo "To deploy:"
    echo "1. Upload the contents of 'dist' folder to your web server"
    echo "2. Configure your web server to serve index.html for all routes"
    echo "3. Ensure your web server supports SPA routing (try_files in nginx)"
    echo ""
    echo "Or use the automated deployment script:"
    echo "  ./deploy.sh"
else
    echo "❌ Build failed. Check the errors above."
    exit 1
fi
