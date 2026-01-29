// Test script for Drizzle + libsql/web
const { createClient } = require("@libsql/client/web");
const { drizzle } = require("drizzle-orm/libsql");
const { sqliteTable, text } = require("drizzle-orm/sqlite-core");
const { eq } = require("drizzle-orm");

const url = "https://yes-ai-cms-haysan10.aws-us-west-2.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3NzQ1NjM1NDEsImlhdCI6MTc2OTM3OTU0MSwiaWQiOiJhYTcxMDQ5Mi00ZGUyLTRmYjAtOTg5Ny1kNTViMTExNGMzMGYiLCJyaWQiOiJlZTE1OTIwYi0wMzIwLTQ1NjctYTAzNC1mODE4NzJiZDVlNWEifQ.Jzrh0WMCvUHaTMiDo4b5aKmquexurkSowY_6LT7Gk-Eu43oTiH41HI5IEB7wavkTLEIppMDM4uDEaNAlTngHDA";

// Simple schema
const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
});

async function test() {
    console.log("🔧 Testing Drizzle + libsql/web...");
    
    try {
        const client = createClient({ url, authToken });
        const db = drizzle(client);
        
        console.log("✅ Client and Drizzle created successfully");
        
        // Test query
        const result = await db.select({ id: users.id, email: users.email }).from(users).limit(3);
        console.log("✅ Query succeeded:", result.length, "rows");
        console.log(result);
    } catch (e) {
        console.error("❌ Error:", e.message);
        console.error("Stack:", e.stack);
    }
}

test();
