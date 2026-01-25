import { getAIClient } from "../config/gemini";
import {
    AIBehaviorConfig,
    DEFAULT_AI_BEHAVIOR,
    getStrictModePrompt,
    getEnhancedMiniCoursePrompt,
    getValidationPrompt,
} from "./ai-prompts";
import { AnalyzedAssignment, MiniCourse, ScaffoldingTask, QuizQuestion, ValidationResult, FileData } from "../types/index";

// Helper for Schema Types (since we can't depend on import)
// We rely on JSON mode (responseMimeType: "application/json") and prompt engineering 
// rather than strict Schema objects to avoid SDK compatibility issues.

export class GeminiService {
    
    async analyzeAssignment(
        text: string,
        fileData?: FileData,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<AnalyzedAssignment> {
        const ai = getAIClient(apiKey);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });

        const strictPrompt = getStrictModePrompt(behaviorConfig);

        const parts: any[] = [];
        if (text) parts.push(`Analyze this assignment: ${text}`);
        if (fileData) {
            parts.push({
                inlineData: {
                    data: fileData.data,
                    mimeType: fileData.mimeType,
                },
            });
            parts.push("Also analyze the attached document/image provided.");
        }

        const langInstruction = behaviorConfig.language === 'id'
            ? 'Respons HARUS dalam Bahasa Indonesia.'
            : 'Response must be in English.';

        parts.push(`${strictPrompt}

${langInstruction}

Act as a Senior Professor. Your task is to ANALYZE the assignment structure, NOT to solve it.

EXTRACT ONLY:
- title: Assignment title
- description: What the assignment asks (describe, don't solve)
- deadline: Due date if mentioned
- course: Course/subject name
- rubrics: Assessment criteria (array of strings)

GENERATE:
- learningOutcome: What the student should LEARN (not the answer)
- diagnosticQuestions: 3 questions to check student's CURRENT knowledge baseline
- milestones: Pedagogically sound LEARNING steps (array of {title, description, estimatedMinutes, deadline})

Output in strict JSON.`);

        const result = await model.generateContent(parts);
        return JSON.parse(result.response.text());
    }

    async generateMiniCourse(
        milestoneTitle: string,
        milestoneDesc: string,
        assignmentContext: string,
        fullRoadmap?: string,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<MiniCourse> {
        const ai = getAIClient(apiKey);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });

        // Build prompt manually since we aren't using the schema object method
        const strictPrompt = getStrictModePrompt(behaviorConfig);
        const langInstruction = behaviorConfig.language === 'id' ? 'Bahasa Indonesia' : 'English';
        
        const prompt = `${strictPrompt}
        Language: ${langInstruction}
        Act as Professor. Create Mini Course for milestone: "${milestoneTitle}".
        Desc: ${milestoneDesc}
        Context: ${assignmentContext}
        ${fullRoadmap ? `Roadmap: ${fullRoadmap}` : ''}
        
        Output JSON:
        {
          "learningOutcome": "string",
          "overview": "string",
          "concepts": ["string"],
          "practicalGuide": "string (markdown allowed)",
          "formativeAction": "string task",
          "expertTip": "string"
        }`;
        
        const result = await model.generateContent(prompt);
        const data = JSON.parse(result.response.text());
        return { ...data, masteryStatus: "untested", formativeTaskCompleted: false };
    }

    async generateDailySynapse(
        assignmentTitle: string,
        assignmentDesc: string,
        progress: number,
        atRisk: boolean,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<string> {
        const ai = getAIClient(apiKey);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

        const statusContext = atRisk
            ? "Student is AT RISK. Gentle but firm wake-up call."
            : progress > 80
                ? "Near completion. Challenge 'last mile' quality."
                : "Mid-process. Challenge assumptions.";

        const langInstruction = behaviorConfig.language === 'id' ? 'Bahasa Indonesia' : 'English';

        const prompt = `Act as Senior Mentor. ${langInstruction}.
        Generate ONE micro-question for "${assignmentTitle}".
        State: ${progress}%. ${statusContext}
        Goal: "Mental Shift". Max 12 words.
        Output ONLY the question text.`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    }

    async generateScaffoldingTask(
        assignmentContext: string,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<ScaffoldingTask> {
        const ai = getAIClient(apiKey);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });

        const langInstruction = behaviorConfig.language === 'id' ? 'Bahasa Indonesia' : 'English';
        const prompt = `${langInstruction}
        Student has "Academic Freeze". Generate ONE low-friction task (< 5 mins) to start working.
        Assignment: ${assignmentContext}
        Output JSON: { "instruction": "string", "durationSeconds": number }`;

        const result = await model.generateContent(prompt);
        const data = JSON.parse(result.response.text());
        return { ...data, id: "task-" + Date.now(), completed: false };
    }

    async generateQuiz(
        context: string,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<QuizQuestion[]> {
        const ai = getAIClient(apiKey);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });

        const langInstruction = behaviorConfig.language === 'id' ? 'Bahasa Indonesia' : 'English';
        const prompt = `${langInstruction}
        Generate 5 multiple choice questions on: ${context}.
        Test understanding, not lookup.
        Output JSON Array: [{ "question": "string", "options": ["string"], "correctAnswer": number (index), "explanation": "string" }]`;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    }

    async validateWork(
        assignmentContext: string,
        workText: string,
        reflectionText: string,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<ValidationResult> {
        const ai = getAIClient(apiKey);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });

        const validationPrompt = getValidationPrompt(assignmentContext, behaviorConfig);
        const prompt = `${validationPrompt}
        Student Work: ${workText}
        Reflection: ${reflectionText}
        Output JSON: {
            "overallScore": number (1-100),
            "rubricScores": [{ "criterion": "string", "score": number, "feedback": "string" }],
            "strengths": ["string"],
            "weaknesses": ["string"],
            "recommendations": ["string"],
            "alignmentScore": number
        }`;

        const result = await model.generateContent(prompt);
        return { ...JSON.parse(result.response.text()), assessmentDate: new Date().toISOString() };
    }
}

export const geminiService = new GeminiService();
