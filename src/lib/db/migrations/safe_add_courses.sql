-- Safe Migration: Add courses table and enhanced mini course fields
-- This migration only ADDS new tables/columns, never drops existing ones
-- Run this manually in Turso console or via SQL client

-- 1. Create courses table (if not exists)
CREATE TABLE IF NOT EXISTS `courses` (
    `id` text PRIMARY KEY NOT NULL,
    `user_id` text NOT NULL,
    `name` text NOT NULL,
    `code` text,
    `description` text,
    `color` text DEFAULT '#6366f1',
    `icon` text DEFAULT '📚',
    `cover_image` text,
    `semester` text,
    `instructor` text,
    `credits` integer,
    `sort_order` integer DEFAULT 0,
    `is_archived` integer DEFAULT 0,
    `total_assignments` integer DEFAULT 0,
    `completed_assignments` integer DEFAULT 0,
    `created_at` text DEFAULT CURRENT_TIMESTAMP,
    `updated_at` text DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

-- 2. Add course_id to assignments (if not exists)
-- SQLite doesn't support IF NOT EXISTS for columns, so we need to check first
-- Run this only if the column doesn't exist:
-- ALTER TABLE `assignments` ADD COLUMN `course_id` text REFERENCES courses(id);

-- 3. Add enhanced AI settings to user_settings (if not exist)
-- Run each only if column doesn't exist:
-- ALTER TABLE `user_settings` ADD COLUMN `strict_no_answers` integer DEFAULT 1;
-- ALTER TABLE `user_settings` ADD COLUMN `detailed_course_mode` integer DEFAULT 1;
-- ALTER TABLE `user_settings` ADD COLUMN `course_citation_style` text DEFAULT 'academic';
-- ALTER TABLE `user_settings` ADD COLUMN `include_source_links` integer DEFAULT 1;
-- ALTER TABLE `user_settings` ADD COLUMN `custom_system_prompt` text;

-- 4. Add enhanced fields to mini_courses table (if not exist)
-- These support the new detailed mini course structure:
-- ALTER TABLE `mini_courses` ADD COLUMN `prerequisites` text;
-- ALTER TABLE `mini_courses` ADD COLUMN `estimated_minutes` integer;
-- ALTER TABLE `mini_courses` ADD COLUMN `difficulty_level` integer DEFAULT 3;
-- ALTER TABLE `mini_courses` ADD COLUMN `sections` text;
-- ALTER TABLE `mini_courses` ADD COLUMN `tasks` text;
-- ALTER TABLE `mini_courses` ADD COLUMN `checkpoints` text;
-- ALTER TABLE `mini_courses` ADD COLUMN `references` text;
-- ALTER TABLE `mini_courses` ADD COLUMN `next_steps` text;
-- ALTER TABLE `mini_courses` ADD COLUMN `completed_tasks` text;
-- ALTER TABLE `mini_courses` ADD COLUMN `completed_checkpoints` text;

-- Create index for faster course lookups
CREATE INDEX IF NOT EXISTS `idx_courses_user_id` ON `courses` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_assignments_course_id` ON `assignments` (`course_id`);

-- NOTE: To run column additions safely, use this pattern:
-- Check if column exists first by running:
-- PRAGMA table_info(table_name);
-- Then only run ALTER TABLE if column is not in the list
