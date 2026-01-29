-- ============================================================
-- KALA Academic Intelligence OS - Database Schema
-- Supabase/PostgreSQL
-- ============================================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== USERS ====================
-- Primary user table for authentication and AI settings
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    
    -- AI Configuration
    ai_provider TEXT DEFAULT 'gemini' CHECK (ai_provider IN ('gemini', 'grok')),
    gemini_api_key TEXT,
    grok_api_key TEXT,
    ai_language TEXT DEFAULT 'en',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ==================== ASSIGNMENTS ====================
-- Core assignment/project entity
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic Info
    title TEXT NOT NULL,
    description TEXT,
    learning_outcome TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    course TEXT DEFAULT 'General',
    
    -- JSONB for structural data
    tags JSONB DEFAULT '[]',
    rubrics JSONB DEFAULT '[]',
    diagnostic_questions JSONB DEFAULT '[]',
    diagnostic_responses JSONB DEFAULT '{}',
    
    -- Progress Tracking
    overall_progress INTEGER DEFAULT 0,
    at_risk BOOLEAN DEFAULT FALSE,
    clarity_score INTEGER DEFAULT 0,
    last_synapse_date DATE,
    
    -- Summative
    summative_reflection TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_deadline ON assignments(deadline);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course);
CREATE INDEX IF NOT EXISTS idx_assignments_at_risk ON assignments(at_risk);

-- ==================== MILESTONES ====================
-- Task breakdown for each assignment
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    estimated_minutes INTEGER DEFAULT 30,
    deadline TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_milestones_assignment_id ON milestones(assignment_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);

-- ==================== MINI COURSES ====================
-- AI-generated learning modules for each milestone
CREATE TABLE IF NOT EXISTS mini_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID UNIQUE NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    
    learning_outcome TEXT,
    overview TEXT,
    concepts JSONB DEFAULT '[]',
    practical_guide TEXT,
    formative_action TEXT,
    expert_tip TEXT,
    
    mastery_status TEXT DEFAULT 'untested' CHECK (mastery_status IN ('untested', 'refined', 'perfected')),
    formative_task_completed BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mini_courses_milestone_id ON mini_courses(milestone_id);
CREATE INDEX IF NOT EXISTS idx_mini_courses_mastery ON mini_courses(mastery_status);

-- ==================== DEBATE TURNS ====================
-- Socratic debate history for mastery validation
CREATE TABLE IF NOT EXISTS debate_turns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mini_course_id UUID NOT NULL REFERENCES mini_courses(id) ON DELETE CASCADE,
    
    role TEXT NOT NULL CHECK (role IN ('user', 'model')),
    content TEXT NOT NULL,
    intellectual_weight INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_debate_turns_mini_course_id ON debate_turns(mini_course_id);

-- ==================== FILES ====================
-- File attachments for assignments (The Vault)
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    type TEXT DEFAULT 'draft' CHECK (type IN ('instruction', 'draft', 'final', 'feedback')),
    storage_key TEXT, -- Supabase Storage key
    size TEXT,
    mime_type TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_files_assignment_id ON files(assignment_id);
CREATE INDEX IF NOT EXISTS idx_files_type ON files(type);

-- ==================== VALIDATION RESULTS ====================
-- Summative assessment results
CREATE TABLE IF NOT EXISTS validation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    
    overall_score INTEGER,
    rubric_scores JSONB DEFAULT '[]',
    strengths JSONB DEFAULT '[]',
    weaknesses JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    alignment_score INTEGER,
    
    assessment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_validation_results_assignment_id ON validation_results(assignment_id);

-- ==================== CHAT SESSIONS ====================
-- Tutor and debate chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    
    type TEXT DEFAULT 'tutor' CHECK (type IN ('tutor', 'debate')),
    system_instruction TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_assignment_id ON chat_sessions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_type ON chat_sessions(type);

-- ==================== CHAT MESSAGES ====================
-- Individual chat messages within sessions
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    
    role TEXT NOT NULL CHECK (role IN ('user', 'model', 'system')),
    content TEXT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

-- ==================== DAILY SYNAPSES ====================
-- Daily micro-challenge questions
CREATE TABLE IF NOT EXISTS daily_synapses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    
    question TEXT NOT NULL,
    response TEXT,
    synapse_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    clarity_awarded INTEGER DEFAULT 15,
    
    UNIQUE(user_id, synapse_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_synapses_user_date ON daily_synapses(user_id, synapse_date);
CREATE INDEX IF NOT EXISTS idx_daily_synapses_assignment ON daily_synapses(assignment_id);

-- ==================== NOTIFICATIONS ====================
-- User notification system
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'system' CHECK (type IN ('deadline', 'risk', 'feedback', 'system')),
    read BOOLEAN DEFAULT FALSE,
    link JSONB, -- Navigation context
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- ==================== TEMPLATES ====================
-- Saved assignment templates for reuse
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    course TEXT,
    tags JSONB DEFAULT '[]',
    rubrics JSONB DEFAULT '[]',
    learning_outcome TEXT,
    diagnostic_questions JSONB DEFAULT '[]',
    milestone_templates JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);

-- ==================== SCAFFOLDING TASKS ====================
-- Micro-burst tasks for academic freeze intervention
CREATE TABLE IF NOT EXISTS scaffolding_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    
    instruction TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 300,
    completed BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scaffolding_tasks_assignment_id ON scaffolding_tasks(assignment_id);

-- ==================== VIEWS ====================

-- View: Assignments with progress info
CREATE OR REPLACE VIEW v_assignments_with_progress AS
SELECT 
    a.*,
    COUNT(m.id) as total_milestones,
    COUNT(CASE WHEN m.status = 'completed' THEN 1 END) as completed_milestones,
    ROUND(
        CASE 
            WHEN COUNT(m.id) > 0 
            THEN (COUNT(CASE WHEN m.status = 'completed' THEN 1 END) * 100.0 / COUNT(m.id))
            ELSE 0 
        END
    ) as calculated_progress
FROM assignments a
LEFT JOIN milestones m ON a.id = m.assignment_id
GROUP BY a.id;

-- View: At-risk assignments (deadline < 48h and low progress)
CREATE OR REPLACE VIEW v_at_risk_assignments AS
SELECT * FROM assignments
WHERE at_risk = TRUE
   OR (overall_progress < 30 
       AND deadline < (NOW() + INTERVAL '48 hours')
       AND deadline > NOW());

-- ============================================================
-- PERFORMANCE RECOMMENDATIONS
-- ============================================================
/*
1. INDEXING STRATEGY:
   - All foreign keys are indexed
   - Frequently queried columns (status, deadline, at_risk) are indexed
   - UUIDs are used for high-entropy primary keys

2. JSONB ADVANTAGE:
   - Supabase/PostgreSQL JSONB provides binary storage and indexing
   - Faster lookups and smaller storage footprint than text-based JSON

3. ROW LEVEL SECURITY (RLS):
   - Recommended to enable RLS on all tables and use Supabase Auth uid()
*/
