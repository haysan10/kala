import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Use Web Crypto API (universally available in Node.js 19+, browsers, and Edge runtimes)
function generateUUID(): string {
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }
    // Fallback for older environments
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ==================== USERS ====================
export const users = sqliteTable("users", {
    id: text("id").primaryKey().$defaultFn(() => generateUUID()),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash"), // Nullable for OAuth users
    name: text("name").notNull(),

    // OAuth fields
    provider: text("provider").default("email"), // 'email' | 'google' | 'github'
    providerId: text("provider_id"), // User ID from OAuth provider
    avatar: text("avatar"), // Profile picture URL

    // Google Drive Sync
    googleAccessToken: text("google_access_token"),
    googleRefreshToken: text("google_refresh_token"),

    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ==================== USER SETTINGS ====================
export const userSettings = sqliteTable("user_settings", {
    id: text("id").primaryKey().$defaultFn(() => generateUUID()),
    userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),

    // AI Provider Configuration
    aiProvider: text("ai_provider").default("gemini"), // 'gemini' | 'grok'
    geminiApiKey: text("gemini_api_key"),
    grokApiKey: text("grok_api_key"),

    // AI Parameters (STRICT - User cannot change via UI)
    aiTemperature: integer("ai_temperature").default(70), // Stored as integer (0.7 * 100)
    aiMaxTokens: integer("ai_max_tokens").default(2000),
    aiTopP: integer("ai_top_p").default(90), // Stored as integer (0.9 * 100)

    // User Preferences
    language: text("language").default("id"), // 'en' | 'id'
    thinkingMode: text("thinking_mode").default("socratic"), // 'socratic' | 'guided' | 'exploratory'
    hintLevel: text("hint_level").default("minimal"), // 'minimal' | 'moderate' | 'generous'

    // ADVANCED AI BEHAVIOR SETTINGS
    strictNoAnswers: integer("strict_no_answers", { mode: "boolean" }).default(true), // Never give direct answers
    detailedCourseMode: integer("detailed_course_mode", { mode: "boolean" }).default(true), // Generate highly detailed courses
    courseCitationStyle: text("course_citation_style").default("academic"), // 'academic' | 'web' | 'both'
    includeSourceLinks: integer("include_source_links", { mode: "boolean" }).default(true), // Add reference links
    customSystemPrompt: text("custom_system_prompt"), // Optional custom prompt override

    // Notification preferences
    emailNotifications: integer("email_notifications", { mode: "boolean" }).default(true),
    pushNotifications: integer("push_notifications", { mode: "boolean" }).default(true),

    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ==================== COURSES (MATAKULIAH) ====================
export const courses = sqliteTable("courses", {
    id: text("id").primaryKey().$defaultFn(() => generateUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

    // Course Identity
    name: text("name").notNull(), // e.g., "Kalkulus I", "Bahasa Arab"
    code: text("code"), // e.g., "MTK101", "ARB201"
    description: text("description"),

    // Visual Customization
    color: text("color").default("#6366f1"), // Hex color for UI
    icon: text("icon").default("📚"), // Emoji or icon name
    coverImage: text("cover_image"), // Optional cover image URL

    // Academic Info
    semester: text("semester"), // e.g., "2025/1", "Ganjil 2025"
    instructor: text("instructor"), // Professor/teacher name
    credits: integer("credits"), // SKS

    // Organization
    sortOrder: integer("sort_order").default(0),
    isArchived: integer("is_archived", { mode: "boolean" }).default(false),

    // Statistics (calculated)
    totalAssignments: integer("total_assignments").default(0),
    completedAssignments: integer("completed_assignments").default(0),

    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ==================== ASSIGNMENTS ====================
export const assignments = sqliteTable("assignments", {
    id: text("id").primaryKey().$defaultFn(() => generateUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

    // NEW: Link to course (matakuliah)
    courseId: text("course_id").references(() => courses.id, { onDelete: "set null" }),

    title: text("title").notNull(),
    description: text("description"),
    learningOutcome: text("learning_outcome"),
    deadline: text("deadline"),
    course: text("course").default("General"), // Legacy field - kept for backward compat
    tags: text("tags").default("[]"), // JSON array
    rubrics: text("rubrics").default("[]"), // JSON array
    diagnosticQuestions: text("diagnostic_questions").default("[]"), // JSON array
    diagnosticResponses: text("diagnostic_responses").default("{}"), // JSON object
    overallProgress: integer("overall_progress").default(0),
    atRisk: integer("at_risk", { mode: "boolean" }).default(false),
    clarityScore: integer("clarity_score").default(0),
    lastSynapseDate: text("last_synapse_date"),
    summativeReflection: text("summative_reflection"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ==================== MILESTONES ====================
export const milestones = sqliteTable("milestones", {
    id: text("id").primaryKey().$defaultFn(() => generateUUID()),
    assignmentId: text("assignment_id").notNull().references(() => assignments.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    estimatedMinutes: integer("estimated_minutes").default(30),
    deadline: text("deadline"),
    status: text("status").default("todo"), // todo, in_progress, completed
    sortOrder: integer("sort_order").default(0),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ==================== MINI COURSES ====================
export const miniCourses = sqliteTable("mini_courses", {
    id: text("id").primaryKey().$defaultFn(() => generateUUID()),
    milestoneId: text("milestone_id").notNull().unique().references(() => milestones.id, { onDelete: "cascade" }),
    learningOutcome: text("learning_outcome"),
    overview: text("overview"),
    concepts: text("concepts").default("[]"), // JSON array
    practicalGuide: text("practical_guide"),
    formativeAction: text("formative_action"),
    expertTip: text("expert_tip"),
    masteryStatus: text("mastery_status").default("untested"), // untested, refined, perfected
    formativeTaskCompleted: integer("formative_task_completed", { mode: "boolean" }).default(false),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ==================== DEBATE TURNS ====================
export const debateTurns = sqliteTable("debate_turns", {
    id: text("id").primaryKey().$defaultFn(() => generateUUID()),
    miniCourseId: text("mini_course_id").notNull().references(() => miniCourses.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // user, model
    content: text("content").notNull(),
    intellectualWeight: integer("intellectual_weight").default(0),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ==================== FOLDERS ====================
export const folders = sqliteTable("folders", {
    id: text("id").primaryKey().$defaultFn(() => generateUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

    // Folder Identity
    name: text("name").notNull(),
    color: text("color").default("#6366f1"),
    icon: text("icon").default("📁"),

    // Hierarchy
    parentId: text("parent_id"), // NULL for root folders

    // Optional linkage
    assignmentId: text("assignment_id").references(() => assignments.id, { onDelete: "set null" }),
    courseId: text("course_id").references(() => courses.id, { onDelete: "set null" }),

    // Metadata
    isStarred: integer("is_starred", { mode: "boolean" }).default(false),
    sortOrder: integer("sort_order").default(0),

    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ==================== FILES (Enhanced) ====================
export const files = sqliteTable("files", {
    id: text("id").primaryKey().$defaultFn(() => generateUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

    // File Identity
    name: text("name").notNull(),
    originalName: text("original_name"), // Original filename

    // Storage
    storageKey: text("storage_key"), // Path on disk or cloud
    mimeType: text("mime_type"),
    sizeBytes: integer("size_bytes"),

    // Organization
    folderId: text("folder_id").references(() => folders.id, { onDelete: "set null" }),
    assignmentId: text("assignment_id").references(() => assignments.id, { onDelete: "set null" }),

    // File Classification
    type: text("type").default("draft"), // instruction, draft, final, feedback, resource
    category: text("category").default("document"), // document, image, video, audio, other

    // Metadata
    isStarred: integer("is_starred", { mode: "boolean" }).default(false),
    downloadCount: integer("download_count").default(0),
    lastAccessedAt: text("last_accessed_at"),

    // Thumbnail (for images/documents)
    thumbnailKey: text("thumbnail_key"),

    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ==================== VALIDATION RESULTS ====================
export const validationResults = sqliteTable("validation_results", {
    id: text("id").primaryKey().$defaultFn(() => generateUUID()),
    assignmentId: text("assignment_id").notNull().references(() => assignments.id, { onDelete: "cascade" }),
    overallScore: integer("overall_score"),
    rubricScores: text("rubric_scores").default("[]"), // JSON array
    strengths: text("strengths").default("[]"), // JSON array
    weaknesses: text("weaknesses").default("[]"), // JSON array
    recommendations: text("recommendations").default("[]"), // JSON array
    alignmentScore: integer("alignment_score"),
    assessmentDate: text("assessment_date").default(sql`CURRENT_TIMESTAMP`),
});

// ==================== CHAT SESSIONS ====================
export const chatSessions = sqliteTable("chat_sessions", {
    id: text("id").primaryKey().$defaultFn(() => generateUUID()),
    assignmentId: text("assignment_id").notNull().references(() => assignments.id, { onDelete: "cascade" }),
    type: text("type").default("tutor"), // tutor, debate
    systemInstruction: text("system_instruction"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ==================== CHAT MESSAGES ====================
export const chatMessages = sqliteTable("chat_messages", {
    id: text("id").primaryKey().$defaultFn(() => generateUUID()),
    sessionId: text("session_id").notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // user, model, system
    content: text("content").notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ==================== DAILY SYNAPSES ====================
export const dailySynapses = sqliteTable("daily_synapses", {
    id: text("id").primaryKey().$defaultFn(() => generateUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    assignmentId: text("assignment_id").notNull().references(() => assignments.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    response: text("response"),
    synapseDate: text("synapse_date").notNull(),
    completed: integer("completed", { mode: "boolean" }).default(false),
    clarityAwarded: integer("clarity_awarded").default(15),
});

// ==================== NOTIFICATIONS ====================
export const notifications = sqliteTable("notifications", {
    id: text("id").primaryKey().$defaultFn(() => generateUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    message: text("message"),
    type: text("type").default("system"), // deadline, risk, feedback, system
    read: integer("read", { mode: "boolean" }).default(false),
    link: text("link"), // JSON object
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ==================== TEMPLATES ====================
export const templates = sqliteTable("templates", {
    id: text("id").primaryKey().$defaultFn(() => generateUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    course: text("course"),
    tags: text("tags").default("[]"), // JSON array
    rubrics: text("rubrics").default("[]"), // JSON array
    learningOutcome: text("learning_outcome"),
    diagnosticQuestions: text("diagnostic_questions").default("[]"), // JSON array
    milestoneTemplates: text("milestone_templates").default("[]"), // JSON array
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ==================== SCAFFOLDING TASKS ====================
export const scaffoldingTasks = sqliteTable("scaffolding_tasks", {
    id: text("id").primaryKey().$defaultFn(() => generateUUID()),
    assignmentId: text("assignment_id").notNull().references(() => assignments.id, { onDelete: "cascade" }),
    instruction: text("instruction").notNull(),
    durationSeconds: integer("duration_seconds").default(300),
    completed: integer("completed", { mode: "boolean" }).default(false),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ==================== CALENDAR EVENTS ====================
export const calendarEvents = sqliteTable("calendar_events", {
    id: text("id").primaryKey().$defaultFn(() => generateUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

    // Event Identity
    title: text("title").notNull(),
    description: text("description"),

    // Timing
    startTime: text("start_time").notNull(), // ISO datetime
    endTime: text("end_time"), // ISO datetime (null for all-day events)
    allDay: integer("all_day", { mode: "boolean" }).default(false),

    // Event Type & Color
    type: text("type").default("custom"), // custom, assignment_deadline, milestone, study_session, mini_course_task
    color: text("color").default("#3B82F6"), // Hex color

    // Optional Linkage to other entities
    assignmentId: text("assignment_id").references(() => assignments.id, { onDelete: "cascade" }),
    milestoneId: text("milestone_id").references(() => milestones.id, { onDelete: "cascade" }),
    courseId: text("course_id").references(() => courses.id, { onDelete: "set null" }),

    // Status
    status: text("status").default("scheduled"), // scheduled, in_progress, completed, cancelled
    isRecurring: integer("is_recurring", { mode: "boolean" }).default(false),
    recurrenceRule: text("recurrence_rule"), // iCal RRULE format

    // Completion tracking
    completedAt: text("completed_at"),

    // UI metadata
    isVisible: integer("is_visible", { mode: "boolean" }).default(true),
    sortOrder: integer("sort_order").default(0),

    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ==================== CONTENT BLOCKS ====================
export const contentBlocks = sqliteTable("content_blocks", {
    id: text("id").primaryKey().$defaultFn(() => generateUUID()),
    assignmentId: text("assignment_id").notNull().references(() => assignments.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

    // Block Identity
    type: text("type").notNull(), // text, heading, image, code, task, etc.
    content: text("content").notNull(), // Main content (e.g., markdown, image URL, etc.)
    metadata: text("metadata").default("{}"), // JSON for settings (language, alt text, etc.)

    // Ordering
    sortOrder: integer("sort_order").default(0),

    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ==================== TYPE EXPORTS ====================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

export type Assignment = typeof assignments.$inferSelect;
export type NewAssignment = typeof assignments.$inferInsert;

export type Milestone = typeof milestones.$inferSelect;
export type NewMilestone = typeof milestones.$inferInsert;

export type MiniCourse = typeof miniCourses.$inferSelect;
export type NewMiniCourse = typeof miniCourses.$inferInsert;

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;

export type ValidationResult = typeof validationResults.$inferSelect;
export type NewValidationResult = typeof validationResults.$inferInsert;

export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type DailySynapse = typeof dailySynapses.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Template = typeof templates.$inferSelect;
export type ScaffoldingTask = typeof scaffoldingTasks.$inferSelect;

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type NewCalendarEvent = typeof calendarEvents.$inferInsert;

export type ContentBlock = typeof contentBlocks.$inferSelect;
export type NewContentBlock = typeof contentBlocks.$inferInsert;
