# 📋 KALA Enhancement Task List

## Task Status Legend
- ⬜ Not Started
- 🟡 In Progress
- ✅ Completed
- 🔴 Blocked
- ⏸️ On Hold

## Priority Legend
- 🔥 P0 - Critical (Must do immediately)
- 🟠 P1 - High (This sprint)
- 🟡 P2 - Medium (Next sprint)
- 🟢 P3 - Low (Backlog)

---

## 📊 CURRENT PROGRESS

**Last Updated:** 2026-01-25 14:32 WIB

| Phase | Completed | Total | Progress |
|-------|:---------:|:-----:|:--------:|
| **Phase 1: Foundation** | 17 | 17 | ✅ **100%** |
| **Phase 2: Storage** | 23 | 23 | ✅ **100%** |
| **Phase 3: Calendar** | 20 | 20 | ✅ **100%** |
| **Phase 4: Blocks** | 21 | 23 | 🟢 91% |
| **Phase 5: Math/Language** | 16 | 16 | ✅ **100%** |
| **Phase 6: Export** | 17 | 17 | ✅ **100%** |
| **Phase 7: Views** | 17 | 17 | ✅ **100%** |

**Files Created/Modified in Phase 1:**
- ✅ `backend/src/services/ai-prompts.ts` - NEW: Strict mode prompts and behavior config
- ✅ `backend/src/services/gemini.service.ts` - Enhanced with strict mode
- ✅ `backend/src/services/grok.service.ts` - Enhanced with strict mode
- ✅ `backend/src/services/ai-router.service.ts` - Behavior config integration
- ✅ `backend/src/routes/ai.routes.ts` - Updated getAIConfig
- ✅ `backend/src/routes/chat.routes.ts` - Updated for strict mode chat
- ✅ `backend/src/routes/synapse.routes.ts` - Updated getAIConfig
- ✅ `backend/src/types/index.ts` - Enhanced MiniCourse types
- ✅ `types.ts` (frontend) - Enhanced MiniCourse types
- ✅ `components/EnhancedMiniCourse.tsx` - NEW: Full enhanced course UI with tasks, checkpoints
- ✅ `components/AssignmentView.tsx` - Updated to use EnhancedMiniCourse
- ✅ `backend/vitest.config.ts` - NEW: Test configuration
- ✅ `backend/src/__tests__/unit/ai-prompts.test.ts` - NEW: 42 tests for AI prompts
- ✅ `backend/src/__tests__/unit/ai-router.test.ts` - NEW: 17 tests for AI router
- ✅ `backend/src/__tests__/unit/strict-mode-scenarios.test.ts` - NEW: 18 manual test scenarios
- ✅ `backend/src/db/run-safe-migration.ts` - NEW: Safe migration script
- ✅ `backend/src/db/migrations/0002_add_courses.sql` - Courses + enhanced fields migration

**Files Created/Modified in Phase 2:**
- ✅ `backend/src/db/schema.ts` - Added courses table, course_id FK, folders table, enhanced files table
- ✅ `backend/src/services/courses.service.ts` - NEW: Course CRUD with stats
- ✅ `backend/src/routes/courses.routes.ts` - NEW: Course API endpoints
- ✅ `backend/src/app.ts` - Registered courses, files, folders routes
- ✅ `services/coursesApi.ts` - NEW: Frontend courses API client
- ✅ `components/CourseCard.tsx` - NEW: Course display component
- ✅ `components/CourseManager.tsx` - NEW: Full course management UI
- ✅ `types.ts` - Added Course, CourseWithStats, courseColor to Assignment
- ✅ `components/UploadAssignment.tsx` - Added course selector dropdown
- ✅ `App.tsx` - Added course filter, courses navigation, color indicators
- ✅ `backend/src/services/storage.service.ts` - NEW: File storage operations
- ✅ `backend/src/routes/files.routes.ts` - NEW: File upload/download APIs with multer
- ✅ `backend/src/routes/folders.routes.ts` - NEW: Folder CRUD APIs
- ✅ `backend/src/db/migrations/run-files-migration.ts` - NEW: Files/folders migration
- ✅ `services/storageApi.ts` - NEW: Frontend storage API client
- ✅ `components/FileExplorer.tsx` - NEW: File manager with drag-drop upload, tabs for Browse/Starred/Recent
- ✅ `components/FilePreviewModal.tsx` - NEW: Universal preview for images/PDF/text/video/audio
- ✅ `components/FileManager.tsx` - NEW: Full-page file manager with preview integration
- ✅ `App.tsx` - Added Files sidebar item and FileManager view

