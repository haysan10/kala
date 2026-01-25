# OAuth Configuration Guide - Google Console & GitHub

## 📋 Overview

Setelah deploy ke Vercel, Anda perlu update OAuth callback URLs di Google Console dan GitHub untuk enable authentication di production.

**Production URL:** `https://kala-kappa.vercel.app`

---

## 🔵 Google Console OAuth Configuration

### Step 1: Buka Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Select project Anda atau create new project
3. Navigate ke: **APIs & Services** → **Credentials**

### Step 2: Create atau Edit OAuth Client ID

#### Jika Belum Ada OAuth Client:

1. Click **"+ CREATE CREDENTIALS"** → **OAuth client ID**
2. Application type: **Web application**
3. Name: `KALA Production` (atau nama yang Anda inginkan)

#### Jika Sudah Ada OAuth Client:

1. Find existing OAuth 2.0 Client ID
2. Click pencil icon untuk Edit

### Step 3: Configure Authorized Redirect URIs

Add production callback URL:

```
https://kala-kappa.vercel.app/api/auth/google/callback
```

**Jika ada custom domain nanti, tambahkan juga:**
```
https://your-custom-domain.com/api/auth/google/callback
```

### Step 4: Configure Authorized JavaScript Origins

Add production origin:

```
https://kala-kappa.vercel.app
```

**Screenshot Guide:**

```
Authorized JavaScript origins:
┌────────────────────────────────────────────────────────┐
│ http://localhost:5173                                  │
│ http://localhost:3000                                  │
│ https://kala-kappa.vercel.app│
└────────────────────────────────────────────────────────┘

Authorized redirect URIs:
┌────────────────────────────────────────────────────────────────┐
│ http://localhost:3001/api/auth/google/callback                │
│ https://kala-kappa.vercel.app/api/auth/google/callback│
└────────────────────────────────────────────────────────────────┘
```

### Step 5: Copy Client Credentials

1. Copy **Client ID**
2. Copy **Client Secret**
3. Save untuk Step 7 (Vercel environment variables)

---

## 🐙 GitHub OAuth Configuration

### Step 1: Buka GitHub Developer Settings

1. Go to: https://github.com/settings/developers
2. Click **"OAuth Apps"**

### Step 2: Create atau Edit OAuth App

#### Jika Belum Ada OAuth App:

1. Click **"New OAuth App"**
2. Fill in details:
   - **Application name:** `KALA Production`
   - **Homepage URL:** `https://kala-kappa.vercel.app`
   - **Application description:** KALA Academic Intelligence OS
   - **Authorization callback URL:** `https://kala-kappa.vercel.app/api/auth/github/callback`

#### Jika Sudah Ada OAuth App:

1. Find existing app (e.g., "KALA Development")
2. Click app name untuk Edit
3. Update callback URL

### Step 3: Configure Callback URL

**Production Callback URL:**
```
https://kala-kappa.vercel.app/api/auth/github/callback
```

**Screenshot Guide:**

```
GitHub OAuth App Settings:
┌─────────────────────────────────────────────────────────┐
│ Application name:                                       │
│ ┌─────────────────────────────────────────────────┐   │
│ │ KALA Production                                   │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Homepage URL:                                           │
│ ┌─────────────────────────────────────────────────┐   │
│ │ https://kala-ahlvtx38z-sans-projects-535a87c1... │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Authorization callback URL:                             │
│ ┌─────────────────────────────────────────────────┐   │
│ │ https://kala-ahlvtx38z-sans-projects-535a87c1...│   │
│ │ /api/auth/github/callback                        │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Step 4: Generate Client Secret (jika belum ada)

1. Click **"Generate a new client secret"**
2. Copy **Client Secret** immediately (hanya ditampilkan sekali!)

### Step 5: Copy Client Credentials

1. Copy **Client ID**
2. Copy **Client Secret** (dari Step 4)
3. Save untuk Step 7 (Vercel environment variables)

---

## ⚙️ Configure Vercel Environment Variables

### Step 6: Buka Vercel Dashboard

1. Go to: https://vercel.com/sans-projects-535a87c1/kala/settings/environment-variables
2. Or: Vercel Dashboard → Your Project → **Settings** → **Environment Variables**

### Step 7: Add OAuth Environment Variables

Add the following environment variables:

#### Google OAuth Variables

| Key | Value | Environment |
|-----|-------|-------------|
| `GOOGLE_CLIENT_ID` | Your Google Client ID | Production |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret | Production |
| `GOOGLE_CALLBACK_URL` | `https://kala-kappa.vercel.app/api/auth/google/callback` | Production |

