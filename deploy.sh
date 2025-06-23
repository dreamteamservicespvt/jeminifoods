#!/bin/bash
# Jemini Restaurant - Production Deployment Script

echo "🚀 Jemini Restaurant Notification System Deployment"
echo "================================================="

# Set deployment environment
NODE_ENV=production

# Check if all required environment variables are set
echo "📋 Checking environment variables..."
required_vars=("VITE_FIREBASE_API_KEY" "VITE_FIREBASE_AUTH_DOMAIN" "VITE_FIREBASE_PROJECT_ID" "VITE_WHATSAPP_API_URL" "VITE_WHATSAPP_API_TOKEN")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing required environment variable: $var"
        exit 1
    else
        echo "✅ $var is set"
    fi
done

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Run linting
echo "🔍 Running code quality checks..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Please fix errors before deployment."
    exit 1
fi

# Build for production
echo "🏗️ Building for production..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deployment."
    exit 1
fi

# Bundle size check
echo "📊 Checking bundle sizes..."
du -sh dist/assets/*.js dist/assets/*.css

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf jemini-notification-system-$(date +%Y%m%d-%H%M%S).tar.gz dist/ firestore.rules package.json

# Firebase deployment (if using Firebase Hosting)
if command -v firebase &> /dev/null; then
    echo "🔥 Deploying to Firebase..."
    firebase deploy --only hosting,firestore:rules
else
    echo "⚠️ Firebase CLI not found. Manual deployment required."
fi

echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Manual deployment steps (if not using Firebase):"
echo "1. Upload dist/ folder contents to your web server"
echo "2. Update firestore.rules in Firebase Console"
echo "3. Configure environment variables on your hosting platform"
echo "4. Test all notification flows in production environment"
echo ""
echo "🧪 Post-deployment testing checklist:"
echo "- Admin reservation confirmation notifications"
echo "- Chef order status update notifications"
echo "- Customer order tracking notifications"
echo "- WhatsApp message delivery"
echo "- Real-time updates across devices"
