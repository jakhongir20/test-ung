#!/bin/bash
# Fix permissions and remove quarantine for deploy scripts

echo "Fixing permissions for deployment scripts..."

for script in deploy.sh deploy-without-docker.sh; do
    if [ -f "$script" ]; then
        echo "Processing $script..."
        # Remove quarantine and extended attributes
        xattr -c "$script" 2>/dev/null
        # Set executable permissions
        chmod +x "$script"
        echo "✅ Fixed $script"
    fi
done

echo ""
echo "Done! You can now run: ./deploy.sh"
