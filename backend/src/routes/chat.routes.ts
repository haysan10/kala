import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { sendSuccess, sendError } from "../utils/helpers.js";
import { db } from "../config/database.js";
import { chatSessions, chatMessages, assignments, userSettings } from "../db/schema.js";
import { eq, and, asc } from "drizzle-orm";
import { getAIClient } from "../config/gemini.js";
import { aiRouter, AIRouterService } from "../services/ai-router.service.js";
import { grokService } from "../services/grok.service.js";

const router = Router();

router.use(authMiddleware);

/**
 * Helper to get AI config from user settings
 * Now includes behavior settings for strict mode enforcement
 */
async function getAIConfig(userId: string) {
    const settings = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, userId),
    });

    if (!settings) {
        return AIRouterService.buildConfig({
            aiProvider: null,
            geminiApiKey: null,
            grokApiKey: null,
            aiLanguage: null,
            // Behavior settings - defaults will be applied
            strictNoAnswers: true,
            thinkingMode: null,
            hintLevel: null,
            detailedCourseMode: true,
        });
    }

    return AIRouterService.buildConfig({
        aiProvider: settings.aiProvider,
        geminiApiKey: settings.geminiApiKey,
        grokApiKey: settings.grokApiKey,
        aiLanguage: settings.language,
        // Include behavior settings from database
        strictNoAnswers: settings.strictNoAnswers,
        thinkingMode: settings.thinkingMode,
        hintLevel: settings.hintLevel,
        detailedCourseMode: settings.detailedCourseMode,
    });
}

// GET /api/chat/assignment/:assignmentId - Get or create chat session
router.get("/assignment/:assignmentId", async (req, res, next) => {
    try {
        const { assignmentId } = req.params;

        // Verify assignment ownership
        const [assignment] = await db
            .select()
            .from(assignments)
            .where(and(eq(assignments.id, assignmentId), eq(assignments.userId, req.user!.id)))
            .limit(1);

        if (!assignment) {
            sendError(res, "Assignment not found", 404);
            return;
        }

        // Find existing session or create new
        let [session] = await db
            .select()
            .from(chatSessions)
            .where(and(eq(chatSessions.assignmentId, assignmentId), eq(chatSessions.type, "tutor")))
            .limit(1);

        if (!session) {
            const systemInstruction = `You are "Kala Mentor", a high-level senior professor assisting with "${assignment.title}". Use a supportive, intellectual, and precise academic tone. Encourage critical thinking. Your output should feel like an academic journal entry. Use rich vocabulary but remain accessible. Focus on bridging the gap between current knowledge and the required outcome: ${assignment.learningOutcome}.`;

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

        sendSuccess(res, { session, messages });
    } catch (error) {
        next(error);
    }
});

// POST /api/chat/:sessionId/message
router.post("/:sessionId/message", async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const { message } = req.body;

        if (!message?.trim()) {
            sendError(res, "Message is required", 400);
            return;
        }

        // Verify session existence
        const [session] = await db
            .select()
            .from(chatSessions)
            .where(eq(chatSessions.id, sessionId))
            .limit(1);

        if (!session) {
            sendError(res, "Chat session not found", 404);
            return;
        }

        // Verify assignment ownership
        const [assignment] = await db
            .select({ userId: assignments.userId })
            .from(assignments)
            .where(eq(assignments.id, session.assignmentId))
            .limit(1);

        if (!assignment || assignment.userId !== req.user!.id) {
            sendError(res, "Chat session not found", 404);
            return;
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

        // Get AI config (now includes behavior settings)
        const config = await getAIConfig(req.user!.id);

        if (!AIRouterService.hasValidConfig(config)) {
            sendError(res, "No AI API key configured. Please add an API key in Settings.", 400);
            return;
        }

        let responseText: string;

        // Use aiRouter for chat - automatically includes strict mode
        try {
            const chatHistory = history.slice(0, -1).map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
            }));

            responseText = await aiRouter.chatTutoring(
                session.systemInstruction || "",
                chatHistory,
                message,
                config
            );
        } catch (chatError: any) {
            // Fallback to Gemini if Grok not available
            if (config.geminiApiKey) {
                console.log("[Chat] Falling back to Gemini for chat");
                const ai = getAIClient(config.geminiApiKey);

                // Inject strict mode into system instruction for Gemini
                const strictSystemInstruction = `${config.behavior.strictNoAnswers
                    ? `STRICT RULE: You are an academic mentor. NEVER provide direct answers, solutions, or complete work. ALWAYS guide through questions and hints.\n\n`
                    : ''}${session.systemInstruction || ''}`;

                const chat = ai.chats.create({
                    model: "gemini-2.0-flash",
                    config: {
                        systemInstruction: strictSystemInstruction,
                    },
                    history: history.slice(0, -1).map((m) => ({
                        role: m.role as "user" | "model",
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

        sendSuccess(res, { userMessage: userMsg, aiResponse: aiMsg });
    } catch (error) {
        next(error);
    }
});

// GET /api/chat/:sessionId/history
router.get("/:sessionId/history", async (req, res, next) => {
    try {
        const { sessionId } = req.params;

        const [session] = await db
            .select()
            .from(chatSessions)
            .where(eq(chatSessions.id, sessionId))
            .limit(1);

        if (!session) {
            sendError(res, "Chat session not found", 404);
            return;
        }

        // Verify ownership
        const [assignment] = await db
            .select({ userId: assignments.userId })
            .from(assignments)
            .where(eq(assignments.id, session.assignmentId))
            .limit(1);

        if (!assignment || assignment.userId !== req.user!.id) {
            sendError(res, "Chat session not found", 404);
            return;
        }

        const messages = await db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.sessionId, sessionId))
            .orderBy(asc(chatMessages.createdAt));

        sendSuccess(res, messages);
    } catch (error) {
        next(error);
    }
});

export default router;