#### GitHub OAuth Variables

| Key | Value | Environment |
|-----|-------|-------------|
| `GITHUB_CLIENT_ID` | Your GitHub Client ID | Production |
| `GITHUB_CLIENT_SECRET` | Your GitHub Client Secret | Production |
| `GITHUB_CALLBACK_URL` | `https://kala-kappa.vercel.app/api/auth/github/callback` | Production |

### Step 8: Redeploy (jika sudah deploy sebelumnya)

Jika Anda add environment variables SETELAH deployment:

```bash
vercel --prod
```

Environment variables akan otomatis loaded di deployment baru.

---

## ✅ Verification Checklist

Setelah configure, verify setup dengan checklist ini:

### Google OAuth
- [ ] Client ID dan Secret sudah di-copy
- [ ] Authorized JavaScript origins includes production URL
- [ ] Authorized redirect URIs includes `/api/auth/google/callback`
- [ ] Environment variables set di Vercel
- [ ] Callback URL format benar (HTTPS, tidak ada trailing slash di base URL)

### GitHub OAuth
- [ ] Client ID dan Secret sudah di-copy
- [ ] Homepage URL sudah di-set ke production URL
- [ ] Authorization callback URL includes `/api/auth/github/callback`
- [ ] Environment variables set di Vercel
- [ ] Callback URL format benar (HTTPS, tidak ada trailing slash di base URL)

### Vercel Environment Variables
- [ ] `GOOGLE_CLIENT_ID` set untuk Production
- [ ] `GOOGLE_CLIENT_SECRET` set untuk Production
- [ ] `GOOGLE_CALLBACK_URL` set untuk Production
- [ ] `GITHUB_CLIENT_ID` set untuk Production
- [ ] `GITHUB_CLIENT_SECRET` set untuk Production
- [ ] `GITHUB_CALLBACK_URL` set untuk Production
- [ ] Redeploy jika variables ditambah setelah deployment

---

## 🧪 Testing OAuth Flows

### Test Google OAuth

1. Navigate to: `https://kala-kappa.vercel.app/login`
2. Click "Sign in with Google"
3. Should redirect to Google login
4. After login, should redirect back to KALA dashboard
5. Check browser console for JWT token

### Test GitHub OAuth

1. Navigate to: `https://kala-kappa.vercel.app/login`
2. Click "Sign in with GitHub"
3. Should redirect to GitHub login
4. After login, should redirect back to KALA dashboard
5. Check browser console for JWT token

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause:** Callback URL in OAuth app doesn't match the URL in request

**Solution:**
1. Double-check callback URL di Google Console / GitHub
2. Ensure HTTPS (not HTTP)
3. Ensure exact match: `https://kala-kappa.vercel.app/api/auth/google/callback`
4. No trailing slash on base URL

### Error: "unauthorized_client"

**Cause:** Client ID/Secret incorrect or environment variables not set

**Solution:**
1. Verify Client ID and Secret are correct
2. Check environment variables in Vercel Dashboard
3. Redeploy after adding variables

### Error: "CORS error"

**Cause:** Origin not authorized

**Solution:**
1. Add production URL to "Authorized JavaScript origins" in Google Console
2. Verify `FRONTEND_URL` environment variable

### OAuth Works Locally But Not in Production

**Solution:**
1. Ensure production callback URLs added to OAuth apps
2. Verify environment variables set for Production (not just Preview/Development)
3. Check Vercel function logs for errors

---

## 📝 Quick Reference

### Production URLs

| Purpose | URL |
|---------|-----|
| **Base URL** | `https://kala-kappa.vercel.app` |
| **Google Callback** | `https://kala-kappa.vercel.app/api/auth/google/callback` |
| **GitHub Callback** | `https://kala-kappa.vercel.app/api/auth/github/callback` |
| **Health Check** | `https://kala-kappa.vercel.app/health` |

### Useful Links

- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
- **GitHub OAuth Apps:** https://github.com/settings/developers
- **Vercel Dashboard:** https://vercel.com/sans-projects-535a87c1/kala
- **Vercel Environment Variables:** https://vercel.com/sans-projects-535a87c1/kala/settings/environment-variables

---

**Last Updated:** 2026-01-25  
**Deployment:** Production  
**Status:** ✅ Ready for OAuth Configuration
