<div align="center">

<img src="https://img.shields.io/badge/KALA-Academic%20Intelligence%20OS-blue?style=for-the-badge&logo=graduation-cap" alt="KALA Badge" />

# 🎓 KALA

### Academic Intelligence Operating System

**Transform Academic Chaos into Cognitive Clarity**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Turso](https://img.shields.io/badge/Database-Turso-4FF8D2?style=flat-square)](https://turso.tech/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)

---

**🌐 Language / Bahasa:**

[🇬🇧 English](#-english) • [🇮🇩 Indonesia](#-indonesia)

</div>

---

# 🇬🇧 English

## 📖 About

**KALA** (Kala Academic Learning Assistant) is an AI-powered Academic Intelligence Operating System designed to revolutionize how students manage their academic workload. By leveraging cutting-edge AI technology, KALA transforms complex assignments into actionable cognitive roadmaps.

### 🎯 The Problem We Solve

| Problem | Solution |
|---------|----------|
| 😰 Academic Overwhelm | AI breaks down complex assignments into manageable steps |
| ⏰ Procrastination | Clear milestones and deadlines keep you on track |
| 📚 Information Overload | Smart document parsing extracts key concepts |
| 🎯 Lack of Structure | Systematic learning paths guide your progress |

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🧠 Neural Ingestion
AI-powered document parsing that extracts key information from PDFs, images, and text documents.

### 📚 Mini-Course Generation  
Comprehensive learning modules generated for each milestone with explanations and examples.

### ⚔️ Socratic Sparring
AI debate mode that challenges your understanding through critical questioning.

</td>
<td width="50%">

### 💬 Academic Mentor
Contextual AI tutoring providing personalized guidance based on your assignments.

### 🧪 Mastery Assessment
AI-generated quizzes and tests to validate your understanding.

### ⏱️ Focus Mode
Built-in Pomodoro timer with customizable intervals for deep work.

</td>
</tr>
</table>

### Additional Features

| Feature | Description |
|---------|-------------|
| 🧠 **Daily Synapse** | Daily micro-challenges to keep your mind sharp |
| 📅 **Calendar View** | Visual deadline tracking and study planning |
| 🌓 **Theme Support** | Beautiful light and dark modes |
| 🔐 **OAuth Login** | Secure authentication with Google & GitHub |
| 🌐 **Multi-language** | English and Indonesian support |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI Framework |
| TypeScript | 5.8 | Type Safety |
| Vite | 6 | Build Tool |
| TailwindCSS | 3.4 | Styling |
| Framer Motion | 12 | Animations |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20+ | Runtime |
| Express | 4.18 | API Framework |
| Drizzle ORM | Latest | Database ORM |
| Turso | libSQL | Edge Database |
| Passport.js | 0.7 | Authentication |

### AI Integration
| Provider | Role | Specialization |
|----------|------|----------------|
| Google Gemini | Primary | Document Analysis, Courses, Quizzes |
| xAI Grok | Secondary | Chat, Debate, Creative Tasks |

---

## 📦 Installation

### Prerequisites

- **Node.js** `>= 20.0.0`
- **npm** `>= 10.0.0`
- **Git**

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/haysan/kala.git
cd kala

# 2. Install dependencies
npm install
cd backend && npm install && cd ..

# 3. Setup environment variables
cp .env.example .env.local
cp backend/.env.example backend/.env
# Edit both files with your API keys

# 4. Start development servers
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend (new terminal)
npm run dev
```

### Access Points

| Service | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:3000 |
| 🔌 Backend API | http://localhost:3001 |
| 💚 Health Check | http://localhost:3001/health |

---

## 📁 Project Structure

```
KALA/
├── 📄 README.md                 # This file
├── 📄 README.id.md              # Indonesian README
├── 📄 CONTRIBUTING.md           # Contribution guidelines
├── 📄 LICENSE                   # MIT License
├── 📄 CHANGELOG.md              # Version history
├── 📄 SECURITY.md               # Security policy
│
├── � .github/                  # GitHub configuration
│   ├── ISSUE_TEMPLATE/          # Issue templates
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── FUNDING.yml
│
├── � docs/                     # 📚 Documentation
│   ├── PRD.md                   # Product Requirements
│   ├── API_DOCUMENTATION.md     # API Reference
│   ├── BACKEND_DATABASE_DESIGN.md
│   └── AI_ROUTER_GUIDE.md
│
├── 📂 components/               # 🎨 React Components
│   ├── AssignmentView.tsx       # Assignment details
│   ├── Dashboard.tsx            # Main dashboard
│   ├── TutorChat.tsx            # AI mentor chat
│   ├── DebateRoom.tsx           # Socratic sparring
│   ├── QuizView.tsx             # AI quizzes
│   ├── FocusMode.tsx            # Pomodoro timer
│   └── ...
│
├── 📂 services/                 # 🔌 Frontend Services
│   ├── geminiService.ts         # AI integration
│   ├── authService.ts           # Authentication
│   └── ...
│
├── 📂 pages/                    # 📄 Page Components
│   ├── about.tsx
│   ├── privacy.tsx
│   └── terms.tsx
│
├── 📂 backend/                  # 🖥️ Backend API
│   ├── src/
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Business logic
│   │   ├── db/                  # Database schema
│   │   ├── middleware/          # Express middleware
│   │   └── config/              # Configuration
│   ├── .env.example
│   └── package.json
│
├── � App.tsx                   # Main React App
├── 📄 index.tsx                 # Entry point
├── 📄 index.css                 # Global styles
├── � types.ts                  # TypeScript types
├── 📄 vite.config.ts            # Vite configuration
├── 📄 tailwind.config.js        # Tailwind configuration
└── 📄 package.json              # Dependencies
```

---

## 🔧 Environment Variables

### Frontend (`.env.local`)
```env
GEMINI_API_KEY=your-gemini-api-key
```

### Backend (`backend/.env`)
```env
# Database
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-token

# Authentication
JWT_SECRET=your-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d

# AI Providers
GEMINI_API_KEY=your-gemini-api-key
GROK_API_KEY=your-grok-api-key

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

---

## 📝 Available Scripts

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

### Backend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot-reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run production server |
| `npm run db:push` | Push schema to database |
| `npm test` | Run tests |

---

## � Deployment

### Recommended Setup

| Service | Platform | Free Tier |
|---------|----------|-----------|
| Frontend | Vercel / Netlify | ✅ Yes |
| Backend | Render / Koyeb | ✅ Yes |
| Database | Turso | ✅ Yes |

### Deploy to Render

1. Push code to GitHub
2. Connect repository to [Render](https://render.com)
3. Create Web Service for backend
4. Set environment variables
5. Deploy!

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [PRD.md](docs/PRD.md) | Product Requirements |
| [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) | API Reference |
| [BACKEND_DATABASE_DESIGN.md](docs/BACKEND_DATABASE_DESIGN.md) | Database Schema |
| [AI_ROUTER_GUIDE.md](docs/AI_ROUTER_GUIDE.md) | AI Integration Guide |
| [OAUTH_IMPLEMENTATION.md](docs/OAUTH_IMPLEMENTATION.md) | OAuth Setup |

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

---

---

# 🇮🇩 Indonesia

## � Tentang

**KALA** (Kala Academic Learning Assistant) adalah Sistem Operasi Kecerdasan Akademik berbasis AI yang dirancang untuk merevolusi cara mahasiswa mengelola beban akademik mereka. Dengan memanfaatkan teknologi AI mutakhir, KALA mengubah tugas-tugas kompleks menjadi peta jalan kognitif yang dapat ditindaklanjuti.

### 🎯 Masalah yang Kami Selesaikan

| Masalah | Solusi |
|---------|--------|
| 😰 Kewalahan Akademik | AI memecah tugas kompleks menjadi langkah-langkah terkelola |
| ⏰ Prokrastinasi | Milestone dan deadline yang jelas menjaga fokus Anda |
| 📚 Kelebihan Informasi | Parsing dokumen cerdas mengekstrak konsep kunci |
| 🎯 Kurang Struktur | Jalur pembelajaran sistematis memandu kemajuan Anda |

---

## ✨ Fitur Utama

<table>
<tr>
<td width="50%">

### 🧠 Neural Ingestion
Parsing dokumen berbasis AI yang mengekstrak informasi kunci dari PDF, gambar, dan dokumen teks.

### 📚 Pembuatan Mini-Course  
Modul pembelajaran komprehensif yang dihasilkan untuk setiap milestone dengan penjelasan dan contoh.

### ⚔️ Socratic Sparring
Mode debat AI yang menantang pemahaman Anda melalui pertanyaan kritis.

</td>
<td width="50%">

### 💬 Mentor Akademik
Tutoring AI kontekstual yang memberikan bimbingan personal berdasarkan tugas Anda.

### 🧪 Penilaian Penguasaan
Kuis dan tes yang dihasilkan AI untuk memvalidasi pemahaman Anda.

### ⏱️ Mode Fokus
Timer Pomodoro bawaan dengan interval yang dapat disesuaikan untuk deep work.

</td>
</tr>
</table>

### Fitur Tambahan

| Fitur | Deskripsi |
|-------|-----------|
| 🧠 **Daily Synapse** | Tantangan mikro harian untuk menjaga pikiran tetap tajam |
| 📅 **Tampilan Kalender** | Pelacakan deadline visual dan perencanaan belajar |
| 🌓 **Dukungan Tema** | Mode terang dan gelap yang indah |
| 🔐 **Login OAuth** | Autentikasi aman dengan Google & GitHub |
| 🌐 **Multi-bahasa** | Dukungan Bahasa Inggris dan Indonesia |

---

## 🛠️ Tech Stack

### Frontend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| React | 19 | Framework UI |
| TypeScript | 5.8 | Keamanan Tipe |
| Vite | 6 | Build Tool |
| TailwindCSS | 3.4 | Styling |
| Framer Motion | 12 | Animasi |

### Backend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Node.js | 20+ | Runtime |
| Express | 4.18 | Framework API |
| Drizzle ORM | Latest | Database ORM |
| Turso | libSQL | Database Edge |
| Passport.js | 0.7 | Autentikasi |

### Integrasi AI
| Provider | Peran | Spesialisasi |
|----------|-------|--------------|
| Google Gemini | Utama | Analisis Dokumen, Course, Kuis |
| xAI Grok | Sekunder | Chat, Debat, Tugas Kreatif |

---

## 📦 Instalasi

### Prasyarat

- **Node.js** `>= 20.0.0`
- **npm** `>= 10.0.0`
- **Git**

### Mulai Cepat

```bash
# 1. Clone repository
git clone https://github.com/haysan/kala.git
cd kala

# 2. Install dependencies
npm install
cd backend && npm install && cd ..

# 3. Setup environment variables
cp .env.example .env.local
cp backend/.env.example backend/.env
# Edit kedua file dengan API key Anda

# 4. Jalankan development servers
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend (terminal baru)
npm run dev
```

### Titik Akses

| Layanan | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:3000 |
| 🔌 Backend API | http://localhost:3001 |
| 💚 Health Check | http://localhost:3001/health |

---

## 📁 Struktur Proyek

```
KALA/
├── 📄 README.md                 # File ini
├── 📄 README.id.md              # README Indonesia
├── 📄 CONTRIBUTING.md           # Panduan kontribusi
├── 📄 LICENSE                   # Lisensi MIT
├── 📄 CHANGELOG.md              # Riwayat versi
├── 📄 SECURITY.md               # Kebijakan keamanan
│
├── 📂 .github/                  # Konfigurasi GitHub
│   ├── ISSUE_TEMPLATE/          # Template issue
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── FUNDING.yml
│
├── 📂 docs/                     # 📚 Dokumentasi
│   ├── PRD.md                   # Persyaratan Produk
│   ├── API_DOCUMENTATION.md     # Referensi API
│   ├── BACKEND_DATABASE_DESIGN.md
│   └── AI_ROUTER_GUIDE.md
│
├── 📂 components/               # 🎨 Komponen React
│   ├── AssignmentView.tsx       # Detail tugas
│   ├── Dashboard.tsx            # Dashboard utama
│   ├── TutorChat.tsx            # Chat mentor AI
│   ├── DebateRoom.tsx           # Socratic sparring
│   ├── QuizView.tsx             # Kuis AI
│   ├── FocusMode.tsx            # Timer Pomodoro
│   └── ...
│
├── 📂 services/                 # 🔌 Layanan Frontend
│   ├── geminiService.ts         # Integrasi AI
│   ├── authService.ts           # Autentikasi
│   └── ...
│
├── 📂 pages/                    # 📄 Komponen Halaman
│   ├── about.tsx
│   ├── privacy.tsx
│   └── terms.tsx
│
├── 📂 backend/                  # 🖥️ Backend API
│   ├── src/
│   │   ├── routes/              # Endpoint API
│   │   ├── services/            # Logika bisnis
│   │   ├── db/                  # Skema database
│   │   ├── middleware/          # Middleware Express
│   │   └── config/              # Konfigurasi
│   ├── .env.example
│   └── package.json
│
├── 📄 App.tsx                   # Aplikasi React Utama
├── 📄 index.tsx                 # Titik masuk
├── 📄 index.css                 # Style global
├── 📄 types.ts                  # Tipe TypeScript
├── 📄 vite.config.ts            # Konfigurasi Vite
├── 📄 tailwind.config.js        # Konfigurasi Tailwind
└── 📄 package.json              # Dependencies
```

---

## � Environment Variables

### Frontend (`.env.local`)
```env
GEMINI_API_KEY=api-key-gemini-anda
```

### Backend (`backend/.env`)
```env
# Database
TURSO_DATABASE_URL=libsql://database-anda.turso.io
TURSO_AUTH_TOKEN=token-anda

# Autentikasi
JWT_SECRET=kunci-rahasia-minimal-32-karakter
JWT_EXPIRES_IN=7d

# Provider AI
GEMINI_API_KEY=api-key-gemini-anda
GROK_API_KEY=api-key-grok-anda

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# OAuth (Opsional)
GOOGLE_CLIENT_ID=client-id-google-anda
GOOGLE_CLIENT_SECRET=client-secret-google-anda
GITHUB_CLIENT_ID=client-id-github-anda
GITHUB_CLIENT_SECRET=client-secret-github-anda
```

---

## 📝 Script yang Tersedia

### Frontend
| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk produksi |
| `npm run preview` | Preview build produksi |

### Backend
| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Jalankan dengan hot-reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Jalankan server produksi |
| `npm run db:push` | Push skema ke database |
| `npm test` | Jalankan test |

---

## 🚀 Deployment

### Setup yang Direkomendasikan

| Layanan | Platform | Tier Gratis |
|---------|----------|-------------|
| Frontend | Vercel / Netlify | ✅ Ya |
| Backend | Render / Koyeb | ✅ Ya |
| Database | Turso | ✅ Ya |

### Deploy ke Render

1. Push kode ke GitHub
2. Hubungkan repository ke [Render](https://render.com)
3. Buat Web Service untuk backend
4. Set environment variables
5. Deploy!

---

## 📚 Dokumentasi

| Dokumen | Deskripsi |
|---------|-----------|
| [PRD.md](docs/PRD.md) | Persyaratan Produk |
| [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) | Referensi API |
| [BACKEND_DATABASE_DESIGN.md](docs/BACKEND_DATABASE_DESIGN.md) | Skema Database |
| [AI_ROUTER_GUIDE.md](docs/AI_ROUTER_GUIDE.md) | Panduan Integrasi AI |
| [OAUTH_IMPLEMENTATION.md](docs/OAUTH_IMPLEMENTATION.md) | Setup OAuth |

---

## 🤝 Kontribusi

Kami menyambut kontribusi! Silakan lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk panduan.

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/fitur-keren`)
3. Commit perubahan (`git commit -m 'feat: tambah fitur keren'`)
4. Push ke branch (`git push origin feature/fitur-keren`)
5. Buka Pull Request

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT - lihat [LICENSE](LICENSE) untuk detail.

---

<div align="center">

### ⭐ Beri bintang repo ini jika bermanfaat!

**Dibuat dengan ❤️ untuk Mahasiswa di Seluruh Dunia**

*Transformasikan perjalanan akademik Anda dengan KALA*

---

**[🔝 Kembali ke Atas](#-kala)**

</div>
