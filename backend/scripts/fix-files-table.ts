/**
 * One-time migration script to fix files table
 * Run with: npx tsx scripts/fix-files-table.ts
 */

import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function fixFilesTable() {
    console.log("Starting migration: Making files.assignment_id nullable...\n");

    try {
        // Check current table structure
        console.log("1. Checking current table structure...");
        const tableInfo = await client.execute("PRAGMA table_info(files)");
        console.log("Current columns:", tableInfo.rows.map((r: any) => r.name));

        // Check if column assignment_id has NOT NULL constraint
        const assignmentCol = tableInfo.rows.find((r: any) => r.name === 'assignment_id');
        if (assignmentCol) {
            console.log(`   assignment_id notnull: ${(assignmentCol as any).notnull}`);

            // If it's already nullable (notnull = 0), skip
            if ((assignmentCol as any).notnull === 0) {
                console.log("\n✅ assignment_id is already nullable. No migration needed.");
                return;
            }
        }

        console.log("\n2. Creating new files table with nullable assignment_id...");

        // Create new table with correct schema
        await client.execute(`
            CREATE TABLE IF NOT EXISTS files_new (
                id TEXT PRIMARY KEY NOT NULL,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                original_name TEXT,
                storage_key TEXT,
                mime_type TEXT,
                size_bytes INTEGER,
                folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
                assignment_id TEXT REFERENCES assignments(id) ON DELETE SET NULL,
                type TEXT DEFAULT 'draft',
                category TEXT DEFAULT 'document',
                is_starred INTEGER DEFAULT 0,
                download_count INTEGER DEFAULT 0,
                last_accessed_at TEXT,
                thumbnail_key TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("   ✓ Created files_new table");

        console.log("\n3. Copying existing data...");
        // Copy existing data - handle both old and new column names
        try {
            await client.execute(`
                INSERT OR IGNORE INTO files_new 
                (id, user_id, name, original_name, storage_key, mime_type, size_bytes, folder_id, assignment_id, type, category, is_starred, download_count, last_accessed_at, thumbnail_key, created_at, updated_at)
                SELECT 
                    id, 
                    user_id, 
                    name, 
                    original_name, 
                    storage_key, 
                    mime_type, 
                    size_bytes, 
                    folder_id, 
                    assignment_id, 
                    type, 
                    category, 
                    is_starred, 
                    download_count, 
                    last_accessed_at, 
                    thumbnail_key, 
                    created_at, 
                    updated_at
                FROM files
            `);
        } catch (copyError) {
            // If copy fails (maybe old schema), try with old column mapping
            console.log("   Trying with old schema compatibility...");
            await client.execute(`
                INSERT OR IGNORE INTO files_new 
                (id, user_id, name, assignment_id, type, created_at)
                SELECT 
                    id, 
                    COALESCE(user_id, (SELECT user_id FROM assignments WHERE assignments.id = files.assignment_id)),
                    name, 
                    assignment_id, 
                    type, 
                    created_at
                FROM files
            `);
        }
        console.log("   ✓ Data copied successfully");

        console.log("\n4. Dropping old files table...");
        await client.execute("DROP TABLE IF EXISTS files");
        console.log("   ✓ Old table dropped");

        console.log("\n5. Renaming new table to files...");
        await client.execute("ALTER TABLE files_new RENAME TO files");
        console.log("   ✓ Table renamed");

        console.log("\n6. Creating indexes...");
        await client.execute("CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id)");
        await client.execute("CREATE INDEX IF NOT EXISTS idx_files_folder_id ON files(folder_id)");
        await client.execute("CREATE INDEX IF NOT EXISTS idx_files_assignment_id ON files(assignment_id)");
        console.log("   ✓ Indexes created");

        console.log("\n✅ Migration completed successfully!");
        console.log("   Files can now be uploaded without assignment_id.\n");

    } catch (error) {
        console.error("\n❌ Migration failed:", error);
        process.exit(1);
    }
}

fixFilesTable();
