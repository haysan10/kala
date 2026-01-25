const { createClient } = require("@libsql/client");

const originalUrl = "libsql://yes-ai-cms-haysan10.aws-us-west-2.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3NzQ1NjM1NDEsImlhdCI6MTc2OTM3OTU0MSwiaWQiOiJhYTcxMDQ5Mi00ZGUyLTRmYjAtOTg5Ny1kNTViMTExNGMzMGYiLCJyaWQiOiJlZTE1OTIwYi0wMzIwLTQ1NjctYTAzNC1mODE4NzJiZDVlNWEifQ.Jzrh0WMCvUHaTMiDo4b5aKmquexurkSowY_6LT7Gk-Eu43oTiH41HI5IEB7wavkTLEIppMDM4uDEaNAlTngHDA";

// Use HTTPS protocol for stability
const httpUrl = originalUrl.replace("libsql://", "https://");

async function test() {
  console.log(`\nTesting Connection to: ${httpUrl}`);
  try {
    const client = createClient({
      url: httpUrl,
      authToken,
    });
    
    console.log("⏳ Connecting...");
    const rs = await client.execute("SELECT 1 as val");
    
    console.log(`✅ DATABASE CONNECTION SUCCESS!`);
    console.log(`   Result:`, rs.rows[0]);
    console.log(`   Token is: VALID`);
  } catch (e) {
    console.error(`❌ CONNECTION FAILED:`, e.message);
    if (e.cause) console.error("   Cause:", e.cause);
  }
}

test();
