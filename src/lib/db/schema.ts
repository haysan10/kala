import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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
export const users = pgTable("users", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => generateUUID()),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash"), // Nullable for OAuth users
    name: varchar("name", { length: 255 }).notNull(),

    // OAuth fields
    provider: varchar("provider", { length: 50 }).default("email"), // 'email' | 'google' | 'github'
    providerId: varchar("provider_id", { length: 255 }), // User ID from OAuth provider
    avatar: text("avatar"), // Profile picture URL

    // Google Drive Sync
    googleAccessToken: text("google_access_token"),
    googleRefreshToken: text("google_refresh_token"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ==================== USER SETTINGS ====================
export const userSettings = pgTable("user_settings", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => generateUUID()),
    userId: varchar("user_id", { length: 36 }).notNull().unique().references(() => users.id, { onDelete: "cascade" }),

    // AI Provider Configuration
    aiProvider: varchar("ai_provider", { length: 50 }).default("gemini"), // 'gemini' | 'grok'
    geminiApiKey: text("gemini_api_key"),
    grokApiKey: text("grok_api_key"),

    // AI Parameters (STRICT - User cannot change via UI)
    aiTemperature: integer("ai_temperature").default(70), // Stored as integer (0.7 * 100)
    aiMaxTokens: integer("ai_max_tokens").default(2000),
    aiTopP: integer("ai_top_p").default(90), // Stored as integer (0.9 * 100)

    // User Preferences
    language: varchar("language", { length: 10 }).default("id"), // 'en' | 'id'
    thinkingMode: varchar("thinking_mode", { length: 50 }).default("socratic"), // 'socratic' | 'guided' | 'exploratory'
    hintLevel: varchar("hint_level", { length: 50 }).default("minimal"), // 'minimal' | 'moderate' | 'generous'

    // ADVANCED AI BEHAVIOR SETTINGS
    strictNoAnswers: boolean("strict_no_answers").default(true), // Never give direct answers
    detailedCourseMode: boolean("detailed_course_mode").default(true), // Generate highly detailed courses
    courseCitationStyle: varchar("course_citation_style", { length: 50 }).default("academic"), // 'academic' | 'web' | 'both'
    includeSourceLinks: boolean("include_source_links").default(true), // Add reference links
    customSystemPrompt: text("custom_system_prompt"), // Optional custom prompt override

    // Notification preferences
    emailNotifications: boolean("email_notifications").default(true),
    pushNotifications: boolean("push_notifications").default(true),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ==================== COURSES (MATAKULIAH) ====================
export const courses = pgTable("courses", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => generateUUID()),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),

    // Course Identity
    name: varchar("name", { length: 255 }).notNull(), // e.g., "Kalkulus I", "Bahasa Arab"
    code: varchar("code", { length: 50 }), // e.g., "MTK101", "ARB201"
    description: text("description"),

    // Visual Customization
    color: varchar("color", { length: 20 }).default("#6366f1"), // Hex color for UI
    icon: varchar("icon", { length: 50 }).default("📚"), // Emoji or icon name
    coverImage: text("cover_image"), // Optional cover image URL

    // Academic Info
    semester: varchar("semester", { length: 50 }), // e.g., "2025/1", "Ganjil 2025"
    instructor: varchar("instructor", { length: 255 }), // Professor/teacher name
    credits: integer("credits"), // SKS

    // Organization
    sortOrder: integer("sort_order").default(0),
    isArchived: boolean("is_archived").default(false),

    // Statistics (calculated)
    totalAssignments: integer("total_assignments").default(0),
    completedAssignments: integer("completed_assignments").default(0),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ==================== ASSIGNMENTS ====================
