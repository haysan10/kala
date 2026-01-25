import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env";

let aiClient: GoogleGenerativeAI | null = null;

export function getAIClient(apiKey?: string): GoogleGenerativeAI {
    const key = apiKey || env.GEMINI_API_KEY;

    if (!key) {
        throw new Error("Gemini API key is required");
    }

    // Use cached client if using default env key
    if (!apiKey && aiClient) {
        return aiClient;
    }

    // Initialize SDK
    const client = new GoogleGenerativeAI(key);

    if (!apiKey) {
        aiClient = client;
    }

    return client;
}
