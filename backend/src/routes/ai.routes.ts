import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import {
    generateMiniCourseSchema,
    generateQuizSchema,
    validateWorkSchema,
    generateScaffoldSchema,
} from "../types/index.js";
import { sendSuccess, sendError } from "../utils/helpers.js";
import { aiRouter, AIRouterService } from "../services/ai-router.service.js";
import { db } from "../config/database.js";
import { userSettings } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

router.use(authMiddleware);

/**
 * Helper to get AI config from user settings
 * Includes behavior settings for strict mode enforcement
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
            // Behavior settings - strict mode defaults applied
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

// POST /api/ai/analyze-assignment
router.post("/analyze-assignment", async (req, res, next) => {
    try {
        const { text, fileData } = req.body;

        if (!text && !fileData) {
            sendError(res, "Either text or fileData is required", 400);
            return;
        }

        const config = await getAIConfig(req.user!.id);

        if (!AIRouterService.hasValidConfig(config)) {
            sendError(res, "No AI API key configured. Please add an API key in Settings.", 400);
            return;
        }

        const result = await aiRouter.analyzeAssignment(text, fileData, config);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

// POST /api/ai/generate-mini-course
router.post("/generate-mini-course", validate(generateMiniCourseSchema), async (req, res, next) => {
    try {
        const { milestoneTitle, milestoneDescription, assignmentContext, fullRoadmap } = req.body;

        const config = await getAIConfig(req.user!.id);

        if (!AIRouterService.hasValidConfig(config)) {
            sendError(res, "No AI API key configured. Please add an API key in Settings.", 400);
            return;
        }

        const result = await aiRouter.generateMiniCourse(
            milestoneTitle,
            milestoneDescription,
            assignmentContext,
            fullRoadmap,
            config
        );
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

// POST /api/ai/generate-synapse
router.post("/generate-synapse", async (req, res, next) => {
    try {
        const { assignmentTitle, assignmentDescription, progress, atRisk } = req.body;

        const config = await getAIConfig(req.user!.id);

        if (!AIRouterService.hasValidConfig(config)) {
            sendError(res, "No AI API key configured. Please add an API key in Settings.", 400);
            return;
        }

        const question = await aiRouter.generateDailySynapse(
            assignmentTitle,
            assignmentDescription,
            progress || 0,
            atRisk || false,
            config
        );
        sendSuccess(res, { question });
    } catch (error) {
        next(error);
    }
});

// POST /api/ai/generate-scaffold
router.post("/generate-scaffold", validate(generateScaffoldSchema), async (req, res, next) => {
    try {
        const config = await getAIConfig(req.user!.id);

        if (!AIRouterService.hasValidConfig(config)) {
            sendError(res, "No AI API key configured. Please add an API key in Settings.", 400);
            return;
        }

        const result = await aiRouter.generateScaffoldingTask(
            req.body.assignmentContext,
            config
        );
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

// POST /api/ai/generate-quiz
router.post("/generate-quiz", validate(generateQuizSchema), async (req, res, next) => {
    try {
        const config = await getAIConfig(req.user!.id);

        if (!AIRouterService.hasValidConfig(config)) {
            sendError(res, "No AI API key configured. Please add an API key in Settings.", 400);
            return;
        }

        const questions = await aiRouter.generateQuiz(req.body.context, config);
        sendSuccess(res, questions);
    } catch (error) {
        next(error);
    }
});

// POST /api/ai/validate-work
router.post("/validate-work", validate(validateWorkSchema), async (req, res, next) => {
    try {
        const { assignmentContext, workText, reflectionText } = req.body;

        const config = await getAIConfig(req.user!.id);

        if (!AIRouterService.hasValidConfig(config)) {
            sendError(res, "No AI API key configured. Please add an API key in Settings.", 400);
            return;
        }

        const result = await aiRouter.validateWork(
            assignmentContext,
            workText,
            reflectionText || "",
            config
        );
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
});

export default router;
