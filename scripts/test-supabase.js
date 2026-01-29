const postgres = require('postgres');

const sql = postgres('postgresql://postgres.nllmyyfsiupefxpiutav:HncDHTa2Y5tNZ5WQ@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  connect_timeout: 10,
});

async function test() {
  try {
    const result = await sql`SELECT 1 as result`;
    console.log('Connection successful:', result);
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
}

test();
