
const { createClient } = require("@libsql/client");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

async function test() {
    const client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
    });

    try {
        console.log("Testing connection to:", process.env.TURSO_DATABASE_URL);
        const result = await client.execute({
            sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='users'",
            args: []
        });
        console.log("Table info:", result.rows);
        
        const count = await client.execute("SELECT count(*) as count FROM users");
        console.log("User count:", count.rows[0].count);
        
    } catch (err) {
        console.error("DB Error:", err);
    }
}

test();
