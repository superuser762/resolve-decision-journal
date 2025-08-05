#!/bin/bash

# Resolve - Mobile Build Script
# This script builds the Next.js app and syncs it to the mobile platforms

echo "🚀 Building Resolve Decision Journal for Mobile..."

# Step 1: Build the Next.js app
echo "📦 Building Next.js app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Step 2: Sync to Android
echo "📱 Syncing to Android platform..."
npx cap sync android

if [ $? -ne 0 ]; then
    echo "❌ Android sync failed."
    exit 1
fi

# Step 3: Open Android Studio (optional)
echo "✅ Build complete!"
echo ""
echo "Next steps:"
echo "1. Open Android Studio: npx cap open android"
echo "2. Build APK or AAB in Android Studio"
echo "3. Test on device or emulator"
echo ""
echo "For iOS (macOS only):"
echo "1. Add iOS platform: npx cap add ios"
echo "2. Sync iOS: npx cap sync ios"
echo "3. Open Xcode: npx cap open ios"
echo ""
echo "🎯 Resolve is ready for mobile deployment!"
