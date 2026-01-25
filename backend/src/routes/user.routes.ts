import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { updateProfileSchema, updateSettingsSchema } from "../types/index.js";
import { sendSuccess, sendError } from "../utils/helpers.js";
import { db } from "../config/database.js";
import { users, userSettings } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { aiRouter, AIRouterService } from "../services/ai-router.service.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ==================== PROFILE ROUTES ====================

/**
 * GET /api/user/profile
 * Get current user profile
 */
router.get("/profile", async (req, res, next) => {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, req.user!.id),
            columns: {
                passwordHash: false, // Exclude sensitive data
            },
        });

        if (!user) {
            return sendError(res, "User not found", 404);
        }

        return sendSuccess(res, user);
    } catch (error) {
        return next(error);
    }
});

/**
 * PUT /api/user/profile
 * Update user profile (name, avatar)
 */
router.put("/profile", validate(updateProfileSchema), async (req, res, next) => {
    try {
        const { name, avatar } = req.body;

        const [updatedUser] = await db
            .update(users)
            .set({
                name,
                avatar,
                updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(users.id, req.user!.id))
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
                avatar: users.avatar,
                provider: users.provider,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            });

        sendSuccess(res, updatedUser);
    } catch (error) {
        next(error);
    }
});

// ==================== SETTINGS ROUTES ====================

/**
 * GET /api/user/settings
 * Get user settings (AI config, preferences)
 */
