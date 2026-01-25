/**
 * AI Router Service - Enhanced Edition with Strict Mode
 * 
 * Manages multiple AI providers (Gemini and Grok) with:
 * - Smart Task Specialization based on AI strengths
 * - STRICT MODE enforcement (never provide direct answers)
 * - Behavior configuration from user settings
 * - Single API key support
 * - Automatic fallback strategy
 * - API key validation
 */

import { geminiService, GeminiService } from "./gemini.service.js";
import { grokService, GrokService } from "./grok.service.js";
import { getAIClient } from "../config/gemini.js";
import { getGrokClient } from "../config/grok.js";
import {
    AIBehaviorConfig,
    DEFAULT_AI_BEHAVIOR
} from "./ai-prompts.js";
import type {
    AnalyzedAssignment,
    MiniCourse,
    ScaffoldingTask,
    QuizQuestion,
    ValidationResult,
    FileData
} from "../types/index.js";

export type AIProvider = "gemini" | "grok";

export interface AIConfig {
    provider: AIProvider;
    geminiApiKey?: string;
    grokApiKey?: string;
    language?: string;
    // Behavior settings
    behavior: AIBehaviorConfig;
}

/**
 * Task Types dengan keunggulan masing-masing AI
 * 
 * GEMINI Strengths:
 * - Document Analysis & Structured Output
 * - Academic Content Generation
 * - Long-form Educational Content
 * - Multi-modal Processing (images, PDFs)
 * 
 * GROK Strengths:
 * - Conversational & Chat
 * - Real-time Responses
 * - Creative & Provocative Questions
 * - Debate & Discussion
 */
export type TaskType =
    | "analyze_assignment"      // Gemini preferred
    | "generate_minicourse"     // Gemini preferred  
    | "generate_quiz"           // Gemini preferred
    | "validate_work"           // Gemini preferred
    | "generate_synapse"        // Grok preferred
    | "generate_scaffolding"    // Grok preferred
    | "chat_tutoring"           // Grok preferred
    | "chat_debate";            // Grok preferred

// Task-to-Provider mapping for optimal results
const TASK_SPECIALIZATION: Record<TaskType, AIProvider> = {
    // Gemini excels at structured analysis and educational content
    analyze_assignment: "gemini",
    generate_minicourse: "gemini",
    generate_quiz: "gemini",
    validate_work: "gemini",

    // Grok excels at conversational and creative content
    generate_synapse: "grok",
    generate_scaffolding: "grok",
    chat_tutoring: "grok",
    chat_debate: "grok",
};

export interface ValidationKeyResult {
    valid: boolean;
    provider: AIProvider;
    message: string;
    model?: string;
}

// Re-export AI types for consumers
export type { AnalyzedAssignment, MiniCourse, ScaffoldingTask, QuizQuestion, ValidationResult, FileData };

/**
 * AI Router - Enhanced Unified Interface for Multiple AI Providers
 * Now with STRICT MODE enforcement
 */
export class AIRouterService {
    private gemini: GeminiService;
    private grok: GrokService;

    constructor() {
        this.gemini = geminiService;
        this.grok = grokService;
    }

    // ==================== API KEY VALIDATION ====================

    /**
     * Validate Gemini API Key
     */
    async validateGeminiKey(apiKey: string): Promise<ValidationKeyResult> {
        try {
            const client = getAIClient(apiKey);

            // Simple test request to validate key
            const response = await client.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [{ role: "user", parts: [{ text: "Say 'valid' in one word." }] }],
            });

            const text = response.text?.trim().toLowerCase();

