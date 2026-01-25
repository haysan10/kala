#!/bin/bash

# 🔐 KALA OAuth Setup Script
# Quick script to add OAuth credentials to Vercel

echo "🔐 KALA OAuth Setup - Vercel Environment Variables"
echo "=================================================="
echo ""

# Function to add env var with -n flag (no newline)
add_env() {
    local name=$1
    local value=$2
    echo -n "$value" | npx vercel env add "$name" production
}

echo "📝 Google OAuth Credentials"
echo ""
echo -n "Enter Google Client ID: "
read GOOGLE_CLIENT_ID

echo -n "Enter Google Client Secret: "
read -s GOOGLE_CLIENT_SECRET
echo ""

echo ""
echo "📝 GitHub OAuth Credentials"
echo ""
echo -n "Enter GitHub Client ID: "
read GITHUB_CLIENT_ID

echo -n "Enter GitHub Client Secret: "
read -s GITHUB_CLIENT_SECRET
echo ""

echo ""
echo "🚀 Adding environment variables to Vercel..."
echo ""

# Add Google OAuth
add_env "GOOGLE_CLIENT_ID" "$GOOGLE_CLIENT_ID"
add_env "GOOGLE_CLIENT_SECRET" "$GOOGLE_CLIENT_SECRET"
add_env "GOOGLE_CALLBACK_URL" "https://kala-webapp.vercel.app/api/auth/callback/google"

# Add GitHub OAuth
add_env "GITHUB_CLIENT_ID" "$GITHUB_CLIENT_ID"
add_env "GITHUB_CLIENT_SECRET" "$GITHUB_CLIENT_SECRET"
add_env "GITHUB_CALLBACK_URL" "https://kala-webapp.vercel.app/api/auth/callback/github"

echo ""
echo "✅ OAuth credentials successfully added!"
echo ""
echo "📝 Next steps:"
echo "1. Update your .env.local file with the same credentials"
echo "2. Redeploy to Vercel: npx vercel --prod"
echo "3. Test OAuth login at: https://kala-webapp.vercel.app"
echo ""
