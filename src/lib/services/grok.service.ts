/**
 * Grok AI Service - Enhanced with Strict Mode
 * 
 * Provides AI capabilities using xAI's Grok models
 * Mirrors the functionality of GeminiService for consistency
 * 
 * STRICT MODE: AI never provides direct answers to assignments
 */

import { getGrokClient, GrokModels } from "../config/grok";
import type OpenAI from "openai";
import type {
    AnalyzedAssignment,
    MiniCourse,
    ScaffoldingTask,
    QuizQuestion,
    ValidationResult,
    FileData,
} from "../types/index";
import {
    AIBehaviorConfig,
    DEFAULT_AI_BEHAVIOR,
    getStrictModePrompt,
    getThinkingModePrompt,
    getHintLevelPrompt,
    getChatTutoringPrompt,
    getValidationPrompt,
} from "./ai-prompts";

export class GrokService {
    private async chat(
        messages: OpenAI.Chat.ChatCompletionMessageParam[],
        apiKey?: string,
        jsonMode: boolean = true
    ): Promise<string> {
        const client = getGrokClient(apiKey);

        const response = await client.chat.completions.create({
            model: GrokModels.GROK_2,
            messages,
            response_format: jsonMode ? { type: "json_object" } : { type: "text" },
            temperature: 0.7,
        });

        return response.choices[0]?.message?.content || "";
    }

    /**
     * Analyze assignment with STRICT MODE
     */
    async analyzeAssignment(
        text: string,
        fileData?: FileData,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<AnalyzedAssignment> {
        const strictPrompt = getStrictModePrompt(behaviorConfig);

        const langInstruction = behaviorConfig.language === 'id'
            ? 'Respons HARUS dalam Bahasa Indonesia.'
            : behaviorConfig.language === 'ar'
                ? 'يجب أن تكون الاستجابة باللغة العربية.'
                : 'Response must be in English.';

        const systemPrompt = `${strictPrompt}

${langInstruction}

You are a Senior Professor analyzing academic assignments.
Your task is to ANALYZE the assignment structure, NOT to solve it.

EXTRACT ONLY:
- title: string
- description: string (what the assignment asks, NOT the answer)
- learningOutcome: string (core learning objective)
- diagnosticQuestions: string[] (3 questions to assess baseline knowledge)
- deadline: string (ISO date format)
- course: string
- rubrics: string[] (assessment criteria)
- milestones: array of { title, description, estimatedMinutes, deadline }

CRITICAL RULES:
- If the assignment contains questions or problems, extract the TOPICS, not answers
- Milestones should teach HOW to approach problems, not solve them
- Be thorough and pedagogically sound in generating milestones

Return as JSON.`;

        const userContent = fileData
            ? `Analyze this assignment document/image and text:\n\n${text}\n\n[Document data provided as base64]`
            : `Analyze this assignment: ${text}`;

        const response = await this.chat([
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent }
        ], apiKey);

        return JSON.parse(response);
    }