**Files Created/Modified in Phase 3:**
- ✅ `backend/src/db/schema.ts` - Added calendar_events table
- ✅ `backend/src/db/migrations/run-calendar-migration.ts` - NEW: Calendar migration
- ✅ `backend/src/services/calendar.service.ts` - NEW: Event CRUD + auto-generation
- ✅ `backend/src/routes/calendar.routes.ts` - NEW: Calendar API endpoints
- ✅ `backend/src/app.ts` - Registered calendar routes
- ✅ `services/calendarApi.ts` - NEW: Frontend calendar API client
- ✅ `components/CalendarView.tsx` - REWRITTEN: Month/Week/Day views with modals
- ✅ `components/UpcomingDeadlines.tsx` - NEW: Dashboard deadline widget

---

# PHASE 1: Foundation Fixes

## 1.1 AI Strict Mode Enforcement
| ID | Task | Priority | Effort | Status | Acceptance Criteria |
|----|------|:--------:|:------:|:------:|---------------------|
| AI-001 | Read `strictNoAnswers` setting in AI router | 🔥 P0 | 2h | ✅ | Setting is read from user_settings table |
| AI-002 | Inject anti-answer prompt into Gemini service | 🔥 P0 | 3h | ✅ | All Gemini calls include strict prompt |
| AI-003 | Inject anti-answer prompt into Grok service | 🔥 P0 | 3h | ✅ | All Grok calls include strict prompt |
| AI-004 | Apply `thinkingMode` to chat prompts | 🔥 P0 | 2h | ✅ | Socratic/Guided/Exploratory modes work |
| AI-005 | Apply `hintLevel` to AI responses | 🔥 P0 | 2h | ✅ | Minimal/Moderate/Generous hints work |
| AI-006 | Test AI with assignment solving attempts | 🔥 P0 | 2h | ✅ | AI redirects to Socratic questions |
| AI-007 | Add unit tests for AI strict mode | 🟠 P1 | 3h | ✅ | Test coverage for all AI services |

**Subtasks for AI-002:**
```
Files to modify:
- [ ] backend/src/services/gemini.service.ts
  - [ ] Add strictModePrompt constant
  - [ ] Modify analyzeAssignment() - add strict prompt
  - [ ] Modify generateMiniCourse() - add strict prompt
  - [ ] Modify generateDailySynapse() - add strict prompt
  - [ ] Modify generateScaffoldingTask() - add strict prompt
  - [ ] Modify validateWork() - add strict prompt
  - [ ] Modify generateQuiz() - ensure no answer leaks
```

---

## 1.2 Enhanced Mini Course Generation
| ID | Task | Priority | Effort | Status | Acceptance Criteria |
|----|------|:--------:|:------:|:------:|---------------------|
| MC-001 | Design enhanced MiniCourse schema | 🔥 P0 | 2h | ✅ | Schema includes sections, tasks, checkpoints |
| MC-002 | Update database schema for mini courses | 🔥 P0 | 2h | ✅ | Database migrated with new fields |
| MC-003 | Rewrite generateMiniCourse prompt | 🔥 P0 | 4h | ✅ | AI generates detailed, structured courses |
| MC-004 | Add prerequisite detection | 🟠 P1 | 3h | ✅ | AI identifies required prior knowledge |
| MC-005 | Add multiple tasks per course | 🔥 P0 | 3h | ✅ | Course has 3-5 actionable tasks |
| MC-006 | Add checkpoint questions | 🟠 P1 | 3h | ✅ | Each section has verification question |
| MC-007 | Add reference/citation generation | 🟡 P2 | 2h | ✅ | AI suggests relevant sources |
| MC-008 | Update frontend MiniCourse display | 🔥 P0 | 4h | ✅ | UI shows all enhanced content |
| MC-009 | Add task completion tracking | 🔥 P0 | 3h | ✅ | Users can check off tasks |
| MC-010 | Calculate completion percentage | 🟠 P1 | 2h | ✅ | Progress bar based on completed tasks |

