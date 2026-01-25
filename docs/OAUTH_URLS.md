# 📌 OAuth URLs - Copy & Paste

## Production URL
```
https://kala-webapp.vercel.app
```

---

## 🔵 GOOGLE CLOUD CONSOLE

**Link**: https://console.cloud.google.com

**Project**: KALA Academic Intelligence

**Authorized redirect URI** (copy ini):
```
https://kala-webapp.vercel.app/api/auth/callback/google
```

**Client ID** (yang sudah ada):
```
29160567636-sh7arv0r6sot5r5vouhui3d71ddtu5bv.apps.googleusercontent.com
```

---

## ⚫ GITHUB DEVELOPER SETTINGS

**Link**: https://github.com/settings/developers

**OAuth App**: KALA - Academic Intelligence

**Authorization callback URL** (copy ini):
```
https://kala-webapp.vercel.app/api/auth/callback/github
```

**Client ID** (yang sudah ada):
```
Ov23liXgMtnRRIcx11M2
```

---

## ✅ Vercel Environment Variables (SUDAH SET!)

- ✅ `GOOGLE_CLIENT_ID` = `29160567636-sh7arv0r6sot5r5vouhui3d71ddtu5bv.apps.googleusercontent.com`
- ✅ `GOOGLE_CLIENT_SECRET` = `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`
- ✅ `GOOGLE_CALLBACK_URL` = `https://kala-webapp.vercel.app/api/auth/callback/google`
- ✅ `GITHUB_CLIENT_ID` = `Ov23liXgMtnRRIcx11M2`
- ✅ `GITHUB_CLIENT_SECRET` = `4ff8ca568a7cd32e76fee62b6b5dacf731f10edf`
- ✅ `GITHUB_CALLBACK_URL` = `https://kala-webapp.vercel.app/api/auth/callback/github`

---

## 🚀 Deploy Command

```bash
npx vercel --prod
```

---

## 🧪 Test URLs

After deployment, test here:
- **App**: https://kala-webapp.vercel.app
- **Google OAuth Init**: https://kala-webapp.vercel.app/api/auth/google
- **GitHub OAuth Init**: https://kala-webapp.vercel.app/api/auth/github
