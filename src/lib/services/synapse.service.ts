
import { db } from "../config/database";
import { dailySynapses, assignments, userSettings } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { aiRouter, AIRouterService } from "./ai-router.service";

export class SynapseService {
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
            strictNoAnswers: settings.strictNoAnswers || false,
            thinkingMode: settings.thinkingMode as any,
            hintLevel: settings.hintLevel as any,
            detailedCourseMode: settings.detailedCourseMode || true,
        });
    }

    async getTodaySynapse(userId: string) {
        const today = new Date().toISOString().split("T")[0];

        // Check for existing synapse
        const [existing] = await db
            .select()
            .from(dailySynapses)
            .where(and(eq(dailySynapses.userId, userId), eq(dailySynapses.synapseDate, today)))
            .limit(1);

        if (existing) {
            return existing;
        }

        // Get most urgent assignment
        const userAssignments = await db
            .select()
            .from(assignments)
            .where(eq(assignments.userId, userId))
            .orderBy(desc(assignments.atRisk));

        if (userAssignments.length === 0) {
            return null;
        }

        // Pick the most urgent assignment
        const target = userAssignments.sort((a, b) => {
            if (a.atRisk && !b.atRisk) return -1;
            if (b.atRisk && !a.atRisk) return 1;
            return new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime();
        })[0];

        // Get AI config
        const config = await this.getAIConfig(userId);

        if (!AIRouterService.hasValidConfig(config)) {
            // Return null if no AI config
            return null;
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
                userId: userId,
                assignmentId: target.id,
                question,
                synapseDate: today,
            })
            .returning();

        return synapse;
    }

    async completeSynapse(id: string, userId: string, response: string) {
        if (!response?.trim()) {
            throw new Error("Response is required");
        }

        const [synapse] = await db
            .select()
            .from(dailySynapses)
            .where(and(eq(dailySynapses.id, id), eq(dailySynapses.userId, userId)))
            .limit(1);

        if (!synapse) {
            throw new Error("Synapse not found");
        }

        if (synapse.completed) {
            throw new Error("Synapse already completed");
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

        return updated;
    }
}

export const synapseService = new SynapseService();
