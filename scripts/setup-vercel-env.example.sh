#!/bin/bash
# Template script to set backend environment variables for KALA on Vercel
# Usage: Copy this file, replace placeholders with actual values, and run it.

echo "🔧 Setting Backend Environment Variables for Production..."

# Database
echo "Setting database variables..."
echo "PLACEHOLDER_TURSO_DATABASE_URL" | vercel env add TURSO_DATABASE_URL production 2>/dev/null || echo "TURSO_DATABASE_URL already exists"
echo "PLACEHOLDER_TURSO_AUTH_TOKEN" | vercel env add TURSO_AUTH_TOKEN production 2>/dev/null || echo "TURSO_AUTH_TOKEN already exists"

# Authentication
echo "Setting auth variables..."
echo "PLACEHOLDER_JWT_SECRET" | vercel env add JWT_SECRET production 2>/dev/null || echo "JWT_SECRET already exists"
echo "7d" | vercel env add JWT_EXPIRES_IN production 2>/dev/null || echo "JWT_EXPIRES_IN already exists"

# AI Providers
echo "Setting AI provider variables..."
echo "PLACEHOLDER_GEMINI_API_KEY" | vercel env add GEMINI_API_KEY production 2>/dev/null || echo "GEMINI_API_KEY already exists"
echo "PLACEHOLDER_GROK_API_KEY" | vercel env add GROK_API_KEY production 2>/dev/null || echo "GROK_API_KEY already exists"

# Server
echo "Setting server variables..."
echo "production" | vercel env add NODE_ENV production 2>/dev/null || echo "NODE_ENV already exists"
echo "info" | vercel env add LOG_LEVEL production 2>/dev/null || echo "LOG_LEVEL already exists"

# CORS
echo "Setting CORS variables..."
echo "https://kala-frontend.vercel.app" | vercel env add FRONTEND_URL production 2>/dev/null || echo "FRONTEND_URL already exists"

# OAuth - Google
echo "Setting Google OAuth variables..."
echo "PLACEHOLDER_GOOGLE_CLIENT_ID" | vercel env add GOOGLE_CLIENT_ID production 2>/dev/null || echo "GOOGLE_CLIENT_ID already exists"
echo "PLACEHOLDER_GOOGLE_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET production 2>/dev/null || echo "GOOGLE_CLIENT_SECRET already exists"
echo "https://kala-frontend.vercel.app/api/auth/google/callback" | vercel env add GOOGLE_CALLBACK_URL production 2>/dev/null || echo "GOOGLE_CALLBACK_URL already exists"

# OAuth - GitHub  
echo "Setting GitHub OAuth variables..."
echo "PLACEHOLDER_GITHUB_CLIENT_ID" | vercel env add GITHUB_CLIENT_ID production 2>/dev/null || echo "GITHUB_CLIENT_ID already exists"
echo "PLACEHOLDER_GITHUB_CLIENT_SECRET" | vercel env add GITHUB_CLIENT_SECRET production 2>/dev/null || echo "GITHUB_CLIENT_SECRET already exists"
echo "https://kala-frontend.vercel.app/api/auth/github/callback" | vercel env add GITHUB_CALLBACK_URL production 2>/dev/null || echo "GITHUB_CALLBACK_URL already exists"

echo "✅ Environment variables template script finished."
