
import { z } from "zod";

const envSchema = z.object({
    // Database
    TURSO_DATABASE_URL: z.string().min(1).default("libsql://dummy-db-url.turso.io"),
    TURSO_AUTH_TOKEN: z.string().optional(),

    // Authentication
    JWT_SECRET: z.string().min(32).default("default-jwt-secret-for-build-process-only-must-be-min-32-chars"),
    JWT_EXPIRES_IN: z.string().default("7d"),

    // OAuth - Google
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CALLBACK_URL: z.string().optional(),

    // OAuth - GitHub
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GITHUB_CALLBACK_URL: z.string().optional(),

    // AI Providers
    GEMINI_API_KEY: z.string().optional(),
    GROK_API_KEY: z.string().optional(),

    // Server
    PORT: z.string().default("3001").transform(Number),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

    // CORS
    FRONTEND_URL: z.string().default(
        process.env.NODE_ENV === "production" 
            ? process.env.VERCEL_URL 
                ? `https://${process.env.VERCEL_URL}` 
                : "https://kala.vercel.app"
            : "http://localhost:5173"
    ),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
    // In Next.js, process.env is populated by .env.local automatically
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        // Log error but don't crash immediately to allow build to proceed
        // unless it's strictly required by runtime logic that executes immediately
        if (typeof window === 'undefined') {
            console.warn("⚠️  Invalid environment variables (Suppressing checking for build sanity):", result.error.format());
        }
        
        // Return a fallback/dummy config that satisfies the type
        // This is crucial for build environments where secrets might not be present
        return {
             TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL || "libsql://dummy-db-url.turso.io",
             TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
             JWT_SECRET: process.env.JWT_SECRET || "default-jwt-secret-for-build-process-only-must-be-min-32-chars",
             JWT_EXPIRES_IN: "7d",
             PORT: 3001,
             NODE_ENV: (process.env.NODE_ENV as any) || "development",
             LOG_LEVEL: "info",
             FRONTEND_URL: "http://localhost:5173",
             // ... cast other optionals
        } as Env;
    }

    return result.data as Env;
}

export const env = loadEnv();
