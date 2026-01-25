-- Migration: Make files.assignment_id nullable and add new columns
-- This allows files to be uploaded without requiring an assignment

-- SQLite doesn't support ALTER COLUMN, so we need to recreate the table
-- Step 1: Create new table with correct schema
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
);

-- Step 2: Copy existing data (if any)
INSERT OR IGNORE INTO files_new (id, user_id, name, original_name, storage_key, mime_type, size_bytes, folder_id, assignment_id, type, category, is_starred, download_count, last_accessed_at, thumbnail_key, created_at, updated_at)
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
FROM files;

-- Step 3: Drop old table
DROP TABLE IF EXISTS files;

-- Step 4: Rename new table
ALTER TABLE files_new RENAME TO files;

-- Step 5: Create index for common queries
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_assignment_id ON files(assignment_id);
