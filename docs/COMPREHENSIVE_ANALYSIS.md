# Analisa Komprehensif KALA WebApp
## AI Academic Intelligence Operating System

---

## 📋 Executive Summary

**KALA** adalah sebuah WebApp Academic Intelligence OS yang dirancang untuk membantu mahasiswa mengatasi prokrastinasi dengan:
- Transformasi dokumen tugas menjadi roadmap kognitif terstruktur
- AI-powered mentoring dan validasi pemahaman
- Progress tracking real-time dengan risk detection
- Multi-modal AI integration (Gemini dan Grok)

---

## 🧠 1. Analisa Fitur & Fungsi

### 1.1 Fitur-Fitur yang Sudah Ada di UI

| # | Fitur | Komponen | Status | Deskripsi |
|---|-------|----------|--------|-----------|
| 1 | **Neural Ingestion** | `UploadAssignment.tsx` | ✅ Implemented | AI parsing dokumen tugas (PDF, Image, Text) |
| 2 | **Intelligence Vault** | `Dashboard.tsx` | ✅ Implemented | Repository pusat semua project/assignment |
| 3 | **Roadmap & Milestones** | `AssignmentView.tsx` | ✅ Implemented | List view + Knowledge Map SVG |
| 4 | **Mini-Course Generation** | `AssignmentView.tsx` | ✅ Implemented | AI-generated learning modules per milestone |
| 5 | **Socratic Sparring** | `DebateRoom.tsx` | ✅ Implemented | AI debate untuk validasi pemahaman |
| 6 | **Academic Mentor Chat** | `TutorChat.tsx` | ✅ Implemented | Contextual AI tutoring per assignment |
| 7 | **Mastery Assessment** | `QuizView.tsx` | ✅ Implemented | AI-generated 5-question MCQ quiz |
| 8 | **Focus Mode** | `FocusMode.tsx` | ✅ Implemented | 25-min Pomodoro timer |
| 9 | **Daily Synapse** | `DailySynapse.tsx` | ✅ Implemented | Daily micro-challenge questions |
| 10 | **Emergency Scaffolding** | `AssignmentView.tsx` | ✅ Implemented | Micro-burst tasks untuk academic freeze |
| 11 | **Calendar View** | `CalendarView.tsx` | ✅ Implemented | Monthly calendar dengan deadline markers |
| 12 | **Knowledge Map** | `KnowledgeMap.tsx` | ✅ Implemented | Visual SVG representation milestones |
| 13 | **The Vault (Files)** | `AssignmentView.tsx` | ✅ Implemented | File management per assignment |
| 14 | **Summative Validation** | `AssignmentView.tsx` | ✅ Implemented | Rubric-based final assessment |
| 15 | **Landing Page** | `LandingPage.tsx` | ✅ Implemented | Marketing/welcome page |

### 1.2 Alur Pengguna (User Flow)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              KALA USER JOURNEY                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

[Landing Page] ──▶ [Dashboard/Library] ──┬──▶ [New Project (Ingestion)]
                         │               │                 │
                         │               │                 ▼
                         │               │    [AI Analyzes Assignment]
                         │               │                 │
                         │               │                 ▼
                         │               │    [Milestones Generated]
                         │               │
                         ▼               │
                  [Select Project] ◀─────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    [Milestones]   [Tutor Chat]   [Calendar]
         │               │
         ▼               │
    [Load Mini-Course]   │
         │               │
    ┌────┴────┐          │
    ▼         ▼          │
[Quiz]   [Debate] ◀──────┘
                         
[Focus Mode] ◀── Any Point
[Daily Synapse] ◀── Dashboard

