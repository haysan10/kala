import { getAIClient } from "../config/gemini.js";
import { Type } from "@google/genai";
import {
    AIBehaviorConfig,
    DEFAULT_AI_BEHAVIOR,
    getStrictModePrompt,
    buildSystemPrompt,
    getEnhancedMiniCoursePrompt,
    getValidationPrompt,
} from "./ai-prompts.js";

interface FileData {
    data: string;
    mimeType: string;
}

interface AnalyzedAssignment {
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

interface MiniCourse {
    learningOutcome: string;
    overview: string;
    concepts: string[];
    practicalGuide: string;
    formativeAction: string;
    expertTip: string;
    masteryStatus: string;
    formativeTaskCompleted: boolean;
}

interface ScaffoldingTask {
    id: string;
    instruction: string;
    durationSeconds: number;
    completed: boolean;
}

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

interface ValidationResult {
    overallScore: number;
    rubricScores: { criterion: string; score: number; feedback: string }[];
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    alignmentScore: number;
    assessmentDate: string;
}

export class GeminiService {
    /**
     * Analyze assignment with STRICT MODE - Never extract answers from documents
     */
    async analyzeAssignment(
        text: string,
        fileData?: FileData,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<AnalyzedAssignment> {
        const ai = getAIClient(apiKey);

        const strictPrompt = getStrictModePrompt(behaviorConfig);

        const parts: any[] = [];
        if (text) parts.push({ text: `Analyze this assignment: ${text}` });
        if (fileData) {
            parts.push({
                inlineData: {
                    data: fileData.data,
                    mimeType: fileData.mimeType,
                },
            });
            parts.push({ text: "Also analyze the attached document/image provided." });
        }

        const langInstruction = behaviorConfig.language === 'id'
            ? 'Respons HARUS dalam Bahasa Indonesia.'
            : behaviorConfig.language === 'ar'
                ? 'يجب أن تكون الاستجابة باللغة العربية.'
                : 'Response must be in English.';

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: {
                parts: [
                    ...parts,
                    {
                        text: `${strictPrompt}

${langInstruction}

Act as a Senior Professor. Your task is to ANALYZE the assignment structure, NOT to solve it.

EXTRACT ONLY:
- title: Assignment title
- description: What the assignment asks (describe, don't solve)
- deadline: Due date if mentioned
- course: Course/subject name
- rubrics: Assessment criteria

GENERATE:
- learningOutcome: What the student should LEARN (not the answer)
- diagnosticQuestions: 3 questions to check student's CURRENT knowledge baseline
- milestones: Pedagogically sound LEARNING steps (guide the process, not the content)

CRITICAL: If this is an assignment with questions or problems:
- Extract the TOPICS and CONCEPTS to learn
- DO NOT extract or provide answers to the questions
- Create milestones that teach HOW to approach the problem type
- The student must do the actual work themselves

Output in strict JSON.`,
                    },
                ],
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
                                    deadline: { type: Type.STRING },
                                },
                                required: ["title", "description", "estimatedMinutes", "deadline"],
                            },
                        },
                    },
                    required: ["title", "description", "learningOutcome", "diagnosticQuestions", "deadline", "course", "milestones"],
                },
            },
        });

        return JSON.parse(response.text || "{}");
    }

    /**
     * Generate ENHANCED mini course with detailed sections and tasks
     */
    async generateMiniCourse(
        milestoneTitle: string,
        milestoneDesc: string,
        assignmentContext: string,
        fullRoadmap?: string,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<MiniCourse> {
        const ai = getAIClient(apiKey);

        // Use detailed mode if enabled
        const systemPrompt = behaviorConfig.detailedCourseMode
            ? getEnhancedMiniCoursePrompt(milestoneTitle, milestoneDesc, assignmentContext, fullRoadmap, behaviorConfig)
            : this.getBasicMiniCoursePrompt(milestoneTitle, milestoneDesc, assignmentContext, fullRoadmap, behaviorConfig);

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: systemPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: behaviorConfig.detailedCourseMode
                    ? this.getEnhancedMiniCourseSchema()
                    : this.getBasicMiniCourseSchema(),
            },
        });

        const data = JSON.parse(response.text || "{}");

        // Ensure backward compatibility
        if (behaviorConfig.detailedCourseMode) {
            // Convert enhanced format to include basic fields for compatibility
            return {
                learningOutcome: data.learningOutcome || '',
                overview: data.overview || '',
                concepts: data.concepts?.map((c: any) => typeof c === 'string' ? c : c.term) || [],
                practicalGuide: typeof data.practicalGuide === 'string'
                    ? data.practicalGuide
                    : data.practicalGuide?.steps?.map((s: any) => s.description).join('\n\n') || '',
                formativeAction: data.tasks?.[0]?.instruction || data.formativeAction || '',
                expertTip: data.expertTip || '',
                masteryStatus: "untested",
                formativeTaskCompleted: false,
                // Include enhanced data
                ...data,
            };
        }

        return { ...data, masteryStatus: "untested", formativeTaskCompleted: false };
    }

    private getBasicMiniCoursePrompt(
        milestoneTitle: string,
        milestoneDesc: string,
        assignmentContext: string,
        fullRoadmap: string | undefined,
        behaviorConfig: AIBehaviorConfig
    ): string {
        const strictPrompt = getStrictModePrompt(behaviorConfig);
        const langInstruction = behaviorConfig.language === 'id'
            ? 'Respons HARUS dalam Bahasa Indonesia yang formal dan akademis.'
            : 'Response MUST be in formal academic English.';

        return `${strictPrompt}

${langInstruction}

Act as a Distinguished University Professor and Subject Matter Expert. 
Your task is to create a COMPREHENSIVE and RIGOROUS Academic Module for this specific milestone: "${milestoneTitle}".

Description of this milestone: ${milestoneDesc}
Context of the whole assignment: ${assignmentContext}
${fullRoadmap ? `Full Roadmap Sequence for Continuity: ${fullRoadmap}` : ""}

REQUIRED STRUCTURE:
1. Learning Outcome: Use Bloom's Taxonomy (e.g., Analyze, Evaluate, Synthesize).
2. Overview (The "Why"): Provide deep context. Connect this specific unit to the broader academic field.
3. Concepts (The "What"): A list of 5-7 core theoretical concepts or technical terms essential for this unit.
4. Practical Guide (The "How"): This must be a DETAILED, STEP-BY-STEP breakdown. Do not be generic. Provide methodology, academic standards, and specific actions. (Minimum 300 words for this section).
5. Formative Action: A specific, measurable task the student must complete to demonstrate they've mastered this module.
6. Expert Tip: A "nuanced" take—something only a professional in the field would know.

REMEMBER: Guide the learning process. NEVER provide answers or complete work for the student.

Tone: Formal, authoritative, encouraging, and intellectually stimulating.`;
    }

    private getBasicMiniCourseSchema() {
        return {
            type: Type.OBJECT,
            properties: {
                learningOutcome: { type: Type.STRING },
                overview: { type: Type.STRING },
                concepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                practicalGuide: { type: Type.STRING },
                formativeAction: { type: Type.STRING },
                expertTip: { type: Type.STRING },
            },
            required: ["learningOutcome", "overview", "concepts", "practicalGuide", "formativeAction", "expertTip"],
        };
    }

    private getEnhancedMiniCourseSchema() {
        return {
            type: Type.OBJECT,
            properties: {
                learningOutcome: { type: Type.STRING },
                prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
                estimatedMinutes: { type: Type.NUMBER },
                difficultyLevel: { type: Type.NUMBER },
                overview: { type: Type.STRING },
                sections: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            content: { type: Type.STRING },
                            estimatedMinutes: { type: Type.NUMBER },
                        },
                        required: ["id", "title", "content", "estimatedMinutes"],
                    },
                },
                concepts: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            term: { type: Type.STRING },
                            definition: { type: Type.STRING },
                            example: { type: Type.STRING },
                            importance: { type: Type.STRING },
                        },
                        required: ["term", "definition", "example", "importance"],
                    },
                },
                practicalGuide: {
                    type: Type.OBJECT,
                    properties: {
                        steps: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    stepNumber: { type: Type.NUMBER },
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    tips: { type: Type.ARRAY, items: { type: Type.STRING } },
                                },
                                required: ["stepNumber", "title", "description", "tips"],
                            },
                        },
                        commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
                        proTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["steps", "commonMistakes", "proTips"],
                },
                tasks: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            instruction: { type: Type.STRING },
                            type: { type: Type.STRING },
                            estimatedMinutes: { type: Type.NUMBER },
                            deliverable: { type: Type.STRING },
                        },
                        required: ["id", "instruction", "type", "estimatedMinutes", "deliverable"],
                    },
                },
                checkpoints: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            question: { type: Type.STRING },
                            hint: { type: Type.STRING },
                            successCriteria: { type: Type.STRING },
                        },
                        required: ["id", "question", "hint", "successCriteria"],
                    },
                },
                references: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            type: { type: Type.STRING },
                            description: { type: Type.STRING },
                        },
                        required: ["title", "type", "description"],
                    },
                },
                expertTip: { type: Type.STRING },
                nextSteps: { type: Type.STRING },
            },
            required: [
                "learningOutcome", "prerequisites", "estimatedMinutes", "difficultyLevel",
                "overview", "sections", "concepts", "practicalGuide", "tasks",
                "checkpoints", "references", "expertTip", "nextSteps"
            ],
        };
    }

    /**
     * Generate daily synapse with strict mode
     */
    async generateDailySynapse(
        assignmentTitle: string,
        assignmentDesc: string,
        progress: number,
        atRisk: boolean,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<string> {
        const ai = getAIClient(apiKey);

        const statusContext = atRisk
            ? "The student is STAGNANT and AT RISK. The question must be a gentle but firm wake-up call to their intellectual integrity."
            : progress > 80
                ? "The student is near completion. Challenge the 'last mile' quality and the potential for original contribution."
                : "The student is in the middle of the process. Challenge the core assumptions of their current path.";

        const langInstruction = behaviorConfig.language === 'id'
            ? 'Pertanyaan HARUS dalam Bahasa Indonesia.'
            : behaviorConfig.language === 'ar'
                ? 'يجب أن يكون السؤال باللغة العربية.'
                : 'Question must be in English.';

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `Act as a world-class Senior Academic Mentor with a background in Epistemology. 
${langInstruction}

Generate ONE single provocative, highly refined micro-question for a student working on "${assignmentTitle}" (${assignmentDesc}). 

Current state: ${progress}% completion. ${statusContext}

The goal is a "Mental Shift":
- Avoid cliches. 
- Use Socratic irony or existential academic provocation. 
- Focus on the 'Why' or the 'Hidden Complexity' of their specific topic.
- Strictly MAX 12 words. 
- Tone: Elegant, slightly detached, profoundly insightful.

IMPORTANT: This is a QUESTION to provoke thinking, NOT an answer or solution.`,
        });

        return response.text?.trim() || "What if your primary assumption about this topic is fundamentally incomplete?";
    }

    /**
     * Generate scaffolding task with strict mode
     */
    async generateScaffoldingTask(
        assignmentContext: string,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<ScaffoldingTask> {
        const ai = getAIClient(apiKey);

        const langInstruction = behaviorConfig.language === 'id'
            ? 'Instruksi HARUS dalam Bahasa Indonesia.'
            : 'Instruction must be in English.';

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `${langInstruction}

The student is experiencing "Academic Freeze" (0% progress and very close to deadline). 
Generate ONE "Micro-Burst" task. 
It must be extremely low-friction (takes less than 5 minutes). 

IMPORTANT: The task should help them START working, not complete work for them.
Examples of good tasks:
- "Write ONE sentence describing what confuses you most"
- "List 3 keywords related to your topic"
- "Open your notes and highlight ONE key concept"

NOT good (too much like doing work for them):
- "Write the introduction paragraph"
- "Create an outline"

Assignment: ${assignmentContext}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        instruction: { type: Type.STRING },
                        durationSeconds: { type: Type.NUMBER },
                    },
                    required: ["instruction", "durationSeconds"],
                },
            },
        });

        const data = JSON.parse(response.text || "{}");
        return { ...data, id: crypto.randomUUID(), completed: false };
    }

    /**
     * Generate quiz with strict mode - Questions test understanding, not give answers
     */
    async generateQuiz(
        context: string,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<QuizQuestion[]> {
        const ai = getAIClient(apiKey);

        const langInstruction = behaviorConfig.language === 'id'
            ? 'Quiz HARUS dalam Bahasa Indonesia.'
            : 'Quiz must be in English.';

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `${langInstruction}

Generate a 5-question multiple choice quiz based on this academic content: ${context}.

IMPORTANT RULES:
- Questions should TEST understanding of concepts
- Questions should NOT be answerable by simply looking at the source material
- Include questions that require APPLYING knowledge
- Each question must have exactly 4 options and one correct answer (0-3 index)
- Explanations should teach WHY the answer is correct

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
                            explanation: { type: Type.STRING },
                        },
                        required: ["question", "options", "correctAnswer", "explanation"],
                    },
                },
            },
        });

        return JSON.parse(response.text || "[]");
    }

    /**
     * Validate work - CAN assess, but never writes for student
     */
    async validateWork(
        assignmentContext: string,
        workText: string,
        reflectionText: string,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<ValidationResult> {
        const ai = getAIClient(apiKey);

        const validationPrompt = getValidationPrompt(assignmentContext, behaviorConfig);

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `${validationPrompt}

STUDENT OUTPUT:
${workText}

STUDENT REFLECTION:
${reflectionText}

Evaluate based on:
- Task Alignment (Level 1-4): Does the work address the assignment requirements?
- Analytical Rigor (Level 1-4): Is the analysis thorough and well-reasoned?
- Conceptual Precision (Level 1-4): Are concepts used accurately?
- Metacognitive Reflection (Level 1-4): Does the student show self-awareness of their learning?

IMPORTANT: 
- Provide constructive feedback that helps the student IMPROVE
- Point out WHAT needs improvement, not HOW to fix it (they must figure that out)
- Be encouraging while maintaining academic standards`,
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
                                    feedback: { type: Type.STRING },
                                },
                            },
                        },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                        alignmentScore: { type: Type.NUMBER },
                    },
                    required: ["overallScore", "rubricScores", "strengths", "weaknesses", "recommendations", "alignmentScore"],
                },
            },
        });

        return { ...JSON.parse(response.text || "{}"), assessmentDate: new Date().toISOString() };
    }
}

export const geminiService = new GeminiService();
