# Skill Matrix - Agency Developer Team
## Kala Academic Intelligence OS Development

---

## 📌 Daftar Lengkap Role & Skill untuk Fullstack Development

Dokumen ini mendefinisikan semua peran yang dibutuhkan oleh agency developer team untuk mengembangkan Kala dari frontend-only menjadi fullstack application lengkap dengan backend dan database.

---

## 1. Frontend Developer

### 📋 Deskripsi Peran
Bertanggung jawab atas pengembangan dan penyempurnaan antarmuka pengguna (UI) berdasarkan desain yang ada, termasuk integrasi dengan backend API dan optimasi performa client-side.

### 💪 Hard Skills

| Skill | Level Required | Description |
|-------|----------------|-------------|
| **HTML5/CSS3** | Advanced | Semantic markup, CSS Grid/Flexbox, responsive design |
| **JavaScript/TypeScript** | Advanced | ES6+, async/await, type safety |
| **React 18+** | Advanced | Hooks, Context, Suspense, Server Components |
| **State Management** | Intermediate | Zustand, React Query, or Redux Toolkit |
| **CSS-in-JS / Tailwind** | Intermediate | Utility-first CSS, theming systems |
| **API Integration** | Intermediate | REST, fetch/axios, error handling |
| **Testing** | Intermediate | Vitest, React Testing Library, Playwright |
| **Build Tools** | Intermediate | Vite, webpack, module bundlers |
| **Version Control** | Intermediate | Git, branching strategies |

### 🔧 Browser Debugging Skills

| Skill | Application |
|-------|-------------|
| **Chrome DevTools** | Elements, Console, Network, Performance tabs |
| **Performance Profiling** | Analyze reflow, repaint, FPS monitoring |
| **Network Inspection** | Request/response analysis, timing, caching |
| **Lighthouse Audit** | Performance, accessibility, SEO scoring |
| **Cross-browser Debugging** | Safari, Firefox compatibility issues |
| **Mobile Emulation** | Device simulation, touch events |
| **React DevTools** | Component tree, state inspection, profiler |

### 🛠️ Tools & Stack

| Category | Tools |
|----------|-------|
| **Design** | Figma (dev handoff), Zeplin |
| **IDE** | VS Code + extensions (ESLint, Prettier, TypeScript) |
| **API Testing** | Postman, Insomnia, Thunder Client |
| **Browser** | Chrome DevTools, React DevTools |
| **Version Control** | GitHub, GitLab |
| **Documentation** | Storybook (component library) |

### ✅ Tanggung Jawab

- [ ] Membangun komponen React berdasarkan desain UI
- [ ] Integrasi dengan backend API endpoints
- [ ] Implementasi state management untuk data flow
- [ ] Optimasi performa (lazy loading, code splitting)
- [ ] Responsive design untuk semua screen sizes
- [ ] Implementasi dark/light mode theming
- [ ] Unit testing untuk komponen kritis
- [ ] Error boundary dan fallback UI
- [ ] Accessibility (WCAG compliance)

---

## 2. Backend Developer

### 📋 Deskripsi Peran
Membangun API dan logika bisnis dari nol, termasuk autentikasi, integrasi dengan database, dan koneksi ke layanan AI eksternal (Gemini API).

### 💪 Hard Skills

| Skill | Level Required | Description |
|-------|----------------|-------------|
| **Node.js** | Advanced | Event loop, streams, async patterns |
| **Express.js / Hono** | Advanced | Routing, middleware, error handling |
| **TypeScript** | Advanced | Strict typing, generics, decorators |
| **REST API Design** | Advanced | Resource naming, HTTP methods, status codes |
| **Authentication** | Advanced | JWT, OAuth, session management |
| **SQL/libSQL** | Intermediate | Query optimization, transactions |
| **ORM (Drizzle)** | Intermediate | Schema design, migrations |
| **Testing** | Intermediate | Jest, Supertest, mocking |
| **Docker** | Basic | Containerization, compose |

### 🔧 Debugger Skills

| Skill | Application |
|-------|-------------|
| **Log Inspection** | Winston, Pino structured logging |
| **Node.js Debugger** | VS Code debugger, breakpoints |
| **API Testing** | Postman collections, automated tests |
| **Error Tracing** | Stack traces, error middleware |
| **Memory Profiling** | Heap snapshots, leak detection |
| **Performance Monitoring** | APM tools, request timing |
| **Database Query Analysis** | EXPLAIN, query profiling |

### 🛠️ Tools & Stack

| Category | Tools |
|----------|-------|
| **Runtime** | Node.js 20+, npm/pnpm |
| **Framework** | Express.js, Hono, Fastify |
| **Database** | Turso (libSQL), Drizzle ORM |
| **Auth** | jsonwebtoken, bcrypt |
| **Validation** | Zod, Joi |
| **Testing** | Vitest, Supertest |
| **Monitoring** | Sentry, LogTail |
| **Documentation** | OpenAPI/Swagger |

