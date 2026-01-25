#!/bin/bash
# Update OAuth Callback URLs for Production Vercel Deployment

echo "🔧 Updating OAuth Callback URLs for Production..."
echo ""

# Get the current production URL
PRODUCTION_URL="https://kala-webapp-1p2ci6pm6-sans-projects-535a87c1.vercel.app"

# Update Google Callback URL
echo "📝 Updating GOOGLE_CALLBACK_URL..."
echo "${PRODUCTION_URL}/api/auth/callback/google" | npx vercel env rm GOOGLE_CALLBACK_URL production -y 2>/dev/null || true
echo "${PRODUCTION_URL}/api/auth/callback/google" | npx vercel env add GOOGLE_CALLBACK_URL production

# Update GitHub Callback URL  
echo ""
echo "📝 Updating GITHUB_CALLBACK_URL..."
echo "${PRODUCTION_URL}/api/auth/callback/github" | npx vercel env rm GITHUB_CALLBACK_URL production -y 2>/dev/null || true
echo "${PRODUCTION_URL}/api/auth/callback/github" | npx vercel env add GITHUB_CALLBACK_URL production

echo ""
echo "✅ Environment variables updated!"
echo ""
echo "⚠️  IMPORTANT: You still need to update the redirect URIs at:"
echo "   1. Google Cloud Console: https://console.cloud.google.com"
echo "   2. GitHub Developer Settings: https://github.com/settings/developers"
echo ""
echo "📋 Add these redirect URIs:"
echo "   Google: ${PRODUCTION_URL}/api/auth/callback/google"
echo "   GitHub: ${PRODUCTION_URL}/api/auth/callback/github"
echo ""
echo "🚀 After updating, redeploy with: npx vercel --prod"
