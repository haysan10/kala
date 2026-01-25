# 🔴 PERBAIKAN OAUTH - LANGKAH TERAKHIR

## ✅ Status Saat Ini

- ✅ Code OAuth sudah diimplementasi
- ✅ Environment variables Vercel sudah diupdate ke URL yang benar
- ✅ Production URL: **`https://kala-webapp.vercel.app`**
- ❌ **Google Cloud Console belum diupdate** ← **MASALAH INI**
- ❌ **GitHub Developer Settings belum diupdate** ← **DAN INI**

---

## 🎯 Error yang Terjadi

```
Error 400: invalid_request
This app doesn't comply with Google's OAuth 2.0 policy
```

**Penyebab:** Redirect URI di Google Cloud Console tidak match dengan yang di code.

---

## 🔧 SOLUSI - 2 Langkah Konfigurasi

### 1️⃣ **UPDATE GOOGLE CLOUD CONSOLE** (WAJIB!)

#### Langkah Detail:

1. **Buka**: https://console.cloud.google.com
2. **Login** dengan akun Google yang membuat OAuth credentials
3. **Pilih Project**: `KALA Academic Intelligence` (di dropdown kiri atas)
4. **Sidebar kiri**: Klik `APIs & Services` → `Credentials`
5. **Cari OAuth 2.0 Client IDs**: Di bagian "OAuth 2.0 Client IDs"
6. **Klik nama client** (contoh: "KALA Web Client" atau client ID yang dimulai dengan `29160567636-...`)
7. **Di bagian "Authorized redirect URIs"**:
   - Klik **"+ ADD URI"**
   - Masukkan URL ini **PERSIS**:
     ```
     https://kala-webapp.vercel.app/api/auth/callback/google
     ```
   - ⚠️ **PENTING**: Pastikan tidak ada spasi, tidak ada `/` di akhir
8. **(Opsional)** Jika ada redirect URI lama dengan format `https://kala-webapp-[hash].vercel.app`, bisa **dihapus**
9. **Klik "SAVE"** di bagian bawah

#### Screenshot Guide:
```
┌─────────────────────────────────────────────────────┐
│ Google Cloud Console                                │
│ APIs & Services > Credentials                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│ OAuth 2.0 Client IDs                                │
│ ┌─────────────────────────────────────────────┐   │
│ │ KALA Web Client                             │   │
│ │ Client ID: 29160567636-...                  │   │
│ │                                             │   │
│ │ Authorized redirect URIs:                   │   │
│ │ ┌─────────────────────────────────────────┐ │   │
│ │ │https://kala-webapp.vercel.app/api/auth/│ │   │
│ │ │callback/google                          │ │   │
│ │ └─────────────────────────────────────────┘ │   │
│ │ [+ ADD URI]                                 │   │
│ │                                             │   │
│ │                               [SAVE]        │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 2️⃣ **UPDATE GITHUB DEVELOPER SETTINGS** (WAJIB!)

#### Langkah Detail:

1. **Buka**: https://github.com/settings/developers
2. **Login** dengan akun GitHub
3. **Pilih tab**: `OAuth Apps`
4. **Klik aplikasi**: `KALA - Academic Intelligence` (atau nama OAuth app Anda)
5. **Di bagian "Authorization callback URL"**:
   - **Hapus** URL lama (kalau ada)
   - **Masukkan** URL baru:
     ```
     https://kala-webapp.vercel.app/api/auth/callback/github
     ```
   - ⚠️ **PENTING**: Pastikan tidak ada spasi, tidak ada `/` di akhir
6. **Klik "Update application"**

#### Screenshot Guide:
```
┌─────────────────────────────────────────────────────┐
│ GitHub Developer Settings                           │
│ OAuth Apps                                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ KALA - Academic Intelligence                        │
│ ┌─────────────────────────────────────────────┐   │
│ │ Application name:                           │   │
│ │ KALA - Academic Intelligence                │   │
│ │                                             │   │
│ │ Homepage URL:                               │   │
│ │ https://kala-webapp.vercel.app              │   │
│ │                                             │   │
│ │ Authorization callback URL:                 │   │
│ │ ┌─────────────────────────────────────────┐ │   │
│ │ │https://kala-webapp.vercel.app/api/auth/│ │   │
│ │ │callback/github                          │ │   │
│ │ └─────────────────────────────────────────┘ │   │
│ │                                             │   │
│ │                    [Update application]     │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 **Setelah Update, Deploy Ulang**

Setelah kedua provider (Google & GitHub) diupdate, jalankan:

```bash
npx vercel --prod
```

Tunggu hingga deployment selesai (~1-2 menit).

---

## ✅ **Testing**

Setelah deployment selesai:

1. **Buka**: https://kala-webapp.vercel.app
2. **Klik "Sign in with Google"**:
   - ✅ Harus redirect ke halaman Google
   - ✅ Pilih akun
   - ✅ Approve permissions
   - ✅ Redirect kembali ke app (sudah login)
3. **Klik "Sign in with GitHub"**:
   - ✅ Harus redirect ke halaman GitHub
   - ✅ Authorize app
   - ✅ Redirect kembali ke app (sudah login)

---

## 🔍 **Troubleshooting**

### Masih Error "invalid_request" di Google?

**Cek:**
1. ✅ Redirect URI di Google **PERSIS**: `https://kala-webapp.vercel.app/api/auth/callback/google`
2. ✅ Tidak ada typo, spasi, atau `/` di akhir
3. ✅ Sudah klik "SAVE" di Google Cloud Console
4. ✅ Sudah deploy ulang: `npx vercel --prod`
5. ✅ Tunggu 1-2 menit setelah deploy sebelum test lagi

### Masih Error di GitHub?

**Cek:**
1. ✅ Callback URL di GitHub **PERSIS**: `https://kala-webapp.vercel.app/api/auth/callback/github`
2. ✅ Sudah klik "Update application"
3. ✅ Sudah deploy ulang

### Google menampilkan "App not verified"?

**Solusi:** Ini **normal** untuk testing!
- Klik **"Advanced"**
- Klik **"Go to KALA (unsafe)"**
- Atau tambahkan email Anda sebagai **Test User** di OAuth Consent Screen

---

## 📋 **Checklist Final**

- [ ] ✅ Update redirect URI di Google Cloud Console
- [ ] ✅ Update callback URL di GitHub Developer Settings
- [ ] ✅ Deploy ulang: `npx vercel --prod`
- [ ] ✅ Test Google login
- [ ] ✅ Test GitHub login

---

## 🎉 **Setelah Semua Langkah Selesai**

OAuth authentication akan berfungsi sempurna! Users bisa:
- ✅ Login dengan Google
- ✅ Login dengan GitHub
- ✅ Account otomatis dibuat
- ✅ JWT token di-generate
- ✅ Session management works

---

**Ada masalah? Cek dokumentasi lengkap di:**
- `docs/FIX_OAUTH.md`
- `docs/OAUTH_SETUP.md`
