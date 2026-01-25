# 🔴 SOLUSI FINAL: CONSOLE MISMATCH

Saya telah memverifikasi deployment Anda secara remote. 
**Hasil: Code & Deployment 100% BENAR.**

App Anda mengirimkan konfigurasi berikut:
- **Client ID**: `29160567636-sh7arv0r6sot5r5vouhui3d71ddtu5bv.apps.googleusercontent.com`
- **Redirect URI**: `https://kala-webapp.vercel.app/api/auth/callback/google`

Jika Anda masih error 400, berarti **Google Cloud Console TIDAK COCOK** dengan data di atas.

---

## 🛠️ TUGAS ANDA (Cek Detail Ini)

Buka [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

### 1. Cek Client ID
Pastikan Anda mengedit OAuth Client yang ID-nya **diawali** dengan:
`29160567636-...`
(Jika Anda mengedit Client ID yang lain, login tidak akan berhasil)

### 2. Cek Redirect URI (Harus Persis!)
Copy text di bawah ini dan paste ke Console (hapus yang lama):
```text
https://kala-webapp.vercel.app/api/auth/callback/google
```

⚠️ **Perhatikan:**
- Gunakan `https`, bukan `http`
- Tidak ada `www`
- Tidak ada spasi di awal/akhir
- Tidak ada garis miring `/` di paling belakang

### 3. Cek GitHub Juga
Buka [GitHub Settings](https://github.com/settings/developers).
Paste URL callback ini:
```text
https://kala-webapp.vercel.app/api/auth/callback/github
```

---

## 🆘 Masih Error?

Jika sudah yakin 100% benar tapi masih error, kemungkinan **Deployment Vercel belum update**.
Jalankan ini sekali lagi untuk memaksa update:
```bash
npx vercel --prod --force
```
Lalu buka: **https://kala-webapp.vercel.app**

*(Jangan pakai URL lain)*
