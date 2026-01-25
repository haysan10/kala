/**
 * Safe Migration Script for Phase 1 & 2
 * 
 * This script safely adds new tables and columns without data loss.
 * Run with: npx tsx src/db/run-safe-migration.ts
 */

import { createClient } from '@libsql/client';
import 'dotenv/config';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function tableExists(tableName: string): Promise<boolean> {
    const result = await client.execute({
        sql: `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
        args: [tableName],
    });
    return result.rows.length > 0;
}

async function columnExists(tableName: string, columnName: string): Promise<boolean> {
    const result = await client.execute({
        sql: `PRAGMA table_info(${tableName})`,
        args: [],
    });
    return result.rows.some((row: any) => row.name === columnName);
}

async function safeAddColumn(tableName: string, columnName: string, definition: string) {
    const exists = await columnExists(tableName, columnName);
    if (exists) {
        console.log(`  ⏭️  Column ${tableName}.${columnName} already exists, skipping`);
        return;
    }

    try {
        await client.execute({
            sql: `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`,
            args: [],
        });
        console.log(`  ✅ Added column ${tableName}.${columnName}`);
    } catch (error: any) {
        console.error(`  ❌ Failed to add ${tableName}.${columnName}: ${error.message}`);
    }
}

async function main() {
    console.log('🚀 Starting safe migration...\n');

    // 1. Create courses table
    console.log('1. Creating courses table...');
    const coursesExists = await tableExists('courses');
    if (coursesExists) {
        console.log('  ⏭️  courses table already exists');
    } else {
        await client.execute({
            sql: `CREATE TABLE courses (
                id text PRIMARY KEY NOT NULL,
                user_id text NOT NULL,
                name text NOT NULL,
                code text,
                description text,
                color text DEFAULT '#6366f1',
                icon text DEFAULT '📚',
                cover_image text,
                semester text,
                instructor text,
                credits integer,
                sort_order integer DEFAULT 0,
                is_archived integer DEFAULT 0,
                total_assignments integer DEFAULT 0,
                completed_assignments integer DEFAULT 0,
                created_at text DEFAULT CURRENT_TIMESTAMP,
                updated_at text DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE cascade
            )`,
            args: [],
        });
        console.log('  ✅ Created courses table');
    }

    // 2. Add course_id to assignments
    console.log('\n2. Adding course_id to assignments...');
    await safeAddColumn('assignments', 'course_id', 'text REFERENCES courses(id)');

    // 3. Add AI settings to user_settings
    console.log('\n3. Adding AI settings to user_settings...');
    await safeAddColumn('user_settings', 'strict_no_answers', 'integer DEFAULT 1');
    await safeAddColumn('user_settings', 'detailed_course_mode', 'integer DEFAULT 1');
    await safeAddColumn('user_settings', 'course_citation_style', "text DEFAULT 'academic'");
    await safeAddColumn('user_settings', 'include_source_links', 'integer DEFAULT 1');
    await safeAddColumn('user_settings', 'custom_system_prompt', 'text');

    // 4. Add enhanced fields to mini_courses
    console.log('\n4. Adding enhanced fields to mini_courses...');
    const miniCoursesExists = await tableExists('mini_courses');
    if (miniCoursesExists) {
        await safeAddColumn('mini_courses', 'prerequisites', 'text');
        await safeAddColumn('mini_courses', 'estimated_minutes', 'integer');
        await safeAddColumn('mini_courses', 'difficulty_level', 'integer DEFAULT 3');
        await safeAddColumn('mini_courses', 'sections', 'text');
        await safeAddColumn('mini_courses', 'tasks', 'text');
        await safeAddColumn('mini_courses', 'checkpoints', 'text');
        await safeAddColumn('mini_courses', 'references_json', 'text');
        await safeAddColumn('mini_courses', 'next_steps', 'text');
        await safeAddColumn('mini_courses', 'completed_tasks', 'text');
        await safeAddColumn('mini_courses', 'completed_checkpoints', 'text');
    } else {
        console.log('  ⚠️  mini_courses table not found');
    }

    // 5. Create indexes
    console.log('\n5. Creating indexes...');
    try {
        await client.execute({
            sql: 'CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id)',
            args: [],
        });
        console.log('  ✅ Created index idx_courses_user_id');
    } catch (e: any) {
        console.log(`  ⏭️  Index already exists or error: ${e.message}`);
    }

    try {
        await client.execute({
            sql: 'CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id)',
            args: [],
        });
        console.log('  ✅ Created index idx_assignments_course_id');
    } catch (e: any) {
        console.log(`  ⏭️  Index already exists or error: ${e.message}`);
    }

    console.log('\n✨ Migration completed successfully!\n');

    // Verify
    console.log('📊 Verification:');
    const tables = await client.execute({
        sql: "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
        args: [],
    });
    console.log('Tables:', tables.rows.map((r: any) => r.name).join(', '));

    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
