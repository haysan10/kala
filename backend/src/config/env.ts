import 'dotenv/config';
import { z } from "zod";


const envSchema = z.object({
    // Database
    TURSO_DATABASE_URL: z.string().min(1),
    TURSO_AUTH_TOKEN: z.string().optional(),

    // Authentication
    JWT_SECRET: z.string().min(32),
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
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error("❌ Invalid environment variables:");
        console.error(result.error.format());
        process.exit(1);
    }

    return result.data;
}

export const env = loadEnv();
