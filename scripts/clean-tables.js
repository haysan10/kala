const postgres = require('postgres');

const sql = postgres('postgresql://postgres.nllmyyfsiupefxpiutav:HncDHTa2Y5tNZ5WQ@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  connect_timeout: 10,
});

async function clean() {
  try {
    console.log('Cleaning up existing tables...');
    await sql`DROP TABLE IF EXISTS profiles, folders, documents, schedules, notifications, ai_cache CASCADE`;
    console.log('Cleanup successful!');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err.message);
    process.exit(1);
  }
}

clean();
