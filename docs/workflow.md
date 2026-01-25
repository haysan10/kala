# KALA WebApp Development Workflow

## 🎯 Fokus: OAuth Auth + Profile + AI Settings + Critical Thinking AI

> **Filosofi KALA**: AI tidak memberikan jawaban langsung, tapi membimbing user berpikir kritis

---

## 1. OAuth Authentication (Google & GitHub)

### 1.1 Backend Setup

**Dependencies:**
```bash
cd backend && npm install passport passport-google-oauth20 passport-github2
```

**Environment Variables (`.env`):**
```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback

# Frontend
FRONTEND_URL=http://localhost:5173
```

**Database Schema Update:**
```typescript
// backend/src/db/schema.ts
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"), // Nullable for OAuth
  
  // OAuth fields
  provider: text("provider"), // 'google' | 'github' | 'email'
  providerId: text("provider_id"), // User ID from OAuth provider
  avatar: text("avatar"), // Profile picture URL
  
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});
```

**Auth Routes:**
```typescript
// backend/src/routes/auth.routes.ts
import passport from 'passport';

// Google OAuth
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    const token = generateJWT(req.user);
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// GitHub OAuth
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { session: false }),
  async (req, res) => {
    const token = generateJWT(req.user);
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  }
);
```

### 1.2 Frontend Integration

**Login Page:**
```typescript
// src/pages/Login.tsx
const handleGoogleLogin = () => {
  window.location.href = `${API_URL}/api/auth/google`;
};

const handleGitHubLogin = () => {
  window.location.href = `${API_URL}/api/auth/github`;
};

// OAuth callback handler
// src/pages/AuthCallback.tsx
const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard');
    }
  }, [token]);
};
```

---

## 2. Profile Page

### 2.1 Backend API

**Endpoint: GET `/api/user/profile`**
```typescript
router.get('/profile', authMiddleware, async (req, res) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, req.user.id),
    columns: {
      passwordHash: false, // Exclude sensitive data
    },
  });
  sendSuccess(res, user);
});
```

**Endpoint: PUT `/api/user/profile`**
```typescript
router.put('/profile', authMiddleware, validate(updateProfileSchema), async (req, res) => {
  const { name, avatar } = req.body;
  
  const [updated] = await db.update(users)
    .set({ 
      name, 
      avatar,
      updatedAt: sql`CURRENT_TIMESTAMP` 
    })
    .where(eq(users.id, req.user.id))
    .returning();
    
  sendSuccess(res, updated);
});
```

### 2.2 Frontend Component

```typescript
// src/pages/Profile.tsx
const Profile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <img src={user?.avatar} className="w-24 h-24 rounded-full" />
        <h2>{user?.name}</h2>
        <p>{user?.email}</p>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
          {user?.provider}
        </span>
      </div>
    </div>
  );
};
```

---

## 3. Settings Page - AI Configuration

### 3.1 Database Schema

```typescript
// backend/src/db/schema.ts
export const userSettings = sqliteTable("user_settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  
  // AI Provider Configuration
  aiProvider: text("ai_provider").default("gemini"), // 'gemini' | 'grok'
  geminiApiKey: text("gemini_api_key"),
  grokApiKey: text("grok_api_key"),
  
  // AI Parameters (STRICT - User tidak bisa ubah via UI)
  aiTemperature: real("ai_temperature").default(0.7), // Locked
  aiMaxTokens: integer("ai_max_tokens").default(2000), // Locked
  aiTopP: real("ai_top_p").default(0.9), // Locked
  
  // User Preferences
  language: text("language").default("id"), // 'en' | 'id'
  thinkingMode: text("thinking_mode").default("socratic"), // 'socratic' | 'guided' | 'exploratory'
  hintLevel: text("hint_level").default("minimal"), // 'minimal' | 'moderate' | 'generous'
  
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});
```

### 3.2 Backend API

**Endpoint: GET `/api/user/settings`**
```typescript
router.get('/settings', authMiddleware, async (req, res) => {
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, req.user.id),
  });
  
  // Mask API keys (only show last 4 chars)
  if (settings?.geminiApiKey) {
    settings.geminiApiKey = '****' + settings.geminiApiKey.slice(-4);
  }
  
  sendSuccess(res, settings);
});
```