    /**
     * Generate mini course with STRICT MODE
     */
    async generateMiniCourse(
        milestoneTitle: string,
        milestoneDesc: string,
        assignmentContext: string,
        fullRoadmap?: string,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<MiniCourse> {
        const strictPrompt = getStrictModePrompt(behaviorConfig);

        const langInstruction = behaviorConfig.language === 'id'
            ? 'Respons HARUS dalam Bahasa Indonesia yang formal dan akademis.'
            : behaviorConfig.language === 'ar'
                ? 'يجب أن تكون الاستجابة باللغة العربية الفصحى الأكاديمية.'
                : 'Response MUST be in formal academic English.';

        const systemPrompt = `${strictPrompt}

${langInstruction}

You are a Distinguished University Professor creating comprehensive academic modules.

CRITICAL: You are creating a LEARNING module, not an answer key.
- Guide HOW to think about the topic
- Explain concepts, but don't solve problems for them
- Formative actions should be learning tasks, not finished work

Return a JSON object with:
- learningOutcome: string (using Bloom's Taxonomy)
- overview: string (the "Why" - deep context, minimum 200 words)
- concepts: string[] (5-7 core theoretical concepts)
- practicalGuide: string (detailed step-by-step methodology, minimum 300 words - how to APPROACH, not how to SOLVE)
- formativeAction: string (specific measurable learning task)
- expertTip: string (nuanced professional insight)`;

        const userPrompt = `Create a comprehensive Academic Module for milestone: "${milestoneTitle}"

Description: ${milestoneDesc}
Assignment Context: ${assignmentContext}
${fullRoadmap ? `Full Roadmap: ${fullRoadmap}` : ""}

Remember: This should teach the student HOW to learn and approach this topic, not give them the answers.`;

        const response = await this.chat([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ], apiKey);

        const data = JSON.parse(response);
        return { ...data, masteryStatus: "untested", formativeTaskCompleted: false };
    }

    /**
     * Generate daily synapse with appropriate language
     */
    async generateDailySynapse(
        assignmentTitle: string,
        assignmentDesc: string,
        progress: number,
        atRisk: boolean,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<string> {
        const statusContext = atRisk
            ? "Student is STAGNANT and AT RISK. Question should be a gentle but firm wake-up call."
            : progress > 80
                ? "Student is near completion. Challenge the 'last mile' quality."
                : "Student is mid-process. Challenge core assumptions.";

        const langInstruction = behaviorConfig.language === 'id'
            ? 'Pertanyaan HARUS dalam Bahasa Indonesia.'
            : behaviorConfig.language === 'ar'
                ? 'يجب أن يكون السؤال باللغة العربية.'
                : 'Question must be in English.';

        const systemPrompt = `${langInstruction}

You are a world-class Senior Academic Mentor with expertise in Epistemology.
Generate ONE provocative micro-question that creates a "Mental Shift".

Rules:
- Avoid clichés
- Use Socratic irony or existential academic provocation
- Focus on the 'Why' or 'Hidden Complexity'
- Maximum 12 words
- Elegant, slightly detached, profoundly insightful tone

IMPORTANT: This is a QUESTION to provoke thinking, NOT an answer.

Return plain text only, no JSON.`;

        const response = await this.chat([
            { role: "system", content: systemPrompt },
            { role: "user", content: `Assignment: "${assignmentTitle}" (${assignmentDesc})\nProgress: ${progress}%\n${statusContext}` }
        ], apiKey, false);

        return response.trim() || "What if your primary assumption is fundamentally incomplete?";
    }

    /**
     * Generate scaffolding task - helps start, doesn't do work
     */
    async generateScaffoldingTask(
        assignmentContext: string,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<ScaffoldingTask> {
        const langInstruction = behaviorConfig.language === 'id'
            ? 'Instruksi HARUS dalam Bahasa Indonesia.'
            : 'Instruction must be in English.';

        const systemPrompt = `${langInstruction}

The student is experiencing "Academic Freeze" (0% progress, deadline imminent).
Generate ONE "Micro-Burst" task that is extremely low-friction (less than 5 minutes).

IMPORTANT: The task should help them START, not do work for them.

Good examples:
- "Write ONE sentence about what confuses you most"
- "List 3 keywords related to your topic"
- "Open your notes and highlight ONE important concept"

BAD examples (these do work for them):
- "Write the introduction"
- "Create an outline for the essay"

Return JSON with: { instruction: string, durationSeconds: number }`;

        const response = await this.chat([
            { role: "system", content: systemPrompt },
            { role: "user", content: `Assignment: ${assignmentContext}` }
        ], apiKey);

        const data = JSON.parse(response);
        return { ...data, id: crypto.randomUUID(), completed: false };
    }

    /**
     * Generate quiz - tests understanding, doesn't give answers
     */
    async generateQuiz(
        context: string,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<QuizQuestion[]> {
        const langInstruction = behaviorConfig.language === 'id'
            ? 'Quiz HARUS dalam Bahasa Indonesia.'
            : 'Quiz must be in English.';

        const systemPrompt = `${langInstruction}

Generate a 5-question multiple choice quiz for academic assessment.

IMPORTANT RULES:
- Questions should TEST understanding, not be answerable by simple lookup
- Include application-level questions
- Explanations should teach WHY the answer is correct

Return JSON array with objects containing:
- question: string
- options: string[] (exactly 4 options)
- correctAnswer: number (0-3 index)
- explanation: string`;

        const response = await this.chat([
            { role: "system", content: systemPrompt },
            { role: "user", content: `Academic content: ${context}` }
        ], apiKey);

        return JSON.parse(response);
    }

    /**
     * Validate work - assesses but never writes for student
     */
    async validateWork(
        assignmentContext: string,
        workText: string,
        reflectionText: string,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<ValidationResult> {
        const validationPrompt = getValidationPrompt(assignmentContext, behaviorConfig);

        const systemPrompt = `${validationPrompt}

Evaluate based on:
- Task Alignment (Level 1-4)
- Analytical Rigor (Level 1-4)
- Conceptual Precision (Level 1-4)
- Metacognitive Reflection (Level 1-4)

IMPORTANT:
- Provide constructive feedback
- Point out WHAT needs improvement, not HOW to fix it
- Be encouraging while maintaining standards

Return JSON with:
- overallScore: number
- rubricScores: array of { criterion, score, feedback }
- strengths: string[]
- weaknesses: string[]
- recommendations: string[]
- alignmentScore: number`;

        const response = await this.chat([
            { role: "system", content: systemPrompt },
            { role: "user", content: `Student Work: ${workText}\n\nReflection: ${reflectionText}` }
        ], apiKey);

        return { ...JSON.parse(response), assessmentDate: new Date().toISOString() };
    }

    /**
     * Chat message for tutoring with STRICT MODE
     */
    async chatMessage(
        systemInstruction: string,
        messages: { role: "user" | "assistant"; content: string }[],
        newMessage: string,
        apiKey?: string,
        behaviorConfig: AIBehaviorConfig = DEFAULT_AI_BEHAVIOR
    ): Promise<string> {
        const client = getGrokClient(apiKey);

        // Inject strict mode into system instruction
        const strictPrompt = getStrictModePrompt(behaviorConfig);
        const thinkingPrompt = getThinkingModePrompt(behaviorConfig.thinkingMode);
        const hintPrompt = getHintLevelPrompt(behaviorConfig.hintLevel);

        const enhancedSystemInstruction = `${strictPrompt}

${thinkingPrompt}

${hintPrompt}

${systemInstruction}

REMEMBER: You are a MENTOR. Guide the student's thinking, never do work for them.`;

        const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: "system", content: enhancedSystemInstruction },
            ...messages,
            { role: "user", content: newMessage }
        ];

        const response = await client.chat.completions.create({
            model: GrokModels.GROK_2,
            messages: chatMessages,
            temperature: 0.8,
        });

        return response.choices[0]?.message?.content || "";
    }
}

export const grokService = new GrokService();
