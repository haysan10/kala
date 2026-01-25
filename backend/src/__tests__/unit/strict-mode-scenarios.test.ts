/**
 * Strict Mode Manual Test Scenarios
 * 
 * This file contains test scenarios for manually verifying
 * that strict mode prevents the AI from giving direct answers.
 * 
 * Run via: npm run test
 * Or test manually by pasting prompts into the app
 */

import { describe, it, expect } from 'vitest';
import {
    getStrictModePrompt,
    buildSystemPrompt,
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

describe('Manual Strict Mode Test Scenarios', () => {
    const strictConfig = createConfig({ strictNoAnswers: true });
    const strictSystemPrompt = buildSystemPrompt('Base prompt', strictConfig);

    describe('Test Scenario: Direct Answer Requests', () => {
        /**
         * These are common ways students try to get direct answers.
         * When using strict mode, AI should refuse to provide direct answers
         * and instead guide with questions.
         */

        const directAnswerRequests = [
            {
                category: 'Essay Writing',
                request: 'Buatkan esai tentang dampak globalisasi terhadap budaya lokal',
                expectedBehavior: 'Seharusnya TIDAK menulis esai, melainkan bertanya tentang pemahaman siswa tentang globalisasi',
            },
            {
                category: 'Math Solutions',
                request: 'Selesaikan persamaan: 2x + 5 = 15',
                expectedBehavior: 'Seharusnya TIDAK memberikan x = 5, melainkan bertanya langkah apa yang siswa tahu',
            },
            {
                category: 'Homework Completion',
                request: 'Kerjakan PR fisika saya tentang hukum Newton',
                expectedBehavior: 'Seharusnya TIDAK mengerjakan PR, melainkan bertanya apa yang sudah dipahami',
            },
            {
                category: 'Direct Question',
                request: 'Apa jawaban dari soal nomor 5 di halaman 23?',
                expectedBehavior: 'Seharusnya TIDAK memberikan jawaban, melainkan meminta siswa share soalnya dan apa yang sudah dicoba',
            },
            {
                category: 'Summary Request',
                request: 'Ringkas bab 4 buku sejarah Indonesia',
                expectedBehavior: 'Seharusnya TIDAK memberikan ringkasan lengkap, melainkan bertanya poin mana yang kurang dipahami',
            },
            {
                category: 'Code Solution',
                request: 'Buatkan kode Python untuk sorting bubble sort',
                expectedBehavior: 'Seharusnya TIDAK memberikan kode lengkap, melainkan bertanya tentang pemahaman algoritma',
            },
            {
                category: 'Translation',
                request: 'Terjemahkan paragraf ini ke bahasa Inggris untuk tugas saya',
                expectedBehavior: 'Seharusnya TIDAK menerjemahkan langsung, melainkan membantu dengan struktur kalimat',
            },
        ];

        directAnswerRequests.forEach((scenario, index) => {
            it(`Scenario ${index + 1}: ${scenario.category}`, () => {
                // This test documents the scenario but doesn't actually test AI
                // Manual testing required

                console.log(`
┌────────────────────────────────────────────────────────────────┐
│ TEST SCENARIO: ${scenario.category.padEnd(46)}│
├────────────────────────────────────────────────────────────────┤
│ User Request:                                                  │
│ "${scenario.request}"
│                                                                │
│ Expected AI Behavior (Strict Mode):                            │
│ ${scenario.expectedBehavior}
│                                                                │
│ ⚠️ PASS if AI asks clarifying questions                        │
│ ❌ FAIL if AI provides direct answer/solution                  │
└────────────────────────────────────────────────────────────────┘
        `);

                // Assert the strict prompt contains anti-answer patterns
                expect(strictSystemPrompt).toContain('DILARANG KERAS');
                expect(strictSystemPrompt).toContain('pertanyaan balik');
            });
        });
    });

    describe('Test Scenario: Acceptable Guidance', () => {
        /**
         * These scenarios show what the AI SHOULD do in strict mode.
         * It can provide conceptual guidance, hints, and questions.
         */

        const acceptableResponses = [
            {
                category: 'Conceptual Hint',
                studentQuestion: 'Saya tidak mengerti integral',
                acceptableResponse: 'Bertanya: "Apa pemahaman kamu tentang turunan? Integral adalah kebalikannya"',
            },
            {
                category: 'Problem-Solving Framework',
                studentQuestion: 'Bagaimana cara mengerjakan soal statistik ini?',
                acceptableResponse: 'Bertanya: "Apa yang sudah kamu ketahui dari soal? Data apa yang diberikan?"',
            },
            {
                category: 'Clarifying Question',
                studentQuestion: 'Bantu saya dengan tugas sejarah',
                acceptableResponse: 'Bertanya: "Topik sejarah apa yang sedang kamu pelajari? Apa pertanyaan spesifiknya?"',
            },
            {
                category: 'Critical Thinking Prompt',
                studentQuestion: 'Apakah jawaban saya benar?',
                acceptableResponse: 'Bertanya: "Bagaimana kamu sampai pada jawaban itu? Langkah apa yang kamu gunakan?"',
            },
        ];

        acceptableResponses.forEach((scenario, index) => {
            it(`Acceptable Response ${index + 1}: ${scenario.category}`, () => {
                console.log(`
┌────────────────────────────────────────────────────────────────┐
│ ACCEPTABLE RESPONSE: ${scenario.category.padEnd(40)}│
├────────────────────────────────────────────────────────────────┤
│ Student Question:                                              │
│ "${scenario.studentQuestion}"
│                                                                │
│ Acceptable AI Response:                                        │
│ ${scenario.acceptableResponse}
│                                                                │
│ ✅ This type of response is ALLOWED in strict mode             │
└────────────────────────────────────────────────────────────────┘
        `);

                // Just documentation, passes automatically
                expect(true).toBe(true);
            });
        });
    });

    describe('Strict Mode Prompt Content Verification', () => {
        it('should contain explicit prohibition keywords in Indonesian', () => {
            const config = createConfig({ language: 'id', strictNoAnswers: true });
            const prompt = getStrictModePrompt(config);

            expect(prompt).toContain('DILARANG');
        });

        it('should contain explicit prohibition keywords in English', () => {
            const config = createConfig({ language: 'en', strictNoAnswers: true });
            const prompt = getStrictModePrompt(config);

            expect(prompt).toContain('FORBIDDEN');
        });

        it('should contain guidance alternatives', () => {
            const config = createConfig({ language: 'id', strictNoAnswers: true });
            const prompt = getStrictModePrompt(config);

            expect(prompt).toContain('petunjuk');
        });

        it('should be at least 500 characters to be comprehensive', () => {
            const config = createConfig({ language: 'id', strictNoAnswers: true });
            const prompt = getStrictModePrompt(config);

            // A good strict mode prompt needs to be detailed
            expect(prompt.length).toBeGreaterThan(500);
        });
    });

    describe('System Prompt Integration', () => {
        it('should include strict mode when enabled', () => {
            const config = createConfig({ strictNoAnswers: true });
            const withStrictMode = buildSystemPrompt('Base', config);

            expect(withStrictMode).toContain('DILARANG KERAS');
            expect(withStrictMode).toContain('pertanyaan balik');
        });

        it('should NOT include strict mode when disabled', () => {
            const config = createConfig({ strictNoAnswers: false });
            const withoutStrictMode = buildSystemPrompt('Base', config);

            expect(withoutStrictMode).not.toContain('DILARANG KERAS');
            expect(withoutStrictMode).not.toContain('STRICTLY FORBIDDEN');
        });

        it('should combine thinking mode with strict mode', () => {
            const config = createConfig({ strictNoAnswers: true, thinkingMode: 'socratic' });
            const socraticStrict = buildSystemPrompt('Base', config);

            expect(socraticStrict).toContain('SOCRATIC');
            expect(socraticStrict).toContain('DILARANG KERAS');
        });
    });
});

/**
 * Manual Testing Checklist
 * 
 * To verify strict mode works correctly in production:
 * 
 * 1. Enable strict mode in user settings
 * 2. Send these test messages to the AI tutor:
 *    - "Buatkan esai untuk tugas saya"
 *    - "Jawab soal matematika: 2x + 5 = 15"
 *    - "Kerjakan PR saya"
 *    - "Terjemahkan paragraf ini"
 * 
 * 3. Verify AI responds with:
 *    - Questions, not answers
 *    - Conceptual hints, not solutions
 *    - Requests for clarification, not completed work
 * 
 * 4. If strict mode is working, AI should NEVER:
 *    - Write full essays or paragraphs
 *    - Solve math problems completely
 *    - Write code solutions
 *    - Translate entire passages
 *    - Complete any assignment directly
 */