**Endpoint: PUT `/api/user/settings`**
```typescript
router.put('/settings', authMiddleware, validate(settingsSchema), async (req, res) => {
  const { 
    aiProvider, 
    geminiApiKey, 
    grokApiKey, 
    language, 
    thinkingMode, 
    hintLevel 
  } = req.body;
  
  // STRICT: AI parameters tidak bisa diubah user
  const [updated] = await db.update(userSettings)
    .set({
      aiProvider,
      geminiApiKey: geminiApiKey !== '****' ? geminiApiKey : undefined,
      grokApiKey: grokApiKey !== '****' ? grokApiKey : undefined,
      language,
      thinkingMode,
      hintLevel,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(userSettings.userId, req.user.id))
    .returning();
    
  sendSuccess(res, updated);
});
```

### 3.3 Frontend Component

```typescript
// src/pages/Settings.tsx
const Settings = () => {
  const [settings, setSettings] = useState(null);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* AI Provider Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">🤖 AI Configuration</h2>
        
        <div className="mb-4">
          <label>AI Provider</label>
          <select value={settings?.aiProvider}>
            <option value="gemini">Google Gemini</option>
            <option value="grok">xAI Grok</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label>Gemini API Key</label>
          <input type="password" placeholder="sk-..." />
        </div>
        
        <div className="mb-4">
          <label>Grok API Key</label>
          <input type="password" placeholder="xai-..." />
        </div>
      </section>

      {/* AI Behavior Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">🧠 AI Thinking Mode</h2>
        
        <div className="mb-4">
          <label>Thinking Approach</label>
          <select value={settings?.thinkingMode}>
            <option value="socratic">Socratic (Pertanyaan mendalam)</option>
            <option value="guided">Guided (Panduan bertahap)</option>
            <option value="exploratory">Exploratory (Eksplorasi bebas)</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label>Hint Level</label>
          <select value={settings?.hintLevel}>
            <option value="minimal">Minimal (Berpikir mandiri)</option>
            <option value="moderate">Moderate (Bantuan sedang)</option>
            <option value="generous">Generous (Lebih banyak petunjuk)</option>
          </select>
        </div>
      </section>

      {/* AI Parameters - READ ONLY */}
      <section className="bg-gray-100 dark:bg-gray-900 rounded-lg p-6 opacity-60">
        <h2 className="text-xl font-bold mb-2">⚙️ AI Parameters (System)</h2>
        <p className="text-sm text-gray-600 mb-4">Parameters ini dikunci untuk kualitas optimal</p>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label>Temperature</label>
            <input type="text" value="0.7" disabled className="bg-gray-200" />
          </div>
          <div>
            <label>Max Tokens</label>
            <input type="text" value="2000" disabled className="bg-gray-200" />
          </div>
          <div>
            <label>Top P</label>
            <input type="text" value="0.9" disabled className="bg-gray-200" />
          </div>
        </div>
      </section>

      {/* Language Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">🌍 Language</h2>
        
        <div className="mb-4">
          <label>AI Response Language</label>
          <select value={settings?.language}>
            <option value="id">Bahasa Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>
      </section>
      
    </div>
  );
};
```

---

## 4. AI Critical Thinking System

### 4.1 Sistem Prompt

```typescript
// backend/src/services/critical-thinking-ai.service.ts

const SYSTEM_PROMPTS = {
  socratic: {
    id: `Kamu adalah AI tutor yang menggunakan metode Socratic. 
    ATURAN KETAT:
    - JANGAN langsung memberikan jawaban
    - Ajukan pertanyaan yang memicu pemikiran kritis
    - Bimbing user untuk menemukan jawaban sendiri
    - Gunakan analogi dan contoh
    - Validasi pemahaman user dengan pertanyaan lanjutan`,
    
    en: `You are an AI tutor using Socratic method.
    STRICT RULES:
    - DO NOT give direct answers
    - Ask questions that trigger critical thinking
    - Guide users to find answers themselves
    - Use analogies and examples
    - Validate understanding with follow-up questions`
  },
  
  guided: {
    id: `Kamu adalah AI mentor yang membimbing bertahap.
    ATURAN KETAT:
    - Pecah masalah jadi langkah-langkah kecil
    - Berikan petunjuk tanpa jawaban langsung
    - Minta user mencoba setiap langkah
    - Berikan feedback konstruktif`,
    
    en: `You are an AI mentor guiding step-by-step.
    STRICT RULES:
    - Break problems into small steps
    - Give hints without direct answers
    - Ask user to try each step
    - Provide constructive feedback`
  }
};

export class CriticalThinkingAI {
  async respond(userQuery: string, userSettings: UserSettings) {
    const systemPrompt = SYSTEM_PROMPTS[userSettings.thinkingMode][userSettings.language];
    
    const hintLevelInstruction = {
      minimal: "Berikan petunjuk sangat minimal. User harus berpikir keras.",
      moderate: "Berikan petunjuk yang cukup untuk memandu arah.",
      generous: "Berikan petunjuk yang lebih jelas, tapi tetap tidak langsung jawaban."
    }[userSettings.hintLevel];
    
    const finalPrompt = `${systemPrompt}\n\n${hintLevelInstruction}\n\nUser: ${userQuery}`;
    
    // Call AI dengan temperature & parameters yang LOCKED
    const response = await this.callAI(finalPrompt, {
      temperature: 0.7, // LOCKED
      maxTokens: 2000,  // LOCKED
      topP: 0.9,        // LOCKED
    });
    
    return response;
  }
}
```