            return {
                valid: true,
                provider: "gemini",
                message: "API key valid! Connected to Gemini.",
                model: "gemini-2.0-flash"
            };
        } catch (error: any) {
            console.error("[AIRouter] Gemini validation error:", error.message);

            let message = "API key tidak valid";
            if (error.message?.includes("API_KEY_INVALID")) {
                message = "API key Gemini tidak valid atau sudah expired";
            } else if (error.message?.includes("quota")) {
                message = "Quota API key Gemini sudah habis";
            } else if (error.message?.includes("PERMISSION_DENIED")) {
                message = "API key tidak memiliki permission yang diperlukan";
            }

            return {
                valid: false,
                provider: "gemini",
                message
            };
        }
    }

    /**
     * Validate Grok API Key
     */
    async validateGrokKey(apiKey: string): Promise<ValidationKeyResult> {
        try {
            const client = getGrokClient(apiKey);

            // Simple test request to validate key
            const response = await client.chat.completions.create({
                model: "grok-2",
                messages: [{ role: "user", content: "Say 'valid' in one word." }],
                max_tokens: 10,
            });

            return {
                valid: true,
                provider: "grok",
                message: "API key valid! Connected to Grok.",
                model: "grok-2"
            };
        } catch (error: any) {
            console.error("[AIRouter] Grok validation error:", error.message);

            let message = "API key tidak valid";
            if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
                message = "API key Grok tidak valid atau sudah expired";
            } else if (error.message?.includes("429") || error.message?.includes("rate")) {
                message = "Rate limit tercapai, coba lagi nanti";
            } else if (error.message?.includes("403")) {
                message = "API key tidak memiliki akses ke model Grok";
            }

            return {
                valid: false,
                provider: "grok",
                message
            };
        }
    }

    // ==================== PROVIDER SELECTION ====================

    /**
     * Get API key for specified provider from config
     */
    private getApiKey(provider: AIProvider, config: AIConfig): string | undefined {
        return provider === "gemini" ? config.geminiApiKey : config.grokApiKey;
    }

    /**
     * Get alternative provider for fallback
     */
    private getAlternativeProvider(provider: AIProvider): AIProvider {
        return provider === "gemini" ? "grok" : "gemini";
    }

    /**
     * Check if fallback is available
     */
    private canFallback(config: AIConfig): boolean {
        const alternative = this.getAlternativeProvider(config.provider);
        return !!this.getApiKey(alternative, config);
    }

    /**
     * Get available providers from config
     */
    getAvailableProviders(config: AIConfig): AIProvider[] {
        const available: AIProvider[] = [];
        if (config.geminiApiKey) available.push("gemini");
        if (config.grokApiKey) available.push("grok");
        return available;
    }

    /**
     * Select optimal provider for a task
     * Considers: task specialization, available keys, user preference
     */
    selectProvider(task: TaskType, config: AIConfig): AIProvider {
        const available = this.getAvailableProviders(config);

        // If only one provider available, use it
        if (available.length === 1) {
            return available[0];
        }

        // If no providers available, return user preference anyway (will error later)
        if (available.length === 0) {
            return config.provider;
        }

        // Get optimal provider for this task
        const optimalProvider = TASK_SPECIALIZATION[task];

        // If optimal provider is available, use it
        if (available.includes(optimalProvider)) {
            return optimalProvider;
        }

        // Otherwise use user's preferred provider or first available
        return available.includes(config.provider) ? config.provider : available[0];
    }

    /**
     * Execute with automatic fallback to alternative provider
     */
    private async withFallback<T>(
        config: AIConfig,
        task: TaskType,
        geminiOperation: (apiKey: string | undefined, behavior: AIBehaviorConfig) => Promise<T>,
        grokOperation: (apiKey: string | undefined, behavior: AIBehaviorConfig) => Promise<T>
    ): Promise<T> {
        const primaryProvider = this.selectProvider(task, config);
        const primaryApiKey = this.getApiKey(primaryProvider, config);
        const primaryOperation = primaryProvider === "gemini" ? geminiOperation : grokOperation;
        const behavior = config.behavior || DEFAULT_AI_BEHAVIOR;

        try {
            console.log(`[AIRouter] Executing ${task} with ${primaryProvider} (strict=${behavior.strictNoAnswers})`);
            return await primaryOperation(primaryApiKey, behavior);
        } catch (primaryError) {
            console.warn(`[AIRouter] Primary provider ${primaryProvider} failed:`, primaryError);

            if (this.canFallback(config)) {
                const fallbackProvider = this.getAlternativeProvider(primaryProvider);
                const fallbackApiKey = this.getApiKey(fallbackProvider, config);
                const fallbackOperation = fallbackProvider === "gemini" ? geminiOperation : grokOperation;

                console.log(`[AIRouter] Attempting fallback to ${fallbackProvider}`);

                try {
                    return await fallbackOperation(fallbackApiKey, behavior);
                } catch (fallbackError) {
                    console.error(`[AIRouter] Fallback provider ${fallbackProvider} also failed:`, fallbackError);
                    throw new Error(`Both AI providers failed. Primary: ${primaryProvider}, Fallback: ${fallbackProvider}`);
                }
            }

            throw primaryError;
        }
    }

    // ==================== AI OPERATIONS ====================

    /**
     * Analyze assignment document/text
     * Preferred: GEMINI (better at document analysis & structured output)
     * STRICT MODE: Never extracts answers from assignment documents
     */
    async analyzeAssignment(text: string, fileData: FileData | undefined, config: AIConfig) {
        return this.withFallback(
            config,
            "analyze_assignment",
            (apiKey, behavior) => this.gemini.analyzeAssignment(text, fileData, apiKey, behavior),
            (apiKey, behavior) => this.grok.analyzeAssignment(text, fileData, apiKey, behavior)
        );
    }

    /**
     * Generate mini-course for milestone
     * Preferred: GEMINI (better at long-form educational content)
     * STRICT MODE: Guides learning, never provides solutions
     */
    async generateMiniCourse(
        milestoneTitle: string,
        milestoneDesc: string,
        assignmentContext: string,
        fullRoadmap: string | undefined,
        config: AIConfig
    ) {
        return this.withFallback(
            config,
            "generate_minicourse",
            (apiKey, behavior) => this.gemini.generateMiniCourse(milestoneTitle, milestoneDesc, assignmentContext, fullRoadmap, apiKey, behavior),
            (apiKey, behavior) => this.grok.generateMiniCourse(milestoneTitle, milestoneDesc, assignmentContext, fullRoadmap, apiKey, behavior)
        );
    }

    /**
     * Generate daily synapse question
     * Preferred: GROK (better at creative & provocative questions)
     */
    async generateDailySynapse(
        assignmentTitle: string,
        assignmentDesc: string,
        progress: number,
        atRisk: boolean,
        config: AIConfig
    ): Promise<string> {
        return this.withFallback(
            config,
            "generate_synapse",
            (apiKey, behavior) => this.gemini.generateDailySynapse(assignmentTitle, assignmentDesc, progress, atRisk, apiKey, behavior),
            (apiKey, behavior) => this.grok.generateDailySynapse(assignmentTitle, assignmentDesc, progress, atRisk, apiKey, behavior)
        );
    }

    /**
     * Generate scaffolding task for academic freeze
     * Preferred: GROK (better at motivational & quick responses)
     * STRICT MODE: Helps start work, never does work for student
     */
    async generateScaffoldingTask(assignmentContext: string, config: AIConfig) {
        return this.withFallback(
            config,
            "generate_scaffolding",
            (apiKey, behavior) => this.gemini.generateScaffoldingTask(assignmentContext, apiKey, behavior),
            (apiKey, behavior) => this.grok.generateScaffoldingTask(assignmentContext, apiKey, behavior)
        );
    }

    /**
     * Generate quiz questions
     * Preferred: GEMINI (better at structured educational assessments)
     * STRICT MODE: Tests understanding, questions aren't simply lookup-able
     */
    async generateQuiz(context: string, config: AIConfig) {
        return this.withFallback(
            config,
            "generate_quiz",
            (apiKey, behavior) => this.gemini.generateQuiz(context, apiKey, behavior),
            (apiKey, behavior) => this.grok.generateQuiz(context, apiKey, behavior)
        );
    }

    /**
     * Validate student work
     * Preferred: GEMINI (better at detailed rubric-based assessment)
     * CAN assess and critique, but never rewrites work
     */
    async validateWork(
        assignmentContext: string,
        workText: string,
        reflectionText: string,
        config: AIConfig
    ) {
        return this.withFallback(
            config,
            "validate_work",
            (apiKey, behavior) => this.gemini.validateWork(assignmentContext, workText, reflectionText, apiKey, behavior),
            (apiKey, behavior) => this.grok.validateWork(assignmentContext, workText, reflectionText, apiKey, behavior)
        );
    }

    /**
     * Chat message for tutoring
     * Preferred: GROK (better at conversational interactions)
     * STRICT MODE: Never provides direct answers
     */
    async chatTutoring(
        systemInstruction: string,
        messages: { role: "user" | "assistant"; content: string }[],
        newMessage: string,
        config: AIConfig
    ): Promise<string> {
        const behavior = config.behavior || DEFAULT_AI_BEHAVIOR;

        // Grok is preferred for chat
        if (config.grokApiKey) {
            return this.grok.chatMessage(systemInstruction, messages, newMessage, config.grokApiKey, behavior);
        }

        // Fallback error - Gemini chat requires different handling
        throw new Error("Gemini chat requires session management. Please configure Grok API key for chat functionality.");
    }

    /**
     * Chat message for debate mode
     * Preferred: GROK (better at argumentation & debate)
     * STRICT MODE: Challenges thinking, never provides answers
     */
    async chatDebate(
        systemInstruction: string,
        messages: { role: "user" | "assistant"; content: string }[],
        newMessage: string,
        config: AIConfig
    ): Promise<string> {
        const behavior = config.behavior || DEFAULT_AI_BEHAVIOR;

        if (config.grokApiKey) {
            return this.grok.chatMessage(systemInstruction, messages, newMessage, config.grokApiKey, behavior);
        }

        throw new Error("Gemini chat requires session management. Please configure Grok API key for debate functionality.");
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Build AI config from user data
     * Handles single API key scenario AND behavior settings
     */
    static buildConfig(user: {
        aiProvider: string | null;
        geminiApiKey: string | null;
        grokApiKey: string | null;
        aiLanguage: string | null;
        // Behavior settings from user_settings table
        strictNoAnswers?: boolean | null;
        thinkingMode?: string | null;
        hintLevel?: string | null;
        detailedCourseMode?: boolean | null;
    }): AIConfig {
        const hasGemini = !!user.geminiApiKey;
        const hasGrok = !!user.grokApiKey;

        // Determine provider:
        // 1. If user has preference and has that key, use it
        // 2. If user only has one key, use that provider
        // 3. Default to gemini
        let provider: AIProvider = "gemini";

        if (user.aiProvider === "grok" && hasGrok) {
            provider = "grok";
        } else if (user.aiProvider === "gemini" && hasGemini) {
            provider = "gemini";
        } else if (hasGrok && !hasGemini) {
            provider = "grok";
        } else if (hasGemini && !hasGrok) {
            provider = "gemini";
        }

        // Build behavior config from user settings
        // STRICT MODE is ALWAYS true unless explicitly set to false by developer
        const behavior: AIBehaviorConfig = {
            strictNoAnswers: user.strictNoAnswers !== false, // Default TRUE
            thinkingMode: (user.thinkingMode as AIBehaviorConfig['thinkingMode']) || DEFAULT_AI_BEHAVIOR.thinkingMode,
            hintLevel: (user.hintLevel as AIBehaviorConfig['hintLevel']) || DEFAULT_AI_BEHAVIOR.hintLevel,
            language: (user.aiLanguage as AIBehaviorConfig['language']) || DEFAULT_AI_BEHAVIOR.language,
            detailedCourseMode: user.detailedCourseMode !== false, // Default TRUE
        };

        return {
            provider,
            geminiApiKey: user.geminiApiKey || undefined,
            grokApiKey: user.grokApiKey || undefined,
            language: user.aiLanguage || "en",
            behavior,
        };
    }

    /**
     * Get task specialization info
     */
    static getTaskSpecialization(): Record<TaskType, { provider: AIProvider; reason: string }> {
        return {
            analyze_assignment: {
                provider: "gemini",
                reason: "Gemini unggul dalam analisis dokumen dan menghasilkan output terstruktur"
            },
            generate_minicourse: {
                provider: "gemini",
                reason: "Gemini lebih baik untuk konten edukatif panjang"
            },
            generate_quiz: {
                provider: "gemini",
                reason: "Gemini optimal untuk assessment terstruktur"
            },
            validate_work: {
                provider: "gemini",
                reason: "Gemini bagus untuk penilaian berbasis rubrik"
            },
            generate_synapse: {
                provider: "grok",
                reason: "Grok lebih kreatif untuk pertanyaan provokatif"
            },
            generate_scaffolding: {
                provider: "grok",
                reason: "Grok lebih cepat untuk respons motivasional"
            },
            chat_tutoring: {
                provider: "grok",
                reason: "Grok unggul dalam percakapan interaktif"
            },
            chat_debate: {
                provider: "grok",
                reason: "Grok lebih baik untuk argumentasi & debat"
            },
        };
    }

    /**
     * Check if config has at least one valid API key
     */
    static hasValidConfig(config: AIConfig): boolean {
        return !!(config.geminiApiKey || config.grokApiKey);
    }

    /**
     * Get status summary for UI
     */
    getConfigStatus(config: AIConfig): {
        hasGemini: boolean;
        hasGrok: boolean;
        activeProvider: AIProvider;
        canUseFallback: boolean;
        strictModeEnabled: boolean;
        message: string;
    } {
        const hasGemini = !!config.geminiApiKey;
        const hasGrok = !!config.grokApiKey;
        const strictModeEnabled = config.behavior?.strictNoAnswers !== false;

        let message: string;
        if (hasGemini && hasGrok) {
            message = "Kedua AI tersedia. Task akan otomatis dialokasikan sesuai keahlian masing-masing.";
        } else if (hasGemini) {
            message = "Hanya Gemini tersedia. Semua task akan menggunakan Gemini.";
        } else if (hasGrok) {
            message = "Hanya Grok tersedia. Semua task akan menggunakan Grok.";
        } else {
            message = "Tidak ada API key. Silakan tambahkan minimal satu API key.";
        }

        if (strictModeEnabled) {
            message += " Strict Mode aktif - AI tidak akan memberikan jawaban langsung.";
        }

        return {
            hasGemini,
            hasGrok,
            activeProvider: config.provider,
            canUseFallback: hasGemini && hasGrok,
            strictModeEnabled,
            message
        };
    }
}

export const aiRouter = new AIRouterService();