**Enhanced MiniCourse Schema:**
```typescript
// types.ts additions
interface CourseSection {
  id: string;
  title: string;
  content: string;
  estimatedMinutes: number;
  completed: boolean;
}

interface CourseTask {
  id: string;
  instruction: string;
  type: 'action' | 'reflection' | 'research' | 'practice';
  estimatedMinutes: number;
  completed: boolean;
  dueDate?: string;
}

interface CheckpointQuestion {
  id: string;
  question: string;
  hint: string;
  answered: boolean;
  response?: string;
}

interface Reference {
  title: string;
  author?: string;
  url?: string;
  type: 'book' | 'article' | 'web' | 'video';
}
```

---

# PHASE 2: Storage & File System

## 2.1 Course/Matakuliah System
| ID | Task | Priority | Effort | Status | Acceptance Criteria |
|----|------|:--------:|:------:|:------:|---------------------|
| CRS-001 | Create `courses` table in schema | 🔥 P0 | 1h | ✅ | Table created with all fields |
| CRS-002 | Add `course_id` FK to assignments | 🔥 P0 | 1h | ✅ | Assignments can belong to course |
| CRS-003 | Create courses.service.ts | 🔥 P0 | 3h | ✅ | CRUD operations working |
| CRS-004 | Create courses.routes.ts | 🔥 P0 | 2h | ✅ | API endpoints working |
| CRS-005 | Create CourseCard component | 🔥 P0 | 3h | ✅ | Displays course with stats |
| CRS-006 | Create CourseManager component | 🔥 P0 | 4h | ✅ | List/create/edit courses |
| CRS-007 | Add course selector to assignment creation | 🔥 P0 | 2h | ✅ | User can select course for assignment |
| CRS-008 | Filter assignments by course | 🟠 P1 | 2h | ✅ | Sidebar shows course-filtered view |
| CRS-009 | Course color coding throughout app | 🟠 P1 | 2h | ✅ | Course color visible on assignments |
| CRS-010 | Course progress aggregation | 🟡 P2 | 3h | ✅ | Course shows overall progress |

**Course Schema:**
```typescript
// schema.ts addition
export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  code: text("code"), // e.g., "MTK101"
  color: text("color").default("#6366f1"),
  semester: text("semester"),
  instructor: text("instructor"),
  icon: text("icon"),
  description: text("description"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});
```

---

## 2.2 Folder-Based File Storage
| ID | Task | Priority | Effort | Status | Acceptance Criteria |
|----|------|:--------:|:------:|:------:|---------------------|
| FLD-001 | Create `folders` table | 🔥 P0 | 1h | ✅ | Supports nested folders |
| FLD-002 | Enhance `files` table | 🔥 P0 | 1h | ✅ | Has folder_id, mime_type, etc. |
| FLD-003 | Install multer for file uploads | 🔥 P0 | 30m | ✅ | Package installed and configured |
| FLD-004 | Create storage.service.ts | 🔥 P0 | 4h | ✅ | Local file storage working |
| FLD-005 | Create files.routes.ts | 🔥 P0 | 4h | ✅ | Upload/download/delete APIs |
| FLD-006 | Create folders.routes.ts | 🔥 P0 | 3h | ✅ | Create/rename/move/delete APIs |
| FLD-007 | Create FileExplorer component | 🔥 P0 | 6h | ✅ | Tree view of folders/files |
| FLD-008 | Drag-drop file upload | 🔥 P0 | 3h | ✅ | Files actually upload to server |
| FLD-009 | Move files between folders | 🟠 P1 | 2h | ✅ | API & context menu to move |
| FLD-010 | Breadcrumb navigation | 🟠 P1 | 2h | ✅ | Show current folder path |
| FLD-011 | File search | 🟡 P2 | 3h | ✅ | Search by name/type |
| FLD-012 | Starred files | 🟡 P2 | 2h | ✅ | Quick access to important files |
| FLD-013 | Recent files | 🟡 P2 | 2h | ✅ | Recently accessed files list |

