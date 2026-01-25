import 'dotenv/config';
import { createClient } from '@libsql/client';

async function fixNotifications() {
    console.log('🔧 Fixing notifications table...');

    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!tursoUrl) {
        console.error('❌ TURSO_DATABASE_URL is not set');
        process.exit(1);
    }

    const client = createClient({
        url: tursoUrl,
        authToken: authToken,
    });

    try {
        // Check current notifications table structure
        console.log('\n📋 Checking notifications table structure...');
        const notifInfo = await client.execute(`PRAGMA table_info(notifications)`);
        const columns = new Set(notifInfo.rows.map(r => r.name));

        console.log('Current columns:');
        notifInfo.rows.forEach(row => console.log(`  - ${row.name}: ${row.type}`));

        // Required columns from our schema
        const requiredColumns: Record<string, string> = {
            'id': 'TEXT PRIMARY KEY',
            'user_id': 'TEXT NOT NULL',
            'title': 'TEXT NOT NULL',
            'message': 'TEXT',
            'type': "TEXT DEFAULT 'system'",
            'read': 'INTEGER DEFAULT 0',
            'link': 'TEXT',
            'created_at': 'TEXT DEFAULT CURRENT_TIMESTAMP'
        };

        console.log('\n🔍 Checking for missing columns...');
        for (const [col, def] of Object.entries(requiredColumns)) {
            if (!columns.has(col)) {
                console.log(`  Adding column: ${col}`);
                try {
                    await client.execute(`ALTER TABLE notifications ADD COLUMN ${col} ${def}`);
                } catch (e: any) {
                    console.log(`    Skipped: ${e.message}`);
                }
            }
        }

        console.log('\n✅ Notifications table fixed!');

    } catch (error) {
        console.error('❌ Fix failed:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

fixNotifications();
