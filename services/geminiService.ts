
import { GoogleGenAI, Type } from "@google/genai";
import { Assignment, Milestone, TaskStatus, QuizQuestion, ValidationResult, MiniCourse, ScaffoldingTask } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeAssignment = async (text: string, fileData?: { data: string, mimeType: string }): Promise<Partial<Assignment>> => {
  const parts = [];
  if (text) parts.push({ text: `Analyze this assignment: ${text}` });
  if (fileData) {
    parts.push({
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
    parts.push({ text: "Also analyze the attached document/image provided." });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        ...parts,
        {
          text: `Act as a Senior Professor. Extract: 
        - title, description, deadline, course, rubrics.
        - Core Learning Outcome (LO): What the student MUST master.
        - Diagnostic Check: 3 questions to assess their current baseline.
        - Milestone sequence: Pedagogically sound steps. 
        Output in strict JSON.` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          learningOutcome: { type: Type.STRING },
          diagnosticQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          deadline: { type: Type.STRING },
          course: { type: Type.STRING },
          rubrics: { type: Type.ARRAY, items: { type: Type.STRING } },
          milestones: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedMinutes: { type: Type.NUMBER },
                deadline: { type: Type.STRING }
              },
              required: ["title", "description", "estimatedMinutes", "deadline"]
            }
          }
        },
        required: ["title", "description", "learningOutcome", "diagnosticQuestions", "deadline", "course", "milestones"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateDailySynapse = async (assignmentTitle: string, assignmentDesc: string, progress: number, atRisk: boolean): Promise<string> => {
  const statusContext = atRisk
    ? "The student is STAGNANT and AT RISK. The question must be a gentle but firm wake-up call to their intellectual integrity."
    : progress > 80
      ? "The student is near completion. Challenge the 'last mile' quality and the potential for original contribution."
      : "The student is in the middle of the process. Challenge the core assumptions of their current path.";

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a world-class Senior Academic Mentor with a background in Epistemology. 
    Generate ONE single provocative, highly refined micro-question for a student working on "${assignmentTitle}" (${assignmentDesc}). 
    
    Current state: ${progress}% completion. ${statusContext}
    
    The goal is a "Mental Shift":
    - Avoid cliches. 
    - Use Socratic irony or existential academic provocation. 
    - Focus on the 'Why' or the 'Hidden Complexity' of their specific topic.
    - Strictly MAX 12 words. 
    - Tone: Elegant, slightly detached, profoundly insightful.`,
  });
  return response.text?.trim() || "What if your primary assumption about this topic is fundamentally incomplete?";
};

export const generateMiniCourse = async (milestoneTitle: string, milestoneDesc: string, assignmentContext: string, fullRoadmap?: string): Promise<MiniCourse> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Act as a Distinguished University Professor and Subject Matter Expert. 
    Your task is to create a COMPREHENSIVE and RIGOROUS Academic Module for this specific milestone: "${milestoneTitle}".
    
    Description of this milestone: ${milestoneDesc}
    Context of the whole assignment: ${assignmentContext}
    ${fullRoadmap ? `Full Roadmap Sequence for Continuity: ${fullRoadmap}` : ''}

    REQUIRED STRUCTURE:
    1. Learning Outcome: Use Bloom's Taxonomy (e.g., Analyze, Evaluate, Synthesize).
    2. Overview (The "Why"): Provide deep context. Connect this specific unit to the broader academic field.
    3. Concepts (The "What"): A list of 5-7 core theoretical concepts or technical terms essential for this unit.
    4. Practical Guide (The "How"): This must be a DETAILED, STEP-BY-STEP breakdown. Do not be generic. Provide methodology, academic standards, and specific actions. (Minimum 300 words for this section).
    5. Formative Action: A specific, measurable task the student must complete to demonstrate they've mastered this module.
    6. Expert Tip: A "nuanced" take—something only a professional in the field would know.

    MATH/SCIENCE RULES:
    - ALWAYS use LaTeX for any mathematical formulas or scientific notations.
    - Use single dollar signs for inline math: $formula$.
    - Use double dollar signs for block/display math: $$formula$$.

    ARABIC/RTL SUPPORT:
    - If the user context OR language suggests Arabic, output the content in Arabic.
    - Ensure correct RTL layout for Arabic text.
    - Use 'Amiri' font aesthetic in your "mind" when drafting Arabic content.

    Tone: Formal, authoritative, encouraging, and intellectually stimulating.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          learningOutcome: { type: Type.STRING },
          overview: { type: Type.STRING },
          concepts: { type: Type.ARRAY, items: { type: Type.STRING } },
          practicalGuide: { type: Type.STRING },
          formativeAction: { type: Type.STRING },
          expertTip: { type: Type.STRING }
        },
        required: ["learningOutcome", "overview", "concepts", "practicalGuide", "formativeAction", "expertTip"]
      }
    }
  });
  const data = JSON.parse(response.text || '{}');
  return { ...data, masteryStatus: 'untested', formativeTaskCompleted: false };
};

export const generateScaffoldingTask = async (assignmentContext: string): Promise<ScaffoldingTask> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The student is experiencing "Academic Freeze" (0% progress and very close to deadline). 
    Generate ONE "Micro-Burst" task. 
    It must be extremely low-friction (takes less than 5 minutes). 
    Example: "Write one single sentence describing your main argument in the Vault notes."
    
    Assignment: ${assignmentContext}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          instruction: { type: Type.STRING },
          durationSeconds: { type: Type.NUMBER }
        },
        required: ["instruction", "durationSeconds"]
      }
    }
  });
  const data = JSON.parse(response.text || '{}');
  return { ...data, id: Math.random().toString(), completed: false };
};

export const validateWork = async (assignmentContext: string, workText: string, reflectionText: string): Promise<ValidationResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `PERFORM SUMMATIVE ASSESSMENT.
    Assignment: ${assignmentContext}
    Student Output: ${workText}
    Student Reflection: ${reflectionText}
    
    Evaluate based on:
    - Task Alignment (Level 1-4)
    - Analytical Rigor (Level 1-4)
    - Conceptual Precision (Level 1-4)
    - Metacognitive Reflection (Level 1-4)
    
    Provide scores and qualitative feedback for each rubric criterion.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          rubricScores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                criterion: { type: Type.STRING },
                score: { type: Type.NUMBER },
                feedback: { type: Type.STRING }
              }
            }
          },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          alignmentScore: { type: Type.NUMBER }
        },
        required: ["overallScore", "rubricScores", "strengths", "weaknesses", "recommendations", "alignmentScore"]
      }
    }
  });
  return { ...JSON.parse(response.text || '{}'), assessmentDate: new Date().toISOString() };
};

