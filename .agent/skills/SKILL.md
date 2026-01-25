---
name: KALA Full-Stack Development Skills
description: Complete skill matrix for agency developer team building KALA Academic Intelligence OS
---

# 🎓 KALA Development Skill Matrix
## Agency Developer Team - Complete Role & Skill Guide

---

## 📌 Executive Summary

Dokumen ini mendefinisikan semua peran, keahlian, dan tanggung jawab yang dibutuhkan oleh tim agency developer untuk mengembangkan **KALA** dari frontend-only menjadi fullstack application lengkap dengan:
- Backend API (Node.js + Express)
- Database (Turso/libSQL)
- AI Integration (Gemini + Grok)
- Production Deployment

---

## 1. 💻 Frontend Developer

### 📋 Deskripsi Peran
Bertanggung jawab atas pengembangan dan penyempurnaan antarmuka pengguna (UI) berdasarkan desain yang ada, termasuk integrasi dengan backend API dan optimasi performa client-side.

### � Hard Skills

| Skill | Level | Description |
|-------|-------|-------------|
| **HTML5/CSS3** | Advanced | Semantic markup, CSS Grid/Flexbox, responsive design |
| **JavaScript/TypeScript** | Advanced | ES6+, async/await, strict type safety |
| **React 18+** | Advanced | Hooks, Context, Suspense, Concurrent Features |
| **Tailwind CSS** | Advanced | Utility-first CSS, custom design systems |
| **State Management** | Intermediate | Zustand, React Query, localStorage patterns |
| **API Integration** | Intermediate | REST, fetch/axios, error handling, caching |
| **Build Tools** | Intermediate | Vite, module bundlers, tree shaking |
| **Testing** | Intermediate | Vitest, React Testing Library, Playwright |

### 🔧 Browser DevTools Skills

| Skill | Application |
|-------|-------------|
| **Elements Panel** | DOM inspection, CSS debugging, layout analysis |
| **Console** | Error debugging, logging, JavaScript execution |
| **Network Panel** | API request/response analysis, timing, caching |
| **Performance** | FPS monitoring, reflow/repaint analysis, profiling |
| **React DevTools** | Component tree, state inspection, profiler |
| **Lighthouse** | Performance, accessibility, SEO audits |
| **Device Emulation** | Mobile testing, responsive validation |
| **Application Panel** | LocalStorage, cookies, service workers |

### 🛠️ Tools & Stack

| Category | Tools |
|----------|-------|
| **IDE** | VS Code + ESLint, Prettier, TypeScript extensions |
| **Design** | Figma (dev handoff) |
| **API Testing** | Postman, Thunder Client |
| **Browser** | Chrome DevTools, React DevTools |
| **Version Control** | Git, GitHub |

### ✅ Tanggung Jawab Utama

- [ ] Membangun komponen React sesuai design system
- [ ] Integrasi dengan backend API endpoints
- [ ] Implementasi state management
- [ ] Optimasi performa (lazy loading, code splitting, memoization)
- [ ] Responsive design untuk semua screen sizes
- [ ] Implementasi dark/light mode theming
- [ ] Error boundaries dan fallback UI
- [ ] Accessibility (WCAG 2.1 compliance)
- [ ] Unit testing untuk komponen kritis

---

## 2. ⚙️ Backend Developer

### � Deskripsi Peran
Membangun API dan logika bisnis, termasuk autentikasi, integrasi database, dan koneksi ke layanan AI eksternal (Gemini dan Grok).

### 💪 Hard Skills

| Skill | Level | Description |
|-------|-------|-------------|
| **Node.js 20+** | Advanced | Event loop, streams, async patterns, ESM |
| **Express.js** | Advanced | Routing, middleware, error handling |
| **TypeScript** | Advanced | Strict typing, generics, type inference |
| **REST API Design** | Advanced | Resource naming, HTTP methods, status codes |
| **Authentication** | Advanced | JWT, bcrypt, session management, OAuth |
| **SQL/libSQL** | Intermediate | Query optimization, transactions, migrations |
| **ORM (Drizzle)** | Intermediate | Schema design, relations, type-safe queries |
| **Testing** | Intermediate | Vitest, Supertest, mocking strategies |
| **Error Handling** | Advanced | Centralized error middleware, logging |

### 🔧 Debugging Skills

