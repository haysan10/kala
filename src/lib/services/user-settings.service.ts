
import { db } from "../config/database";
import { users, userSettings } from "../db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { aiRouter, AIRouterService } from "./ai-router.service";
import { UpdateProfileInput, UpdateSettingsInput } from "../types";

export class UserSettingsService {
    async getProfile(userId: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: {
                passwordHash: false,
            },
        });
        return user;
    }

    async updateProfile(userId: string, input: UpdateProfileInput) {
        const [updatedUser] = await db
            .update(users)
            .set({
                name: input.name,
                avatar: input.avatar,
                updatedAt: new Date().toISOString(), // Use ISO string instead of sql helper for compatibility
            })
            .where(eq(users.id, userId))
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
                avatar: users.avatar,
                provider: users.provider,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            });
        return updatedUser;
    }

    async getSettings(userId: string) {
        let settings = await db.query.userSettings.findFirst({
            where: eq(userSettings.userId, userId),
        });

        // Create default settings if doesn't exist
        if (!settings) {
            const [newSettings] = await db
                .insert(userSettings)
                .values({
                    userId: userId,
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

        return maskedSettings;
    }

    async updateSettings(userId: string, input: UpdateSettingsInput) {
        const updateData: any = {
            updatedAt: new Date().toISOString(),
        };

        // Standard settings
        if (input.aiProvider !== undefined) updateData.aiProvider = input.aiProvider;
        if (input.language !== undefined) updateData.language = input.language;
        if (input.thinkingMode !== undefined) updateData.thinkingMode = input.thinkingMode;
        if (input.hintLevel !== undefined) updateData.hintLevel = input.hintLevel;
        if (input.emailNotifications !== undefined) updateData.emailNotifications = input.emailNotifications;
        if (input.pushNotifications !== undefined) updateData.pushNotifications = input.pushNotifications;

        // Advanced AI Settings
        // Note: UpdateSettingsInput might need to be extended if types/index.ts is old, 
        // but let's assume it matches what was used in express routes or extend handling here.
        // Express route extracted strictNoAnswers etc. manually from body.
        
        // We will assume input contains these fields (casted as any if needed or type extended)
        const advancedInput = input as any;
        if (advancedInput.strictNoAnswers !== undefined) updateData.strictNoAnswers = advancedInput.strictNoAnswers;
        if (advancedInput.detailedCourseMode !== undefined) updateData.detailedCourseMode = advancedInput.detailedCourseMode;
        if (advancedInput.courseCitationStyle !== undefined) updateData.courseCitationStyle = advancedInput.courseCitationStyle;
        if (advancedInput.includeSourceLinks !== undefined) updateData.includeSourceLinks = advancedInput.includeSourceLinks;
        if (advancedInput.customSystemPrompt !== undefined) updateData.customSystemPrompt = advancedInput.customSystemPrompt;

        // Only update API keys if they're not masked (not starting with ****)
        if (input.geminiApiKey && !input.geminiApiKey.startsWith("****")) {
            updateData.geminiApiKey = input.geminiApiKey;
        }
        if (input.grokApiKey && !input.grokApiKey.startsWith("****")) {
            updateData.grokApiKey = input.grokApiKey;
        }

        const existingSettings = await db.query.userSettings.findFirst({
            where: eq(userSettings.userId, userId),
        });

        let updatedSettings;

        if (existingSettings) {
            [updatedSettings] = await db
                .update(userSettings)
                .set(updateData)
                .where(eq(userSettings.userId, userId))
                .returning();
        } else {
            [updatedSettings] = await db
                .insert(userSettings)
                .values({
                    userId: userId,
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
            aiTemperature: (updatedSettings.aiTemperature ?? 70) / 100,
            aiTopP: (updatedSettings.aiTopP ?? 90) / 100,
        };

        return maskedSettings;
    }

    async deleteApiKey(userId: string, provider: string) {
        if (!["gemini", "grok"].includes(provider)) {
            throw new Error("Invalid provider. Must be 'gemini' or 'grok'");
        }

        const updateData: any = {
            updatedAt: new Date().toISOString(),
        };

        if (provider === "gemini") {
            updateData.geminiApiKey = null;
        } else {
            updateData.grokApiKey = null;
        }

        await db
            .update(userSettings)
            .set(updateData)
            .where(eq(userSettings.userId, userId));

        return { message: `${provider} API key deleted successfully` };
    }

    async validateApiKey(provider: string, apiKey: string) {
        if (!["gemini", "grok"].includes(provider)) {
            throw new Error("Provider harus 'gemini' atau 'grok'");
        }

        if (provider === "gemini") {
            return await aiRouter.validateGeminiKey(apiKey);
        } else {
            return await aiRouter.validateGrokKey(apiKey);
        }
    }

    async getAIStatus(userId: string) {
        const settings = await db.query.userSettings.findFirst({
            where: eq(userSettings.userId, userId),
        });

        if (!settings) {
            return {
                hasGemini: false,
                hasGrok: false,
                activeProvider: "gemini",
                canUseFallback: false,
                message: "Belum ada pengaturan AI. Silakan tambahkan API key.",
                taskSpecialization: AIRouterService.getTaskSpecialization()
            };
        }

        const config = AIRouterService.buildConfig({
            aiProvider: settings.aiProvider as any,
            geminiApiKey: settings.geminiApiKey,
            grokApiKey: settings.grokApiKey,
            aiLanguage: settings.language as any,
        });

        const status = aiRouter.getConfigStatus(config);

        return {
            ...status,
            taskSpecialization: AIRouterService.getTaskSpecialization()
        };
    }
}

export const userSettingsService = new UserSettingsService();
