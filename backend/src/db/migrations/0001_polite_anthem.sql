CREATE TABLE `user_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`ai_provider` text DEFAULT 'gemini',
	`gemini_api_key` text,
	`grok_api_key` text,
	`ai_temperature` integer DEFAULT 70,
	`ai_max_tokens` integer DEFAULT 2000,
	`ai_top_p` integer DEFAULT 90,
	`language` text DEFAULT 'id',
	`thinking_mode` text DEFAULT 'socratic',
	`hint_level` text DEFAULT 'minimal',
	`email_notifications` integer DEFAULT true,
	`push_notifications` integer DEFAULT true,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_settings_user_id_unique` ON `user_settings` (`user_id`);--> statement-breakpoint
DROP INDEX "mini_courses_milestone_id_unique";--> statement-breakpoint
DROP INDEX "user_settings_user_id_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "password_hash" TO "password_hash" text;--> statement-breakpoint
CREATE UNIQUE INDEX `mini_courses_milestone_id_unique` ON `mini_courses` (`milestone_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `users` ADD `provider` text DEFAULT 'email';--> statement-breakpoint
ALTER TABLE `users` ADD `provider_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `ai_provider`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `gemini_api_key`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `grok_api_key`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `ai_language`;