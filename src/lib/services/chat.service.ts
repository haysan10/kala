
import { db } from "../config/database";
import { chatSessions, chatMessages, assignments, userSettings } from "../db/schema";
import { eq, and, asc } from "drizzle-orm";
import { getAIClient } from "../config/gemini";
import { aiRouter, AIRouterService } from "./ai-router.service";

export class ChatService {
    /**
     * Helper to get AI config from user settings
     */
    private async getAIConfig(userId: string) {
        const settings = await db.query.userSettings.findFirst({
            where: eq(userSettings.userId, userId),
        });

        if (!settings) {
            return AIRouterService.buildConfig({
                aiProvider: null,
                geminiApiKey: null,
                grokApiKey: null,
                aiLanguage: null,
                strictNoAnswers: true,
                thinkingMode: null,
                hintLevel: null,
                detailedCourseMode: true,
            });
        }

        return AIRouterService.buildConfig({
            aiProvider: settings.aiProvider as any,
            geminiApiKey: settings.geminiApiKey,
            grokApiKey: settings.grokApiKey,
            aiLanguage: settings.language as any,
            strictNoAnswers: settings.strictNoAnswers || false, // Should be boolean in schema, using fallback just in case
            thinkingMode: settings.thinkingMode as any,
            hintLevel: settings.hintLevel as any,
            detailedCourseMode: settings.detailedCourseMode || true,
        });
    }

    async getOrCreateSession(assignmentId: string, userId: string) {
        // Verify assignment ownership
        const [assignment] = await db
            .select()
            .from(assignments)
            .where(and(eq(assignments.id, assignmentId), eq(assignments.userId, userId)))
            .limit(1);

        if (!assignment) {
            throw new Error("Assignment not found");
        }

        // Find existing session or create new
        let [session] = await db
            .select()
            .from(chatSessions)
            .where(and(eq(chatSessions.assignmentId, assignmentId), eq(chatSessions.type, "tutor")))
            .limit(1);

        if (!session) {
            const systemInstruction = `You are "Kala Mentor", a high-level senior professor assisting with "${assignment.title}". Use a supportive, intellectual, and precise academic tone. Encourage critical thinking. Your output should feel like an academic journal entry. Use rich vocabulary but remain accessible. Focus on bridging the gap between current knowledge and the required outcome: ${assignment.learningOutcome || 'mastery'}.`;

            [session] = await db
                .insert(chatSessions)
                .values({
                    assignmentId,
                    type: "tutor",
                    systemInstruction,
                })
                .returning();

            // Add initial message
            await db.insert(chatMessages).values({
                sessionId: session.id,
                role: "model",
                content: `Good day. I have digitized the core requirements for "${assignment.title}". Let us refine your intellectual approach to this task. Where shall we begin our analysis?`,
            });
        }

        // Get messages
        const messages = await db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.sessionId, session.id))
            .orderBy(asc(chatMessages.createdAt));

        return { session, messages };
    }

    async sendMessage(sessionId: string, userId: string, message: string) {
        if (!message?.trim()) {
            throw new Error("Message is required");
        }

        // Verify session existence
        const [session] = await db
            .select()
            .from(chatSessions)
            .where(eq(chatSessions.id, sessionId))
            .limit(1);

        if (!session) {
            throw new Error("Chat session not found");
        }

        // Verify assignment ownership
        const [assignment] = await db
            .select({ userId: assignments.userId })
            .from(assignments)
            .where(eq(assignments.id, session.assignmentId))
            .limit(1);

        if (!assignment || assignment.userId !== userId) {
             throw new Error("Chat session not found");
        }

        // Save user message
        const [userMsg] = await db
            .insert(chatMessages)
            .values({
                sessionId,
                role: "user",
                content: message,
            })
            .returning();

        // Get chat history
        const history = await db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.sessionId, sessionId))
            .orderBy(asc(chatMessages.createdAt));

        // Get AI config
        const config = await this.getAIConfig(userId);

        if (!AIRouterService.hasValidConfig(config)) {
            // Check if we have env var fallback (should be handled in buildConfig but check anyway)
             // Actually, if settings are null, getAIConfig returns null keys.
             // We can check environment variables if needed but usually better to fail if not configured.
             if(!process.env.GEMINI_API_KEY && !process.env.GROK_API_KEY) {
                  throw new Error("No AI API key configured. Please add an API key in Settings.");
             }
             // However, AIRouterService might handle env fallbacks.
        }

        let responseText: string;

        // Use aiRouter for chat
        try {
            const chatHistory = history.slice(0, -1).map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
            }));

            // Map 'model' to 'assistant' for AI Router if needed, or assume it handles it.
            // Looking at backend code: m.role as "user" | "assistant". 
            // In DB 'model' is stored.
            const mappedHistory = history.slice(0, -1).map(m => ({
                role: (m.role === 'model' ? 'assistant' : m.role) as "user" | "assistant",
                content: m.content
            }));

            responseText = await aiRouter.chatTutoring(
                session.systemInstruction || "",
                mappedHistory,
                message,
                config
            );
        } catch (chatError: any) {
            console.error("AI Router chat error:", chatError);
            
            // Fallback to Gemini manual call if Grok failed or Router failed
            // Note: Router usually handles fallback. If it threw, maybe both failed.
            // But let's try direct Gemini as last resort if key exists.
            
            if (config.geminiApiKey || process.env.GEMINI_API_KEY) {
                console.log("[ChatService] Falling back to Gemini direct call");
                const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
                const ai = getAIClient(apiKey!);

                const strictSystemInstruction = `${config.behavior.strictNoAnswers
                    ? `STRICT RULE: You are an academic mentor. NEVER provide direct answers, solutions, or complete work. ALWAYS guide through questions and hints.\n\n`
                    : ''}${session.systemInstruction || ''}`;

                const chat = ai.chats.create({
                    model: "gemini-2.0-flash",
                    config: {
                        systemInstruction: strictSystemInstruction,
                    },
                    history: history.slice(0, -1).map((m) => ({
                        role: m.role as "user" | "model", // Gemini uses 'model'
                        parts: [{ text: m.content }],
                    })),
                });

                const response = await chat.sendMessage({ message });
                responseText = response.text || "I apologize, but I couldn't generate a response. Please try again.";
            } else {
                throw chatError;
            }
        }

        // Save AI response
        const [aiMsg] = await db
            .insert(chatMessages)
            .values({
                sessionId,
                role: "model",
                content: responseText,
            })
            .returning();

        return { userMessage: userMsg, aiResponse: aiMsg };
    }

    async getHistory(sessionId: string, userId: string) {
        const [session] = await db
            .select()
            .from(chatSessions)
            .where(eq(chatSessions.id, sessionId))
            .limit(1);

        if (!session) {
             throw new Error("Chat session not found");
        }

        // Verify ownership
        const [assignment] = await db
            .select({ userId: assignments.userId })
            .from(assignments)
            .where(eq(assignments.id, session.assignmentId))
            .limit(1);

        if (!assignment || assignment.userId !== userId) {
            throw new Error("Chat session not found");
        }

        const messages = await db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.sessionId, sessionId))
            .orderBy(asc(chatMessages.createdAt));

        return messages;
    }
}

export const chatService = new ChatService();
