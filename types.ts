
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface DailySynapse {
  id: string;
  question: string;
  assignmentId: string;
  date: string; // ISO Date
  completed: boolean;
  response?: string;
  clarityAwarded: number;
}

export interface DebateTurn {
  role: 'user' | 'model';
  text: string;
  intellectualWeight: number; // 0-100 score for the argument quality
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

// Base MiniCourse for backward compatibility
export interface MiniCourse {
  learningOutcome: string;
  overview: string;
  concepts: string[] | ConceptItem[]; // Can be string[] or detailed objects
  practicalGuide: string | EnhancedPracticalGuide; // Can be string or structured
  formativeAction: string;
  expertTip: string;
  masteryStatus: 'untested' | 'refined' | 'perfected';
  formativeTaskCompleted: boolean;
  debateHistory?: DebateTurn[];

  // Enhanced fields (optional for backward compat)
  prerequisites?: string[];
  estimatedMinutes?: number;
  difficultyLevel?: 1 | 2 | 3 | 4 | 5;
  sections?: CourseSection[];
  tasks?: CourseTask[];
  checkpoints?: CheckpointQuestion[];
  references?: Reference[];
  nextSteps?: string;
  completionPercentage?: number;
  completedTasks?: string[];
  completedCheckpoints?: string[];
}

export interface FileEntry {
  id: string;
  name: string;
  type: 'instruction' | 'draft' | 'final' | 'feedback';
  timestamp: string;
  size: string;
}

export interface RubricScore {
  criterion: string;
  score: 1 | 2 | 3 | 4;
  feedback: string;
}

export interface ValidationResult {
  overallScore: number;
  rubricScores: RubricScore[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  alignmentScore: number;
  assessmentDate: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  deadline: string; // ISO String
  status: TaskStatus;
  miniCourse?: MiniCourse;
}

export interface ScaffoldingTask {
  id: string;
  instruction: string;
  durationSeconds: number;
  completed: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  learningOutcome: string;
  diagnosticQuestions: string[];
  diagnosticResponses?: Record<string, string>;
  deadline: string;
  // Course linking
  courseId?: string; // Link to Course entity
  course: string;    // Legacy: course name string
  courseColor?: string; // Course color for UI theming
  tags: string[];
  rubrics: string[];
  milestones: Milestone[];
  overallProgress: number;
  atRisk: boolean;
  createdAt: string;
  files: FileEntry[];
  validationHistory: ValidationResult[];
  summativeReflection?: string;
  currentScaffoldingTask?: ScaffoldingTask;
  clarityScore: number;
  lastSynapseDate?: string;
}

export interface AssignmentTemplate {
  id: string;
  name: string;
  course: string;
  tags: string[];
  rubrics: string[];
  milestones: Partial<Milestone>[];
  learningOutcome: string;
  diagnosticQuestions: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'risk' | 'feedback' | 'system';
  timestamp: string;
  read: boolean;
  link?: { view: 'assignment' | 'dashboard'; id: string };
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  aiProvider?: 'gemini' | 'grok';
  geminiApiKey?: string;
  grokApiKey?: string;
  aiLanguage?: 'en' | 'id';
  createdAt: string;
  updatedAt: string;
}

// ==================== COURSE (MATAKULIAH) ====================

export interface Course {
  id: string;
  userId: string;
  name: string;
  code?: string;
  description?: string;
  color: string;
  icon: string;
  coverImage?: string;
  semester?: string;
  instructor?: string;
  credits?: number;
  sortOrder: number;
  isArchived: boolean;
  totalAssignments: number;
  completedAssignments: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseWithStats extends Course {
  assignmentCount: number;
  completedCount: number;
  inProgressCount: number;
  overallProgress: number;
}