### ✅ Tanggung Jawab

- [ ] Merancang arsitektur API RESTful
- [ ] Implementasi endpoint CRUD untuk semua entities
- [ ] Integrasi dengan Gemini AI API
- [ ] Sistem autentikasi JWT
- [ ] Middleware untuk auth, validation, rate limiting
- [ ] Error handling terpusat
- [ ] Database migrations dan seeding
- [ ] API documentation (OpenAPI spec)
- [ ] Unit dan integration testing

---

## 3. Database Engineer

### 📋 Deskripsi Peran
Merancang, mengimplementasikan, dan mengelola database menggunakan Turso (libSQL), termasuk optimasi query dan strategi backup.

### 💪 Hard Skills

| Skill | Level Required | Description |
|-------|----------------|-------------|
| **SQL** | Advanced | Complex queries, CTEs, window functions |
| **SQLite/libSQL** | Advanced | Turso-specific features, edge deployment |
| **Database Design** | Advanced | Normalization, ER diagrams, indexing |
| **ORM** | Intermediate | Drizzle schema design, migrations |
| **Query Optimization** | Intermediate | EXPLAIN, index strategies |
| **Data Modeling** | Intermediate | Entity relationships, constraints |
| **Backup/Recovery** | Basic | Turso replication, point-in-time recovery |

### 🛠️ Tools & Stack

| Category | Tools |
|----------|-------|
| **Database** | Turso, SQLite, libSQL |
| **ORM** | Drizzle ORM |
| **GUI** | TablePlus, DBeaver, Turso CLI |
| **Migrations** | Drizzle Kit |
| **Monitoring** | Turso Dashboard |
| **ERD Design** | dbdiagram.io, Lucidchart |

### ✅ Tanggung Jawab

- [ ] Desain schema database berdasarkan kebutuhan aplikasi
- [ ] Implementasi DDL (CREATE TABLE scripts)
- [ ] Strategi indexing untuk query yang sering digunakan
- [ ] Normalisasi data (3NF)
- [ ] Migration scripts untuk schema changes
- [ ] Seed data untuk development/testing
- [ ] Query optimization dan performance tuning
- [ ] Backup strategy dan disaster recovery plan

---

## 4. UI/UX Designer

### 📋 Deskripsi Peran
Merancang dan mengevaluasi pengalaman pengguna, memastikan interface intuitif, accessible, dan sesuai dengan brand Kala.

### 💪 Hard Skills

| Skill | Level Required | Description |
|-------|----------------|-------------|
| **UI Design** | Advanced | Visual hierarchy, typography, color theory |
| **UX Research** | Intermediate | User interviews, usability testing |
| **Prototyping** | Advanced | Interactive prototypes, micro-interactions |
| **Design Systems** | Intermediate | Component libraries, tokens, documentation |
| **Responsive Design** | Advanced | Mobile-first, breakpoint strategies |
| **Accessibility** | Intermediate | WCAG guidelines, screen reader testing |
| **Motion Design** | Basic | Animations, transitions, micro-interactions |

### 🛠️ Tools & Stack

| Category | Tools |
|----------|-------|
| **Design** | Figma, Adobe XD |
| **Prototyping** | Figma, Principle, Framer |
| **Handoff** | Figma Dev Mode, Zeplin |
| **Testing** | Maze, UserTesting |
| **Analytics** | Hotjar, FullStory |
| **Icons/Assets** | Lucide, Heroicons, Unsplash |

### ✅ Tanggung Jawab

- [ ] Menyempurnakan design system Kala
- [ ] Membuat high-fidelity mockups untuk fitur baru
- [ ] User flow diagrams
- [ ] Interactive prototypes untuk testing
- [ ] Accessibility audit dan improvements
- [ ] Design specs untuk developer handoff
- [ ] Usability testing dan iteration
- [ ] Dark/light mode design consistency

---

## 5. QA Engineer

### 📋 Deskripsi Peran
Melakukan manual dan automation testing untuk memvalidasi frontend, backend, dan integrasi API, memastikan kualitas produk sebelum release.

### 💪 Hard Skills

| Skill | Level Required | Description |
|-------|----------------|-------------|
| **Manual Testing** | Advanced | Test case design, exploratory testing |
| **Automation Testing** | Intermediate | E2E test frameworks |
| **API Testing** | Intermediate | REST API validation, contract testing |
| **Performance Testing** | Basic | Load testing, stress testing |
| **Test Documentation** | Advanced | Test plans, bug reports |
| **SQL** | Basic | Data verification queries |

