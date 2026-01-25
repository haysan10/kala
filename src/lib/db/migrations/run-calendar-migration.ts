/**
 * Calendar Events Migration
 * 
 * Creates the calendar_events table for Phase 3
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || path.join(__dirname, '../../../data/kala.db');

console.log('🗓️ Running calendar_events migration...');
console.log(`📁 Database path: ${dbPath}`);

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

const migration = `
-- Calendar Events table
CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Event Identity
    title TEXT NOT NULL,
    description TEXT,
    
    -- Timing
    start_time TEXT NOT NULL,
    end_time TEXT,
    all_day INTEGER DEFAULT 0,
    
    -- Event Type & Color
    type TEXT DEFAULT 'custom',
    color TEXT DEFAULT '#3B82F6',
    
    -- Optional Linkage
    assignment_id TEXT REFERENCES assignments(id) ON DELETE CASCADE,
    milestone_id TEXT REFERENCES milestones(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
    
    -- Status
    status TEXT DEFAULT 'scheduled',
    is_recurring INTEGER DEFAULT 0,
    recurrence_rule TEXT,
    
    -- Completion tracking
    completed_at TEXT,
    
    -- UI metadata
    is_visible INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_assignment_id ON calendar_events(assignment_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_milestone_id ON calendar_events(milestone_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(type);
`;

try {
    db.exec(migration);
    console.log('✅ calendar_events table created successfully');

    // Verify table exists
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='calendar_events'").all();
    console.log('📊 Found tables:', tables.map((t: any) => t.name));

} catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
} finally {
    db.close();
}

console.log('✅ Calendar migration completed!');