[Final: Validation] ──▶ [Summative Assessment]
```

### 1.3 Kebutuhan Data Per Fitur

| Fitur | Data Input | Data Output | Storage |
|-------|------------|-------------|---------|
| Ingestion | Text/File | Assignment + Milestones | Database |
| Dashboard | User ID | Assignment[] | Database |
| Milestones | Assignment ID | Milestone[] | Database |
| Mini-Course | Milestone Context | MiniCourse object | Database |
| Quiz | Assignment Context | QuizQuestion[] | Session |
| Debate | Milestone + MiniCourse | DebateTurn[] | Database |
| Chat | Assignment Context | ChatMessage[] | Database |
| Synapse | Assignment Status | DailySynapse | LocalStorage → DB |
| Validation | Work + Reflection | ValidationResult | Database |

---

## 🤖 2. Integrasi AI

### 2.1 AI Provider Saat Ini

| Provider | Status | Model Used | Purpose |
|----------|--------|------------|---------|
| **Google Gemini** | ✅ Primary | `gemini-2.0-flash`, `gemini-3-pro-preview` | Semua AI features |
| **Grok** | 🔜 Planned | TBD | Alternative provider |

### 2.2 Daftar Fitur AI

| # | Fitur AI | Endpoint/Function | Model | Response Type |
|---|----------|-------------------|-------|---------------|
| 1 | **Assignment Analysis** | `analyzeAssignment()` | gemini-2.0-flash | Structured JSON |
| 2 | **Mini-Course Generation** | `generateMiniCourse()` | gemini-2.0-flash | Structured JSON |
| 3 | **Daily Synapse** | `generateDailySynapse()` | gemini-2.0-flash | Plain text |
| 4 | **Scaffolding Task** | `generateScaffoldingTask()` | gemini-2.0-flash | Structured JSON |
| 5 | **Quiz Generation** | `generateQuiz()` | gemini-2.0-flash | JSON Array |
| 6 | **Work Validation** | `validateWork()` | gemini-2.0-flash | Structured JSON |
| 7 | **Tutor Chat** | `startTutorChat()` | gemini-3-flash-preview | Streaming chat |
| 8 | **Socratic Debate** | `startDebateSession()` | gemini-3-pro-preview | Streaming chat |

### 2.3 AI Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 services/geminiService.ts                    │   │
│  │  (Direct API calls - untuk development/demo)                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Express/Hono)                       │
│                                                                     │
│  ┌───────────────┐    ┌───────────────────────────────────────┐    │
│  │ routes/       │    │  services/gemini.service.ts            │    │
│  │ ai.routes.ts  │───▶│  - User API Key support                │    │
│  └───────────────┘    │  - Centralized AI logic                │    │
│                       └───────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
        ┌───────────────────┐     ┌───────────────────┐
        │   Google Gemini   │     │      Grok API     │
        │   (Primary)       │     │   (Planned)       │
        └───────────────────┘     └───────────────────┘
```

### 2.4 Saran Arsitektur Multi-AI (Grok + Gemini)

```typescript
// Proposed: AI Router Pattern

interface AIProvider {
  name: 'gemini' | 'grok';
  analyzeAssignment(text: string, fileData?: FileData): Promise<AnalyzedAssignment>;
  generateMiniCourse(...): Promise<MiniCourse>;
  generateQuiz(...): Promise<QuizQuestion[]>;
  chat(...): AsyncIterable<string>; // Streaming
}

class AIRouter {
  private providers: Map<string, AIProvider>;
  private defaultProvider: string = 'gemini';
  
  // User preference from settings
  getUserProvider(userId: string): AIProvider { ... }
  
  // Fallback strategy
  async withFallback<T>(operation: (provider: AIProvider) => Promise<T>): Promise<T> {
    try {
      return await operation(this.getPrimary());
    } catch {
      return await operation(this.getSecondary());
    }
  }
}
```

### 2.5 Rekomendasi Integrasi Grok

| Aspek | Rekomendasi |
|-------|-------------|
| **Provider Selection** | User dapat memilih di Settings (sudah ada `ai_provider` field) |
| **API Key Storage** | Sudah disiapkan: `gemini_api_key`, `grok_api_key` di Users table |
| **Fallback Strategy** | Jika satu provider gagal, otomatis switch ke provider lain |
| **Use Case Splitting** | Gemini untuk struktural (JSON), Grok untuk conversational |
| **Cost Optimization** | Flash models untuk quick tasks, Pro models untuk depth tasks |

---

## 📁 3. Analisa Struktur Folder

### 3.1 Overview Struktur Proyek

