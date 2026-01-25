const { createClient } = require("@libsql/client/web");

const url = "https://yes-ai-cms-haysan10.aws-us-west-2.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3NzQ1NjM1NDEsImlhdCI6MTc2OTM3OTU0MSwiaWQiOiJhYTcxMDQ5Mi00ZGUyLTRmYjAtOTg5Ny1kNTViMTExNGMzMGYiLCJyaWQiOiJlZTE1OTIwYi0wMzIwLTQ1NjctYTAzNC1mODE4NzJiZDVlNWEifQ.Jzrh0WMCvUHaTMiDo4b5aKmquexurkSowY_6LT7Gk-Eu43oTiH41HI5IEB7wavkTLEIppMDM4uDEaNAlTngHDA";

async function inspectSchema() {
  console.log("🔍 Consulting Database Schema...");
  try {
    const client = createClient({
      url,
      authToken,
    });
    
    // Check table info for 'users'
    const rs = await client.execute("PRAGMA table_info(users);");
    
    const columns = rs.rows.map(row => row.name);
    console.log("✅ Columns in 'users' table:", columns);
    
    const sensitive = ['google_access_token', 'provider', 'provider_id', 'avatar'];
    const missing = sensitive.filter(col => !columns.includes(col));
    
    if (missing.length > 0) {
        console.error("❌ MISSING COLUMNS:", missing);
    } else {
        console.log("✅ All OAuth columns present!");
    }

  } catch (e) {
    console.error("❌ FAILED:", e.message);
  }
}

inspectSchema();
