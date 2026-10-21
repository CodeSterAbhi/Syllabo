-- Syllabo: Core Database Schema Migration
-- Matches the schema established in docs/ARCHITECTURE.md
-- Idempotent and non-destructive for existing tables

-- 1. Programs / Courses (e.g., B.Tech CSE, BCA)
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Subjects (linked to Course and Semester)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 12),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_subjects_course_sem_code UNIQUE (course_id, semester, code)
);

-- 3. Units (Units within a Subject; includes numericals applicability flag)
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    unit_number INTEGER NOT NULL CHECK (unit_number >= 1 AND unit_number <= 10),
    title TEXT NOT NULL,
    description TEXT,
    numericals_applicable BOOLEAN NOT NULL DEFAULT true,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_units_subject_unit_number UNIQUE (subject_id, unit_number)
);

-- 4. Theory Questions (Exactly 5 comprehensive questions per published unit)
CREATE TABLE IF NOT EXISTS public.theory_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL CHECK (question_number >= 1 AND question_number <= 5),
    topics_covered TEXT NOT NULL,
    question_text TEXT NOT NULL,
    answer_intro TEXT,
    answer_body TEXT NOT NULL,
    answer_conclusion TEXT,
    diagram_url TEXT,
    diagram_caption TEXT,
    hinglish_explanation TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_theory_questions_unit_qnum UNIQUE (unit_id, question_number)
);

-- 5. Numericals (Worked step-by-step problems and solutions)
CREATE TABLE IF NOT EXISTS public.numericals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    problem_number INTEGER NOT NULL CHECK (problem_number >= 1),
    problem_statement TEXT NOT NULL,
    given TEXT,
    required TEXT,
    formula TEXT,
    solution_steps TEXT NOT NULL,
    final_answer TEXT,
    diagram_url TEXT,
    hinglish_explanation TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_numericals_unit_probnum UNIQUE (unit_id, problem_number)
);

-- 6. MCQs (15-20 Multiple Choice Questions per unit)
CREATE TABLE IF NOT EXISTS public.mcqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL CHECK (question_number >= 1),
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- e.g. {"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"}
    correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_mcqs_unit_qnum UNIQUE (unit_id, question_number)
);

-- 7. Faculty Profiles (Linked to Supabase auth.users UUID)
CREATE TABLE IF NOT EXISTS public.faculty_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    faculty_code TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Faculty Subject Assignments (Explicit subject-level authorization)
CREATE TABLE IF NOT EXISTS public.faculty_subject_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_faculty_subject UNIQUE (faculty_id, subject_id)
);

-- 9. Evaluations (Scores 0-8 given by authorized faculty on theory questions)
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.theory_questions(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES public.faculty_profiles(id) ON DELETE CASCADE,
    score NUMERIC(3, 1) NOT NULL CHECK (score >= 0.0 AND score <= 8.0),
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_evaluations_question_faculty UNIQUE (question_id, faculty_id)
);

-- 10. Administrator Table (app_admins for platform administration)
CREATE TABLE IF NOT EXISTS public.app_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subjects_course_sem ON public.subjects(course_id, semester);
CREATE INDEX IF NOT EXISTS idx_units_subject ON public.units(subject_id);
CREATE INDEX IF NOT EXISTS idx_theory_questions_unit ON public.theory_questions(unit_id);
CREATE INDEX IF NOT EXISTS idx_numericals_unit ON public.numericals(unit_id);
CREATE INDEX IF NOT EXISTS idx_mcqs_unit ON public.mcqs(unit_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_question ON public.evaluations(question_id);
CREATE INDEX IF NOT EXISTS idx_faculty_subject_faculty ON public.faculty_subject_assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_subject_subject ON public.faculty_subject_assignments(subject_id);