| Skill | Application |
|-------|-------------|
| **Node.js Debugger** | VS Code debugger, breakpoints, watch expressions |
| **Structured Logging** | Winston, Pino, custom logger implementation |
| **API Testing** | Postman collections, curl, automated tests |
| **Error Tracing** | Stack traces, source maps, error middleware |
| **Memory Profiling** | Heap snapshots, memory leak detection |
| **Database Debugging** | Query logging, EXPLAIN analysis |

### 🛠️ Tools & Stack

| Category | Tools |
|----------|-------|
| **Runtime** | Node.js 20+, npm/pnpm |
| **Framework** | Express.js |
| **Database** | Turso (libSQL), Drizzle ORM |
| **Auth** | jsonwebtoken, bcrypt |
| **Validation** | Zod |
| **Testing** | Vitest, Supertest |
| **Documentation** | OpenAPI/Swagger |

### ✅ Tanggung Jawab Utama

- [ ] Merancang arsitektur API RESTful
- [ ] Implementasi semua CRUD endpoints
- [ ] Integrasi dengan Gemini dan Grok AI APIs
- [ ] Sistem autentikasi JWT lengkap
- [ ] Middleware (auth, validation, rate limiting, logging)
- [ ] Error handling terpusat
- [ ] Database migrations dan seeding
- [ ] API documentation (OpenAPI spec)
- [ ] Unit dan integration testing

---

## 3. 🗄️ Database Engineer

### � Deskripsi Peran
Merancang, mengimplementasikan, dan mengelola database menggunakan Turso (libSQL), termasuk optimasi query dan strategi backup.

### 💪 Hard Skills

| Skill | Level | Description |
|-------|-------|-------------|
| **SQL** | Advanced | Complex queries, CTEs, window functions, subqueries |
| **SQLite/libSQL** | Advanced | Turso-specific features, edge deployment |
| **Database Design** | Advanced | Normalization (3NF), ER diagrams, constraints |
| **Drizzle ORM** | Intermediate | Schema design, migrations, type-safe queries |
| **Query Optimization** | Intermediate | EXPLAIN, index strategies, query planning |
| **Data Modeling** | Intermediate | Entity relationships, JSON columns, denormalization |

### 🛠️ Tools & Stack

| Category | Tools |
|----------|-------|
| **Database** | Turso, SQLite, libSQL |
| **ORM** | Drizzle ORM |
| **GUI** | TablePlus, DBeaver, Turso CLI |
| **Migrations** | Drizzle Kit |
| **Monitoring** | Turso Dashboard |
| **ERD Design** | dbdiagram.io, Lucidchart |

### ✅ Tanggung Jawab Utama

- [ ] Desain schema database lengkap
- [ ] Implementasi DDL (CREATE TABLE scripts)
- [ ] Strategi indexing untuk frequently-used queries
- [ ] Normalisasi data hingga 3NF
- [ ] Migration scripts untuk schema changes
- [ ] Seed data untuk development/testing
- [ ] Query optimization dan performance tuning
- [ ] Backup strategy dan disaster recovery

---

## 4. 🤖 AI Engineer

### 📋 Deskripsi Peran
Mengintegrasikan dan mengoptimalkan layanan AI (Gemini dan Grok), termasuk prompt engineering, response handling, dan fallback strategies.

### 💪 Hard Skills

| Skill | Level | Description |
|-------|-------|-------------|
| **Prompt Engineering** | Advanced | System prompts, few-shot learning, structured output |
| **Google Gemini API** | Advanced | Models, multimodal, streaming, JSON mode |
| **xAI Grok API** | Intermediate | OpenAI-compatible SDK, chat completions |
| **LLM Concepts** | Intermediate | Tokens, temperature, context windows |
| **Error Handling** | Advanced | Rate limits, retries, fallback strategies |
| **Response Parsing** | Intermediate | JSON schema validation, type safety |

### 🔧 AI Provider Comparison

| Feature | Gemini | Grok |
|---------|--------|------|
| **Best For** | Structured JSON, multimodal | Conversational, reasoning |
| **Models** | gemini-2.0-flash, gemini-pro | grok-2, grok-2-vision |
| **SDK** | @google/genai | OpenAI SDK compatible |
| **JSON Mode** | Native responseSchema | json_object format |
| **Streaming** | Supported | Supported |

### 🛠️ Tools & Stack

| Category | Tools |
|----------|-------|
| **Gemini** | @google/genai SDK |
| **Grok** | OpenAI SDK with custom baseURL |
| **Testing** | Manual prompt testing, playground |
| **Monitoring** | Request logging, cost tracking |

