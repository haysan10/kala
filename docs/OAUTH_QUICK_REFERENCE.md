# 🚀 OAuth Quick Reference

## 📍 URLs yang Dibutuhkan

### Google OAuth
- **Console**: https://console.cloud.google.com/apis/credentials
- **Authorized Redirect URI**: 
  ```
  https://kala-webapp.vercel.app/api/auth/callback/google
  ```

### GitHub OAuth
- **Console**: https://github.com/settings/developers
- **Authorization Callback URL**:
  ```
  https://kala-webapp.vercel.app/api/auth/callback/github
  ```

---

## ⚡ Quick Setup Commands

### Setelah dapat credentials, jalankan:

```bash
# Gunakan setup script (RECOMMENDED)
./scripts/setup-oauth.sh

# ATAU manual:
echo -n "YOUR_GOOGLE_CLIENT_ID" | npx vercel env add GOOGLE_CLIENT_ID production
echo -n "YOUR_GOOGLE_CLIENT_SECRET" | npx vercel env add GOOGLE_CLIENT_SECRET production
echo -n "https://kala-webapp.vercel.app/api/auth/callback/google" | npx vercel env add GOOGLE_CALLBACK_URL production

echo -n "YOUR_GITHUB_CLIENT_ID" | npx vercel env add GITHUB_CLIENT_ID production
echo -n "YOUR_GITHUB_CLIENT_SECRET" | npx vercel env add GITHUB_CLIENT_SECRET production
echo -n "https://kala-webapp.vercel.app/api/auth/callback/github" | npx vercel env add GITHUB_CALLBACK_URL production
```

### Update .env.local:

```bash
# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/callback/google

# OAuth - GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/callback/github
```

### Redeploy:

```bash
npx vercel --prod
```

---

## ✅ Testing Checklist

- [ ] Google login works in production
- [ ] GitHub login works in production
- [ ] User data saved correctly to database
- [ ] Redirect after login works properly

---

## 🔗 Documentation

Full guide: `docs/OAUTH_SETUP.md`
