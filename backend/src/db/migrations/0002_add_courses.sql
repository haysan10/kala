CREATE TABLE `courses` (
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
	`is_archived` integer DEFAULT false,
	`total_assignments` integer DEFAULT 0,
	`completed_assignments` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `assignments` ADD `course_id` text REFERENCES courses(id);--> statement-breakpoint
ALTER TABLE `user_settings` ADD `strict_no_answers` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `user_settings` ADD `detailed_course_mode` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `user_settings` ADD `course_citation_style` text DEFAULT 'academic';--> statement-breakpoint
ALTER TABLE `user_settings` ADD `include_source_links` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `user_settings` ADD `custom_system_prompt` text;