export const generateQuiz = async (context: string): Promise<QuizQuestion[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a 5-question multiple choice quiz based on this academic content: ${context}.
    Each question must have exactly 4 options and one correct answer (0-3 index).
    Return the response in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.NUMBER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const startDebateSession = (milestoneTitle: string, miniCourse: MiniCourse, assignmentContext: string) => {
  const systemInstruction = `You are a "Socratic Sparring Partner". 
  Your goal is to challenge the user's understanding of: ${milestoneTitle}.
  The student just completed the formative action: ${miniCourse.formativeAction}.
  
  RULES:
  1. Challenge assumptions. Use "Why?" and "How?".
  2. Point out logical fallacies.
  3. Only grant "Perfected" status if they prove deep conceptual mastery.`;

  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: { systemInstruction }
  });
};

export const startTutorChat = (systemInstruction: string) => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction }
  });
};

export const generateDraft = async (prompt: string, context: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a senior academic ghostwriter. 
    Complete the following request based on the context of this assignment. 
    Context: ${context}
    Request: ${prompt}
    
    Instruction: 
    - Output ONLY the generated content. 
    - Maintain academic rigor. 
    - Do not use conversational filler. 
    - If math is involved, use LaTeX ($...$ for inline, $$...$$ for block).
    - Detect the language of the prompt and respond accordingly. If Arabic is detected, ensure the response is in Arabic and compatible with RTL layouts.`
  });
  return response.text || '';
};
