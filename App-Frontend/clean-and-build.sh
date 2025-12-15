#!/bin/bash

echo "🧹 Cleaning project..."
echo "======================"

# Clean Expo cache
echo "Clearing Expo cache..."
npx expo start --clear

# Clean EAS cache
echo "Clearing EAS cache..."
eas build:clean

# Clean node modules (optional)
echo "Cleaning node modules..."
rm -rf node_modules
npm install

# Clean iOS build
echo "Cleaning iOS build..."
cd ios
rm -rf build
rm -rf Pods
rm -rf Podfile.lock
pod install
cd ..

# Clean Android build
echo "Cleaning Android build..."
cd android
./gradlew clean
cd ..

echo "✅ Cleaning complete!"
echo ""
echo "🚀 Ready to build:"
echo "For Android: eas build --platform android --profile preview"
echo "For iOS: eas build --platform ios --profile preview"
echo ""
echo "📱 After build, install the APK/AAB and test the app icon and splash screen." 