```
KALA/
├── 📄 App.tsx                    # Main React App (Router, State)
├── 📄 index.tsx                  # Entry point
├── 📄 index.html                 # HTML template
├── 📄 types.ts                   # TypeScript types/interfaces
├── 📄 vite.config.ts             # Vite bundler config
├── 📄 tsconfig.json              # TypeScript config
├── 📄 package.json               # Frontend dependencies
├── 📄 metadata.json              # App metadata
├── 📄 README.md                  # Documentation
├── 📄 .env.local                 # Environment variables
├── 📄 .gitignore                 # Git ignore rules
│
├── 📂 components/                # React UI Components
│   ├── AssignmentView.tsx        # Main assignment detail (largest: 34KB)
│   ├── UploadAssignment.tsx      # Upload/create assignment
│   ├── Dashboard.tsx             # Dashboard/Library view
│   ├── CalendarView.tsx          # Calendar visualization
│   ├── TutorChat.tsx             # AI chat interface
│   ├── DebateRoom.tsx            # Socratic sparring UI
│   ├── QuizView.tsx              # Quiz interface
│   ├── FocusMode.tsx             # Pomodoro timer
│   ├── DailySynapse.tsx          # Daily challenge
│   ├── KnowledgeMap.tsx          # SVG milestone map
│   └── LandingPage.tsx           # Marketing page
│
├── 📂 services/                  # Frontend Services
│   └── geminiService.ts          # Direct Gemini API calls
│
├── 📂 docs/                      # Documentation
│   ├── PRD.md                    # Product Requirements
│   ├── skill.md                  # Team Skills Matrix
│   ├── workflow.md               # Development Workflow
│   └── BACKEND_DATABASE_DESIGN.md # DB Design
│
└── 📂 backend/                   # Backend Application
    ├── package.json              # Backend dependencies
    ├── drizzle.config.ts         # Drizzle ORM config
    ├── tsconfig.json             # Backend TS config
    └── 📂 src/
        ├── index.ts              # Entry point
        ├── app.ts                # Express/Hono setup
        ├── 📂 config/            # Configuration
        ├── 📂 routes/            # API Routes
        │   ├── auth.routes.ts
        │   ├── assignments.routes.ts
        │   ├── milestones.routes.ts
        │   ├── ai.routes.ts
        │   ├── chat.routes.ts
        │   └── synapse.routes.ts
        ├── 📂 services/          # Business Logic
        │   ├── auth.service.ts
        │   ├── assignments.service.ts
        │   ├── milestones.service.ts
        │   └── gemini.service.ts
        ├── 📂 middleware/        # Middlewares
        ├── 📂 db/                # Database (Drizzle)
        ├── 📂 types/             # Backend Types
        └── 📂 utils/             # Utilities
```

### 3.2 Audit & Best Practices

| Aspek | Status | Rekomendasi |
|-------|--------|-------------|
| **Separation of Concerns** | ✅ Good | FE/BE clearly separated |
| **Component Organization** | ⚠️ Flat | Consider grouping by feature |
| **Types Centralization** | ✅ Good | `types.ts` di root |
| **Services Layer** | ✅ Good | Separate from components |
| **Documentation** | ✅ Excellent | PRD, skill.md, workflow.md |
| **Config Management** | ✅ Good | Env files, config folder |

### 3.3 Rekomendasi Refactoring Struktur

```
KALA/
├── 📂 src/                       # Move all source here
│   ├── 📂 components/
│   │   ├── 📂 common/            # Shared components
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── 📂 features/          # Feature-based grouping
│   │   │   ├── 📂 assignment/
│   │   │   │   ├── AssignmentView.tsx
│   │   │   │   ├── UploadAssignment.tsx
│   │   │   │   └── AssignmentCard.tsx
│   │   │   ├── 📂 ai/
│   │   │   │   ├── TutorChat.tsx
│   │   │   │   ├── DebateRoom.tsx
│   │   │   │   └── QuizView.tsx
│   │   │   └── 📂 dashboard/
│   │   │       ├── Dashboard.tsx
│   │   │       └── DailySynapse.tsx
│   │   └── 📂 layout/            # Layout components
│   ├── 📂 hooks/                 # Custom React hooks
│   │   ├── useAssignments.ts
│   │   ├── useAI.ts
│   │   └── useAuth.ts
│   ├── 📂 services/              # API services
│   ├── 📂 store/                 # State management (Zustand)
│   ├── 📂 types/                 # TypeScript types
│   └── 📂 utils/                 # Utility functions
│
├── 📂 .agent/                    # Agent Skills & Workflows
│   ├── 📂 skills/
│   │   └── SKILL.md
│   └── 📂 workflows/
│       └── dev-workflow.md
│
├── 📂 docs/                      # Documentation
└── 📂 backend/                   # Backend (unchanged)
```

