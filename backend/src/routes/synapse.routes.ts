import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { sendSuccess, sendError } from "../utils/helpers.js";
import { db } from "../config/database.js";
import { dailySynapses, assignments, userSettings } from "../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { aiRouter, AIRouterService } from "../services/ai-router.service.js";

const router = Router();

router.use(authMiddleware);

/**
 * Helper to get AI config from user settings
 * Includes behavior settings for synapse generation
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
            // Behavior settings - defaults applied
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

// GET /api/synapse/today - Get or generate today's synapse
router.get("/today", async (req, res, next) => {
    try {
        const today = new Date().toISOString().split("T")[0];

        // Check for existing synapse
        const [existing] = await db
            .select()
            .from(dailySynapses)
            .where(and(eq(dailySynapses.userId, req.user!.id), eq(dailySynapses.synapseDate, today)))
            .limit(1);

        if (existing) {
            sendSuccess(res, existing);
            return;
        }

        // Get most urgent assignment
        const userAssignments = await db
            .select()
            .from(assignments)
            .where(eq(assignments.userId, req.user!.id))
            .orderBy(desc(assignments.atRisk));

        if (userAssignments.length === 0) {
            sendSuccess(res, null);
            return;
        }

        // Pick the most urgent assignment
        const target = userAssignments.sort((a, b) => {
            if (a.atRisk && !b.atRisk) return -1;
            if (b.atRisk && !a.atRisk) return 1;
            return new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime();
        })[0];

        // Get AI config
        const config = await getAIConfig(req.user!.id);

        if (!AIRouterService.hasValidConfig(config)) {
            // Return null if no AI config - synapse requires AI
            sendSuccess(res, null);
            return;
        }

        // Generate synapse question using AI Router (prefers Grok for creative questions)
        const question = await aiRouter.generateDailySynapse(
            target.title,
            target.description || "",
            target.overallProgress || 0,
            target.atRisk || false,
            config
        );

        // Save synapse
        const [synapse] = await db
            .insert(dailySynapses)
            .values({
                userId: req.user!.id,
                assignmentId: target.id,
                question,
                synapseDate: today,
            })
            .returning();

        sendSuccess(res, synapse);
    } catch (error) {
        next(error);
    }
});

// POST /api/synapse/:id/complete - Complete synapse with response
router.post("/:id/complete", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { response } = req.body;

        if (!response?.trim()) {
            sendError(res, "Response is required", 400);
            return;
        }

        const [synapse] = await db
            .select()
            .from(dailySynapses)
            .where(and(eq(dailySynapses.id, id), eq(dailySynapses.userId, req.user!.id)))
            .limit(1);

        if (!synapse) {
            sendError(res, "Synapse not found", 404);
            return;
        }

        if (synapse.completed) {
            sendError(res, "Synapse already completed", 400);
            return;
        }

        // Update synapse
        const [updated] = await db
            .update(dailySynapses)
            .set({
                response,
                completed: true,
            })
            .where(eq(dailySynapses.id, id))
            .returning();

        // Update assignment clarity score
        await db
            .update(assignments)
            .set({
                clarityScore: synapse.clarityAwarded,
                lastSynapseDate: synapse.synapseDate,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(assignments.id, synapse.assignmentId));

        sendSuccess(res, updated);
    } catch (error) {
        next(error);
    }
});

export default router;
