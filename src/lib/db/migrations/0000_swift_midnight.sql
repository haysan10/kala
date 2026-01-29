CREATE TABLE "assignments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"course_id" varchar(36),
	"title" varchar(255) NOT NULL,
	"description" text,
	"learning_outcome" text,
	"deadline" varchar(50),
	"course" varchar(100) DEFAULT 'General',
	"tags" text DEFAULT '[]',
	"rubrics" text DEFAULT '[]',
	"diagnostic_questions" text DEFAULT '[]',
	"diagnostic_responses" text DEFAULT '{}',
	"overall_progress" integer DEFAULT 0,
	"at_risk" boolean DEFAULT false,
	"clarity_score" integer DEFAULT 0,
	"last_synapse_date" varchar(50),
	"summative_reflection" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"all_day" boolean DEFAULT false,
	"type" varchar(50) DEFAULT 'custom',
	"color" varchar(20) DEFAULT '#3B82F6',
	"assignment_id" varchar(36),
	"milestone_id" varchar(36),
	"course_id" varchar(36),
	"status" varchar(50) DEFAULT 'scheduled',
	"is_recurring" boolean DEFAULT false,
	"recurrence_rule" text,
	"completed_at" timestamp with time zone,
	"is_visible" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"session_id" varchar(36) NOT NULL,
	"role" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(36) NOT NULL,
	"type" varchar(50) DEFAULT 'tutor',
	"system_instruction" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_blocks" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"type" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"metadata" text DEFAULT '{}',
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50),
	"description" text,
	"color" varchar(20) DEFAULT '#6366f1',
	"icon" varchar(50) DEFAULT '📚',
	"cover_image" text,
	"semester" varchar(50),
	"instructor" varchar(255),
	"credits" integer,
	"sort_order" integer DEFAULT 0,
	"is_archived" boolean DEFAULT false,
	"total_assignments" integer DEFAULT 0,
	"completed_assignments" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_synapses" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"assignment_id" varchar(36) NOT NULL,
	"question" text NOT NULL,
	"response" text,
	"synapse_date" varchar(50) NOT NULL,
	"completed" boolean DEFAULT false,
	"clarity_awarded" integer DEFAULT 15
);
--> statement-breakpoint
CREATE TABLE "debate_turns" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"mini_course_id" varchar(36) NOT NULL,
	"role" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"intellectual_weight" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"original_name" varchar(255),
	"storage_key" text,
	"mime_type" varchar(100),
	"size_bytes" integer,
	"folder_id" varchar(36),
	"assignment_id" varchar(36),
	"type" varchar(50) DEFAULT 'draft',
	"category" varchar(50) DEFAULT 'document',
	"is_starred" boolean DEFAULT false,
	"download_count" integer DEFAULT 0,
	"last_accessed_at" timestamp with time zone,
	"thumbnail_key" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "folders" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"color" varchar(20) DEFAULT '#6366f1',
	"icon" varchar(50) DEFAULT '📁',
	"parent_id" varchar(36),
	"assignment_id" varchar(36),
	"course_id" varchar(36),
	"is_starred" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(36) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"estimated_minutes" integer DEFAULT 30,
	"deadline" varchar(50),
	"status" varchar(50) DEFAULT 'todo',
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mini_courses" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"milestone_id" varchar(36) NOT NULL,
	"learning_outcome" text,
	"overview" text,
	"concepts" text DEFAULT '[]',
	"practical_guide" text,
	"formative_action" text,
	"expert_tip" text,
	"mastery_status" varchar(50) DEFAULT 'untested',
	"formative_task_completed" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "mini_courses_milestone_id_unique" UNIQUE("milestone_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text,
	"type" varchar(50) DEFAULT 'system',
	"read" boolean DEFAULT false,
	"link" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scaffolding_tasks" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(36) NOT NULL,
	"instruction" text NOT NULL,
	"duration_seconds" integer DEFAULT 300,
	"completed" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"course" varchar(100),
	"tags" text DEFAULT '[]',
	"rubrics" text DEFAULT '[]',
	"learning_outcome" text,
	"diagnostic_questions" text DEFAULT '[]',
	"milestone_templates" text DEFAULT '[]',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"ai_provider" varchar(50) DEFAULT 'gemini',
	"gemini_api_key" text,
	"grok_api_key" text,
	"ai_temperature" integer DEFAULT 70,
	"ai_max_tokens" integer DEFAULT 2000,
	"ai_top_p" integer DEFAULT 90,
	"language" varchar(10) DEFAULT 'id',
	"thinking_mode" varchar(50) DEFAULT 'socratic',
	"hint_level" varchar(50) DEFAULT 'minimal',
	"strict_no_answers" boolean DEFAULT true,
	"detailed_course_mode" boolean DEFAULT true,
	"course_citation_style" varchar(50) DEFAULT 'academic',
	"include_source_links" boolean DEFAULT true,
	"custom_system_prompt" text,
	"email_notifications" boolean DEFAULT true,
	"push_notifications" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text,
	"name" varchar(255) NOT NULL,
	"provider" varchar(50) DEFAULT 'email',
	"provider_id" varchar(255),
	"avatar" text,
	"google_access_token" text,
	"google_refresh_token" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "validation_results" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"assignment_id" varchar(36) NOT NULL,
	"overall_score" integer,
	"rubric_scores" text DEFAULT '[]',
	"strengths" text DEFAULT '[]',
	"weaknesses" text DEFAULT '[]',
	"recommendations" text DEFAULT '[]',
	"alignment_score" integer,
	"assessment_date" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_synapses" ADD CONSTRAINT "daily_synapses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_synapses" ADD CONSTRAINT "daily_synapses_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debate_turns" ADD CONSTRAINT "debate_turns_mini_course_id_mini_courses_id_fk" FOREIGN KEY ("mini_course_id") REFERENCES "public"."mini_courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_folder_id_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mini_courses" ADD CONSTRAINT "mini_courses_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scaffolding_tasks" ADD CONSTRAINT "scaffolding_tasks_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "validation_results" ADD CONSTRAINT "validation_results_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;