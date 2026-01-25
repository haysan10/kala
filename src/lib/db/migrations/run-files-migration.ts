/**
 * Safe Migration: Add folders table and enhance files table
 * 
 * Run with: npx tsx src/db/migrations/run-files-migration.ts
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
        console.log(`  ⏭️  Column ${tableName}.${columnName} already exists`);
        return;
    }

    try {
        await client.execute({
            sql: `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`,
            args: [],
        });
        console.log(`  ✅ Added column ${tableName}.${columnName}`);
    } catch (error: any) {
        console.error(`  ❌ Failed: ${error.message}`);
    }
}

async function main() {
    console.log('🚀 Starting file storage migration...\n');

    // 1. Create folders table
    console.log('1. Creating folders table...');
    const foldersExists = await tableExists('folders');
    if (foldersExists) {
        console.log('  ⏭️  folders table already exists');
    } else {
        await client.execute({
            sql: `CREATE TABLE folders (
                id text PRIMARY KEY NOT NULL,
                user_id text NOT NULL,
                name text NOT NULL,
                color text DEFAULT '#6366f1',
                icon text DEFAULT '📁',
                parent_id text,
                assignment_id text,
                course_id text,
                is_starred integer DEFAULT 0,
                sort_order integer DEFAULT 0,
                created_at text DEFAULT CURRENT_TIMESTAMP,
                updated_at text DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
            )`,
            args: [],
        });
        console.log('  ✅ Created folders table');
    }

    // 2. Enhance files table
    console.log('\n2. Enhancing files table...');
    const filesExists = await tableExists('files');

    if (filesExists) {
        // Add new columns to existing files table
        await safeAddColumn('files', 'user_id', 'text');
        await safeAddColumn('files', 'original_name', 'text');
        await safeAddColumn('files', 'mime_type', 'text');
        await safeAddColumn('files', 'size_bytes', 'integer');
        await safeAddColumn('files', 'folder_id', 'text');
        await safeAddColumn('files', 'category', "text DEFAULT 'document'");
        await safeAddColumn('files', 'is_starred', 'integer DEFAULT 0');
        await safeAddColumn('files', 'download_count', 'integer DEFAULT 0');
        await safeAddColumn('files', 'last_accessed_at', 'text');
        await safeAddColumn('files', 'thumbnail_key', 'text');
        await safeAddColumn('files', 'updated_at', 'text');

        // Make assignment_id nullable (it was NOT NULL before)
        console.log('  ℹ️  Note: assignment_id constraint cannot be changed in SQLite without recreating table');
    } else {
        // Create fresh files table with all fields
        await client.execute({
            sql: `CREATE TABLE files (
                id text PRIMARY KEY NOT NULL,
                user_id text NOT NULL,
                name text NOT NULL,
                original_name text,
                storage_key text,
                mime_type text,
                size_bytes integer,
                folder_id text,
                assignment_id text,
                type text DEFAULT 'draft',
                category text DEFAULT 'document',
                is_starred integer DEFAULT 0,
                download_count integer DEFAULT 0,
                last_accessed_at text,
                thumbnail_key text,
                created_at text DEFAULT CURRENT_TIMESTAMP,
                updated_at text DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL,
                FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL
            )`,
            args: [],
        });
        console.log('  ✅ Created files table');
    }

    // 3. Create indexes
    console.log('\n3. Creating indexes...');
    const indexes = [
        { name: 'idx_folders_user_id', table: 'folders', column: 'user_id' },
        { name: 'idx_folders_parent_id', table: 'folders', column: 'parent_id' },
        { name: 'idx_files_user_id', table: 'files', column: 'user_id' },
        { name: 'idx_files_folder_id', table: 'files', column: 'folder_id' },
        { name: 'idx_files_assignment_id', table: 'files', column: 'assignment_id' },
    ];

    for (const idx of indexes) {
        try {
            await client.execute({
                sql: `CREATE INDEX IF NOT EXISTS ${idx.name} ON ${idx.table}(${idx.column})`,
                args: [],
            });
            console.log(`  ✅ Index ${idx.name}`);
        } catch (e: any) {
            console.log(`  ⏭️  ${idx.name}: ${e.message}`);
        }
    }

    console.log('\n✨ Migration completed!\n');
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
