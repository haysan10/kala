import { z } from "zod";

// ==================== AUTH SCHEMAS ====================
export const registerSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    avatar: z.string().url().optional(),
});

export const updateSettingsSchema = z.object({
    // AI Provider Configuration
    aiProvider: z.enum(["gemini", "grok"]).optional(),
    geminiApiKey: z.string().min(10).optional(),
    grokApiKey: z.string().min(10).optional(),

    // User Preferences (AI parameters tidak bisa diubah)
    language: z.enum(["en", "id"]).optional(),
    thinkingMode: z.enum(["socratic", "guided", "exploratory"]).optional(),
    hintLevel: z.enum(["minimal", "moderate", "generous"]).optional(),

    // Notification preferences
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
});

// ==================== ASSIGNMENT SCHEMAS ====================
export const createAssignmentSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    learningOutcome: z.string().optional(),
    deadline: z.string().optional(),
    course: z.string().optional(),
    tags: z.array(z.string()).optional(),
    rubrics: z.array(z.string()).optional(),
    diagnosticQuestions: z.array(z.string()).optional(),
    milestones: z.array(z.object({
        title: z.string(),
        description: z.string().optional(),
        estimatedMinutes: z.number().optional(),
        deadline: z.string().optional(),
    })).optional(),
});

export const updateAssignmentSchema = createAssignmentSchema.partial().extend({
    overallProgress: z.number().min(0).max(100).optional(),
    atRisk: z.boolean().optional(),
    clarityScore: z.number().optional(),
    summativeReflection: z.string().optional(),
});

// ==================== MILESTONE SCHEMAS ====================
export const createMilestoneSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    estimatedMinutes: z.number().optional(),
    deadline: z.string().optional(),
});

export const updateMilestoneSchema = createMilestoneSchema.partial().extend({
    status: z.enum(["todo", "in_progress", "completed"]).optional(),
});

// ==================== AI SCHEMAS ====================
export const analyzeAssignmentSchema = z.object({
    text: z.string().optional(),
    // File data handled separately via multer
});

export const generateMiniCourseSchema = z.object({
    milestoneId: z.string().uuid(),
    milestoneTitle: z.string(),
    milestoneDescription: z.string(),
    assignmentContext: z.string(),
    fullRoadmap: z.string().optional(),
});

export const generateSynapseSchema = z.object({
    assignmentId: z.string().uuid(),
});

export const generateQuizSchema = z.object({
    context: z.string().min(10),
});

export const validateWorkSchema = z.object({
    assignmentContext: z.string(),
    workText: z.string().min(1),
    reflectionText: z.string().optional(),
});

export const generateScaffoldSchema = z.object({
    assignmentContext: z.string(),
});

// ==================== CHAT SCHEMAS ====================
export const sendMessageSchema = z.object({
    message: z.string().min(1),
});

// ==================== SYNAPSE SCHEMAS ====================
export const completeSynapseSchema = z.object({
    response: z.string().min(1),
});

// ==================== CONTENT BLOCK SCHEMAS ====================
export const contentBlockTypeSchema = z.enum([
    "text",
    "heading",
    "image",
    "code",
    "task",
    "milestone",
    "quiz",
    "file",
    "divider",
    "callout",
    "math",
    "milestone_ref",
    "citation"
]);

export const createContentBlockSchema = z.object({
    assignmentId: z.string().uuid(),
    type: contentBlockTypeSchema,
    content: z.string(),
    metadata: z.record(z.any()).optional(),
    sortOrder: z.number().optional(),
});

export const updateContentBlockSchema = createContentBlockSchema.partial();

export const reorderBlocksSchema = z.object({
    blockIds: z.array(z.string().uuid()),
});

export const bulkCreateContentBlocksSchema = z.object({
    assignmentId: z.string().uuid(),
    blocks: z.array(z.object({
        type: contentBlockTypeSchema,
        content: z.string(),
        metadata: z.record(z.any()).optional(),
        sortOrder: z.number().optional(),
    }))
});

// ==================== TYPE EXPORTS ====================
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;

export type ContentBlockType = z.infer<typeof contentBlockTypeSchema>;
export type CreateContentBlockInput = z.infer<typeof createContentBlockSchema>;
export type UpdateContentBlockInput = z.infer<typeof updateContentBlockSchema>;

export interface ContentBlock {
    id: string;
    assignmentId: string;
    userId: string;
    type: ContentBlockType;
    content: string;
    metadata: Record<string, any>;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

// ==================== AI TYPES ====================
export interface AnalyzedAssignment {
    title: string;
    description: string;
    learningOutcome: string;
    diagnosticQuestions: string[];
    deadline: string;
    course: string;
    rubrics: string[];
    milestones: {
        title: string;
        description: string;
        estimatedMinutes: number;
        deadline: string;
    }[];
}

export interface MiniCourse {
    learningOutcome: string;
    overview: string;
    concepts: string[];
    practicalGuide: string;
    formativeAction: string;
    expertTip: string;
    masteryStatus: string;
    formativeTaskCompleted: boolean;
}

// ==================== ENHANCED MINI COURSE TYPES ====================

export interface CourseSection {
    id: string;
    title: string;
    content: string;
    estimatedMinutes: number;
}

export interface ConceptItem {
    term: string;
    definition: string;
    example: string;
    importance: string;
}

export interface CourseTask {
    id: string;
    instruction: string;
    type: 'action' | 'reflection' | 'research' | 'practice';
    estimatedMinutes: number;
    deliverable: string;
    completed?: boolean;
}

export interface CheckpointQuestion {
    id: string;
    question: string;
    hint: string;
    successCriteria: string;
    answered?: boolean;
    response?: string;
}

export interface Reference {
    title: string;
    type: 'book' | 'article' | 'web' | 'video';
    description: string;
    url?: string;
}

export interface PracticalGuideStep {
    stepNumber: number;
    title: string;
    description: string;
    tips: string[];
}

export interface EnhancedPracticalGuide {
    steps: PracticalGuideStep[];
    commonMistakes: string[];
    proTips: string[];
}

export interface EnhancedMiniCourse {
    // Metadata
    id?: string;
    milestoneId?: string;
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

    // Enhanced Practical Guide
    practicalGuide: EnhancedPracticalGuide;

    // Actionable Tasks
    tasks: CourseTask[];

    // Self-check Checkpoints
    checkpoints: CheckpointQuestion[];

    // References
    references: Reference[];

    // Expert Content
    expertTip: string;
    nextSteps: string;

    // Tracking
    masteryStatus: 'untested' | 'refined' | 'perfected';
    completionPercentage: number;
    completedTasks: string[];
    completedCheckpoints: string[];
}

export interface ScaffoldingTask {
    id: string;
    instruction: string;
    durationSeconds: number;
    completed: boolean;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export interface ValidationResult {
    overallScore: number;
    rubricScores: { criterion: string; score: number; feedback: string }[];
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    alignmentScore: number;
    assessmentDate: string;
}

export interface FileData {
    data: string;
    mimeType: string;
}