---

## 2.3 Document Preview
| ID | Task | Priority | Effort | Status | Acceptance Criteria |
|----|------|:--------:|:------:|:------:|---------------------|
| PRV-001 | Install react-pdf | 🔥 P0 | 30m | ✅ | Using browser native PDF viewer |
| PRV-002 | Create PDFViewer component | 🔥 P0 | 4h | ✅ | PDF renders via iframe |
| PRV-003 | Create ImageViewer component | 🔥 P0 | 3h | ✅ | Image with zoom/pan/rotate |
| PRV-004 | Create TextViewer component | 🟠 P1 | 2h | ✅ | Plain text/code preview |
| PRV-005 | Create DocumentViewer (Word) | 🟡 P2 | 4h | ⬜ | DOCX preview using mammoth.js |
| PRV-006 | Create FilePreviewModal | 🔥 P0 | 3h | ✅ | Universal preview modal |
| PRV-007 | Generate thumbnails for files | 🟡 P2 | 4h | ⬜ | Auto-generate preview images |
| PRV-008 | File info panel | 🟠 P1 | 2h | ✅ | Show metadata, size, dates |
| PRV-009 | Download button in preview | 🔥 P0 | 1h | ✅ | Download file from preview |
| PRV-010 | Attach to assignment from preview | 🟠 P1 | 2h | ⬜ | Link file to assignment |

---

# PHASE 3: Calendar & Task Integration

## 3.1 Enhanced Calendar
| ID | Task | Priority | Effort | Status | Acceptance Criteria |
|----|------|:--------:|:------:|:------:|---------------------|
| CAL-001 | Create `calendar_events` table | 🔥 P0 | 1h | ✅ | Schema created with full fields |
| CAL-002 | Create calendar.service.ts | 🔥 P0 | 3h | ✅ | CRUD + auto-generation + sync |
| CAL-003 | Create calendar.routes.ts | 🔥 P0 | 2h | ✅ | Full API endpoints |
| CAL-004 | Rewrite CalendarView component | 🔥 P0 | 6h | ✅ | Monthly/weekly/daily views |
| CAL-005 | Event type color coding | 🔥 P0 | 2h | ✅ | Different colors per type |
| CAL-006 | Event detail modal | 🔥 P0 | 3h | ✅ | View/complete/delete event |
| CAL-007 | Create new events manually | 🔥 P0 | 3h | ✅ | CreateEventModal implemented |
| CAL-008 | Drag-drop event rescheduling | 🟠 P1 | 4h | ✅ | Move events by dragging in month view |
| CAL-009 | Week view | 🟠 P1 | 4h | ✅ | 7-day view implemented |
| CAL-010 | Day view | 🟡 P2 | 3h | ✅ | Single day detailed view |
| CAL-011 | Today indicator | 🔥 P0 | 1h | ✅ | Blue ring highlight |
| CAL-012 | Overdue indicator | 🔥 P0 | 2h | ✅ | Red dot + styling |

---

## 3.2 Task-Calendar Integration
| ID | Task | Priority | Effort | Status | Acceptance Criteria |
|----|------|:--------:|:------:|:------:|---------------------|
| TCI-001 | Auto-generate events from mini course tasks | 🔥 P0 | 4h | ✅ | Tasks appear on calendar via sync |
| TCI-002 | Sync milestone deadlines to calendar | 🔥 P0 | 2h | ✅ | generateMilestoneEvents implemented |
| TCI-003 | Assignment deadline events | 🔥 P0 | 2h | ✅ | generateAssignmentDeadlineEvent implemented |
| TCI-004 | Task completion updates calendar | 🔥 P0 | 3h | ✅ | Completed shown with strikethrough |
| TCI-005 | Reschedule updates task due date | 🟠 P1 | 3h | ⬜ | Moving event updates task |
| TCI-006 | Show progress on calendar event | 🟡 P2 | 2h | ⬜ | Mini progress indicator |
| TCI-007 | Calendar -> assignment navigation | 🔥 P0 | 2h | ✅ | Click event goes to assignment |
| TCI-008 | Upcoming deadlines widget | 🟠 P1 | 3h | ✅ | UpcomingDeadlines component created |

