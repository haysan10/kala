
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

export interface MiniCourse {
  learningOutcome: string; // The "LO" of this module
  overview: string; // The "Why"
  concepts: string[]; // The "What"
  practicalGuide: string; // The "How"
  formativeAction: string; // The "Action/Micro-task"
  expertTip: string;
  masteryStatus: 'untested' | 'refined' | 'perfected';
  formativeTaskCompleted: boolean;
  debateHistory?: DebateTurn[];
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
  course: string;
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