### ✅ Tanggung Jawab Utama

- [ ] Implementasi Gemini service layer
- [ ] Implementasi Grok service layer
- [ ] AI Router dengan fallback strategy
- [ ] Prompt optimization untuk setiap use case
- [ ] Response validation dan type safety
- [ ] Token usage monitoring
- [ ] Error handling untuk API failures
- [ ] Multi-language support (ai_language setting)

### 🎯 AI Use Cases in KALA

| Feature | Primary Provider | Fallback |
|---------|-----------------|----------|
| Assignment Analysis | Gemini (structured JSON) | Grok |
| Mini-Course Generation | Gemini (detailed content) | Grok |
| Daily Synapse | Either (short text) | Either |
| Quiz Generation | Gemini (structured JSON) | Grok |
| Tutor Chat | Either (conversational) | Either |
| Socratic Debate | Grok (reasoning) | Gemini |
| Work Validation | Gemini (structured JSON) | Grok |
| Scaffolding Tasks | Either (short text) | Either |

---

## 5. 🧪 QA Engineer

### 📋 Deskripsi Peran
Melakukan manual dan automation testing untuk memvalidasi frontend, backend, dan integrasi AI, memastikan kualitas produk sebelum release.

### 💪 Hard Skills

| Skill | Level | Description |
|-------|-------|-------------|
| **Manual Testing** | Advanced | Test case design, exploratory testing |
| **E2E Testing** | Intermediate | Playwright, Cypress |
| **API Testing** | Intermediate | REST validation, contract testing |
| **Test Documentation** | Advanced | Test plans, bug reports, coverage |
| **Browser DevTools** | Advanced | Console, network, performance |
| **Accessibility Testing** | Intermediate | WCAG, screen readers |

### 🔧 DevTools for QA

| Skill | Application |
|-------|-------------|
| **Console Errors** | JavaScript error detection, warning analysis |
| **Network Inspection** | API response validation, status codes |
| **Device Emulation** | Mobile testing, responsive validation |
| **Throttling** | Slow network simulation, offline mode |
| **Accessibility** | axe DevTools, contrast checking |
| **Performance** | Lighthouse scores, Core Web Vitals |

### 🛠️ Tools & Stack

| Category | Tools |
|----------|-------|
| **E2E Testing** | Playwright, Cypress |
| **API Testing** | Postman, Newman, curl |
| **Unit Testing** | Vitest, Jest |
| **Bug Tracking** | GitHub Issues |
| **Screenshots** | CleanShot, Loom |

### ✅ Tanggung Jawab Utama

- [ ] Test plan creation berdasarkan PRD
- [ ] Manual testing untuk semua user flows
- [ ] Automation scripts untuk critical paths
- [ ] API endpoint validation
- [ ] Cross-browser compatibility testing
- [ ] Mobile responsiveness testing
- [ ] AI response quality testing
- [ ] Regression testing sebelum release
- [ ] Bug reports dengan reproduction steps

---

## 6. 🚀 DevOps Engineer

### 📋 Deskripsi Peran
Mengelola CI/CD pipeline, deployment infrastructure, monitoring, dan memastikan reliability sistem produksi.

### � Hard Skills

| Skill | Level | Description |
|-------|-------|-------------|
| **CI/CD** | Advanced | GitHub Actions, automated workflows |
| **Cloud Platforms** | Intermediate | Vercel, Railway, Cloudflare |
| **Docker** | Intermediate | Containerization, compose |
| **Monitoring** | Intermediate | Logs, metrics, alerting |
| **Environment Management** | Advanced | Secrets, env variables, stages |
| **SSL/Security** | Basic | Certificate management, HTTPS |

### 🛠️ Tools & Stack

| Category | Tools |
|----------|-------|
| **CI/CD** | GitHub Actions |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Railway, Render |
| **Database** | Turso |
| **Monitoring** | Sentry, LogTail |
| **Secrets** | GitHub Secrets, Doppler |

### ✅ Tanggung Jawab Utama

- [ ] Setup CI/CD pipeline untuk FE dan BE
- [ ] Environment configuration (dev, staging, prod)
- [ ] Deployment automation
- [ ] Monitoring dan alerting setup
- [ ] Log aggregation dan analysis
- [ ] Secret management
- [ ] SSL certificate management
- [ ] Incident response runbooks

---