### 🔧 DevTools for QA

| Skill | Application |
|-------|-------------|
| **Browser DevTools** | Console errors, network inspection |
| **Device Emulation** | Mobile testing, responsive validation |
| **Throttling** | Slow network simulation, offline mode |
| **Accessibility Tools** | Axe, WAVE, screen reader testing |
| **Performance Tools** | Lighthouse, WebPageTest |
| **Screenshot/Recording** | Bug documentation |

### 🛠️ Tools & Stack

| Category | Tools |
|----------|-------|
| **E2E Testing** | Playwright, Cypress |
| **API Testing** | Postman, Newman |
| **Unit Testing** | Vitest, Jest |
| **Performance** | k6, Artillery |
| **Bug Tracking** | GitHub Issues, Jira |
| **Test Management** | TestRail, Zephyr |
| **Screenshots** | Loom, CleanShot |

### ✅ Tanggung Jawab

- [ ] Test plan creation berdasarkan PRD
- [ ] Manual testing untuk semua user flows
- [ ] Automation scripts untuk critical paths
- [ ] API endpoint validation
- [ ] Cross-browser compatibility testing
- [ ] Mobile responsiveness testing
- [ ] Regression testing sebelum release
- [ ] Bug reports dengan detail reproduction steps
- [ ] Performance baseline testing

---

## 6. DevOps Engineer

### 📋 Deskripsi Peran
Mengelola CI/CD pipeline, deployment infrastructure, monitoring, dan memastikan reliability sistem produksi.

### 💪 Hard Skills

| Skill | Level Required | Description |
|-------|----------------|-------------|
| **CI/CD** | Advanced | GitHub Actions, GitLab CI |
| **Cloud Platforms** | Intermediate | Vercel, Railway, Cloudflare |
| **Containerization** | Intermediate | Docker, container registries |
| **Infrastructure as Code** | Basic | Terraform, Pulumi |
| **Monitoring** | Intermediate | Logs, metrics, alerting |
| **Security** | Basic | Secrets management, SSL |
| **Networking** | Basic | DNS, CDN, load balancing |

### 🔧 Debugging for Production

| Skill | Application |
|-------|-------------|
| **Log Aggregation** | Centralized logging, log search |
| **Error Tracking** | Sentry, error grouping |
| **Performance Monitoring** | APM, request tracing |
| **Uptime Monitoring** | Health checks, status pages |
| **Incident Response** | Runbooks, escalation |

### 🛠️ Tools & Stack

| Category | Tools |
|----------|-------|
| **CI/CD** | GitHub Actions |
| **Hosting** | Vercel (FE), Railway/Render (BE) |
| **Database** | Turso |
| **CDN/Edge** | Cloudflare |
| **Monitoring** | Sentry, LogTail, UptimeRobot |
| **Secrets** | Doppler, GitHub Secrets |
| **Containers** | Docker |

### ✅ Tanggung Jawab

- [ ] Setup CI/CD pipeline untuk FE dan BE
- [ ] Environment configuration (dev, staging, prod)
- [ ] Deployment automation
- [ ] Monitoring dan alerting setup
- [ ] Log aggregation dan analysis
- [ ] Secret management
- [ ] SSL certificate management
- [ ] Performance monitoring dashboards
- [ ] Incident response runbooks

---

## 7. Project Manager / Tech Lead

### 📋 Deskripsi Peran
Koordinasi lintas divisi, penyusunan timeline, prioritasi backlog, dan memastikan delivery sesuai target.

### 💪 Hard Skills

| Skill | Level Required | Description |
|-------|----------------|-------------|
| **Project Management** | Advanced | Agile, Scrum, Kanban |
| **Technical Understanding** | Intermediate | Arsitektur, trade-offs |
| **Stakeholder Communication** | Advanced | Requirements gathering, reporting |
| **Risk Management** | Intermediate | Identification, mitigation |
| **Resource Planning** | Intermediate | Capacity, allocation |
| **Documentation** | Advanced | PRDs, technical specs |

### 🛠️ Tools & Stack

| Category | Tools |
|----------|-------|
| **Project Tracking** | GitHub Projects, Linear, Jira |
| **Documentation** | Notion, Confluence |
| **Communication** | Slack, Discord |
| **Roadmapping** | Productboard, Roadmunk |
| **Time Tracking** | Clockify, Toggl |
| **Diagramming** | Miro, FigJam, Excalidraw |

### ✅ Tanggung Jawab

- [ ] Sprint planning dan backlog grooming
- [ ] Daily standups facilitation
- [ ] Cross-team dependency management
- [ ] Timeline estimation dan tracking
- [ ] Risk identification dan mitigation
- [ ] Stakeholder communication
- [ ] Technical decision documentation
- [ ] Team velocity monitoring
- [ ] Retrospective facilitation

