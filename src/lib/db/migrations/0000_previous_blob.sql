CREATE TABLE `assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`learning_outcome` text,
	`deadline` text,
	`course` text DEFAULT 'General',
	`tags` text DEFAULT '[]',
	`rubrics` text DEFAULT '[]',
	`diagnostic_questions` text DEFAULT '[]',
	`diagnostic_responses` text DEFAULT '{}',
	`overall_progress` integer DEFAULT 0,
	`at_risk` integer DEFAULT false,
	`clarity_score` integer DEFAULT 0,
	`last_synapse_date` text,
	`summative_reflection` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`assignment_id` text NOT NULL,
	`type` text DEFAULT 'tutor',
	`system_instruction` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `daily_synapses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`assignment_id` text NOT NULL,
	`question` text NOT NULL,
	`response` text,
	`synapse_date` text NOT NULL,
	`completed` integer DEFAULT false,
	`clarity_awarded` integer DEFAULT 15,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `debate_turns` (
	`id` text PRIMARY KEY NOT NULL,
	`mini_course_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`intellectual_weight` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`mini_course_id`) REFERENCES `mini_courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`assignment_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'draft',
	`storage_key` text,
	`size` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`assignment_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`estimated_minutes` integer DEFAULT 30,
	`deadline` text,
	`status` text DEFAULT 'todo',
	`sort_order` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `mini_courses` (
	`id` text PRIMARY KEY NOT NULL,
	`milestone_id` text NOT NULL,
	`learning_outcome` text,
	`overview` text,
	`concepts` text DEFAULT '[]',
	`practical_guide` text,
	`formative_action` text,
	`expert_tip` text,
	`mastery_status` text DEFAULT 'untested',
	`formative_task_completed` integer DEFAULT false,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mini_courses_milestone_id_unique` ON `mini_courses` (`milestone_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`message` text,
	`type` text DEFAULT 'system',
	`read` integer DEFAULT false,
	`link` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `scaffolding_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`assignment_id` text NOT NULL,
	`instruction` text NOT NULL,
	`duration_seconds` integer DEFAULT 300,
	`completed` integer DEFAULT false,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`course` text,
	`tags` text DEFAULT '[]',
	`rubrics` text DEFAULT '[]',
	`learning_outcome` text,
	`diagnostic_questions` text DEFAULT '[]',
	`milestone_templates` text DEFAULT '[]',
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`ai_provider` text DEFAULT 'gemini',
	`gemini_api_key` text,
	`grok_api_key` text,
	`ai_language` text DEFAULT 'en',
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `validation_results` (
	`id` text PRIMARY KEY NOT NULL,
	`assignment_id` text NOT NULL,
	`overall_score` integer,
	`rubric_scores` text DEFAULT '[]',
	`strengths` text DEFAULT '[]',
	`weaknesses` text DEFAULT '[]',
	`recommendations` text DEFAULT '[]',
	`alignment_score` integer,
	`assessment_date` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE cascade
);
