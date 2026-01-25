---
description: Complete KALA Enhancement Workflow - From analysis to deployment with comprehensive feature implementation
---

# 🎓 KALA Enhancement Workflow

## Project Overview

**KALA** (Academic Intelligence Operating System) is being enhanced to become a comprehensive academic productivity platform inspired by Notion.so while maintaining its unique Socratic, pedagogical approach.

### Core Philosophy (MUST MAINTAIN)
- 🎯 **No Direct Answers** - AI guides learning, never provides solutions
- 🧠 **Socratic Method** - Challenge assumptions, provoke thinking
- 📚 **Academic Focus** - Built exclusively for students and learning
- 🤖 **AI as Mentor** - Not an assistant, but a teaching companion

---

## Phase 1: Foundation Fixes (Priority: CRITICAL)

### 1.1 AI Strict Mode Enforcement
**Goal:** Ensure AI never provides direct answers from uploaded assignments

**Files to modify:**
- `backend/src/services/gemini.service.ts`
- `backend/src/services/grok.service.ts`
- `backend/src/services/ai-router.service.ts`
- `backend/src/routes/chat.routes.ts`

**Implementation:**
```bash
# turbo
# View current AI service implementation
cat backend/src/services/gemini.service.ts
```

**Changes Required:**
1. Read `strictNoAnswers` from user settings in all AI calls
2. Inject anti-answer prompt into all system instructions:
   ```
   STRICT RULE: You are an academic mentor. 
   NEVER provide direct answers, solutions, or complete work.
   ALWAYS guide through questions, hints, and conceptual explanations.
   If a student asks for the answer, redirect with a Socratic question.
   ```
3. Apply `thinkingMode` and `hintLevel` settings to prompts
4. Test with various assignment types

---

### 1.2 Mini Course Enhancement
**Goal:** Generate highly detailed, structured courses with actionable tasks

**Files to modify:**
- `backend/src/db/schema.ts` - Enhanced MiniCourse schema
- `backend/src/services/gemini.service.ts` - Improved prompts
- `types.ts` - Frontend types
- `components/AssignmentView.tsx` - Enhanced display

**New MiniCourse Structure:**
```typescript
interface EnhancedMiniCourse {
  // Metadata
  id: string;
  milestoneId: string;
  estimatedMinutes: number;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  
  // Core Content
  learningOutcome: string;
  prerequisites: string[];
  overview: string;
  
  // Structured Sections
  sections: CourseSection[];
  
  // Concepts with depth
  concepts: ConceptItem[];
  
  // Actionable Tasks (Multiple)
  tasks: CourseTask[];
  
  // Checkpoints
  checkpoints: CheckpointQuestion[];
  
  // References
  references: Reference[];
  
  // Practical Guide (Enhanced)
  practicalGuide: {
    steps: GuideStep[];
    commonMistakes: string[];
    proTips: string[];
  };
  
  // Expert Content
  expertTip: string;
  
  // Tracking
  masteryStatus: 'untested' | 'refined' | 'perfected';
  completionPercentage: number;
  completedTasks: string[];
}
```

---

## Phase 2: Storage & File System

### 2.1 Course/Matakuliah System
**Goal:** Organize all content by academic course

**Database changes:**
```sql
-- New courses table
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  code TEXT,
  color TEXT,
  semester TEXT,
  instructor TEXT,
  icon TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Add course_id to assignments
ALTER TABLE assignments ADD COLUMN course_id TEXT REFERENCES courses(id);
```

**Files to create/modify:**
- `backend/src/db/schema.ts` - Add courses table
- `backend/src/routes/courses.routes.ts` - NEW
- `backend/src/services/courses.service.ts` - NEW
- `components/CourseManager.tsx` - NEW
- `components/CourseCard.tsx` - NEW

---

### 2.2 Folder-Based File Storage
**Goal:** Hierarchical file organization with actual file upload

