#!/bin/bash
# Update OAuth Callback URLs for Production Vercel Deployment
# Using the clean Vercel alias URL

echo "🔧 Updating OAuth Callback URLs for Production..."
echo ""

# Use the clean Vercel alias
PRODUCTION_URL="https://kala-webapp.vercel.app"

echo "📝 Using production URL: ${PRODUCTION_URL}"
echo ""

# Update Google Callback URL
echo "🔄 Updating GOOGLE_CALLBACK_URL..."
npx vercel env rm GOOGLE_CALLBACK_URL production -y 2>/dev/null || true
echo "${PRODUCTION_URL}/api/auth/callback/google" | npx vercel env add GOOGLE_CALLBACK_URL production

# Update GitHub Callback URL  
echo ""
echo "🔄 Updating GITHUB_CALLBACK_URL..."
npx vercel env rm GITHUB_CALLBACK_URL production -y 2>/dev/null || true
echo "${PRODUCTION_URL}/api/auth/callback/github" | npx vercel env add GITHUB_CALLBACK_URL production

echo ""
echo "✅ Environment variables updated successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  CRITICAL: Update OAuth Provider Settings"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  GOOGLE CLOUD CONSOLE"
echo "   URL: https://console.cloud.google.com"
echo "   → Go to: APIs & Services > Credentials"
echo "   → Edit your OAuth 2.0 Client ID"
echo "   → Add Authorized redirect URI:"
echo "      ${PRODUCTION_URL}/api/auth/callback/google"
echo ""
echo "2️⃣  GITHUB DEVELOPER SETTINGS"
echo "   URL: https://github.com/settings/developers"
echo "   → Select your OAuth App"
echo "   → Update Authorization callback URL:"
echo "      ${PRODUCTION_URL}/api/auth/callback/github"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 After updating OAuth settings, redeploy with:"
echo "   npx vercel --prod"
echo ""
