/**
 * Complete database sync script
 * Ensures all tables match the current schema
 * Run with: npx tsx scripts/sync-database.ts
 */

import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function syncDatabase() {
    console.log("🔄 Starting database sync...\n");

    try {
        // ==================== FOLDERS TABLE ====================
        console.log("📁 Checking folders table...");

        const foldersInfo = await client.execute("PRAGMA table_info(folders)");
        const folderColumns = foldersInfo.rows.map((r: any) => r.name);

        if (folderColumns.length === 0) {
            // Create folders table from scratch
            console.log("   Creating folders table...");
            await client.execute(`
                CREATE TABLE folders (
                    id TEXT PRIMARY KEY NOT NULL,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    name TEXT NOT NULL,
                    color TEXT DEFAULT '#6366f1',
                    icon TEXT DEFAULT '📁',
                    parent_id TEXT,
                    assignment_id TEXT REFERENCES assignments(id) ON DELETE SET NULL,
                    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
                    is_starred INTEGER DEFAULT 0,
                    sort_order INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log("   ✓ folders table created");
        } else {
            console.log("   Existing columns:", folderColumns.join(", "));

            // Check for missing columns and add them
            const requiredColumns = [
                { name: 'parent_id', sql: 'ALTER TABLE folders ADD COLUMN parent_id TEXT' },
                { name: 'assignment_id', sql: 'ALTER TABLE folders ADD COLUMN assignment_id TEXT' },
                { name: 'course_id', sql: 'ALTER TABLE folders ADD COLUMN course_id TEXT' },
                { name: 'is_starred', sql: 'ALTER TABLE folders ADD COLUMN is_starred INTEGER DEFAULT 0' },
                { name: 'sort_order', sql: 'ALTER TABLE folders ADD COLUMN sort_order INTEGER DEFAULT 0' },
                { name: 'color', sql: "ALTER TABLE folders ADD COLUMN color TEXT DEFAULT '#6366f1'" },
                { name: 'icon', sql: "ALTER TABLE folders ADD COLUMN icon TEXT DEFAULT '📁'" },
                { name: 'updated_at', sql: 'ALTER TABLE folders ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP' },
            ];

            for (const col of requiredColumns) {
                if (!folderColumns.includes(col.name)) {
                    console.log(`   Adding column: ${col.name}...`);
                    try {
                        await client.execute(col.sql);
                        console.log(`   ✓ ${col.name} added`);
                    } catch (e: any) {
                        if (!e.message.includes('duplicate column')) {
                            console.log(`   ⚠ ${col.name}: ${e.message}`);
                        }
                    }
                }
            }
        }

        // ==================== CALENDAR EVENTS TABLE ====================
        console.log("\n📅 Checking calendar_events table...");

        try {
            await client.execute("SELECT 1 FROM calendar_events LIMIT 1");
            console.log("   ✓ calendar_events exists");
        } catch {
            console.log("   Creating calendar_events table...");
            await client.execute(`
                CREATE TABLE calendar_events (
                    id TEXT PRIMARY KEY NOT NULL,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    title TEXT NOT NULL,
                    description TEXT,
                    start_time TEXT NOT NULL,
                    end_time TEXT,
                    all_day INTEGER DEFAULT 0,
                    type TEXT DEFAULT 'custom',
                    color TEXT DEFAULT '#3B82F6',
                    assignment_id TEXT REFERENCES assignments(id) ON DELETE CASCADE,
                    milestone_id TEXT REFERENCES milestones(id) ON DELETE CASCADE,
                    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
                    status TEXT DEFAULT 'scheduled',
                    is_recurring INTEGER DEFAULT 0,
                    recurrence_rule TEXT,
                    completed_at TEXT,
                    is_visible INTEGER DEFAULT 1,
                    sort_order INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log("   ✓ calendar_events created");
        }

        // ==================== CONTENT BLOCKS TABLE ====================
        console.log("\n📝 Checking content_blocks table...");

        try {
            await client.execute("SELECT 1 FROM content_blocks LIMIT 1");
            console.log("   ✓ content_blocks exists");
        } catch {
            console.log("   Creating content_blocks table...");
            await client.execute(`
                CREATE TABLE content_blocks (
                    id TEXT PRIMARY KEY NOT NULL,
                    assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    metadata TEXT DEFAULT '{}',
                    sort_order INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log("   ✓ content_blocks created");
        }

        // ==================== COURSES TABLE ====================
        console.log("\n📚 Checking courses table...");

        try {
            await client.execute("SELECT 1 FROM courses LIMIT 1");
            console.log("   ✓ courses exists");
        } catch {
            console.log("   Creating courses table...");
            await client.execute(`
                CREATE TABLE courses (
                    id TEXT PRIMARY KEY NOT NULL,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    name TEXT NOT NULL,
                    code TEXT,
                    description TEXT,
                    color TEXT DEFAULT '#6366f1',
                    icon TEXT DEFAULT '📚',
                    cover_image TEXT,
                    semester TEXT,
                    instructor TEXT,
                    credits INTEGER,
                    sort_order INTEGER DEFAULT 0,
                    is_archived INTEGER DEFAULT 0,
                    total_assignments INTEGER DEFAULT 0,
                    completed_assignments INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log("   ✓ courses created");
        }

        // ==================== CREATE INDEXES ====================
        console.log("\n🔍 Creating indexes...");

        const indexes = [
            "CREATE INDEX IF NOT EXISTS idx_folders_user ON folders(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id)",
            "CREATE INDEX IF NOT EXISTS idx_files_user ON files(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_files_folder ON files(folder_id)",
            "CREATE INDEX IF NOT EXISTS idx_calendar_user ON calendar_events(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_calendar_dates ON calendar_events(start_time, end_time)",
        ];

        for (const idx of indexes) {
            try {
                await client.execute(idx);
            } catch (e: any) {
                // Ignore if already exists
            }
        }
        console.log("   ✓ Indexes created/verified");

        // ==================== VERIFY FILES TABLE ====================
        console.log("\n📄 Verifying files table structure...");
        const filesInfo = await client.execute("PRAGMA table_info(files)");
        const fileColumns = filesInfo.rows.map((r: any) => r.name);
        console.log("   Current columns:", fileColumns.join(", "));

        // Check files count
        const filesCount = await client.execute("SELECT COUNT(*) as count FROM files");
        console.log(`   Total files in database: ${(filesCount.rows[0] as any).count}`);

        console.log("\n✅ Database sync completed successfully!\n");

    } catch (error) {
        console.error("\n❌ Database sync failed:", error);
        process.exit(1);
    }
}

syncDatabase();
