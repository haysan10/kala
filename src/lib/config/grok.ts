/**
 * Grok AI (xAI) Configuration and Client
 * 
 * This module provides integration with xAI's Grok API
 * Compatible with OpenAI SDK format
 */

import OpenAI from "openai";
import { env } from "./env";

let grokClient: OpenAI | null = null;

export interface GrokConfig {
    apiKey: string;
    baseURL?: string;
}

/**
 * Get or create Grok AI client
 * Uses OpenAI SDK with custom baseURL for Grok API
 */
export function getGrokClient(apiKey?: string): OpenAI {
    const key = apiKey || env.GROK_API_KEY;

    if (!key) {
        throw new Error("Grok API key is required");
    }

    // Use cached client if same key
    if (!apiKey && grokClient) {
        return grokClient;
    }

    const client = new OpenAI({
        apiKey: key,
        baseURL: "https://api.x.ai/v1",
    });

    if (!apiKey) {
        grokClient = client;
    }

    return client;
}

// Available Grok models
export const GrokModels = {
    // Latest and most capable
    GROK_2: "grok-2-latest",
    GROK_2_1212: "grok-2-1212",

    // Vision capable
    GROK_2_VISION: "grok-2-vision-1212",

    // Fast and efficient
    GROK_BETA: "grok-beta",
} as const;

export type GrokModel = typeof GrokModels[keyof typeof GrokModels];