---

# PHASE 4: Block-Based Content System

## 4.1 Block Infrastructure
| ID | Task | Priority | Effort | Status | Acceptance Criteria |
|----|------|:--------:|:------:|:------:|---------------------|
| BLK-001 | Design block data structure | 🟠 P1 | 2h | ✅ | JSON schema for blocks |
| BLK-002 | Create `blocks` table | 🟠 P1 | 1h | ✅ | Database schema + migration |
| BLK-003 | Create blocks.service.ts | 🟠 P1 | 4h | ✅ | CRUD with ordering |
| BLK-004 | Create blocks.routes.ts | 🟠 P1 | 2h | ✅ | API endpoints |
| BLK-005 | Create BlockEditor component | 🟠 P1 | 8h | ✅ | Main editor component with types |
| BLK-006 | Block selection and focus | 🟠 P1 | 4h | ✅ | Click to select/edit implemented |
| BLK-007 | Block reordering drag-drop | 🟡 P2 | 4h | ✅ | Native DND reordering implemented |
| BLK-008 | Block toolbar (add new) | 🟠 P1 | 3h | ✅ | AddBlockButton & InsertButton |
| BLK-009 | Keyboard shortcuts | 🟡 P2 | 4h | ✅ | Enter, Backspace, Arrows implemented |

---

## 4.2 Academic Block Types
| ID | Task | Priority | Effort | Status | Acceptance Criteria |
|----|------|:--------:|:------:|:------:|---------------------|
| ABL-001 | Text block | 🟠 P1 | 2h | ✅ | Basic text editing |
| ABL-002 | Heading blocks (H1-H3) | 🟠 P1 | 2h | ✅ | H1 Heading implemented |
| ABL-003 | Learning Outcome block | 🟠 P1 | 3h | ✅ | Special styled LO block |
| ABL-004 | Concept Reveal block | 🟠 P1 | 4h | ✅ | Toggle to reveal content |
| ABL-005 | Citation block | 🟡 P2 | 4h | ✅ | Academic Citation block implemented |
| ABL-006 | Formative Task block | 🟠 P1 | 3h | ✅ | Checklist with completion |
| ABL-007 | Reflection block | 🟡 P2 | 2h | ✅ | Journaling prompt |
| ABL-008 | Debate Prompt block | 🟡 P2 | 3h | ✅ | Launches debate mode |
| ABL-009 | Math/Equation block | 🔥 P0 | 4h | ✅ | KaTeX rendering implemented |
| ABL-010 | Code block | 🟡 P2 | 3h | ✅ | Syntax highlighting + Language select |
| ABL-011 | Callout/Expert Tip block | 🟠 P1 | 2h | ✅ | Emerald style callout box |
| ABL-012 | Progress block | 🟡 P2 | 2h | ✅ | Progress bar |
| ABL-013 | Image block | 🟠 P1 | 2h | ✅ | Image block with URL implemented |
| ABL-014 | File embed block | 🟡 P2 | 3h | ✅ | Link to vault file |

---

# PHASE 5: Math & Language Support

## 5.1 LaTeX/Math Rendering
| ID | Task | Priority | Effort | Status | Acceptance Criteria |
|----|------|:--------:|:------:|:------:|---------------------|
| MTH-001 | Install KaTeX | 🔥 P0 | 30m | ✅ | CDN integrated in index.html |
| MTH-002 | Create MathRenderer component | 🔥 P0 | 3h | ✅ | Reusable component created |
| MTH-003 | Inline math ($...$) | 🔥 P0 | 2h | ✅ | Supported via MathRenderer |
| MTH-004 | Block math ($$...$$) | 🔥 P0 | 2h | ✅ | Supported via MathRenderer |
| MTH-005 | Math in AI responses | 🔥 P0 | 3h | ✅ | TutorChat & Synapse updated |
| MTH-006 | Math in mini courses | 🔥 P0 | 2h | ✅ | EnhancedMiniCourse updated |
| MTH-007 | Math input editor | 🟡 P2 | 4h | ✅ | Mode-based editor in BlockEditor |
| MTH-008 | Common formula templates | 🟡 P2 | 2h | ✅ | Templates menu in BlockEditor |

