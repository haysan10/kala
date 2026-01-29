const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

const sql = postgres('postgresql://postgres.nllmyyfsiupefxpiutav:HncDHTa2Y5tNZ5WQ@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  connect_timeout: 10,
});

async function migrate() {
  try {
    const migrationPath = path.join(__dirname, '../src/lib/db/migrations/0000_swift_midnight.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration...');
    // Split by semicolon but be careful with functions/triggers if any (our schema is simple)
    // Actually, postgres-js can handle multi-statement strings
    await sql.unsafe(migrationSql);
    
    console.log('Migration successful!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