### 3.4 Klasifikasi Folder Berdasarkan Fungsi

| Kategori | Folder/File | Deskripsi |
|----------|-------------|-----------|
| **UI Components** | `components/` | React UI components |
| **State/Logic** | `App.tsx`, `types.ts` | App state, type definitions |
| **Services** | `services/` | External API integrations |
| **Assets** | (inline in components) | Icons via Lucide |
| **Configuration** | `vite.config.ts`, `tsconfig.json` | Build configs |
| **Documentation** | `docs/` | PRD, skills, workflows |
| **Backend API** | `backend/src/routes/` | Express routes |
| **Backend Logic** | `backend/src/services/` | Business logic |
| **Database** | `backend/src/db/` | Drizzle schema |
| **Middleware** | `backend/src/middleware/` | Auth, validation, error |

### 3.5 Catatan: Folder `.agent` Tidak Ditemukan

> ⚠️ **Observasi**: Folder `.agent` dengan `skill.md` dan `workflow.md` **tidak ditemukan** di root project.
> 
> Dokumentasi skill dan workflow **tersedia** di folder `/docs/`:
> - `/docs/skill.md` - Team Skills Matrix
> - `/docs/workflow.md` - Development Workflow
> 
> **Rekomendasi**: Buat folder `.agent/` untuk Skill Agent documentation:
> ```
> .agent/
> ├── skills/
> │   └── SKILL.md
> └── workflows/
>     └── development.md
> ```

---

## 🔌 4. Saran Backend dan Database

### 4.1 Current Backend Stack

| Component | Technology | Status |
|-----------|------------|--------|
| Runtime | Node.js 20+ | ✅ |
| Framework | Express.js | ✅ |
| Database | Supabase (PostgreSQL) | ✅ |
| ORM | Drizzle ORM | ✅ |
| Auth | JWT + bcrypt | ✅ |
| Validation | Zod | ✅ |
| AI Provider | Google Gemini | ✅ |

### 4.2 Database Schema Summary (Supabase)

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `users` | User accounts | Has many: assignments, notifications |
| `assignments` | Academic projects | Belongs to: user. Has many: milestones, files |
| `milestones` | Task breakdown | Belongs to: assignment. Has one: mini_course |
| `mini_courses` | AI learning modules | Belongs to: milestone. Has many: debate_turns |
| `files` | Uploaded documents | Belongs to: assignment |
| `validation_results` | Assessment scores | Belongs to: assignment |
| `chat_sessions` | Tutor/Debate chats | Belongs to: assignment. Has many: messages |
| `chat_messages` | Chat history | Belongs to: session |
| `daily_synapses` | Daily challenges | Belongs to: user, assignment |
| `notifications` | User alerts | Belongs to: user |
| `templates` | Saved structures | Belongs to: user |
| `scaffolding_tasks` | Micro-burst tasks | Belongs to: assignment |

### 4.3 API Endpoints Summary

```
AUTH
├── POST /api/auth/register
├── POST /api/auth/login
├── GET  /api/auth/me
└── PUT  /api/auth/profile

ASSIGNMENTS
├── GET    /api/assignments
├── GET    /api/assignments/:id
├── POST   /api/assignments
├── PUT    /api/assignments/:id
└── DELETE /api/assignments/:id

MILESTONES
├── GET    /api/assignments/:id/milestones
├── POST   /api/assignments/:id/milestones
├── PUT    /api/milestones/:id
├── PUT    /api/milestones/:id/toggle
└── DELETE /api/milestones/:id

AI SERVICES
├── POST /api/ai/analyze-assignment
├── POST /api/ai/generate-mini-course
├── POST /api/ai/generate-synapse
├── POST /api/ai/generate-scaffold
├── POST /api/ai/generate-quiz
└── POST /api/ai/validate-work

CHAT
├── GET  /api/assignments/:id/chat
├── POST /api/chat/:sessionId/message
└── GET  /api/chat/:sessionId/history

SYNAPSE
├── GET  /api/synapse/today
└── POST /api/synapse/:id/complete
```

