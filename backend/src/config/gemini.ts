import { GoogleGenAI } from "@google/genai";
import { env } from "./env.js";

let aiClient: GoogleGenAI | null = null;

export function getAIClient(apiKey?: string): GoogleGenAI {
    const key = apiKey || env.GEMINI_API_KEY;

    if (!key) {
        throw new Error("Gemini API key is required");
    }

    // Use cached client if same key
    if (!apiKey && aiClient) {
        return aiClient;
    }

    const client = new GoogleGenAI({ apiKey: key });

    if (!apiKey) {
        aiClient = client;
    }

    return client;
}
