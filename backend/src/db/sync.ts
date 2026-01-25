import 'dotenv/config';
import { createClient } from '@libsql/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function syncDatabase() {
    console.log('🚀 Starting database sync...');

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

    try {
        // Check existing tables
        console.log('\n📋 Checking existing tables...');
        const tables = await client.execute(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%'
            ORDER BY name
        `);

        console.log('Existing tables:');
        const existingTables = new Set<string>();
        tables.rows.forEach(row => {
            console.log(`  - ${row.name}`);
            existingTables.add(row.name as string);
        });

        // Required tables from schema
        const requiredTables = [
            'users',
            'assignments',
            'milestones',
            'mini_courses',
            'debate_turns',
            'files',
            'validation_results',
            'chat_sessions',
            'chat_messages',
            'daily_synapses',
            'notifications',
            'templates',
            'scaffolding_tasks'
        ];

        console.log('\n🔍 Checking for missing tables...');
        const missingTables = requiredTables.filter(t => !existingTables.has(t));

        if (missingTables.length === 0) {
            console.log('✅ All required tables exist!');
        } else {
            console.log('Missing tables:');
            missingTables.forEach(t => console.log(`  - ${t}`));

            // Read migration SQL
            const migrationPath = path.join(__dirname, 'migrations', '0000_previous_blob.sql');
            const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

            // Parse SQL statements
            const statements = migrationSql.split('-->\ statement-breakpoint\n').filter(s => s.trim());

            // Execute only statements for missing tables
            console.log('\n📦 Creating missing tables...');
            for (const stmt of statements) {
                const createMatch = stmt.match(/CREATE TABLE `(\w+)`/);
                const createIndexMatch = stmt.match(/CREATE.*INDEX.*ON `(\w+)`/);

                if (createMatch && missingTables.includes(createMatch[1])) {
                    console.log(`  Creating table: ${createMatch[1]}`);
                    try {
                        await client.execute(stmt.trim());
                    } catch (e: any) {
                        if (!e.message?.includes('already exists')) {
                            console.error(`    Error: ${e.message}`);
                        }
                    }
                } else if (createIndexMatch) {
                    try {
                        await client.execute(stmt.trim());
                    } catch (e: any) {
                        // Ignore if index already exists
                    }
                }
            }
        }

        // Add users table specific columns check
        console.log('\n🔍 Checking users table structure...');
        const usersInfo = await client.execute(`PRAGMA table_info(users)`);
        const userColumns = new Set(usersInfo.rows.map(r => r.name));

        const requiredUserColumns = ['id', 'email', 'password_hash', 'name', 'provider', 'provider_id', 'avatar', 'google_access_token', 'google_refresh_token', 'created_at', 'updated_at'];
        const missingUserColumns = requiredUserColumns.filter(c => !userColumns.has(c));

        if (missingUserColumns.length > 0) {
            console.log('Missing user columns:', missingUserColumns.join(', '));

            for (const col of missingUserColumns) {
                let alterSql = '';
                switch (col) {
                    case 'provider':
                        alterSql = `ALTER TABLE users ADD COLUMN provider TEXT DEFAULT 'email'`;
                        break;
                    case 'provider_id':
                        alterSql = `ALTER TABLE users ADD COLUMN provider_id TEXT`;
                        break;
                    case 'avatar':
                        alterSql = `ALTER TABLE users ADD COLUMN avatar TEXT`;
                        break;
                    case 'google_access_token':
                        alterSql = `ALTER TABLE users ADD COLUMN google_access_token TEXT`;
                        break;
                    case 'google_refresh_token':
                        alterSql = `ALTER TABLE users ADD COLUMN google_refresh_token TEXT`;
                        break;
                    case 'password_hash':
                        alterSql = `ALTER TABLE users ADD COLUMN password_hash TEXT`;
                        break;
                }

                if (alterSql) {
                    try {
                        console.log(`  Adding column: ${col}`);
                        await client.execute(alterSql);
                    } catch (e: any) {
                        if (!e.message?.includes('duplicate column')) {
                            console.error(`    Error: ${e.message}`);
                        }
                    }
                }
            }
        } else {
            console.log('✅ Users table has all required columns');
        }

        console.log('\n✅ Database sync completed!');

        // Show final table count
        const finalTables = await client.execute(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%'
            ORDER BY name
        `);
        console.log(`\n📊 Total tables: ${finalTables.rows.length}`);

    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

syncDatabase();