export const assignments = pgTable("assignments", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => generateUUID()),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),

    // Link to course (matakuliah)
    courseId: varchar("course_id", { length: 36 }).references(() => courses.id, { onDelete: "set null" }),

    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    learningOutcome: text("learning_outcome"),
    deadline: varchar("deadline", { length: 50 }),
    course: varchar("course", { length: 100 }).default("General"), // Legacy field - kept for backward compat
    tags: text("tags").default("[]"), // JSON string
    rubrics: text("rubrics").default("[]"), // JSON string
    diagnosticQuestions: text("diagnostic_questions").default("[]"), // JSON string
    diagnosticResponses: text("diagnostic_responses").default("{}"), // JSON string
    overallProgress: integer("overall_progress").default(0),
    atRisk: boolean("at_risk").default(false),
    clarityScore: integer("clarity_score").default(0),
    lastSynapseDate: varchar("last_synapse_date", { length: 50 }),
    summativeReflection: text("summative_reflection"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ==================== MILESTONES ====================
export const milestones = pgTable("milestones", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => generateUUID()),
    assignmentId: varchar("assignment_id", { length: 36 }).notNull().references(() => assignments.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    estimatedMinutes: integer("estimated_minutes").default(30),
    deadline: varchar("deadline", { length: 50 }),
    status: varchar("status", { length: 50 }).default("todo"), // todo, in_progress, completed
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ==================== MINI COURSES ====================
export const miniCourses = pgTable("mini_courses", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => generateUUID()),
    milestoneId: varchar("milestone_id", { length: 36 }).notNull().unique().references(() => milestones.id, { onDelete: "cascade" }),
    learningOutcome: text("learning_outcome"),
    overview: text("overview"),
    concepts: text("concepts").default("[]"), // JSON array string
    practicalGuide: text("practical_guide"),
    formativeAction: text("formative_action"),
    expertTip: text("expert_tip"),
    masteryStatus: varchar("mastery_status", { length: 50 }).default("untested"), // untested, refined, perfected
    formativeTaskCompleted: boolean("formative_task_completed").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ==================== DEBATE TURNS ====================
export const debateTurns = pgTable("debate_turns", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => generateUUID()),
    miniCourseId: varchar("mini_course_id", { length: 36 }).notNull().references(() => miniCourses.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 50 }).notNull(), // user, model
    content: text("content").notNull(),
    intellectualWeight: integer("intellectual_weight").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ==================== FOLDERS ====================
export const folders = pgTable("folders", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => generateUUID()),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),

    // Folder Identity
    name: varchar("name", { length: 255 }).notNull(),
    color: varchar("color", { length: 20 }).default("#6366f1"),
    icon: varchar("icon", { length: 50 }).default("📁"),

    // Hierarchy
    parentId: varchar("parent_id", { length: 36 }), // NULL for root folders

    // Optional linkage
    assignmentId: varchar("assignment_id", { length: 36 }).references(() => assignments.id, { onDelete: "set null" }),
    courseId: varchar("course_id", { length: 36 }).references(() => courses.id, { onDelete: "set null" }),

    // Metadata
    isStarred: boolean("is_starred").default(false),
    sortOrder: integer("sort_order").default(0),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ==================== FILES (Enhanced) ====================
export const files = pgTable("files", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => generateUUID()),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),

    // File Identity
    name: varchar("name", { length: 255 }).notNull(),
    originalName: varchar("original_name", { length: 255 }), // Original filename

    // Storage
    storageKey: text("storage_key"), // Path on disk or cloud
    mimeType: varchar("mime_type", { length: 100 }),
    sizeBytes: integer("size_bytes"),

    // Organization
    folderId: varchar("folder_id", { length: 36 }).references(() => folders.id, { onDelete: "set null" }),
    assignmentId: varchar("assignment_id", { length: 36 }).references(() => assignments.id, { onDelete: "set null" }),

    // File Classification
    type: varchar("type", { length: 50 }).default("draft"), // instruction, draft, final, feedback, resource
    category: varchar("category", { length: 50 }).default("document"), // document, image, video, audio, other

    // Metadata
    isStarred: boolean("is_starred").default(false),
    downloadCount: integer("download_count").default(0),
    lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }),

    // Thumbnail (for images/documents)
    thumbnailKey: text("thumbnail_key"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ==================== VALIDATION RESULTS ====================
export const validationResults = pgTable("validation_results", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => generateUUID()),
    assignmentId: varchar("assignment_id", { length: 36 }).notNull().references(() => assignments.id, { onDelete: "cascade" }),
    overallScore: integer("overall_score"),
    rubricScores: text("rubric_scores").default("[]"), // JSON string
    strengths: text("strengths").default("[]"), // JSON string
    weaknesses: text("weaknesses").default("[]"), // JSON string
    recommendations: text("recommendations").default("[]"), // JSON string
    alignmentScore: integer("alignment_score"),
    assessmentDate: timestamp("assessment_date", { withTimezone: true }).defaultNow(),
});