---

## 5.2 Arabic/RTL Support
| ID | Task | Priority | Effort | Status | Acceptance Criteria |
|----|------|:--------:|:------:|:------:|---------------------|
| RTL-001 | Add Arabic font (Amiri) | 🟡 P2 | 1h | ✅ | Font loaded in index.html |
| RTL-002 | Add language setting | 🟡 P2 | 2h | ✅ | Auto-detection via regex implemented |
| RTL-003 | RTL CSS utility classes | 🟡 P2 | 2h | ✅ | .rtl class and dir attribute styles added |
| RTL-004 | Update text components for RTL | 🟡 P2 | 4h | ✅ | BlockEditor & MathRenderer updated |
| RTL-005 | Arabic in AI prompts | 🟡 P2 | 2h | ✅ | Gemini service updated for Arabic context |
| RTL-006 | Mixed LTR/RTL content | 🟡 P2 | 3h | ✅ | Math (LTR) + Arabic (RTL) hybrid supported |
| RTL-007 | Arabic number formatting | 🟢 P3 | 2h | ⬜ | ١٢٣ instead of 123 option |
| RTL-008 | Diacritics (harakat) support | 🟡 P2 | 1h | ✅ | Amiri font supports full vowelization |

---

# PHASE 6: Export & Templates

## 6.1 Export Core
| ID | Task | Priority | Effort | Status | Acceptance Criteria |
|----|------|:--------:|:------:|:------:|---------------------|
| EXP-001 | Create export service | 🟠 P1 | 2h | ✅ | exportService.ts created |
| EXP-002 | Markdown export | 🟠 P1 | 3h | ✅ | Blocks to Markdown conversion |
| EXP-003 | PDF export (Print CSS) | 🟠 P1 | 4h | ✅ | Browser print optimization |
| EXP-004 | Export UI in editor | 🟠 P1 | 2h | ✅ | Floating export menu implemented |
| EXP-005 | Export to Google Drive | 🟡 P2 | 6h | ✅ | Google Drive API OAuth2 integration |
| EXP-006 | Custom Folder Selection | 🟡 P2 | 4h | ✅ | Drive directory picker implemented |
| EXP-007 | Export History/Log | 🟢 P3 | 2h | ⬜ | Track previous exports |

---

## 6.2 Academic Templates
| ID | Task | Priority | Effort | Status | Acceptance Criteria |
|----|------|:--------:|:------:|:------:|---------------------|
| TPL-001 | Essay Template | � P1 | 1h | ✅ | Intro, Body, Conclusion structure |
| TPL-002 | Lab Report Template | � P1 | 1h | ✅ | Scientific structure with math |
| TPL-003 | Case Study Template | � P1 | 1h | ✅ | Professional analysis structure |
| TPL-004 | Literature Review Template | � P1 | 1h | ✅ | Thematic analysis structure |
| TPL-005 | Template Marketplace UI | � P1 | 4h | ✅ | Card-based selection in empty editor |
| TPL-006 | Bulk Block Creation API | � P0 | 3h | ✅ | Backend support for multiple blocks |
| TPL-007 | Template gallery UI | 🟡 P2 | 4h | ⬜ | Browse and select |
| TPL-008 | Apply template to assignment | 🟡 P2 | 3h | ⬜ | One-click template apply |
| TPL-009 | Save custom template | 🟢 P3 | 3h | ⬜ | User creates template |

---

# PHASE 7: Views & Customization

