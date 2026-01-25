import { db } from "@/lib/config/database";
import { userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AIRouterService } from "@/lib/services/ai-router.service";

export async function getAIConfig(userId: string) {
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
        aiProvider: settings.aiProvider,
        geminiApiKey: settings.geminiApiKey,
        grokApiKey: settings.grokApiKey,
        aiLanguage: settings.language,
        strictNoAnswers: settings.strictNoAnswers,
        thinkingMode: settings.thinkingMode,
        hintLevel: settings.hintLevel,
        detailedCourseMode: settings.detailedCourseMode,
    });
}