---

## 8. Security Specialist (Opsional)

### 📋 Deskripsi Peran
Meninjau celah keamanan pada API, form input, autentikasi, dan memastikan best practices keamanan diimplementasikan.

### 💪 Hard Skills

| Skill | Level Required | Description |
|-------|----------------|-------------|
| **Web Security** | Advanced | OWASP Top 10, XSS, CSRF, SQL Injection |
| **Authentication Security** | Advanced | JWT best practices, session security |
| **API Security** | Intermediate | Rate limiting, input validation |
| **Penetration Testing** | Intermediate | Vulnerability assessment |
| **Compliance** | Basic | GDPR, data protection |

### 🛠️ Tools & Stack

| Category | Tools |
|----------|-------|
| **Scanning** | OWASP ZAP, Burp Suite |
| **Secrets** | GitLeaks, TruffleHog |
| **Headers** | SecurityHeaders.com |
| **Dependencies** | npm audit, Snyk |

### ✅ Tanggung Jawab

- [ ] Security audit untuk codebase
- [ ] API vulnerability assessment
- [ ] Authentication flow review
- [ ] Input validation verification
- [ ] Dependency vulnerability scanning
- [ ] Security best practices documentation
- [ ] Incident response planning

---

## 9. Cross-Functional Generalist

### 📋 Deskripsi Peran
Senior developer dengan kemampuan membaca dan mengevaluasi hasil debugging lintas fungsi, menjembatani komunikasi teknis antar tim.

### 💪 Hard Skills

| Skill | Level Required | Description |
|-------|----------------|-------------|
| **Full-Stack Development** | Intermediate | Both frontend and backend |
| **System Design** | Intermediate | Architecture decisions |
| **Cross-Domain Debugging** | Advanced | Trace issues across stack |
| **Technical Communication** | Advanced | Explain complex issues |
| **Code Review** | Advanced | Quality and security |

### 🔧 Cross-Stack Debugging

| Skill | Application |
|-------|-------------|
| **End-to-End Tracing** | Follow request from FE to DB |
| **Log Correlation** | Match frontend errors to backend |
| **Network Analysis** | Identify latency sources |
| **State Debugging** | React state + Database state |
| **Integration Issues** | API contract mismatches |

### ✅ Tanggung Jawab

- [ ] Membantu investigasi bug kompleks lintas stack
- [ ] Code review untuk PR dari berbagai tim
- [ ] Arsitektur decision support
- [ ] Knowledge sharing sessions
- [ ] Documentation untuk integration patterns
- [ ] Onboarding support untuk new developers

---

## 📊 Team Composition Recommendation

### Minimum Viable Team (3-4 orang)

| Role | Count | Notes |
|------|-------|-------|
| Full-Stack Developer | 2 | Handle both FE and BE |
| QA Engineer | 1 | Part-time acceptable |
| Project Manager | 0.5 | Can be shared |

### Optimal Team (6-8 orang)

| Role | Count | Notes |
|------|-------|-------|
| Frontend Developer | 2 | Dedicated to UI/UX polish |
| Backend Developer | 2 | API and AI integration |
| Database Engineer | 1 | Can be combined with BE |
| QA Engineer | 1 | Full-time |
| DevOps Engineer | 0.5 | Part-time or shared |
| Project Manager/Tech Lead | 1 | Full-time |

### Enterprise Team (10+ orang)

| Role | Count | Notes |
|------|-------|-------|
| Frontend Developer | 3 | Squad-based |
| Backend Developer | 3 | Squad-based |
| Database Engineer | 1 | Dedicated |
| UI/UX Designer | 1 | Dedicated |
| QA Engineer | 2 | Manual + Automation |
| DevOps Engineer | 1 | Full-time |
| Security Specialist | 0.5 | Consultant |
| Project Manager | 1 | Full-time |
| Tech Lead | 1 | Architecture oversight |

---

## 🔑 Key Skill Priorities per Phase

### Phase 1: MVP Foundation
**Priority Skills:**
1. Backend Developer (API structure)
2. Database Engineer (Schema design)
3. Frontend Developer (API integration)

### Phase 2: AI Integration
**Priority Skills:**
1. Backend Developer (Gemini API)
2. Frontend Developer (Chat UI, loading states)
3. QA Engineer (AI response validation)

### Phase 3: Production Ready
**Priority Skills:**
1. DevOps Engineer (CI/CD, monitoring)
2. QA Engineer (E2E testing)
3. Security Specialist (Audit)

### Phase 4: Scale & Optimize
**Priority Skills:**
1. Database Engineer (Query optimization)
2. DevOps Engineer (Caching, CDN)
3. Cross-Functional Generalist (Performance debugging)
