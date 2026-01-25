# Product Requirement Document (PRD)
## Kala - Academic Intelligence Operating System

---

## 1. Latar Belakang & Visi Produk

### 1.1 Latar Belakang
Mahasiswa sering menghadapi tantangan dalam mengelola tugas akademis yang kompleks. Prokrastinasi, "blank page syndrome", dan kurangnya struktur dalam mengerjakan tugas menjadi hambatan utama dalam mencapai hasil akademis yang optimal.

### 1.2 Visi Produk
**Kala** adalah sebuah AI Academic Operating System yang dirancang untuk menghilangkan prokrastinasi dengan mensintesis silabus kompleks menjadi roadmap kognitif yang dapat ditindaklanjuti. Kala bertindak sebagai mentor akademis berbasis AI yang membantu mahasiswa memecah tugas besar menjadi milestone yang dapat dikelola, menyediakan validasi konseptual melalui debat Socratic, dan melacak kemajuan secara real-time.

### 1.3 Problem Statement
| Problem | Impact | Kala Solution |
|---------|--------|---------------|
| Tugas akademis terasa overwhelming | Prokrastinasi, deadline terlewat | AI-powered breakdown menjadi milestone terstruktur |
| Tidak tahu harus mulai dari mana | "Blank page syndrome" | Scaffolding task untuk memulai dengan friction rendah |
| Kurang pemahaman konseptual | Hasil tugas tidak optimal | Mini-course & Socratic sparring untuk validasi pemahaman |
| Tidak ada feedback real-time | Tidak tahu apakah sudah on-track | Progress tracking, risk detection, dan AI mentor chat |

---

## 2. Fitur Utama Berdasarkan UI

### 2.1 🧠 Neural Ingestion (Assignment Upload)
**Deskripsi:** Sistem parsing dokumen/teks tugas menggunakan AI untuk mengekstrak informasi kunci.

**Kapabilitas:**
- Upload dokumen (PDF, DOCX, Image)
- Paste teks instruksi tugas
- Penggunaan template dari tugas sebelumnya
- AI extraction: title, course, deadline, rubrics, learning outcome
- Auto-generation milestone pedagogi

**Acceptance Criteria:**
- [ ] User dapat upload file hingga 10MB
- [ ] AI mengekstrak minimal 5 field: title, description, deadline, course, rubrics
- [ ] Sistem generate minimum 3 milestone per assignment
- [ ] Proses ingestion selesai dalam < 30 detik

---

### 2.2 📚 Intelligence Vault (Dashboard)
**Deskripsi:** Repository pusat untuk semua project/assignment.

**Kapabilitas:**
- Grid view assignment berdasarkan course
- Progress tracking per assignment (maturity index)
- Risk indicator untuk assignment yang at-risk
- Metric cards: Active Risk, Domains, Total Assets
- Daily Synapse integration

**Acceptance Criteria:**
- [ ] Assignment grouped by course automatically
- [ ] Progress percentage akurat berdasarkan milestone completion
- [ ] At-risk indicator muncul jika deadline < 48 jam dan progress 0%
- [ ] Quick delete functionality dengan konfirmasi

---

### 2.3 🗺️ Roadmap & Milestone Management
**Deskripsi:** Sistem tracking milestone dengan visualisasi list dan knowledge map.

**Kapabilitas:**
- List view dengan detail milestone
- Knowledge Map (SVG visualization)
- Toggle completion status
- Load Mini-Course untuk setiap milestone
- Estimated time per milestone
- Deadline per milestone

**Acceptance Criteria:**
- [ ] Toggle milestone status (TODO ↔ COMPLETED)
- [ ] Progress auto-update saat milestone berubah
- [ ] Knowledge map menampilkan nodes dengan status visual
- [ ] Mastery status tracking (untested, refined, perfected)

---

### 2.4 📖 Mini-Course Generation
**Deskripsi:** AI-generated comprehensive module untuk setiap milestone.