router.get("/settings", async (req, res, next) => {
    try {
        let settings = await db.query.userSettings.findFirst({
            where: eq(userSettings.userId, req.user!.id),
        });

        // Create default settings if doesn't exist
        if (!settings) {
            const [newSettings] = await db
                .insert(userSettings)
                .values({
                    userId: req.user!.id,
                })
                .returning();
            settings = newSettings;
        }

        // Mask API keys (only show last 4 characters)
        const maskedSettings = {
            ...settings,
            geminiApiKey: settings.geminiApiKey
                ? "****" + settings.geminiApiKey.slice(-4)
                : null,
            grokApiKey: settings.grokApiKey
                ? "****" + settings.grokApiKey.slice(-4)
                : null,
            // Convert integer to float for display
            aiTemperature: (settings.aiTemperature ?? 70) / 100,
            aiTopP: (settings.aiTopP ?? 90) / 100,
        };

        sendSuccess(res, maskedSettings);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/user/settings
 * Update user settings
 * Note: AI parameters (temperature, maxTokens, topP) are LOCKED and cannot be changed
 */
router.put("/settings", validate(updateSettingsSchema), async (req, res, next) => {
    try {
        const {
            aiProvider,
            geminiApiKey,
            grokApiKey,
            language,
            thinkingMode,
            hintLevel,
            emailNotifications,
            pushNotifications,
            // Advanced AI Settings
            strictNoAnswers,
            detailedCourseMode,
            courseCitationStyle,
            includeSourceLinks,
            customSystemPrompt,
        } = req.body;

        // Prepare update object (only include non-masked API keys)
        const updateData: any = {
            updatedAt: sql`CURRENT_TIMESTAMP`,
        };

        if (aiProvider !== undefined) updateData.aiProvider = aiProvider;
        if (language !== undefined) updateData.language = language;
        if (thinkingMode !== undefined) updateData.thinkingMode = thinkingMode;
        if (hintLevel !== undefined) updateData.hintLevel = hintLevel;
        if (emailNotifications !== undefined)
            updateData.emailNotifications = emailNotifications;
        if (pushNotifications !== undefined)
            updateData.pushNotifications = pushNotifications;

        // Advanced AI Settings
        if (strictNoAnswers !== undefined) updateData.strictNoAnswers = strictNoAnswers;
        if (detailedCourseMode !== undefined) updateData.detailedCourseMode = detailedCourseMode;
        if (courseCitationStyle !== undefined) updateData.courseCitationStyle = courseCitationStyle;
        if (includeSourceLinks !== undefined) updateData.includeSourceLinks = includeSourceLinks;
        if (customSystemPrompt !== undefined) updateData.customSystemPrompt = customSystemPrompt;

        // Only update API keys if they're not masked (not starting with ****)
        if (geminiApiKey && !geminiApiKey.startsWith("****")) {
            updateData.geminiApiKey = geminiApiKey;
        }
        if (grokApiKey && !grokApiKey.startsWith("****")) {
            updateData.grokApiKey = grokApiKey;
        }

        // Check if settings exist
        const existingSettings = await db.query.userSettings.findFirst({
            where: eq(userSettings.userId, req.user!.id),
        });

        let updatedSettings;

        if (existingSettings) {
            // Update existing settings
            [updatedSettings] = await db
                .update(userSettings)
                .set(updateData)
                .where(eq(userSettings.userId, req.user!.id))
                .returning();
        } else {
            // Create new settings
            [updatedSettings] = await db
                .insert(userSettings)
                .values({
                    userId: req.user!.id,
                    ...updateData,
                })
                .returning();
        }

        // Mask API keys in response
        const maskedSettings = {
            ...updatedSettings,
            geminiApiKey: updatedSettings.geminiApiKey
                ? "****" + updatedSettings.geminiApiKey.slice(-4)
                : null,
            grokApiKey: updatedSettings.grokApiKey
                ? "****" + updatedSettings.grokApiKey.slice(-4)
                : null,
            // Convert integer to float for display
            aiTemperature: (updatedSettings.aiTemperature ?? 70) / 100,
            aiTopP: (updatedSettings.aiTopP ?? 90) / 100,
        };

        sendSuccess(res, maskedSettings);
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/user/settings/api-key/:provider
 * Delete API key for a specific provider
 */
router.delete("/settings/api-key/:provider", async (req, res, next) => {
    try {
        const { provider } = req.params;

        if (!["gemini", "grok"].includes(provider)) {
            return sendError(res, "Invalid provider. Must be 'gemini' or 'grok'", 400);
        }

        const updateData: any = {
            updatedAt: sql`CURRENT_TIMESTAMP`,
        };

        if (provider === "gemini") {
            updateData.geminiApiKey = null;
        } else {
            updateData.grokApiKey = null;
        }

        await db
            .update(userSettings)
            .set(updateData)
            .where(eq(userSettings.userId, req.user!.id));

        return sendSuccess(res, { message: `${provider} API key deleted successfully` });
    } catch (error) {
        return next(error);
    }
});

// ==================== AI VALIDATION ROUTES ====================

/**
 * POST /api/user/validate-api-key
 * Validate an AI API key before saving
 */
router.post("/validate-api-key", async (req, res, next) => {
    try {
        const { provider, apiKey } = req.body;

        if (!provider || !apiKey) {
            return sendError(res, "Provider dan API key diperlukan", 400);
        }

        if (!["gemini", "grok"].includes(provider)) {
            return sendError(res, "Provider harus 'gemini' atau 'grok'", 400);
        }

        let result;
        if (provider === "gemini") {
            result = await aiRouter.validateGeminiKey(apiKey);
        } else {
            result = await aiRouter.validateGrokKey(apiKey);
        }

        if (result.valid) {
            return sendSuccess(res, result);
        } else {
            return sendError(res, result.message, 400);
        }
    } catch (error) {
        return next(error);
    }
});

/**
 * GET /api/user/ai-status
 * Get current AI configuration status
 */
router.get("/ai-status", async (req, res, next) => {
    try {
        const settings = await db.query.userSettings.findFirst({
            where: eq(userSettings.userId, req.user!.id),
        });

        if (!settings) {
            return sendSuccess(res, {
                hasGemini: false,
                hasGrok: false,
                activeProvider: "gemini",
                canUseFallback: false,
                message: "Belum ada pengaturan AI. Silakan tambahkan API key.",
                taskSpecialization: AIRouterService.getTaskSpecialization()
            });
        }

        const config = AIRouterService.buildConfig({
            aiProvider: settings.aiProvider,
            geminiApiKey: settings.geminiApiKey,
            grokApiKey: settings.grokApiKey,
            aiLanguage: settings.language,
        });

        const status = aiRouter.getConfigStatus(config);

        return sendSuccess(res, {
            ...status,
            taskSpecialization: AIRouterService.getTaskSpecialization()
        });
    } catch (error) {
        return next(error);
    }
});

export default router;
