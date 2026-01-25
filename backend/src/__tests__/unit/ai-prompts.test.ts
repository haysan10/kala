/**
 * Unit Tests for AI Prompts Service
 * 
 * Tests strict mode prompts, thinking mode prompts, and behavior configurations
 */

import { describe, it, expect } from 'vitest';
import {
    getStrictModePrompt,
    getThinkingModePrompt,
    getHintLevelPrompt,
    buildSystemPrompt,
    DEFAULT_AI_BEHAVIOR,
    getEnhancedMiniCoursePrompt,
    getChatTutoringPrompt,
    AIBehaviorConfig,
} from '../../services/ai-prompts.js';

// Helper to create config
const createConfig = (overrides?: Partial<AIBehaviorConfig>): AIBehaviorConfig => ({
    strictNoAnswers: true,
    thinkingMode: 'socratic',
    hintLevel: 'minimal',
    language: 'id',
    detailedCourseMode: true,
    ...overrides,
});

describe('AI Prompts Service', () => {
    describe('getStrictModePrompt', () => {
        it('should return Indonesian strict mode prompt when strictNoAnswers is true', () => {
            const config = createConfig({ language: 'id', strictNoAnswers: true });
            const prompt = getStrictModePrompt(config);

            expect(prompt).toContain('ATURAN KETAT');
            expect(prompt).toContain('DILARANG KERAS');
            expect(prompt).toContain('jawaban langsung');
            expect(prompt).toContain('pertanyaan balik');
        });

        it('should return English strict mode prompt when language is en', () => {
            const config = createConfig({ language: 'en', strictNoAnswers: true });
            const prompt = getStrictModePrompt(config);

            expect(prompt).toContain('STRICT RULES');
            expect(prompt).toContain('ABSOLUTELY FORBIDDEN');
            expect(prompt).toContain('direct answers');
            expect(prompt).toContain('counter-questions');
        });

        it('should return empty string when strictNoAnswers is false', () => {
            const config = createConfig({ strictNoAnswers: false });
            const prompt = getStrictModePrompt(config);

            expect(prompt).toBe('');
        });

        it('should contain prohibition against completing assignments', () => {
            const config = createConfig({ language: 'id', strictNoAnswers: true });
            const prompt = getStrictModePrompt(config);

            expect(prompt).toContain('esai');
            expect(prompt).toContain('konten lengkap');
        });

        it('should contain guidance alternatives', () => {
            const config = createConfig({ language: 'id', strictNoAnswers: true });
            const prompt = getStrictModePrompt(config);

            expect(prompt).toContain('petunjuk konseptual');
            expect(prompt).toContain('pemikiran kritis');
        });
    });

    describe('getThinkingModePrompt', () => {
        it('should return Socratic mode prompt', () => {
            const prompt = getThinkingModePrompt('socratic');

            expect(prompt).toContain('SOCRATIC');
            expect(prompt).toContain('questions');
        });

        it('should return Guided mode prompt', () => {
            const prompt = getThinkingModePrompt('guided');

            expect(prompt).toContain('GUIDED');
            expect(prompt).toContain('structured');
        });

        it('should return Exploratory mode prompt', () => {
            const prompt = getThinkingModePrompt('exploratory');

            expect(prompt).toContain('EXPLORATORY');
            expect(prompt).toContain('exploration');
        });
    });

    describe('getHintLevelPrompt', () => {
        it('should return minimal hint level prompt', () => {
            const prompt = getHintLevelPrompt('minimal');

            expect(prompt).toContain('MINIMAL');
            expect(prompt).toContain('essential');
        });

        it('should return moderate hint level prompt', () => {
            const prompt = getHintLevelPrompt('moderate');

            expect(prompt).toContain('MODERATE');
            expect(prompt).toContain('balanced');
        });

        it('should return generous hint level prompt', () => {
            const prompt = getHintLevelPrompt('generous');

            expect(prompt).toContain('GENEROUS');
            expect(prompt).toContain('thorough');
        });

        it('should still prohibit direct answers at generous level', () => {
            const prompt = getHintLevelPrompt('generous');

            expect(prompt).toContain('NEVER');
            expect(prompt.toLowerCase()).toContain('answer');
        });
    });

    describe('buildSystemPrompt', () => {
        const basePrompt = 'You are an AI assistant.';
        const defaultConfig = createConfig();

        it('should build complete system prompt with all components', () => {
            const prompt = buildSystemPrompt(basePrompt, defaultConfig);

            // Should contain strict mode rules
            expect(prompt).toContain('ATURAN KETAT');

            // Should contain thinking mode
            expect(prompt).toContain('SOCRATIC');

            // Should contain hint level
            expect(prompt).toContain('MINIMAL');

            // Should contain base prompt
            expect(prompt).toContain('You are an AI assistant.');
        });

        it('should NOT include strict mode when strictNoAnswers is false', () => {
            const config = createConfig({ strictNoAnswers: false });

            const prompt = buildSystemPrompt(basePrompt, config);

            // Should NOT contain strict mode rules
            expect(prompt).not.toContain('ATURAN KETAK');
            expect(prompt).not.toContain('DILARANG KERAS');
        });

        it('should respect language setting', () => {
            const config = createConfig({ language: 'en' });

            const prompt = buildSystemPrompt(basePrompt, config);

            expect(prompt).toContain('STRICT RULES');
            expect(prompt).not.toContain('ATURAN KETAT');
        });
    });

    describe('DEFAULT_AI_BEHAVIOR', () => {
        it('should have strict mode enabled by default', () => {
            expect(DEFAULT_AI_BEHAVIOR.strictNoAnswers).toBe(true);
        });

        it('should use Socratic thinking mode by default', () => {
            expect(DEFAULT_AI_BEHAVIOR.thinkingMode).toBe('socratic');
        });

        it('should use minimal hint level by default', () => {
            expect(DEFAULT_AI_BEHAVIOR.hintLevel).toBe('minimal');
        });

        it('should use Indonesian language by default', () => {
            expect(DEFAULT_AI_BEHAVIOR.language).toBe('id');
        });

        it('should have detailed course mode enabled', () => {
            expect(DEFAULT_AI_BEHAVIOR.detailedCourseMode).toBe(true);
        });
    });

    describe('getEnhancedMiniCoursePrompt', () => {
        const config = createConfig();
        const milestoneTitle = 'Test Milestone';
        const milestoneDesc = 'Test description';
        const assignmentContext = 'Test assignment';

        it('should return a detailed course generation prompt', () => {
            const prompt = getEnhancedMiniCoursePrompt(
                milestoneTitle, milestoneDesc, assignmentContext, undefined, config
            );

            expect(prompt).toContain('Academic Module');
            expect(prompt).toContain('REQUIRED OUTPUT STRUCTURE');
        });

        it('should include milestone context', () => {
            const prompt = getEnhancedMiniCoursePrompt(
                milestoneTitle, milestoneDesc, assignmentContext, undefined, config
            );

            expect(prompt).toContain(milestoneTitle);
            expect(prompt).toContain(milestoneDesc);
        });

        it('should require sections in the output', () => {
            const prompt = getEnhancedMiniCoursePrompt(
                milestoneTitle, milestoneDesc, assignmentContext, undefined, config
            );

            expect(prompt.toLowerCase()).toContain('section');
        });

        it('should require tasks in the output', () => {
            const prompt = getEnhancedMiniCoursePrompt(
                milestoneTitle, milestoneDesc, assignmentContext, undefined, config
            );

            expect(prompt.toLowerCase()).toContain('task');
        });

        it('should require checkpoints/questions in the output', () => {
            const prompt = getEnhancedMiniCoursePrompt(
                milestoneTitle, milestoneDesc, assignmentContext, undefined, config
            );

            expect(prompt.toLowerCase()).toContain('checkpoint');
        });

        it('should require references in the output', () => {
            const prompt = getEnhancedMiniCoursePrompt(
                milestoneTitle, milestoneDesc, assignmentContext, undefined, config
            );

            expect(prompt.toLowerCase()).toContain('reference');
        });

        it('should include strict mode rules', () => {
            const prompt = getEnhancedMiniCoursePrompt(
                milestoneTitle, milestoneDesc, assignmentContext, undefined, config
            );

            expect(prompt).toContain('ATURAN KETAT');
        });
    });

    describe('getChatTutoringPrompt', () => {
        const assignmentTitle = 'Test Assignment';
        const learningOutcome = 'Test outcome';

        it('should include strict mode rules when enabled', () => {
            const config = createConfig({ strictNoAnswers: true });
            const prompt = getChatTutoringPrompt(assignmentTitle, learningOutcome, config);

            expect(prompt).toContain('ATURAN KETAT');
        });

        it('should NOT include strict mode when disabled', () => {
            const config = createConfig({ strictNoAnswers: false });
            const prompt = getChatTutoringPrompt(assignmentTitle, learningOutcome, config);

            expect(prompt).not.toContain('ATURAN KETAT');
            expect(prompt).not.toContain('DILARANG KERAS');
        });

        it('should include thinking mode', () => {
            const config = createConfig({ thinkingMode: 'guided' });
            const prompt = getChatTutoringPrompt(assignmentTitle, learningOutcome, config);

            expect(prompt).toContain('GUIDED');
        });

        it('should include hint level', () => {
            const config = createConfig({ hintLevel: 'generous' });
            const prompt = getChatTutoringPrompt(assignmentTitle, learningOutcome, config);

            expect(prompt).toContain('GENEROUS');
        });

        it('should include assignment context', () => {
            const config = createConfig();
            const prompt = getChatTutoringPrompt(assignmentTitle, learningOutcome, config);

            expect(prompt).toContain(assignmentTitle);
            expect(prompt).toContain(learningOutcome);
        });
    });
});

