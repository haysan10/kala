import 'dotenv/config';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from './schema';

async function runMigrations() {
    console.log('🚀 Starting database migration...');

    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!tursoUrl) {
        console.error('❌ TURSO_DATABASE_URL is not set');
        process.exit(1);
    }

    console.log(`📍 Database URL: ${tursoUrl.substring(0, 30)}...`);

    const client = createClient({
        url: tursoUrl,
        authToken: authToken,
    });

    const db = drizzle(client, { schema });

    try {
        console.log('📦 Running migrations...');
        await migrate(db, { migrationsFolder: './src/lib/db/migrations' });
        console.log('✅ Migrations completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

runMigrations();
