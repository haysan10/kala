#!/bin/bash
# Script to update Turso Database Configuration in Vercel
# This switches to HTTPS protocol (better for Vercel) and updates the Token

echo "🔧 FIXING DATABASE CONNECTION..."
echo ""

# 1. Ask for URL
echo "👉 Enter your Turso Database URL (copy from Turso Dashboard):"
echo "   Example: libsql://yes-ai-cms-haysan10.aws-us-west-2.turso.io"
read -r DB_URL

# Convert libsql:// to https:// for reliability on Vercel
HTTPS_URL=${DB_URL/libsql:\/\//https:\/\/}
HTTPS_URL=${HTTPS_URL/wss:\/\//https:\/\/}

echo "✅ Using HTTPS URL: $HTTPS_URL"

# 2. Ask for Token
echo ""
echo "👉 Enter your NEW Turso Auth Token (Generate a NEW one in Turso Dashboard):"
read -r AUTH_TOKEN

if [ -z "$AUTH_TOKEN" ]; then
    echo "❌ Token cannot be empty!"
    exit 1
fi

echo ""
echo "🚀 Updating Vercel Environment Variables..."

# Update DATABASE_URL
echo "$HTTPS_URL" | npx vercel env rm TURSO_DATABASE_URL production -y 2>/dev/null || true
echo "$HTTPS_URL" | npx vercel env add TURSO_DATABASE_URL production

# Update AUTH_TOKEN
echo "$AUTH_TOKEN" | npx vercel env rm TURSO_AUTH_TOKEN production -y 2>/dev/null || true
echo "$AUTH_TOKEN" | npx vercel env add TURSO_AUTH_TOKEN production

echo ""
echo "✅ Database Configuration Updated!"
echo "🔄 Redeploying to apply changes..."
npx vercel --prod
