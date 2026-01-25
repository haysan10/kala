<div align="center">

<img src="https://img.shields.io/badge/KALA-Sistem%20Kecerdasan%20Akademik-blue?style=for-the-badge&logo=graduation-cap" alt="KALA Badge" />

# 🎓 KALA

### Sistem Operasi Kecerdasan Akademik

**Ubah Kekacauan Akademik Menjadi Kejelasan Kognitif**

[![Lisensi MIT](https://img.shields.io/badge/Lisensi-MIT-green.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Turso](https://img.shields.io/badge/Database-Turso-4FF8D2?style=flat-square)](https://turso.tech/)

---

**🌐 Bahasa Lain:** [🇬🇧 English](README.md)

</div>

---

## 📖 Tentang Proyek

**KALA** (Kala Academic Learning Assistant) adalah Sistem Operasi Kecerdasan Akademik berbasis AI yang dirancang untuk merevolusi cara mahasiswa mengelola beban akademik mereka. Dengan memanfaatkan teknologi AI mutakhir, KALA mengubah tugas-tugas kompleks menjadi peta jalan kognitif yang dapat ditindaklanjuti, membantu mahasiswa mengatasi prokrastinasi dan mencapai keunggulan akademik.

---

## 🎯 Masalah yang Kami Selesaikan

| Masalah | Solusi KALA |
|---------|-------------|
| 😰 **Kewalahan Akademik** | AI memecah tugas kompleks menjadi langkah-langkah terkelola |
| ⏰ **Prokrastinasi** | Milestone dan deadline yang jelas menjaga fokus Anda |
| 📚 **Kelebihan Informasi** | Parsing dokumen cerdas mengekstrak konsep kunci |
| 🎯 **Kurang Struktur** | Jalur pembelajaran sistematis memandu kemajuan Anda |
| 📝 **Bingung Memulai** | AI memberikan langkah pertama yang jelas |
| 🤔 **Tidak Yakin Paham** | Debat Socratic memvalidasi pemahaman sejati |

---

## ✨ Fitur Utama

### Fitur Inti

<table>
<tr>
<td width="50%">

#### 🧠 Neural Ingestion
Parsing dokumen berbasis AI yang secara otomatis mengekstrak informasi kunci dari:
- 📄 File PDF
- 🖼️ Gambar (OCR)
- 📝 Dokumen teks

#### 📚 Pembuatan Mini-Course  
Modul pembelajaran komprehensif yang dihasilkan untuk setiap milestone, lengkap dengan:
- Penjelasan detail
- Contoh praktis
- Sumber belajar tambahan

#### ⚔️ Socratic Sparring
Mode debat AI yang menantang pemahaman Anda melalui pertanyaan kritis untuk memvalidasi penguasaan materi yang sebenarnya.

</td>
<td width="50%">

#### 💬 Mentor Akademik
Tutoring AI kontekstual yang memberikan bimbingan personal berdasarkan:
- Tugas spesifik Anda
- Gaya belajar Anda
- Tingkat pemahaman Anda

#### 🧪 Penilaian Penguasaan
Kuis dan tes yang dihasilkan AI untuk memvalidasi pemahaman Anda sebelum pengumpulan tugas.

#### ⏱️ Mode Fokus
Timer Pomodoro bawaan dengan interval yang dapat disesuaikan untuk sesi deep work yang produktif.

</td>
</tr>
</table>

### Fitur Tambahan

| Fitur | Deskripsi |
|-------|-----------|
| 🧠 **Daily Synapse** | Tantangan mikro harian untuk menjaga pikiran tetap tajam dan siap belajar |
| 📅 **Tampilan Kalender** | Pelacakan deadline visual dan perencanaan belajar yang terorganisir |
| 🌓 **Mode Terang/Gelap** | Tema yang indah untuk kenyamanan mata saat belajar |
| 🔐 **Login OAuth** | Autentikasi aman dan cepat dengan Google & GitHub |
| 🌐 **Multi-bahasa** | Dukungan penuh untuk Bahasa Inggris dan Indonesia |
| 📁 **File Explorer** | Kelola file dan dokumen akademik Anda |
| 📊 **Knowledge Map** | Visualisasi peta pengetahuan dan konsep |

---

## 🛠️ Teknologi yang Digunakan

### Frontend (Tampilan)
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **React** | 19 | Framework UI modern |
| **TypeScript** | 5.8 | Keamanan tipe data |
| **Vite** | 6 | Build tool super cepat |
| **TailwindCSS** | 3.4 | Styling yang fleksibel |
| **Framer Motion** | 12 | Animasi yang halus |
| **Lucide Icons** | Latest | Ikon yang cantik |

### Backend (Server)
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Node.js** | 20+ | Runtime JavaScript |
| **Express** | 4.18 | Framework API |
| **Drizzle ORM** | Latest | Manajemen database |
| **Turso** | libSQL | Database edge yang cepat |
| **Passport.js** | 0.7 | Autentikasi |
| **JWT** | Latest | Token keamanan |

### Integrasi AI
| Provider | Peran | Spesialisasi |
|----------|-------|--------------|
| **Google Gemini** | Utama | Analisis dokumen, pembuatan course, kuis, validasi |
| **xAI Grok** | Sekunder | Chat interaktif, debat, tugas kreatif, motivasi |

---

## 📦 Panduan Instalasi

### Prasyarat

Pastikan Anda sudah menginstal:

- ✅ **Node.js** versi 20.0.0 atau lebih tinggi
- ✅ **npm** versi 10.0.0 atau lebih tinggi
- ✅ **Git** untuk version control

### Langkah 1: Clone Repository

```bash
git clone https://github.com/haysan/kala.git
cd kala
```

### Langkah 2: Install Dependencies

```bash
# Install dependencies frontend
npm install

# Install dependencies backend
cd backend && npm install && cd ..
```

### Langkah 3: Konfigurasi Environment

Buat file environment untuk frontend dan backend:

**Frontend** (`.env.local` di folder root):
```env
GEMINI_API_KEY=api-key-gemini-anda
```

**Backend** (`backend/.env`):
```env
# Database (Turso)
TURSO_DATABASE_URL=libsql://database-anda.turso.io
TURSO_AUTH_TOKEN=token-autentikasi-anda

# Autentikasi
JWT_SECRET=kunci-rahasia-minimal-32-karakter-sangat-panjang
JWT_EXPIRES_IN=7d

# Provider AI
GEMINI_API_KEY=api-key-gemini-anda
GROK_API_KEY=api-key-grok-anda

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# OAuth - Google (Opsional)
GOOGLE_CLIENT_ID=client-id-google-anda
GOOGLE_CLIENT_SECRET=client-secret-google-anda
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# OAuth - GitHub (Opsional)
GITHUB_CLIENT_ID=client-id-github-anda
GITHUB_CLIENT_SECRET=client-secret-github-anda
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
```

### Langkah 4: Jalankan Server Development

Buka dua terminal berbeda:

```bash
# Terminal 1: Jalankan Backend
cd backend && npm run dev

# Terminal 2: Jalankan Frontend
npm run dev
```

### Langkah 5: Akses Aplikasi

| Layanan | URL | Keterangan |
|---------|-----|------------|
| 🌐 **Frontend** | http://localhost:3000 | Tampilan aplikasi |
| 🔌 **Backend API** | http://localhost:3001 | Server API |
| 💚 **Health Check** | http://localhost:3001/health | Cek status server |

---

## 📁 Struktur Proyek

```
KALA/
│
├── 📄 README.md                 # Dokumentasi (Inggris + Indonesia)
├── 📄 README.id.md              # Dokumentasi (Indonesia saja)
├── 📄 CONTRIBUTING.md           # Panduan kontribusi
├── 📄 LICENSE                   # Lisensi MIT
├── 📄 CHANGELOG.md              # Riwayat perubahan
├── 📄 SECURITY.md               # Kebijakan keamanan
│
├── 📂 .github/                  # ⚙️ Konfigurasi GitHub
│   ├── 📂 ISSUE_TEMPLATE/       # Template untuk issue
│   │   ├── bug_report.yml       # Template laporan bug
│   │   ├── feature_request.yml  # Template permintaan fitur
│   │   └── config.yml           # Konfigurasi template
│   ├── PULL_REQUEST_TEMPLATE.md # Template PR
│   └── FUNDING.yml              # Konfigurasi sponsor
│
├── 📂 .vscode/                  # 🔧 Konfigurasi VS Code
│   ├── extensions.json          # Ekstensi yang direkomendasikan
│   └── settings.json            # Pengaturan editor
│
├── 📂 docs/                     # 📚 Dokumentasi Lengkap
│   ├── PRD.md                   # Product Requirements Document
│   ├── API_DOCUMENTATION.md     # Referensi API lengkap
│   ├── BACKEND_DATABASE_DESIGN.md # Desain skema database
│   ├── AI_ROUTER_GUIDE.md       # Panduan integrasi AI
│   ├── OAUTH_IMPLEMENTATION.md  # Panduan setup OAuth
│   └── ...                      # Dokumentasi lainnya
│
├── 📂 components/               # 🎨 Komponen React UI
│   ├── AssignmentView.tsx       # Tampilan detail tugas
│   ├── Auth.tsx                 # Komponen autentikasi
│   ├── BlockEditor.tsx          # Editor blok konten
│   ├── CalendarView.tsx         # Tampilan kalender
│   ├── CourseManager.tsx        # Manajemen course
│   ├── DailySynapse.tsx         # Tantangan harian
│   ├── Dashboard.tsx            # Dashboard utama
│   ├── DebateRoom.tsx           # Ruang debat Socratic
│   ├── DocumentationPage.tsx    # Halaman dokumentasi
│   ├── EnhancedMiniCourse.tsx   # Mini-course yang disempurnakan
│   ├── FileExplorer.tsx         # Penjelajah file
│   ├── FocusMode.tsx            # Timer Pomodoro
│   ├── KnowledgeMap.tsx         # Peta pengetahuan
│   ├── LandingPage.tsx          # Halaman utama
│   ├── Profile.tsx              # Halaman profil
│   ├── QuizView.tsx             # Tampilan kuis
│   ├── Settings.tsx             # Pengaturan aplikasi
│   ├── TutorChat.tsx            # Chat mentor AI
│   ├── UploadAssignment.tsx     # Upload tugas
│   └── 📂 ui/                   # Komponen UI dasar
│
├── 📂 services/                 # 🔌 Layanan Frontend
│   ├── api.ts                   # Konfigurasi API dasar
│   ├── authService.ts           # Layanan autentikasi
│   ├── geminiService.ts         # Integrasi Gemini AI
│   ├── calendarApi.ts           # API kalender
│   ├── coursesApi.ts            # API courses
│   ├── storageApi.ts            # API penyimpanan
│   └── ...                      # Layanan lainnya
│
├── 📂 pages/                    # 📄 Halaman Statis
│   ├── about.tsx                # Halaman tentang
│   ├── privacy.tsx              # Kebijakan privasi
│   └── terms.tsx                # Syarat & ketentuan
│
├── 📂 src/                      # 📦 Source tambahan
│   ├── 📂 components/           # Komponen tambahan
│   │   └── 📂 dashboard/        # Komponen dashboard
│   ├── 📂 services/             # Layanan tambahan
│   ├── 📂 types/                # Definisi tipe
│   └── 📂 utils/                # Fungsi utilitas
│
├── 📂 backend/                  # 🖥️ Backend API Server
│   ├── 📂 src/
│   │   ├── 📂 routes/           # Handler endpoint API
│   │   │   ├── auth.routes.ts   # Rute autentikasi
│   │   │   ├── assignments.routes.ts
│   │   │   ├── courses.routes.ts
│   │   │   └── ...
│   │   ├── 📂 services/         # Logika bisnis
│   │   │   ├── ai.service.ts    # Layanan AI
│   │   │   ├── auth.service.ts
│   │   │   └── ...
│   │   ├── 📂 db/               # Skema & konfigurasi database
│   │   │   ├── schema.ts        # Definisi tabel
│   │   │   └── index.ts         # Koneksi database
│   │   ├── 📂 middleware/       # Middleware Express
│   │   │   ├── auth.middleware.ts
│   │   │   └── ...
│   │   ├── 📂 config/           # Konfigurasi server
│   │   └── 📂 utils/            # Fungsi utilitas
│   ├── 📂 uploads/              # Folder upload file
│   ├── 📂 data/                 # Data lokal (dev)
│   ├── .env.example             # Template environment
│   └── package.json             # Dependencies backend
│
├── 📄 App.tsx                   # Komponen React utama
├── 📄 index.tsx                 # Entry point aplikasi
├── 📄 index.html                # Template HTML
├── 📄 index.css                 # Styles global
├── 📄 types.ts                  # Definisi tipe TypeScript
├── 📄 vite.config.ts            # Konfigurasi Vite
├── 📄 tailwind.config.js        # Konfigurasi TailwindCSS
├── 📄 tsconfig.json             # Konfigurasi TypeScript
├── 📄 postcss.config.js         # Konfigurasi PostCSS
└── 📄 package.json              # Dependencies frontend
```

---

## 🔧 Mendapatkan API Key

### Google Gemini (Gratis)
1. Kunjungi [Google AI Studio](https://aistudio.google.com/apikey)
2. Login dengan akun Google
3. Klik "Create API Key"
4. Salin API key yang dihasilkan

### xAI Grok (Opsional)
1. Kunjungi [xAI Console](https://console.x.ai/)
2. Buat akun atau login
3. Generate API key baru
4. Salin API key yang dihasilkan

---

## 📝 Perintah yang Tersedia

### Frontend
| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Jalankan server development (port 3000) |
| `npm run build` | Build untuk produksi |
| `npm run preview` | Preview hasil build produksi |

### Backend
| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Jalankan dengan hot-reload |
| `npm run build` | Compile TypeScript ke JavaScript |
| `npm run start` | Jalankan server produksi |
| `npm run db:generate` | Generate migrasi database |
| `npm run db:push` | Push skema ke database |
| `npm run db:studio` | Buka Drizzle Studio |
| `npm test` | Jalankan semua test |
| `npm run test:unit` | Jalankan unit test |
| `npm run test:integration` | Jalankan integration test |

---

---

## 📚 Dokumentasi Lengkap

| Dokumen | Deskripsi | Lokasi |
|---------|-----------|--------|
| 📋 **PRD** | Persyaratan produk lengkap | [docs/PRD.md](docs/PRD.md) |
| 🔌 **API Reference** | Dokumentasi semua endpoint | [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) |
| 🗃️ **Database Design** | Skema dan ERD database | [docs/BACKEND_DATABASE_DESIGN.md](docs/BACKEND_DATABASE_DESIGN.md) |
| 🤖 **AI Router Guide** | Panduan integrasi AI | [docs/AI_ROUTER_GUIDE.md](docs/AI_ROUTER_GUIDE.md) |
| 🔐 **OAuth Setup** | Cara setup login sosial | [docs/OAUTH_IMPLEMENTATION.md](docs/OAUTH_IMPLEMENTATION.md) |
| ✅ **Checklist** | Progress implementasi | [docs/IMPLEMENTATION_CHECKLIST.md](docs/IMPLEMENTATION_CHECKLIST.md) |

---

## 🤝 Cara Berkontribusi

Kami sangat menyambut kontribusi! Silakan baca [CONTRIBUTING.md](CONTRIBUTING.md) untuk panduan lengkap.

### Langkah Cepat

1. **Fork** repository ini
2. **Clone** fork Anda
   ```bash
   git clone https://github.com/USERNAME-ANDA/kala.git
   ```
3. **Buat branch** untuk fitur Anda
   ```bash
   git checkout -b feature/fitur-keren-saya
   ```
4. **Commit** perubahan Anda
   ```bash
   git commit -m 'feat: tambahkan fitur keren'
   ```
5. **Push** ke branch
   ```bash
   git push origin feature/fitur-keren-saya
   ```
6. Buka **Pull Request**

### Jenis Kontribusi yang Diterima

- 🐛 Perbaikan bug
- ✨ Fitur baru
- 📝 Perbaikan dokumentasi
- 🎨 Peningkatan UI/UX
- 🌐 Terjemahan
- 🧪 Test baru

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **Lisensi MIT** - lihat file [LICENSE](LICENSE) untuk detail lengkap.

Singkatnya, Anda bebas untuk:
- ✅ Menggunakan secara komersial
- ✅ Memodifikasi
- ✅ Mendistribusikan
- ✅ Menggunakan secara pribadi

Dengan syarat:
- ⚠️ Menyertakan pemberitahuan hak cipta dan lisensi

---

## 💬 Mendapatkan Bantuan

| Metode | Link | Untuk |
|--------|------|-------|
| 🐛 **GitHub Issues** | [Buka Issue](https://github.com/haysan/kala/issues) | Laporan bug, permintaan fitur |
| 💬 **Discussions** | [GitHub Discussions](https://github.com/haysan/kala/discussions) | Pertanyaan, diskusi |
| 📧 **Email** | haysan@example.com | Pertanyaan sensitif |

---

## 🙏 Terima Kasih

Terima kasih kepada semua yang telah berkontribusi pada proyek ini:

- [Google Gemini](https://ai.google.dev/) - AI capabilities
- [xAI Grok](https://x.ai/) - Creative AI features
- [Turso](https://turso.tech/) - Edge database
- [Lucide Icons](https://lucide.dev/) - Beautiful icons
- [Framer Motion](https://www.framer.com/motion/) - Smooth animations
- Semua kontributor yang luar biasa!

---

<div align="center">

### ⭐ Beri bintang repo ini jika bermanfaat!

---

**Dibuat dengan ❤️ untuk Mahasiswa Indonesia dan Seluruh Dunia**

*Transformasikan perjalanan akademik Anda dengan KALA*

---

**[🔝 Kembali ke Atas](#-kala)**

</div>