**Database changes:**
```sql
-- New folders table
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES folders(id),
  course_id TEXT REFERENCES courses(id),
  color TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced files table
ALTER TABLE files ADD COLUMN folder_id TEXT REFERENCES folders(id);
ALTER TABLE files ADD COLUMN user_id TEXT REFERENCES users(id);
ALTER TABLE files ADD COLUMN mime_type TEXT;
ALTER TABLE files ADD COLUMN thumbnail_key TEXT;
```

**Backend implementation:**
```bash
# Install required packages
// turbo
cd backend && npm install multer @types/multer uuid
```

**Files to create:**
- `backend/src/routes/files.routes.ts` - File upload/download API
- `backend/src/routes/folders.routes.ts` - Folder management API
- `backend/src/services/storage.service.ts` - Storage abstraction
- `backend/uploads/` - Local file storage directory

---

### 2.3 Document Preview System
**Goal:** Preview PDFs, images, and documents in-app

**Frontend packages:**
```bash
// turbo
npm install react-pdf @react-pdf-viewer/core @react-pdf-viewer/default-layout mammoth
```

**Components to create:**
- `components/FilePreview.tsx` - Universal preview component
- `components/PDFViewer.tsx` - PDF preview with pagination
- `components/ImageViewer.tsx` - Image preview with zoom
- `components/DocumentViewer.tsx` - Word/text preview

---

## Phase 3: Calendar & Task Integration

### 3.1 Enhanced Calendar
**Goal:** Unified view of all academic events

**Calendar Event Types:**
- Assignment deadlines
- Milestone deadlines
- Mini course tasks
- Study sessions
- Quiz schedules
- Custom events