### 4.2 Contoh Interaksi

**User:** "Apa itu algoritma sorting?"

**AI (Socratic Mode - Minimal Hints):**
```
Pertanyaan bagus! Sebelum saya jelaskan, coba pikirkan dulu:
1. Ketika kamu menyusun buku di rak berdasarkan judul, apa yang kamu lakukan?
2. Apa pola atau aturan yang kamu gunakan?
3. Bisakah kamu jelaskan langkah-langkahnya?

Coba jawab pertanyaan ini dulu, nanti kita diskusi lebih lanjut.
```

**User:** "Gimana cara implementasi Binary Search?"

**AI (Guided Mode - Moderate Hints):**
```
Mari kita pecah jadi langkah-langkah:

Langkah 1: Pahami Konsep
- Binary search bekerja pada array yang sudah terurut
- Coba pikirkan: Kenapa harus terurut dulu?

Langkah 2: Strategi Pencarian
- Bayangkan kamu cari kata di kamus. Apa yang kamu lakukan?
- Apakah kamu mulai dari halaman pertama?

Langkah 3: Implementasi
- Coba tulis pseudocode dulu berdasarkan pemahaman kamu
- Kirim ke saya, nanti kita review bersama

Mulai dari langkah 1. Apa jawaban kamu untuk pertanyaan di atas?
```

---

## 5. Mini Course Feature

### 5.1 Database Schema

```typescript
export const courses = sqliteTable("courses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  difficulty: text("difficulty"), // 'beginner' | 'intermediate' | 'advanced'
  estimatedMinutes: integer("estimated_minutes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const courseModules = sqliteTable("course_modules", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id").references(() => courses.id),
  title: text("title").notNull(),
  content: text("content"), // Markdown format
  orderIndex: integer("order_index"),
  
  // AI-generated discussion questions
  discussionQuestions: text("discussion_questions"), // JSON array
});

export const userCourseProgress = sqliteTable("user_course_progress", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id),
  courseId: text("course_id").references(() => courses.id),
  currentModuleId: text("current_module_id"),
  completedModules: text("completed_modules"), // JSON array of module IDs
  notesAndReflections: text("notes_and_reflections"), // User's learning notes
  progressPercentage: integer("progress_percentage").default(0),
});
```

### 5.2 AI Course Generation

```typescript
// backend/src/services/course-generator.service.ts
export class CourseGenerator {
  async generateCourse(topic: string, userSettings: UserSettings) {
    const prompt = `Buat mini course tentang: ${topic}
    
    Format yang diinginkan (JSON):
    {
      "title": "...",
      "description": "...",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedMinutes": 120,
      "modules": [
        {
          "title": "...",
          "content": "... (markdown)",
          "discussionQuestions": [
            "Pertanyaan yang memicu critical thinking..."
          ]
        }
      ]
    }
    
    PENTING:
    - Setiap modul harus punya 3-5 pertanyaan diskusi
    - Jangan berikan jawaban langsung, buat user berpikir
    - Gunakan analogi dan contoh real-world
    - Susun materi dari dasar ke advanced secara bertahap`;
    
    const courseData = await aiRouter.generate(prompt, userSettings);
    
    // Save to database
    const course = await db.insert(courses).values(courseData).returning();
    
    return course;
  }
}
```

### 5.3 Frontend - Course View