## 7. 🎨 UI/UX Designer

### 📋 Deskripsi Peran
Merancang dan mengevaluasi pengalaman pengguna, memastikan interface intuitif, accessible, dan sesuai dengan brand KALA.

### 💪 Hard Skills

| Skill | Level | Description |
|-------|-------|-------------|
| **UI Design** | Advanced | Visual hierarchy, typography, color theory |
| **UX Research** | Intermediate | User interviews, usability testing |
| **Prototyping** | Advanced | Interactive prototypes, micro-interactions |
| **Design Systems** | Intermediate | Component libraries, tokens |
| **Responsive Design** | Advanced | Mobile-first, breakpoints |
| **Accessibility** | Intermediate | WCAG, contrast, keyboard navigation |

### 🛠️ Tools & Stack

| Category | Tools |
|----------|-------|
| **Design** | Figma |
| **Prototyping** | Figma, Principle |
| **Icons** | Lucide, Heroicons |
| **Assets** | Unsplash, AI image generation |

### ✅ Tanggung Jawab Utama

- [ ] Menyempurnakan design system KALA
- [ ] High-fidelity mockups untuk fitur baru
- [ ] User flow diagrams
- [ ] Interactive prototypes
- [ ] Accessibility audit
- [ ] Dark/light mode consistency
- [ ] Design specs untuk developer handoff

---

## 8. 👔 Project Manager / Tech Lead

### 📋 Deskripsi Peran
Koordinasi lintas divisi, penyusunan timeline, prioritasi backlog, dan memastikan delivery sesuai target.

### � Hard Skills

| Skill | Level | Description |
|-------|-------|-------------|
| **Project Management** | Advanced | Agile, Scrum, Kanban |
| **Technical Understanding** | Intermediate | Architecture decisions, trade-offs |
| **Stakeholder Communication** | Advanced | Requirements, reporting |
| **Risk Management** | Intermediate | Identification, mitigation |
| **Documentation** | Advanced | PRDs, technical specs |

### 🛠️ Tools & Stack

| Category | Tools |
|----------|-------|
| **Project Tracking** | GitHub Projects, Linear |
| **Documentation** | Notion, Markdown |
| **Communication** | Slack, Discord |
| **Diagramming** | Miro, Excalidraw |

### ✅ Tanggung Jawab Utama

- [ ] Sprint planning dan backlog grooming
- [ ] Daily standups facilitation
- [ ] Cross-team dependency management
- [ ] Timeline estimation dan tracking
- [ ] Technical decision documentation
- [ ] Retrospective facilitation

---

## 📊 Team Composition

### Minimum Viable Team (3-4 orang)

| Role | Count | Notes |
|------|-------|-------|
| Full-Stack Developer | 2 | Handle both FE and BE |
| AI/QA | 1 | Combined role |
| Project Manager | 0.5 | Part-time/shared |

### Optimal Team (6-8 orang)

| Role | Count | Notes |
|------|-------|-------|
| Frontend Developer | 2 | UI/UX polish |
| Backend Developer | 2 | API and AI integration |
| Database Engineer | 1 | Combined with BE |
| QA Engineer | 1 | Full-time |
| DevOps | 0.5 | Part-time |
| PM/Tech Lead | 1 | Full-time |

---

## 🔑 Key Skills per Development Phase

### Phase 1: MVP Foundation
1. Backend Developer (API structure)
2. Database Engineer (Schema design)
3. Frontend Developer (API integration)

### Phase 2: AI Integration
1. AI Engineer (Gemini + Grok)
2. Backend Developer (Service layer)
3. QA Engineer (AI response validation)

### Phase 3: Production Ready
1. DevOps Engineer (CI/CD, monitoring)
2. QA Engineer (E2E testing)
3. Security review

### Phase 4: Scale & Optimize
1. Database Engineer (Query optimization)
2. DevOps Engineer (Caching, CDN)
3. Performance profiling

---

## 📚 Required Reading

### All Team Members
- KALA PRD (`docs/PRD.md`)
- Backend/Database Design (`docs/BACKEND_DATABASE_DESIGN.md`)
- This Skill Matrix

### Frontend
- React 18 documentation
- Tailwind CSS documentation
- Vite documentation

### Backend
- Express.js best practices
- Drizzle ORM documentation
- Turso documentation

### AI Integration
- Google Gemini API documentation
- xAI Grok API documentation
- OpenAI SDK patterns (for Grok compatibility)