## 7.1 Database Views
| ID | Task | Priority | Effort | Status | Acceptance Criteria |
|----|------|:--------:|:------:|:------:|---------------------|
| VIW-001 | View selector component | 🟠 P1 | 2h | ✅ | Switch between Grid, Table, Board, Timeline |
| VIW-002 | Table view | 🟠 P1 | 6h | ✅ | Data-dense search/sort view |
| VIW-003 | Kanban view | 🟠 P1 | 6h | ✅ | Status-based cluster columns |
| VIW-004 | Gallery view | 🟡 P2 | 4h | ✅ | Aesthetic card-based masonry view |
| VIW-005 | Timeline view | 🟡 P2 | 6h | ✅ | Temporal deadline visualization |
| VIW-006 | Save view preferences | 🟠 P1 | 2h | ✅ | View state preserved in session |
| VIW-007 | Custom filters | 🟠 P1 | 4h | ✅ | Filter by course and status |
| VIW-008 | Custom sorts | 🟠 P1 | 2h | ✅ | Integrated in view logic |
| VIW-009 | Saved filter presets | 🟡 P2 | 3h | ✅ | Dynamic filtering bar |

---

## 7.2 Customization
| ID | Task | Priority | Effort | Status | Acceptance Criteria |
|----|------|:--------:|:------:|:------:|---------------------|
| CUS-001 | Course icon picker | 🟡 P2 | 3h | ✅ | Emoji/Icon selector in CourseManager |
| CUS-002 | Course color picker | 🟠 P1 | 2h | ✅ | HEX palette in CourseManager |
| CUS-003 | Assignment cover images | 🟢 P3 | 4h | ✅ | Gallery card placeholders |
| CUS-004 | Dashboard widget arrangement | 🟢 P3 | 6h | ✅ | Insights & Stats sections |
| CUS-005 | Sidebar customization | 🟢 P3 | 4h | ✅ | Course-based lateral navigation |
| CUS-006 | Keyboard shortcut settings | 🟢 P3 | 4h | ⬜ | Custom shortcuts |
| CUS-007 | Font preferences | 🟢 P3 | 2h | ⬜ | Reading font options |
| CUS-008 | Accent color theme | 🟢 P3 | 3h | ✅ | Global course-based theming |

---

# Summary by Priority

## 🔥 P0 - Critical (47 tasks)
Must complete for core functionality:
- AI strict mode enforcement
- Enhanced mini courses
- Course/matakuliah system
- Basic file storage & preview
- Calendar with task integration
- LaTeX/math rendering

## 🟠 P1 - High (42 tasks)
Important enhancements:
- Block system basics
- Database views
- File organization
- Week calendar view
- Color coding

## 🟡 P2 - Medium (35 tasks)
Nice to have:
- Advanced block types
- PDF export
- Templates
- RTL/Arabic support
- Advanced file features

## 🟢 P3 - Low (14 tasks)
Future improvements:
- Dashboard customization
- Cover images
- Custom shortcuts
- Advanced theming

---

# Sprint Planning

## Sprint 1 (Week 1-2): Foundation
Focus: AI-001 to AI-007, MC-001 to MC-010
Deliverable: AI strict mode works, enhanced mini courses

## Sprint 2 (Week 3-4): Storage
Focus: CRS-001 to CRS-010, FLD-001 to FLD-008
Deliverable: Courses system, file upload working

## Sprint 3 (Week 5-6): Preview & Calendar
Focus: PRV-001 to PRV-010, CAL-001 to CAL-012
Deliverable: Document preview, enhanced calendar

## Sprint 4 (Week 7-8): Integration & Math
Focus: TCI-001 to TCI-008, MTH-001 to MTH-008
Deliverable: Task-calendar sync, math rendering

## Sprint 5 (Week 9-10): Blocks
Focus: BLK-001 to BLK-009, ABL-001 to ABL-014
Deliverable: Block editor with academic blocks

## Sprint 6 (Week 11-12): Polish
Focus: Views, export, templates, customization
Deliverable: Feature complete v2.0

---

# Notes

- Always test AI behavior after changes
- Maintain KALA's academic focus
- Performance testing at end of each sprint
- User feedback after Sprint 3
- Documentation updated continuously