// ==================== CHAT SESSIONS ====================
export const chatSessions = pgTable("chat_sessions", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => generateUUID()),
    assignmentId: varchar("assignment_id", { length: 36 }).notNull().references(() => assignments.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).default("tutor"), // tutor, debate
    systemInstruction: text("system_instruction"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ==================== CHAT MESSAGES ====================
export const chatMessages = pgTable("chat_messages", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => generateUUID()),
    sessionId: varchar("session_id", { length: 36 }).notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 50 }).notNull(), // user, model, system
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ==================== DAILY SYNAPSES ====================
export const dailySynapses = pgTable("daily_synapses", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => generateUUID()),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    assignmentId: varchar("assignment_id", { length: 36 }).notNull().references(() => assignments.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    response: text("response"),
    synapseDate: varchar("synapse_date", { length: 50 }).notNull(),
    completed: boolean("completed").default(false),
    clarityAwarded: integer("clarity_awarded").default(15),
});

// ==================== NOTIFICATIONS ====================
export const notifications = pgTable("notifications", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => generateUUID()),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message"),
    type: varchar("type", { length: 50 }).default("system"), // deadline, risk, feedback, system
    read: boolean("read").default(false),
    link: text("link"), // JSON object string
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ==================== TEMPLATES ====================
export const templates = pgTable("templates", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => generateUUID()),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    course: varchar("course", { length: 100 }),
    tags: text("tags").default("[]"), // JSON string
    rubrics: text("rubrics").default("[]"), // JSON string
    learningOutcome: text("learning_outcome"),
    diagnosticQuestions: text("diagnostic_questions").default("[]"), // JSON string
    milestoneTemplates: text("milestone_templates").default("[]"), // JSON string
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ==================== SCAFFOLDING TASKS ====================
export const scaffoldingTasks = pgTable("scaffolding_tasks", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => generateUUID()),
    assignmentId: varchar("assignment_id", { length: 36 }).notNull().references(() => assignments.id, { onDelete: "cascade" }),
    instruction: text("instruction").notNull(),
    durationSeconds: integer("duration_seconds").default(300),
    completed: boolean("completed").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ==================== CALENDAR EVENTS ====================
export const calendarEvents = pgTable("calendar_events", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => generateUUID()),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),

    // Event Identity
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),

    // Timing
    startTime: timestamp("start_time", { withTimezone: true }).notNull(), 
    endTime: timestamp("end_time", { withTimezone: true }), 
    allDay: boolean("all_day").default(false),

    // Event Type & Color
    type: varchar("type", { length: 50 }).default("custom"), // custom, assignment_deadline, milestone, study_session, mini_course_task
    color: varchar("color", { length: 20 }).default("#3B82F6"), // Hex color

    // Optional Linkage to other entities
    assignmentId: varchar("assignment_id", { length: 36 }).references(() => assignments.id, { onDelete: "cascade" }),
    milestoneId: varchar("milestone_id", { length: 36 }).references(() => milestones.id, { onDelete: "cascade" }),
    courseId: varchar("course_id", { length: 36 }).references(() => courses.id, { onDelete: "set null" }),

    // Status
    status: varchar("status", { length: 50 }).default("scheduled"), // scheduled, in_progress, completed, cancelled
    isRecurring: boolean("is_recurring").default(false),
    recurrenceRule: text("recurrence_rule"), // iCal RRULE format

    // Completion tracking
    completedAt: timestamp("completed_at", { withTimezone: true }),

    // UI metadata
    isVisible: boolean("is_visible").default(true),
    sortOrder: integer("sort_order").default(0),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ==================== CONTENT BLOCKS ====================
export const contentBlocks = pgTable("content_blocks", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => generateUUID()),
    assignmentId: varchar("assignment_id", { length: 36 }).notNull().references(() => assignments.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),

    // Block Identity
    type: varchar("type", { length: 50 }).notNull(), // text, heading, image, code, task, etc.
    content: text("content").notNull(), // Main content (e.g., markdown, image URL, etc.)
    metadata: text("metadata").default("{}"), // JSON string for settings

    // Ordering
    sortOrder: integer("sort_order").default(0),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
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
