# 🚀 OAuth Quick Fix - Langkah Cepat

## ❌ Masalah
Google dan GitHub OAuth tidak bisa digunakan karena redirect URI tidak sesuai dengan deployment URL Vercel production.

## ✅ Solusi (3 Langkah Mudah)

### 1️⃣ Update Google Cloud Console

**Link**: https://console.cloud.google.com

1. Pilih project **KALA Academic Intelligence**
2. Buka **APIs & Services** > **Credentials**
3. Klik OAuth 2.0 Client ID yang sudah ada
4. Di bagian **Authorized redirect URIs**, tambahkan:
   ```
   https://kala-webapp-1p2ci6pm6-sans-projects-535a87c1.vercel.app/api/auth/callback/google
   ```
5. Klik **SAVE**

### 2️⃣ Update GitHub Developer Settings

**Link**: https://github.com/settings/developers

1. Pilih OAuth App **KALA - Academic Intelligence**
2. Di bagian **Authorization callback URL**, update menjadi:
   ```
   https://kala-webapp-1p2ci6pm6-sans-projects-535a87c1.vercel.app/api/auth/callback/github
   ```
3. Klik **Update application**

### 3️⃣ Update Vercel Environment Variables & Deploy

```bash
# Di terminal, jalankan:
cd /Users/haysan/Documents/WEBAPPS/KALA

# Jalankan script update otomatis
./scripts/update-oauth-urls.sh

# Commit dan push perubahan code
git add .
git commit -m "feat: implement OAuth authentication"
git push origin main

# Deploy ke production
npx vercel --prod
```

---

## 🧪 Test OAuth Setelah Deploy

1. Buka: https://kala-webapp-1p2ci6pm6-sans-projects-535a87c1.vercel.app
2. Klik **Sign in with Google** - harus berhasil redirect dan login ✅
3. Klik **Sign in with GitHub** - harus berhasil redirect dan login ✅

---

## ⚡ Perubahan Code yang Sudah Dibuat

File baru yang dibuat:
- ✅ `src/app/api/auth/google/route.ts` - Google OAuth initiation
- ✅ `src/app/api/auth/github/route.ts` - GitHub OAuth initiation

File yang diupdate:
- ✅ `src/app/api/auth/callback/google/route.ts` - Implementasi callback lengkap
- ✅ `src/app/api/auth/callback/github/route.ts` - Implementasi callback lengkap

---

## 📋 Checklist

- [ ] Update redirect URI di Google Cloud Console
- [ ] Update callback URL di GitHub Developer Settings  
- [ ] Jalankan `./scripts/update-oauth-urls.sh`
- [ ] Commit dan push ke Git
- [ ] Deploy ke Vercel production
- [ ] Test Google login
- [ ] Test GitHub login

---

## 🔍 Troubleshooting

### Error: `redirect_uri_mismatch`
✅ **Fix**: Pastikan URL di Google/GitHub **persis sama** dengan yang di environment variables

### Error: `oauth_token_failed`  
✅ **Fix**: Periksa Client ID dan Client Secret sudah benar di Vercel environment variables

### Google menampilkan "This app hasn't been verified"
✅ **Fix**: Klik **Advanced** → **Go to KALA (unsafe)** (ini normal untuk testing)

---

## 📞 Bantuan Lebih Lanjut

Lihat dokumentasi lengkap di: `docs/FIX_OAUTH.md` atau `docs/OAUTH_SETUP.md`
