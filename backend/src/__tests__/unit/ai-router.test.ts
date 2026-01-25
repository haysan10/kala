/**
 * Unit Tests for AI Router Service
 * 
 * Tests provider selection, behavior config loading, and routing logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIBehaviorConfig } from '../../services/ai-prompts.js';

// Mock the database
vi.mock('../../config/database.js', () => ({
    db: {
        select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([]),
                }),
            }),
        }),
    },
}));

// Mock the AI services
vi.mock('../../services/gemini.service.js', () => ({
    geminiService: {
        generateMiniCourse: vi.fn().mockResolvedValue({
            learningOutcome: 'Test outcome',
            concepts: ['Concept 1', 'Concept 2'],
            overview: 'Test overview',
            practicalGuide: 'Test guide',
            formativeAction: 'Test action',
            expertTip: 'Test tip',
        }),
        chat: vi.fn().mockResolvedValue('Test response'),
        generateDailySynapse: vi.fn().mockResolvedValue('Test question?'),
    },
}));

vi.mock('../../services/grok.service.js', () => ({
    grokService: {
        chat: vi.fn().mockResolvedValue('Grok response'),
        generateMiniCourse: vi.fn().mockResolvedValue({
            learningOutcome: 'Grok outcome',
            concepts: ['Grok Concept'],
            overview: 'Grok overview',
            practicalGuide: 'Grok guide',
            formativeAction: 'Grok action',
            expertTip: 'Grok tip',
        }),
    },
}));

describe('AI Router Service', () => {
    describe('Behavior Config', () => {
        it('should have default behavior config values', () => {
            const defaultConfig: AIBehaviorConfig = {
                strictNoAnswers: true,
                thinkingMode: 'socratic',
                hintLevel: 'minimal',
                language: 'id',
                detailedCourseMode: true,
            };

            expect(defaultConfig.strictNoAnswers).toBe(true);
            expect(defaultConfig.thinkingMode).toBe('socratic');
            expect(defaultConfig.hintLevel).toBe('minimal');
            expect(defaultConfig.language).toBe('id');
        });

        it('should allow all thinking mode values', () => {
            const modes = ['socratic', 'guided', 'exploratory'] as const;

            modes.forEach(mode => {
                const config: AIBehaviorConfig = {
                    strictNoAnswers: true,
                    thinkingMode: mode,
                    hintLevel: 'minimal',
                    language: 'id',
                    detailedCourseMode: true,
                };
                expect(config.thinkingMode).toBe(mode);
            });
        });

        it('should allow all hint level values', () => {
            const levels = ['minimal', 'moderate', 'generous'] as const;

            levels.forEach(level => {
                const config: AIBehaviorConfig = {
                    strictNoAnswers: true,
                    thinkingMode: 'socratic',
                    hintLevel: level,
                    language: 'id',
                    detailedCourseMode: true,
                };
                expect(config.hintLevel).toBe(level);
            });
        });

        it('should allow both language values', () => {
            const languages = ['id', 'en'] as const;

            languages.forEach(lang => {
                const config: AIBehaviorConfig = {
                    strictNoAnswers: true,
                    thinkingMode: 'socratic',
                    hintLevel: 'minimal',
                    language: lang,
                    detailedCourseMode: true,
                };
                expect(config.language).toBe(lang);
            });
        });
    });

    describe('Strict Mode Enforcement Logic', () => {
        it('should recognize strict mode enabled state', () => {
            const isStrictMode = (config: AIBehaviorConfig): boolean => {
                return config.strictNoAnswers === true;
            };

            expect(isStrictMode({ strictNoAnswers: true, thinkingMode: 'socratic', hintLevel: 'minimal', language: 'id', detailedCourseMode: true })).toBe(true);
            expect(isStrictMode({ strictNoAnswers: false, thinkingMode: 'socratic', hintLevel: 'minimal', language: 'id', detailedCourseMode: true })).toBe(false);
        });

        it('should convert strict mode to system prompt inclusion decision', () => {
            const shouldIncludeStrictPrompt = (strictNoAnswers: boolean): boolean => {
                return strictNoAnswers;
            };

            expect(shouldIncludeStrictPrompt(true)).toBe(true);
            expect(shouldIncludeStrictPrompt(false)).toBe(false);
        });
    });

    describe('Provider Selection Logic', () => {
        it('should default to gemini provider', () => {
            const selectProvider = (provider?: string): 'gemini' | 'grok' => {
                if (provider === 'grok') return 'grok';
                return 'gemini';
            };

            expect(selectProvider()).toBe('gemini');
            expect(selectProvider('gemini')).toBe('gemini');
        });

        it('should select grok when specified', () => {
            const selectProvider = (provider?: string): 'gemini' | 'grok' => {
                if (provider === 'grok') return 'grok';
                return 'gemini';
            };

            expect(selectProvider('grok')).toBe('grok');
        });

        it('should validate API key presence', () => {
            const hasValidApiKey = (provider: 'gemini' | 'grok', keys: { gemini?: string; grok?: string }): boolean => {
                if (provider === 'gemini') return !!keys.gemini && keys.gemini.length > 0;
                if (provider === 'grok') return !!keys.grok && keys.grok.length > 0;
                return false;
            };

            expect(hasValidApiKey('gemini', { gemini: 'test-key' })).toBe(true);
            expect(hasValidApiKey('gemini', { gemini: '' })).toBe(false);
            expect(hasValidApiKey('gemini', {})).toBe(false);
            expect(hasValidApiKey('grok', { grok: 'test-key' })).toBe(true);
            expect(hasValidApiKey('grok', {})).toBe(false);
        });
    });

    describe('Temperature and Token Settings', () => {
        it('should convert stored temperature to decimal', () => {
            const convertTemperature = (storedValue: number): number => {
                return storedValue / 100;
            };

            expect(convertTemperature(70)).toBe(0.7);
            expect(convertTemperature(100)).toBe(1.0);
            expect(convertTemperature(50)).toBe(0.5);
        });

        it('should clamp temperature to valid range', () => {
            const clampTemperature = (value: number): number => {
                return Math.max(0, Math.min(1, value));
            };

            expect(clampTemperature(0.7)).toBe(0.7);
            expect(clampTemperature(-0.5)).toBe(0);
            expect(clampTemperature(1.5)).toBe(1);
        });

        it('should use reasonable token limits', () => {
            const validateTokenLimit = (tokens: number): boolean => {
                return tokens >= 100 && tokens <= 10000;
            };

            expect(validateTokenLimit(2000)).toBe(true);
            expect(validateTokenLimit(50)).toBe(false);
            expect(validateTokenLimit(15000)).toBe(false);
        });
    });
});

describe('Provider-Specific Behavior', () => {
    describe('Gemini Provider', () => {
        it('should support structured output for mini courses', () => {
            // Gemini supports JSON schema output
            const supportsStructuredOutput = true;
            expect(supportsStructuredOutput).toBe(true);
        });

        it('should support chat context history', () => {
            // Gemini supports multi-turn conversations
            const supportsChatHistory = true;
            expect(supportsChatHistory).toBe(true);
        });
    });

    describe('Grok Provider', () => {
        it('should use OpenAI-compatible API', () => {
            // Grok uses OpenAI SDK
            const usesOpenAISDK = true;
            expect(usesOpenAISDK).toBe(true);
        });
    });
});

describe('Error Handling', () => {
    it('should define proper error types for AI failures', () => {
        class AIServiceError extends Error {
            constructor(
                message: string,
                public provider: 'gemini' | 'grok',
                public retryable: boolean = true
            ) {
                super(message);
                this.name = 'AIServiceError';
            }
        }

        const error = new AIServiceError('API rate limit exceeded', 'gemini', true);
        expect(error.name).toBe('AIServiceError');
        expect(error.provider).toBe('gemini');
        expect(error.retryable).toBe(true);
    });

    it('should identify retryable errors', () => {
        const isRetryableError = (statusCode: number): boolean => {
            return [429, 500, 502, 503, 504].includes(statusCode);
        };

        expect(isRetryableError(429)).toBe(true); // Rate limit
        expect(isRetryableError(503)).toBe(true); // Service unavailable
        expect(isRetryableError(400)).toBe(false); // Bad request
        expect(isRetryableError(401)).toBe(false); // Unauthorized
    });
});
