const postgres = require('postgres');

const sql = postgres('postgresql://postgres.nllmyyfsiupefxpiutav:HncDHTa2Y5tNZ5WQ@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  connect_timeout: 10,
});

async function check() {
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Existing tables:', result.map(r => r.table_name));
    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err.message);
    process.exit(1);
  }
}

check();
