import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import { env } from "./env";

// Database credentials
const DATABASE_URL = env.DATABASE_URL || "";

// Create client lazily
let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getClient() {
    if (!_client) {
        if (!DATABASE_URL) {
            throw new Error("DATABASE_URL is not defined");
        }
        _client = postgres(DATABASE_URL);
    }
    return _client;
}

export function getDb() {
    if (!_db) {
        const client = getClient();
        _db = drizzle(client, { schema });
    }
    return _db;
}

// Export db with getter pattern for lazy initialization
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
    get(target, prop) {
        const instance = getDb();
        const value = (instance as any)[prop];
        if (typeof value === 'function') {
            return value.bind(instance);
        }
        return value;
    }
});

export type Database = typeof db;