### 4.4 Saran Arsitektur untuk Multi-AI

```typescript
// backend/src/services/ai-router.service.ts

import { GeminiProvider } from './providers/gemini.provider';
import { GrokProvider } from './providers/grok.provider';

interface AIProviderConfig {
  gemini?: { apiKey: string };
  grok?: { apiKey: string };
}

export class AIRouterService {
  private providers: Map<string, AIProvider> = new Map();
  
  constructor() {
    this.providers.set('gemini', new GeminiProvider());
    this.providers.set('grok', new GrokProvider());
  }
  
  getProvider(preference: 'gemini' | 'grok', config: AIProviderConfig): AIProvider {
    const provider = this.providers.get(preference);
    if (!provider) throw new Error(`Provider ${preference} not found`);
    
    // Configure with user's API key
    provider.configure(config[preference]);
    return provider;
  }
  
  async withFallback<T>(
    preference: 'gemini' | 'grok',
    config: AIProviderConfig,
    operation: (provider: AIProvider) => Promise<T>
  ): Promise<T> {
    const primary = this.getProvider(preference, config);
    const secondary = preference === 'gemini' ? 'grok' : 'gemini';
    
    try {
      return await operation(primary);
    } catch (error) {
      console.warn(`Primary provider ${preference} failed, trying ${secondary}`);
      const fallback = this.getProvider(secondary as any, config);
      return await operation(fallback);
    }
  }
}
```

### 4.5 Saran Tambahan

| Area | Rekomendasi |
|------|-------------|
| **Caching** | Redis untuk AI response caching |
| **Rate Limiting** | Per-user rate limits untuk AI endpoints |
| **File Storage** | Cloudflare R2 atau AWS S3 |
| **Real-time** | WebSocket untuk chat (optional) |
| **Monitoring** | Sentry untuk error tracking |
| **Logging** | Structured logging dengan Pino |

---

## 📄 5. Daftar File Penting

### 5.1 Frontend Core Files

| File | Ukuran | Tujuan |
|------|--------|--------|
| `App.tsx` | 11.6KB | Main app, routing, state management |
| `types.ts` | 2.8KB | TypeScript interfaces |
| `index.tsx` | 351B | React DOM entry |
| `vite.config.ts` | 580B | Vite bundler config |

### 5.2 UI Components (by size/importance)

| Component | Ukuran | Fitur |
|-----------|--------|-------|
| `AssignmentView.tsx` | 34KB | ⭐ Main assignment detail, milestones |
| `LandingPage.tsx` | 18.8KB | Marketing/welcome page |
| `UploadAssignment.tsx` | 10.1KB | AI ingestion, file upload |
| `DebateRoom.tsx` | 8KB | Socratic debate with AI |
| `QuizView.tsx` | 7.4KB | AI quiz generation |
| `DailySynapse.tsx` | 6.7KB | Daily challenge |
| `CalendarView.tsx` | 6.5KB | Calendar view |
| `TutorChat.tsx` | 6.3KB | AI mentor chat |
| `Dashboard.tsx` | 6.1KB | Library/dashboard |
| `KnowledgeMap.tsx` | 4.5KB | SVG milestone visualization |
| `FocusMode.tsx` | 3.8KB | Pomodoro timer |

### 5.3 Services

| File | Ukuran | Lokasi | Tujuan |
|------|--------|--------|--------|
| `geminiService.ts` (FE) | 10.3KB | `services/` | Frontend AI calls |
| `gemini.service.ts` (BE) | 12.8KB | `backend/src/services/` | Backend AI service |
| `auth.service.ts` | 3.9KB | `backend/src/services/` | Authentication |
| `assignments.service.ts` | 5.9KB | `backend/src/services/` | Assignment CRUD |
| `milestones.service.ts` | 6KB | `backend/src/services/` | Milestone CRUD |

### 5.4 Documentation