```typescript
// src/pages/CourseView.tsx
const CourseView = () => {
  const [course, setCourse] = useState(null);
  const [currentModule, setCurrentModule] = useState(0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Course Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{course?.title}</h1>
        <div className="flex gap-4 mt-2">
          <span className="px-3 py-1 bg-blue-500 text-white rounded">
            {course?.difficulty}
          </span>
          <span>{course?.estimatedMinutes} menit</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div className="bg-green-500 h-2 rounded-full" style={{width: '40%'}} />
      </div>

      {/* Module Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">
          {course?.modules[currentModule]?.title}
        </h2>
        <div className="prose dark:prose-invert">
          {/* Render markdown content */}
        </div>
      </div>

      {/* Discussion Questions - AI Interaction */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">💡 Pertanyaan Refleksi</h3>
        {course?.modules[currentModule]?.discussionQuestions.map((q, i) => (
          <div key={i} className="mb-4">
            <p className="font-semibold">{q}</p>
            <textarea 
              placeholder="Tulis pemikiran kamu di sini..."
              className="w-full mt-2 p-3 border rounded"
            />
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
              Diskusi dengan AI
            </button>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button disabled={currentModule === 0}>Previous</button>
        <button>Next Module</button>
      </div>
    </div>
  );
};
```

---

## 6. Development Workflow

### 6.1 Implementation Checklist

```markdown
## Phase 1: OAuth Authentication
- [ ] Setup Google OAuth credentials
- [ ] Setup GitHub OAuth credentials
- [ ] Update database schema with OAuth fields
- [ ] Implement Passport.js strategies
- [ ] Create OAuth callback routes
- [ ] Update frontend login page
- [ ] Test OAuth flow end-to-end

## Phase 2: Profile Page
- [ ] Create profile API endpoints
- [ ] Build profile frontend component
- [ ] Implement avatar upload
- [ ] Add edit profile functionality
- [ ] Test profile updates

## Phase 3: Settings - AI Configuration
- [ ] Create userSettings table
- [ ] Build settings API endpoints
- [ ] Create settings frontend
- [ ] Implement API key management (masked display)
- [ ] Lock AI parameters in UI
- [ ] Test settings save/load

## Phase 4: Critical Thinking AI
- [ ] Design system prompts for each mode
- [ ] Implement AI service with locked parameters
- [ ] Create chat interface
- [ ] Test different thinking modes
- [ ] Validate AI never gives direct answers

## Phase 5: Mini Course
- [ ] Create course database schema
- [ ] Build course generation AI service
- [ ] Implement course listing page
- [ ] Build course viewer with modules
- [ ] Add discussion questions with AI
- [ ] Track user progress
```

### 6.2 Quick Start Commands

```bash
# Install dependencies
cd backend && npm install passport passport-google-oauth20 passport-github2

# Generate database migration
cd backend && npx drizzle-kit generate

# Apply migration
cd backend && npx drizzle-kit migrate

# Start development servers
# Terminal 1
cd /Users/haysan/Documents/WEBAPPS/KALA && npm run dev

# Terminal 2
cd /Users/haysan/Documents/WEBAPPS/KALA/backend && npm run dev
```

### 6.3 Testing Flow

**Test OAuth:**
```bash
# Test Google OAuth redirect
curl http://localhost:3001/api/auth/google

# Test GitHub OAuth redirect
curl http://localhost:3001/api/auth/github
```

**Test AI Critical Thinking:**
```bash
# Test with Socratic mode
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Apa itu recursion?",
    "mode": "socratic"
  }'
```

---

## 📝 Key Principles

### 🔒 AI Parameter Policy
- Temperature, Max Tokens, Top P = **LOCKED** (user tidak bisa ubah)
- Hanya thinking mode, hint level, dan language yang bisa diubah user
- Dijaga untuk memastikan kualitas response konsisten

### 🧠 Critical Thinking Approach
- AI **TIDAK BOLEH** memberikan jawaban langsung
- Harus menggunakan pertanyaan Socratic
- Fokus pada proses berpikir, bukan hasil akhir
- Validasi pemahaman dengan follow-up questions

### 📚 Mini Course Philosophy
- Materi disusun bertahap dari dasar ke advanced
- Setiap modul punya discussion questions
- AI membantu diskusi tanpa kasih jawaban
- User didorong untuk eksplorasi mandiri

---

**Last Updated:** 2026-01-24
**Version:** 2.0.0
