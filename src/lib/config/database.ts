import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../db/schema";

// Database credentials
const TURSO_URL = process.env.TURSO_DATABASE_URL || "https://yes-ai-cms-haysan10.aws-us-west-2.turso.io";
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3NzQ1NjM1NDEsImlhdCI6MTc2OTM3OTU0MSwiaWQiOiJhYTcxMDQ5Mi00ZGUyLTRmYjAtOTg5Ny1kNTViMTExNGMzMGYiLCJyaWQiOiJlZTE1OTIwYi0wMzIwLTQ1NjctYTAzNC1mODE4NzJiZDVlNWEifQ.Jzrh0WMCvUHaTMiDo4b5aKmquexurkSowY_6LT7Gk-Eu43oTiH41HI5IEB7wavkTLEIppMDM4uDEaNAlTngHDA";

// Create client lazily
let _client: ReturnType<typeof createClient> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getClient() {
    if (!_client) {
        _client = createClient({
            url: TURSO_URL,
            authToken: TURSO_TOKEN,
        });
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