| File | Ukuran | Tujuan |
|------|--------|--------|
| `docs/PRD.md` | 14KB | Product Requirements Document |
| `docs/skill.md` | 17KB | Agency Team Skills Matrix |
| `docs/workflow.md` | 15.9KB | Development Process Workflow |
| `docs/BACKEND_DATABASE_DESIGN.md` | 27.8KB | Complete DB + API Design |

### 5.5 Backend Routes

| Route File | Endpoints | Tujuan |
|------------|-----------|--------|
| `auth.routes.ts` | 4 | Authentication |
| `assignments.routes.ts` | 5 | Assignment CRUD |
| `milestones.routes.ts` | 5 | Milestone management |
| `ai.routes.ts` | 6 | AI services |
| `chat.routes.ts` | 3 | Chat sessions |
| `synapse.routes.ts` | 2 | Daily synapse |

---

## 📊 6. Summary Tables

### 6.1 Fitur AI vs Non-AI

| Kategori | Fitur | AI-Powered |
|----------|-------|------------|
| **Ingestion** | Assignment Analysis | ✅ Yes |
| **Learning** | Mini-Course Generation | ✅ Yes |
| **Learning** | Quiz Generation | ✅ Yes |
| **Validation** | Daily Synapse | ✅ Yes |
| **Validation** | Socratic Debate | ✅ Yes |
| **Validation** | Work Validation | ✅ Yes |
| **Support** | Tutor Chat | ✅ Yes |
| **Support** | Scaffolding Tasks | ✅ Yes |
| **Productivity** | Focus Mode | ❌ No |
| **Productivity** | Calendar View | ❌ No |
| **Management** | Dashboard | ❌ No |
| **Management** | File Vault | ❌ No |

### 6.2 Technology Stack Summary

| Layer | Technology | 
|-------|------------|
| **Frontend** | React 18+, TypeScript, Vite |
| **Styling** | Tailwind CSS, Custom dark mode |
| **Icons** | Lucide React |
| **Backend** | Node.js 20+, Express.js |
| **Database** | Supabase (PostgreSQL) |
| **ORM** | Drizzle ORM |
| **Auth** | JWT + bcrypt |
| **Validation** | Zod |
| **AI Primary** | Google Gemini (gemini-2.0-flash) |
| **AI Planned** | Grok (xAI) |

### 6.3 Development Phases (from PRD)

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1 | MVP Foundation | ✅ Completed |
| Phase 2 | Core Intelligence | ✅ Completed |
| Phase 3 | Advanced Features | 🔄 In Progress |
| Phase 4 | Polish & Optimization | 🔜 Pending |

---

## ⚠️ Asumsi Teknis

Berikut asumsi yang diambil berdasarkan analisa kode:

1. **Dual AI Integration**: User settings sudah menyimpan `ai_provider`, `gemini_api_key`, `grok_api_key` - menunjukkan rencana support multi-AI
2. **Language Support**: Field `ai_language` menunjukkan AI responses bisa multilingual
3. **File Storage**: Saat ini menggunakan in-memory/base64, production akan pakai cloud storage
4. **Auth Flow**: JWT-based tanpa refresh token (simplified)
5. **Real-time Chat**: Menggunakan polling/request-response, bukan WebSocket
6. **State Management**: React useState + localStorage, belum centralized state (Zustand/Redux)
7. **Testing**: Test infrastructure belum terdeteksi di struktur proyek

---

## 🎯 Action Items & Recommendations

### High Priority
1. ✅ Setup folder `.agent/` dengan SKILL.md dan workflows
2. 🔄 Implement Grok provider sebagai alternative AI
3. 🔜 Add proper error handling dan retry logic untuk AI calls
4. 🔜 Implement file upload ke cloud storage

### Medium Priority
1. 📦 Refactor components ke feature-based structure
2. 📦 Add custom hooks untuk shared logic
3. 📦 Implement centralized state management
4. 📦 Add unit tests untuk critical paths

### Low Priority
1. 💫 Add WebSocket untuk real-time chat
2. 💫 Implement PWA capabilities
3. 💫 Add analytics tracking
4. 💫 Performance optimization (lazy loading, memoization)

---

*Dokumen ini dibuat berdasarkan analisa kode pada 23 Januari 2026*
