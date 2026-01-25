# 🔧 Fix OAuth Authentication - Setup Guide

## ✅ OAuth Code Implementation - COMPLETE

The following files have been created/updated to implement OAuth:

### New Files Created:
1. ✅ `/src/app/api/auth/google/route.ts` - Google OAuth initiation
2. ✅ `/src/app/api/auth/github/route.ts` - GitHub OAuth initiation

### Files Updated:
3. ✅ `/src/app/api/auth/callback/google/route.ts` - Google OAuth callback handler
4. ✅ `/src/app/api/auth/callback/github/route.ts` - GitHub OAuth callback handler

---

## 🔴 CRITICAL: Update OAuth Redirect URIs

Your OAuth credentials at Google Cloud Console and GitHub must be updated with the **production Vercel URL**.

### Current Issue:
- Your `.env.local` has callback URLs set to `http://localhost:3000`
- But your production app is at: `https://kala-webapp-1p2ci6pm6-sans-projects-535a87c1.vercel.app`
- Google and GitHub will **reject** authentication attempts from unauthorized URLs!

---

## 📋 Step-by-Step Setup

### 1️⃣ Update Google Cloud Console

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com
   - Select your project: **KALA Academic Intelligence**

2. **Update OAuth Credentials**:
   - Sidebar: **APIs & Services** > **Credentials**
   - Click on your OAuth 2.0 Client ID (e.g., "KALA Web Client")
   - Under **Authorized redirect URIs**, click **+ ADD URI**
   - Add your Vercel production URL:
     ```
     https://kala-webapp-1p2ci6pm6-sans-projects-535a87c1.vercel.app/api/auth/callback/google
     ```
   - Click **SAVE**

### 2️⃣ Update GitHub OAuth App

1. **Go to GitHub Developer Settings**:
   - Visit: https://github.com/settings/developers
   - Select your OAuth App: **KALA - Academic Intelligence**

2. **Update Authorization Callback URL**:
   - In the **Authorization callback URL** field, add:
     ```
     https://kala-webapp-1p2ci6pm6-sans-projects-535a87c1.vercel.app/api/auth/callback/github
     ```
   - Click **Update application**

### 3️⃣ Update Vercel Environment Variables

Add the production callback URLs to Vercel:

```bash
# Navigate to your project directory
cd /Users/haysan/Documents/WEBAPPS/KALA

# Update Google callback URL
npx vercel env add GOOGLE_CALLBACK_URL production
# When prompted, paste:
https://kala-webapp-1p2ci6pm6-sans-projects-535a87c1.vercel.app/api/auth/callback/google

# Update GitHub callback URL
npx vercel env add GITHUB_CALLBACK_URL production
# When prompted, paste:
https://kala-webapp-1p2ci6pm6-sans-projects-535a87c1.vercel.app/api/auth/callback/github
```

**OR** update via Vercel Dashboard:
1. Go to: https://vercel.com/sans-projects-535a87c1/kala-webapp/settings/environment-variables
2. Add/Edit these environment variables for **Production**:
   - `GOOGLE_CALLBACK_URL` = `https://kala-webapp-1p2ci6pm6-sans-projects-535a87c1.vercel.app/api/auth/callback/google`
   - `GITHUB_CALLBACK_URL` = `https://kala-webapp-1p2ci6pm6-sans-projects-535a87c1.vercel.app/api/auth/callback/github`

### 4️⃣ Verify Your Vercel Env Variables

Make sure ALL OAuth credentials are set in Vercel:

Required environment variables in **Production**:
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`
- ✅ `GOOGLE_CALLBACK_URL` (the one you just added/updated)
- ✅ `GITHUB_CLIENT_ID`
- ✅ `GITHUB_CLIENT_SECRET`
- ✅ `GITHUB_CALLBACK_URL` (the one you just added/updated)

### 5️⃣ Redeploy to Vercel

After updating environment variables, you MUST redeploy:

```bash
# Commit the new OAuth route files
git add .
git commit -m "feat: implement Google & GitHub OAuth authentication"
git push origin main

# Or force a new deployment
npx vercel --prod
```

---

## 🧪 Testing OAuth

After deployment completes:

1. **Visit your app**: https://kala-webapp-1p2ci6pm6-sans-projects-535a87c1.vercel.app

2. **Test Google Sign-In**:
   - Click "Sign in with Google"
   - You should be redirected to Google's authorization page
   - After authorizing, you'll be redirected back to your app (logged in)

3. **Test GitHub Sign-In**:
   - Click "Sign in with GitHub"
   - You should be redirected to GitHub's authorization page
   - After authorizing, you'll be redirected back to your app (logged in)

---

## 🔍 Troubleshooting

### Error: `redirect_uri_mismatch`
**Cause**: The callback URL in Google/GitHub doesn't match the URL in your code.

**Solution**:
1. Double-check the URLs in Google Cloud Console and GitHub Developer Settings
2. Make sure they **exactly match** (including `https://` and the path)
3. Verify your Vercel environment variables are correct

### Error: `oauth_token_failed`
**Cause**: Client ID or Client Secret is incorrect or not set.

**Solution**:
1. Verify `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, and `GITHUB_CLIENT_SECRET` are correctly set in Vercel
2. Make sure there are no extra spaces or newlines
3. Redeploy after fixing environment variables

### Error: `oauth_userinfo_failed`
**Cause**: Failed to fetch user information from Google/GitHub.

**Solution**:
1. Check that the necessary scopes are granted:
   - Google: `openid`, `email`, `profile`
   - GitHub: `user:email`, `read:user`
2. Try revoking access and re-authorizing

### Google: "This app hasn't been verified"
**Cause**: OAuth consent screen is in testing mode.

**Solution**:
- Click **"Advanced"** → **"Go to KALA (unsafe)"**
- OR add your email as a test user in Google Cloud Console → OAuth consent screen → Test users

---

## 📝 Checklist

Before testing, make sure you've completed:

- [ ] Updated Google OAuth redirect URI with production Vercel URL
- [ ] Updated GitHub OAuth callback URL with production Vercel URL
- [ ] Added/Updated `GOOGLE_CALLBACK_URL` in Vercel environment variables (Production)
- [ ] Added/Updated `GITHUB_CALLBACK_URL` in Vercel environment variables (Production)
- [ ] Verified all 6 OAuth environment variables are set in Vercel
- [ ] Committed and pushed the new OAuth route files
- [ ] Redeployed to Vercel
- [ ] Tested Google login
- [ ] Tested GitHub login

---

## 🎉 Success!

Once all steps are complete, your users will be able to:
- ✅ Sign in with Google
- ✅ Sign in with GitHub
- ✅ Have their accounts automatically created/linked
- ✅ Receive a JWT token and be authenticated

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