**Kapabilitas:**
- Learning Outcome (Bloom's Taxonomy)
- Overview (The "Why")
- Concepts list (The "What")
- Practical Guide (The "How")
- Formative Action (verification task)
- Expert Tip

**Acceptance Criteria:**
- [ ] Mini-course digenerate menggunakan Gemini Pro
- [ ] Practical Guide minimum 300 kata
- [ ] Formative action trackable (completed/not completed)
- [ ] Content contextual berdasarkan assignment

---

### 2.5 ⚔️ Socratic Sparring (Debate Room)
**Deskripsi:** AI-driven debate untuk validasi pemahaman konseptual.

**Kapabilitas:**
- Real-time chat dengan AI challenger
- Intellectual Tension meter (0-100%)
- Challenge assumptions dengan teknik Socratic
- Mastery verdict (refined/perfected)
- Debate history storage

**Acceptance Criteria:**
- [ ] AI memulai dengan opening challenge
- [ ] Tension meter meningkat berdasarkan quality argumentation
- [ ] Mastery dapat dicapai jika tension > 85%
- [ ] Debate history tersimpan di milestone

---

### 2.6 💬 Academic Mentor (Tutor Chat)
**Deskripsi:** AI chat assistant dengan konteks assignment.

**Kapabilitas:**
- Contextual tutoring berdasarkan assignment
- Persistent chat session per assignment
- Supportive academic tone
- Bridge gap antara current knowledge dan learning outcome

**Acceptance Criteria:**
- [ ] Chat session unique per assignment
- [ ] AI response dalam tone akademis profesional
- [ ] Message history maintained selama session
- [ ] Typing indicator saat AI processing

---

### 2.7 🧪 Mastery Assessment (Quiz)
**Deskripsi:** AI-generated multiple choice quiz untuk self-assessment.

**Kapabilitas:**
- 5-question quiz generation
- 4 options per question
- Explanation untuk setiap jawaban
- Score tracking dan pass/fail indication
- Retake functionality

**Acceptance Criteria:**
- [ ] Quiz generated berdasarkan assignment content
- [ ] Correct answer index 0-3
- [ ] Pass threshold 70% (3.5/5)
- [ ] Explanation shown setelah answer selection

---

### 2.8 ⏱️ Focus Mode (Pomodoro)
**Deskripsi:** Distraction-free timer untuk deep work session.

**Kapabilitas:**
- 25-minute countdown timer
- Play/Pause/Reset controls
- Target milestone display (optional)
- Mark as Complete functionality
- Full-screen immersive UI

**Acceptance Criteria:**
- [ ] Timer countdown accurate
- [ ] Fullscreen mode dengan minimal UI
- [ ] Can mark milestone complete dari focus mode
- [ ] Exit button untuk kembali ke assignment view

---

### 2.9 🧠 Daily Synapse
**Deskripsi:** Daily micro-challenge untuk maintaining intellectual momentum.

**Kapabilitas:**
- One provocative question per day
- Context-aware berdasarkan assignment yang paling urgent
- 60-second response input
- Clarity Score reward (+15 pts)

**Acceptance Criteria:**
- [ ] Satu synapse per hari per user
- [ ] Question personalized berdasarkan assignment state
- [ ] Response stored dengan timestamp
- [ ] Clarity score terakumulasi di assignment

---

### 2.10 ⚡ Emergency Scaffolding
**Deskripsi:** Intervention untuk "Academic Freeze" (0% progress + deadline imminent).

**Kapabilitas:**
- Auto-detect freeze condition
- AI-generated micro-burst task (< 5 min)
- Countdown timer untuk task
- Mark as complete functionality

**Acceptance Criteria:**
- [ ] Trigger jika progress 0% dan deadline < 48 jam
- [ ] Task generated dengan duration < 300 seconds
- [ ] Visual urgency dengan emergency styling
- [ ] One-click completion

---

### 2.11 📁 The Vault (File Management)
**Deskripsi:** Evidence repository untuk file terkait assignment.

**Kapabilitas:**
- Drag & drop file upload
- File type classification (instruction, draft, final, feedback)
- File preview staging area
- Filter dan search functionality
- Delete with confirmation

**Acceptance Criteria:**
- [ ] Multiple file upload support
- [ ] File categorization per type
- [ ] Search by filename
- [ ] File metadata: name, type, timestamp, size

---

### 2.12 📊 Summative Assessment (Validation)
**Deskripsi:** Final work validation berdasarkan rubrics.

**Kapabilitas:**
- Text input untuk final output
- Reflection text input
- AI-powered rubric scoring (1-4 scale)
- Strengths/Weaknesses analysis
- Recommendations list
- Validation history tracking

**Acceptance Criteria:**
- [ ] Scoring berdasarkan 4 criteria (Task Alignment, Analytical Rigor, Conceptual Precision, Metacognitive Reflection)
- [ ] Overall score aggregation
- [ ] Validation history tersimpan per assignment
- [ ] Assessment date tracked

---

### 2.13 📅 Calendar View
**Deskripsi:** Monthly calendar visualization untuk deadlines dan milestones.

**Kapabilitas:**
- Monthly grid view
- Event markers: milestones, final deadlines
- Risk indicators per day
- Navigation (prev/next month)
- Legend untuk event types

**Acceptance Criteria:**
- [ ] Accurate day/month calculation
- [ ] Events positioned pada correct date
- [ ] At-risk visual differentiation
- [ ] Completed milestone styling

---

## 3. Persona Pengguna

### 3.1 Primary Persona: "The Overwhelmed University Student"
| Attribute | Description |
|-----------|-------------|
| **Nama** | Sarah, 21 tahun |
| **Pendidikan** | S1 Semester 5, Jurusan Sosiologi |
| **Tech Savviness** | Medium (familiar dengan Google Docs, Notion) |
| **Pain Points** | Sering prokrastinasi, tidak tahu harus mulai dari mana, deadline menumpuk |
| **Goals** | Menyelesaikan tugas tepat waktu, memahami materi lebih dalam |
| **Behavior** | Cenderung "last minute", butuh external accountability |

### 3.2 Secondary Persona: "The High-Achiever Graduate Student"
| Attribute | Description |
|-----------|-------------|
| **Nama** | Andi, 24 tahun |
| **Pendidikan** | S2 Semester 2, Jurusan Filsafat |
| **Tech Savviness** | High (familiar dengan productivity tools) |
| **Pain Points** | Tugas research-heavy, butuh validasi konseptual |
| **Goals** | Mencapai deep understanding, publish-quality work |
| **Behavior** | Methodical, appreciates structure and rigor |

---

## 4. User Stories & Acceptance Criteria

### Epic 1: Assignment Management
| ID | User Story | Priority |
|----|------------|----------|
| US-001 | As a student, I want to upload my assignment document so that AI can analyze and structure it | P0 |
| US-002 | As a student, I want to see all my assignments in a dashboard so that I can track overall progress | P0 |
| US-003 | As a student, I want to delete completed assignments so that my dashboard stays clean | P1 |
| US-004 | As a student, I want to save assignment structure as template so that I can reuse it | P2 |

### Epic 2: Learning & Understanding
| ID | User Story | Priority |
|----|------------|----------|
| US-010 | As a student, I want to load mini-courses for each milestone so that I understand what to do | P0 |
| US-011 | As a student, I want to chat with AI tutor so that I can ask questions contextually | P0 |
| US-012 | As a student, I want to debate my understanding with AI so that I can validate my knowledge | P1 |
| US-013 | As a student, I want to take AI-generated quizzes so that I can self-assess | P1 |

### Epic 3: Productivity & Focus
| ID | User Story | Priority |
|----|------------|----------|
| US-020 | As a student, I want to use focus mode timer so that I can concentrate on work | P1 |
| US-021 | As a student, I want daily synapse questions so that I maintain momentum | P2 |
| US-022 | As a student, I want emergency scaffolding so that I can break through freezes | P1 |

### Epic 4: Progress & Validation
| ID | User Story | Priority |
|----|------------|----------|
| US-030 | As a student, I want to track milestone completion so that I see my progress | P0 |
| US-031 | As a student, I want to validate my final work so that I know if it meets rubrics | P1 |
| US-032 | As a student, I want calendar view so that I can visualize all deadlines | P1 |

---

## 5. Roadmap Pengembangan

### Phase 1: MVP Foundation (Sprint 1-2)
- [ ] Backend authentication (JWT)
- [ ] Database schema implementation (Turso)
- [ ] Assignment CRUD API
- [ ] Milestone management API
- [ ] Basic AI integration for analysis

### Phase 2: Core Intelligence (Sprint 3-4)
- [ ] Mini-course generation API
- [ ] Tutor chat API with session management
- [ ] Quiz generation API
- [ ] Daily synapse generation API

### Phase 3: Advanced Features (Sprint 5-6)
- [ ] Debate room (Socratic sparring) API
- [ ] Validation/assessment API
- [ ] File upload & vault management
- [ ] Calendar data aggregation API

### Phase 4: Polish & Optimization (Sprint 7-8)
- [ ] Performance optimization
- [ ] Error handling & retry logic
- [ ] Analytics & usage tracking
- [ ] User settings & preferences

---

## 6. Metrik Keberhasilan

| Metric | Target | Measurement |
|--------|--------|-------------|
| Assignment Completion Rate | > 80% | % assignments marked complete before deadline |
| User Engagement | > 3 sessions/week | Average login frequency per user |
| Time to First Milestone | < 24 hours | Time from assignment creation to first milestone completion |
| AI Feature Usage | > 60% | % users using AI features (tutor, quiz, debate) |
| User Satisfaction | > 4.0/5.0 | In-app rating or NPS |

---

## 7. Asumsi Teknis

> [!IMPORTANT]
> **Asumsi berikut diambil berdasarkan analisis frontend:**

1. **AI Provider:** Menggunakan Google Gemini API (gemini-3-flash-preview dan gemini-3-pro-preview)
2. **Database:** Turso (libSQL) untuk persistent storage
3. **Authentication:** JWT-based dengan user sessions
4. **File Storage:** Cloud storage (S3-compatible) untuk file vault
5. **Real-time:** WebSocket tidak diperlukan untuk MVP, polling acceptable
6. **Multi-tenancy:** Single user mode untuk MVP, multi-user untuk Phase 2

---

## 8. Appendix

### 8.1 Data Types Reference
```typescript
// Core entities derived from frontend types.ts
- Assignment: Full assignment with milestones, files, validation history
- Milestone: Individual unit with mini-course, status tracking
- MiniCourse: AI-generated comprehensive learning module
- FileEntry: Uploaded file metadata
- ValidationResult: Rubric-based assessment result
- Notification: User notification system
- DailySynapse: Daily challenge question
- ChatMessage: Tutor chat message
- QuizQuestion: AI-generated quiz item
- DebateTurn: Socratic debate exchange
```

### 8.2 AI Prompts Used
- Assignment analysis prompt (extract pedagogy)
- Mini-course generation prompt (comprehensive module)
- Daily synapse prompt (provocative question)
- Scaffolding task prompt (low-friction burst)
- Validation prompt (rubric assessment)
- Quiz generation prompt (MCQ creation)
- Debate system prompt (Socratic challenger)
- Tutor system prompt (academic mentor)
