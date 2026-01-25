
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Assignment, Milestone, TaskStatus, QuizQuestion, ValidationResult, MiniCourse, ScaffoldingTask } from "../types";

// Get API key with fallback
const getApiKey = () => {
  // Try process.env first (Next.js standard)
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ NEXT_PUBLIC_GEMINI_API_KEY not configured. AI features will be limited.');
    return '';
  }
  
  return apiKey;
};

const apiKey = getApiKey();
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper to check if AI is available
const ensureAI = () => {
  if (!genAI) {
    throw new Error('Gemini API is not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY.');
  }
  return genAI;
};

// Hack for SchemaType string literals since import might fail
const SchemaType = {
  STRING: "STRING",
  NUMBER: "NUMBER",
  INTEGER: "INTEGER",
  BOOLEAN: "BOOLEAN",
  ARRAY: "ARRAY",
  OBJECT: "OBJECT"
};

export const analyzeAssignment = async (text: string, fileData?: { data: string, mimeType: string }): Promise<Partial<Assignment>> => {
  const model = ensureAI().getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const promptParts: any[] = [];
  if (text) promptParts.push(`Analyze this assignment: ${text}`);
  if (fileData) {
    promptParts.push({
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
    promptParts.push("Also analyze the attached document/image provided.");
  }

  promptParts.push(`Act as a Senior Professor. Extract: 
        - title, description, deadline, course, rubrics.
        - Core Learning Outcome (LO): What the student MUST master.
        - Diagnostic Check: 3 questions to assess their current baseline.
        - Milestone sequence: Pedagogically sound steps. 
        Output in strict JSON with these keys: title, description, learningOutcome, diagnosticQuestions, deadline, course, rubrics, milestones.`);

  const result = await model.generateContent(promptParts);
  const response = result.response;
  return JSON.parse(response.text());
};

export const generateDailySynapse = async (assignmentTitle: string, assignmentDesc: string, progress: number, atRisk: boolean): Promise<string> => {
  const model = ensureAI().getGenerativeModel({ model: "gemini-1.5-flash" });

  const statusContext = atRisk 
    ? "The student is STAGNANT and AT RISK. The question must be a gentle but firm wake-up call." 
    : progress > 80 
      ? "The student is near completion. Challenge the 'last mile' quality."
      : "The student is in the middle. Challenge assumptions.";

  const prompt = `Act as a world-class Senior Academic Mentor. 
    Generate ONE single provocative, highly refined micro-question for a student working on "${assignmentTitle}" (${assignmentDesc}). 
    Current state: ${progress}% completion. ${statusContext}
    Goal: "Mental Shift". Max 12 words. Tone: Elegant, insightful.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim() || "What if your primary assumption is incomplete?";
};

export const generateMiniCourse = async (milestoneTitle: string, milestoneDesc: string, assignmentContext: string, fullRoadmap?: string): Promise<MiniCourse> => {
  const model = ensureAI().getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `Act as a Distinguished University Professor. 
    Create a COMPREHENSIVE Academic Module for milestone: "${milestoneTitle}".
    Desc: ${milestoneDesc}
    Context: ${assignmentContext}
    
    REQUIRED JSON STRUCTURE:
    {
       "learningOutcome": "string",
       "overview": "string deep context",
       "concepts": ["string concept 1", "string concept 2"],
       "practicalGuide": "string detailed guide",
       "formativeAction": "string task",
       "expertTip": "string"
    }`;

  const result = await model.generateContent(prompt);
  const data = JSON.parse(result.response.text());
  return { ...data, masteryStatus: 'untested', formativeTaskCompleted: false };
};

export const generateScaffoldingTask = async (assignmentContext: string): Promise<ScaffoldingTask> => {
  const model = ensureAI().getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `Student has "Academic Freeze". Generate ONE "Micro-Burst" task (< 5 mins).
    Assignment: ${assignmentContext}
    Output JSON: { "instruction": "string", "durationSeconds": number }`;

  const result = await model.generateContent(prompt);
  const data = JSON.parse(result.response.text());
  return { ...data, id: Math.random().toString(), completed: false };
};

export const validateWork = async (assignmentContext: string, workText: string, reflectionText: string): Promise<ValidationResult> => {
  const model = ensureAI().getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `PERFORM SUMMATIVE ASSESSMENT.
    Assignment: ${assignmentContext}
    Student Output: ${workText}
    Student Reflection: ${reflectionText}
    
    Evaluate based on: Task Alignment, Analytical Rigor, Conceptual Precision, Metacognitive Reflection.
    Output JSON keys: overallScore (number), rubricScores (array of {criterion, score, feedback}), strengths (string[]), weaknesses (string[]), recommendations (string[]), alignmentScore (number).`;

  const result = await model.generateContent(prompt);
  return { ...JSON.parse(result.response.text()), assessmentDate: new Date().toISOString() };
};

export const generateQuiz = async (context: string): Promise<QuizQuestion[]> => {
  const model = ensureAI().getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `Generate a 5-question multiple choice quiz on: ${context}.
    Each question must have 4 options and one correct answer index.
    Output JSON Array of objects: { question, options (string[]), correctAnswer (index number), explanation }`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};

export const startDebateSession = (milestoneTitle: string, miniCourse: MiniCourse, assignmentContext: string) => {
  const model = ensureAI().getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const systemInstruction = `You are a "Socratic Sparring Partner". 
  Topic: ${milestoneTitle}.
  The student completed: ${miniCourse.formativeAction}.
  Challenge assumptions.`;

  return model.startChat({
    history: [
      { role: "user", parts: [{ text: systemInstruction }] },
      { role: "model", parts: [{ text: "Understood. I am ready to challenge the student's understanding." }] }
    ]
  });
};

export const startTutorChat = (systemInstruction: string) => {
  const model = ensureAI().getGenerativeModel({ model: "gemini-1.5-flash" });
  return model.startChat({
    history: [
      { role: "user", parts: [{ text: systemInstruction }] },
      { role: "model", parts: [{ text: "I am ready to help." }] }
    ]
  });
};

export const generateDraft = async (prompt: string, context: string): Promise<string> => {
  const model = ensureAI().getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(`Act as academic ghostwriter. Context: ${context}. Request: ${prompt}. Output ONLY content.`);
  return result.response.text();
};
