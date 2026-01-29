
import { z } from "zod";

const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().min(1).optional(),
    SUPABASE_URL: z.string().min(1).optional(),
    SUPABASE_ANON_KEY: z.string().min(1).optional(),

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
    // Some platforms like Vercel might pass PORT as a number
    const rawEnv = { ...process.env };
    if (typeof rawEnv.PORT === 'number') {
        rawEnv.PORT = String(rawEnv.PORT);
    }

    const result = envSchema.safeParse(rawEnv);
    
    if (typeof window === 'undefined') {
        // Validation logging if needed
    }

    if (!result.success) {
        // Log warning but don't crash immediately to allow build to proceed
        // unless it's strictly required by runtime logic that executes immediately
        if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
            console.warn("⚠️  Environment validation failed. Using fallback configuration for build/safety.");
        }
        
        // Return a fallback/dummy config that satisfies the type
        // This is crucial for build environments where secrets might not be present
        return {
             DATABASE_URL: process.env.DATABASE_URL,
             SUPABASE_URL: process.env.SUPABASE_URL,
             SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
             JWT_SECRET: process.env.JWT_SECRET || "default-jwt-secret-for-build-process-only-must-be-min-32-chars",
             JWT_EXPIRES_IN: "7d",
             GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
             GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
             GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
             GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
             GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
             GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
             GEMINI_API_KEY: process.env.GEMINI_API_KEY,
             GROK_API_KEY: process.env.GROK_API_KEY,
             PORT: process.env.PORT ? Number(process.env.PORT) : 3001,
             NODE_ENV: (process.env.NODE_ENV as any) || "development",
             LOG_LEVEL: (process.env.LOG_LEVEL as any) || "info",
             FRONTEND_URL: process.env.FRONTEND_URL || "https://kala.vercel.app",
        } as Env;
    }

    return result.data as Env;
}

export const env = loadEnv();