describe('Strict Mode Anti-Answer Patterns', () => {
    // These tests verify that the prompts contain patterns designed to prevent
    // the AI from giving direct answers to academic questions

    describe('Indonesian prompts', () => {
        const config = createConfig({ language: 'id', strictNoAnswers: true });
        const strictPrompt = getStrictModePrompt(config);

        it('should prohibit writing drafts or essays', () => {
            expect(strictPrompt).toMatch(/draft|esai/i);
        });

        it('should prohibit completing homework', () => {
            expect(strictPrompt).toMatch(/tugas|solusi.*lengkap|masalah akademik/i);
        });

        it('should require asking counter-questions', () => {
            expect(strictPrompt).toMatch(/pertanyaan.*balik/i);
        });

        it('should promote critical thinking', () => {
            expect(strictPrompt).toMatch(/kritis|berpikir/i);
        });
    });

    describe('English prompts', () => {
        const config = createConfig({ language: 'en', strictNoAnswers: true });
        const strictPrompt = getStrictModePrompt(config);

        it('should prohibit writing drafts or essays', () => {
            expect(strictPrompt).toMatch(/draft|essay/i);
        });

        it('should prohibit completing homework', () => {
            expect(strictPrompt).toMatch(/assignment|problem/i);
        });

        it('should require asking counter-questions', () => {
            expect(strictPrompt).toMatch(/counter.*question/i);
        });

        it('should promote critical thinking', () => {
            expect(strictPrompt).toMatch(/critical.*thinking/i);
        });
    });
});

describe('Prompt Content Quality', () => {
    it('should have comprehensive strict mode prompt', () => {
        const config = createConfig({ language: 'id', strictNoAnswers: true });
        const prompt = getStrictModePrompt(config);

        // A good strict mode prompt needs to be detailed (at least 500 chars)
        expect(prompt.length).toBeGreaterThan(500);
    });

    it('should include response template for refusal', () => {
        const config = createConfig({ language: 'id', strictNoAnswers: true });
        const prompt = getStrictModePrompt(config);

        expect(prompt).toContain('mentor akademik');
        expect(prompt).toContain('tidak dapat memberikan jawaban langsung');
    });
});