**Database changes:**
```sql
CREATE TABLE calendar_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  assignment_id TEXT REFERENCES assignments(id),
  milestone_id TEXT REFERENCES milestones(id),
  task_id TEXT,
  
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT, -- deadline, study_session, quiz, custom
  
  start_time TEXT NOT NULL,
  end_time TEXT,
  all_day INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'scheduled', -- scheduled, completed, missed
  is_auto_generated INTEGER DEFAULT 0,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Components to enhance:**
- `components/CalendarView.tsx` - Full calendar rewrite
- `components/CalendarEventModal.tsx` - NEW
- `components/CalendarSidebar.tsx` - NEW

---

### 3.2 Task-Milestone-Calendar Sync
**Goal:** Auto-generate calendar events from tasks

**Implementation:**
1. When mini course is generated → create calendar events for each task
2. When milestone deadline changes → update all related events
3. Drag-drop calendar events → update task deadlines
4. Show task completion status on calendar

---

## Phase 4: Block-Based Content System

### 4.1 Block Type Definitions
**Academic Block Types:**

| Block | Purpose | Icon |
|-------|---------|------|
| `learning_outcome` | Define mastery goals | 🎯 |
| `concept` | Revealable concept explanation | 💡 |
| `citation` | Academic source reference | 📖 |
| `formative_task` | Actionable checklist | ✅ |
| `reflection` | Metacognitive journaling | 💭 |
| `debate_prompt` | Socratic challenge | ⚔️ |
| `math` | LaTeX formula | 🔢 |
| `code` | Syntax highlighted code | 💻 |
| `callout` | Expert insight box | 📌 |
| `progress` | Visual progress tracker | 📊 |

**Database schema:**
```sql
CREATE TABLE blocks (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL, -- Can be assignment, course, or note
  page_type TEXT NOT NULL, -- assignment, course, note
  
  block_type TEXT NOT NULL,
  content TEXT, -- JSON content
  
  parent_id TEXT REFERENCES blocks(id),
  sort_order INTEGER DEFAULT 0,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

### 4.2 Block Editor Component
**Goal:** Notion-like block editing experience

**Files to create:**
- `components/BlockEditor/index.tsx` - Main editor
- `components/BlockEditor/Block.tsx` - Single block renderer
- `components/BlockEditor/BlockToolbar.tsx` - Block type selector
- `components/BlockEditor/blocks/` - Individual block components

---

## Phase 5: Math & Language Support

### 5.1 LaTeX/Math Rendering
**Goal:** Render mathematical formulas beautifully

**Installation:**
```bash
// turbo
npm install katex @types/katex
```

**Implementation:**
- Create `components/MathBlock.tsx`
- Support inline `$...$` and block `$$...$$` syntax
- Auto-detect math in AI responses

---

### 5.2 Arabic/RTL Support
**Goal:** Full support for Arabic language and right-to-left text

**CSS Changes:**
```css
/* globals.css additions */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

.font-arabic {
  font-family: 'Amiri', 'Noto Naskh Arabic', serif;
}
```

**Font Loading:**
```html
<!-- Add to _document.tsx -->
<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet">
```

**Components to update:**
- All text components need RTL awareness
- Settings page to select language/direction

---

## Phase 6: Export & Templates

### 6.1 PDF Export
**Goal:** Export mini courses and notes to professional PDF

**Installation:**
```bash
// turbo
npm install @react-pdf/renderer
```

**Export Types:**
- Mini Course → Study guide PDF
- Assignment → Progress report PDF
- Notes → Formatted document PDF
- Validation Result → Assessment report PDF

---

### 6.2 Academic Templates
**Goal:** Pre-built templates for common academic work

**Template Categories:**
- Research Paper
- Lab Report
- Essay
- Thesis Chapter
- Literature Review
- Case Study
- Problem Set

**Database:**
```sql
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  thumbnail TEXT,
  content TEXT, -- JSON block structure
  created_by TEXT, -- 'system' or user_id
  is_public INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## Phase 7: Views & Customization

### 7.1 Database Views
**Goal:** Multiple views for assignments

**Views to implement:**
1. **Table View** - Spreadsheet-like with sortable columns
2. **Kanban View** - Pipeline: Todo → In Progress → Done
3. **Calendar View** - Enhanced with all events
4. **Timeline View** - Gantt-style planning
5. **Gallery View** - Visual cards

**Components:**
- `components/views/TableView.tsx`
- `components/views/KanbanView.tsx`
- `components/views/TimelineView.tsx`
- `components/views/GalleryView.tsx`

---

### 7.2 Workspace Customization
**Goal:** Personalize the KALA experience

**Customization Options:**
- Course colors and icons
- Assignment covers
- Dashboard widget arrangement
- Sidebar organization
- Keyboard shortcuts
- Theme variations (beyond light/dark)

---

## Development Commands

### Start Development
```bash
// turbo
cd /Users/haysan/Documents/WEBAPPS/KALA && npm run dev
```

### Start Backend
```bash
// turbo
cd /Users/haysan/Documents/WEBAPPS/KALA/backend && npm run dev
```

### Database Push
```bash
// turbo
cd /Users/haysan/Documents/WEBAPPS/KALA/backend && npx drizzle-kit push
```

### Type Check
```bash
// turbo
npm run type-check
```

### Build Production
```bash
npm run build
```

---

## Testing Checklist

### AI Behavior Tests
- [ ] AI refuses to give direct answers
- [ ] AI uses Socratic questioning
- [ ] AI adapts to thinkingMode setting
- [ ] AI adapts to hintLevel setting
- [ ] AI generates detailed mini courses

### Storage Tests
- [ ] File upload works
- [ ] File preview works (PDF, images)
- [ ] Folders can be created/nested
- [ ] Files can be moved between folders
- [ ] Files persist after refresh

### Calendar Tests
- [ ] Events show correctly
- [ ] Auto-generated events from tasks
- [ ] Drag-drop to reschedule
- [ ] Task completion updates calendar

### Math/Language Tests
- [ ] LaTeX renders correctly
- [ ] Arabic text displays properly
- [ ] RTL layout works
- [ ] Mixed language content handles well

---

## Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] File storage configured (local or cloud)
- [ ] AI API keys validated
- [ ] SSL/HTTPS enabled
- [ ] Performance optimized
- [ ] Error logging configured

---

## Notes

- Always maintain KALA's academic focus
- Never implement features that give students shortcuts
- AI should always be a teaching tool, not a cheating tool
- Keep the UI clean and distraction-free
- Performance is critical for student productivity
