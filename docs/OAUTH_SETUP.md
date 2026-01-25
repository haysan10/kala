# 🔐 OAuth Setup Guide - Google & GitHub

Panduan lengkap setup OAuth authentication untuk KALA WebApp.

---

## 📋 Prerequisites

- Aplikasi sudah deploy di Vercel: `https://kala-webapp.vercel.app`
- Access ke [Google Cloud Console](https://console.cloud.google.com)
- Access ke [GitHub Developer Settings](https://github.com/settings/developers)

---

## 1️⃣ Setup Google OAuth

### Step 1: Buat Project di Google Cloud Console

1. **Buka Google Cloud Console**
   - Pergi ke: https://console.cloud.google.com
   - Login dengan akun Google Anda

2. **Buat Project Baru (jika belum ada)**
   - Klik dropdown di header (sebelah logo Google Cloud)
   - Klik **"NEW PROJECT"**
   - **Project Name**: `KALA Academic Intelligence` (atau nama bebas)
   - **Location**: Biarkan default atau pilih organization jika ada
   - Klik **"CREATE"**
   - Tunggu hingga project selesai dibuat (~30 detik)

### Step 2: Enable Google+ API

1. **Pilih Project yang Baru Dibuat**
   - Pastikan project KALA sudah terpilih di dropdown header

2. **Enable APIs**
   - Di sidebar kiri, pilih **"APIs & Services" > "Library"**
   - Cari **"Google+ API"** di search bar
   - Klik **"Google+ API"**
   - Klik **"ENABLE"**
   
   > ⚠️ **PENTING**: Jika Google+ API sudah deprecated, cari dan enable **"Google Identity"** atau **"People API"** sebagai alternatif.

### Step 3: Configure OAuth Consent Screen

1. **Buka OAuth Consent Screen**
   - Sidebar kiri: **"APIs & Services" > "OAuth consent screen"**

2. **Pilih User Type**
   - Pilih **"External"** (untuk testing publik)
   - Klik **"CREATE"**

3. **App Information**
   - **App name**: `KALA - Academic Intelligence Assistant`
   - **User support email**: [email Anda]
   - **App logo**: (Optional - bisa diupload nanti)

4. **App Domain**
   - **Application home page**: `https://kala-webapp.vercel.app`
   - **Application privacy policy link**: `https://kala-webapp.vercel.app/privacy` (buat halaman ini nanti)
   - **Application terms of service**: `https://kala-webapp.vercel.app/terms` (buat halaman ini nanti)

5. **Developer Contact Information**
   - **Email addresses**: [email Anda]
   - Klik **"SAVE AND CONTINUE"**

6. **Scopes**
   - Klik **"ADD OR REMOVE SCOPES"**
   - Pilih scope:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`
   - Klik **"UPDATE"**
   - Klik **"SAVE AND CONTINUE"**

7. **Test Users** (untuk External app di development)
   - Klik **"ADD USERS"**
   - Masukkan email untuk testing (email Google Anda sendiri)
   - Klik **"ADD"**
   - Klik **"SAVE AND CONTINUE"**

8. **Summary**
   - Review informasi
   - Klik **"BACK TO DASHBOARD"**

### Step 4: Create OAuth Credentials

1. **Buka Credentials Page**
   - Sidebar kiri: **"APIs & Services" > "Credentials"**

2. **Create Credentials**
   - Klik **"+ CREATE CREDENTIALS"** di atas
   - Pilih **"OAuth client ID"**

3. **Configure OAuth Client**
   - **Application type**: `Web application`
   - **Name**: `KALA Web Client`
   
4. **Authorized JavaScript origins**
   - Klik **"+ ADD URI"**
   - Tambahkan:
     ```
     https://kala-webapp.vercel.app
     ```
   - (Optional) Untuk development lokal:
     ```
     http://localhost:3000
     ```

5. **Authorized redirect URIs**
   - Klik **"+ ADD URI"**
   - Tambahkan:
     ```
     https://kala-webapp.vercel.app/api/auth/callback/google
     ```
   - (Optional) Untuk development lokal:
     ```
     http://localhost:3000/api/auth/callback/google
     ```

6. **Create Client**
   - Klik **"CREATE"**
   - Pop-up muncul dengan **Client ID** dan **Client Secret**
   - **⚠️ PENTING**: Copy kedua value ini dan simpan!

✅ **Google OAuth Credentials:**
```
Client ID: [copy dari pop-up]
Client Secret: [copy dari pop-up]
```

---

## 2️⃣ Setup GitHub OAuth

### Step 1: Buat OAuth App di GitHub

1. **Buka GitHub Developer Settings**
   - Pergi ke: https://github.com/settings/developers
   - Login dengan akun GitHub Anda

2. **Register New Application**
   - Pilih tab **"OAuth Apps"**
   - Klik **"New OAuth App"**

### Step 2: Configure OAuth App

1. **Application Information**
   - **Application name**: `KALA - Academic Intelligence`
   - **Homepage URL**: `https://kala-webapp.vercel.app`
   - **Application description**: (Optional)
     ```
     AI-powered academic assignment assistant that helps students break down complex tasks into manageable milestones.
     ```
   - **Authorization callback URL**:
     ```
     https://kala-webapp.vercel.app/api/auth/callback/github
     ```

2. **Register Application**
   - Klik **"Register application"**

### Step 3: Generate Client Secret

1. **Setelah aplikasi terdaftar**, Anda akan melihat:
   - **Client ID**: [sudah terlihat di halaman]
   
2. **Generate Client Secret**
   - Klik **"Generate a new client secret"**
   - **⚠️ PENTING**: Copy **Client Secret** yang muncul (hanya akan ditampilkan sekali!)

✅ **GitHub OAuth Credentials:**
```
Client ID: [copy dari halaman]
Client Secret: [copy setelah generate]
```

---

## 3️⃣ Tambahkan Environment Variables

### A. Tambah ke Vercel (Production)

```bash
# Google OAuth
npx vercel env add GOOGLE_CLIENT_ID production
# Paste Client ID yang di-copy, lalu Enter

npx vercel env add GOOGLE_CLIENT_SECRET production
# Paste Client Secret yang di-copy, lalu Enter

# GitHub OAuth
npx vercel env add GITHUB_CLIENT_ID production
# Paste Client ID yang di-copy, lalu Enter

npx vercel env add GITHUB_CLIENT_SECRET production
# Paste Client Secret yang di-copy, lalu Enter

# Callback URLs
echo -n "https://kala-webapp.vercel.app/api/auth/callback/google" | npx vercel env add GOOGLE_CALLBACK_URL production

echo -n "https://kala-webapp.vercel.app/api/auth/callback/github" | npx vercel env add GITHUB_CALLBACK_URL production
```

### B. Tambah ke `.env.local` (Development)

Edit file `.env.local`:

```bash
# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/callback/google

# OAuth - GitHub  
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/callback/github
```

---

## 4️⃣ Deploy Ulang ke Vercel

Setelah menambahkan environment variables, deploy ulang:

```bash
npx vercel --prod
```

---

## 5️⃣ Test OAuth Login

### 1. **Buka Aplikasi**
   - Pergi ke: https://kala-webapp.vercel.app

### 2. **Test Google Login**
   - Klik tombol **"Sign in with Google"**
   - Pilih akun Google
   - Approve permissions
   - Redirect kembali ke aplikasi (sudah login)

### 3. **Test GitHub Login**
   - Klik tombol **"Sign in with GitHub"**
   - Authorize aplikasi
   - Redirect kembali ke aplikasi (sudah login)

---

## 📝 Checklist

- [ ] Google Cloud Project sudah dibuat
- [ ] OAuth Consent Screen sudah dikonfigurasi
- [ ] Google OAuth credentials sudah dibuat
- [ ] GitHub OAuth App sudah registered
- [ ] Semua environment variables sudah ditambahkan ke Vercel
- [ ] Semua environment variables sudah ditambahkan ke `.env.local`
- [ ] Deploy ulang ke Vercel
- [ ] Test Google login berhasil
- [ ] Test GitHub login berhasil

---

## 🔧 Troubleshooting

### Error: "redirect_uri_mismatch"
- **Solusi**: Periksa kembali Authorized redirect URIs di Google/GitHub OAuth settings
- Pastikan URL EXACT match (termasuk `https://` dan path `/api/auth/callback/...`)

### Error: "Invalid client"
- **Solusi**: Periksa kembali Client ID dan Client Secret
- Pastikan tidak ada whitespace atau newline characters
- Re-add environment variables dengan `echo -n` (tanpa newline)

### Google Login: "This app hasn't been verified"
- **Solusi**: Ini normal untuk app External yang masih testing
- Klik **"Advanced"** → **"Go to KALA (unsafe)"**
- Atau tambahkan email tester di OAuth Consent Screen > Test Users

### GitHub Login tidak muncul di aplikasi
- **Solusi**: Periksa implementasi frontend, pastikan button GitHub login sudah ada
- Periksa API route `/api/auth/login` sudah mendukung GitHub

---

## 📚 Resource Links

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [Passport.js Documentation](http://www.passportjs.org/)

---

✅ **Setup Complete!** Aplikasi Anda sekarang mendukung login dengan Google & GitHub.
