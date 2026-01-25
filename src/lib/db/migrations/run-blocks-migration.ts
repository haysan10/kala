/**
 * Content Blocks Migration
 * 
 * Creates the content_blocks table for Phase 4
 */

// @ts-nocheck
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || path.join(__dirname, '../../../data/kala.db');

console.log('🧱 Running content_blocks migration...');
console.log(`📁 Database path: ${dbPath}`);

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

const migration = `
-- Content Blocks table
CREATE TABLE IF NOT EXISTS content_blocks (
    id TEXT PRIMARY KEY,
    assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Block Identity
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',
    
    -- Ordering
    sort_order INTEGER DEFAULT 0,
    
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_blocks_assignment_id ON content_blocks(assignment_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_user_id ON content_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_sort_order ON content_blocks(sort_order);
`;

try {
    db.exec(migration);
    console.log('✅ content_blocks table created successfully');

    // Verify table exists
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='content_blocks'").all();
    console.log('📊 Found tables:', tables.map((t: any) => t.name));

} catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
} finally {
    db.close();
}

console.log('✅ Content Blocks migration completed!');
