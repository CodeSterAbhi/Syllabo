-- =========================================================================
-- PROPOSED MIGRATION (NOT YET EXECUTED)
-- File: supabase/migrations/20261023000001_proposed_schema_reconciliation.sql
-- Status: PROPOSED ONLY — DO NOT EXECUTE AGAINST LIVE DATABASE WITHOUT DBA REVIEW
--
-- PURPOSE & JUSTIFICATION:
-- The application code has been fully adapted to work directly with the live
-- Supabase schema (respecting live column names: theory_questions.question,
-- topics_covered text[], numericals.problem, given_data, required_result,
-- mcqs.question, correct_option text, faculty_profiles.user_id PK, app_admins.user_id PK).
--
-- This proposed additive migration specifies ONLY safe, minimal, non-breaking
-- additions that support optional application features (e.g., catalog descriptions
-- and diagram captions) if the university database administrators choose to enable them.
--
-- NON-DESTRUCTIVE GUARANTEES:
-- - Uses ADD COLUMN IF NOT EXISTS exclusively.
-- - Does NOT drop, alter, or rename existing columns.
-- - Does NOT reset or drop tables.
-- - Does NOT add synthetic 'id' columns or rewrite existing foreign keys.
-- - Preserves existing RLS policies and role permissions.
-- =========================================================================

-- 1. Optional Academic Catalog Descriptions
-- Allows administrators to persist syllabus descriptions and program summaries.
ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.subjects
    ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.units
    ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Optional Diagram Caption Support
-- Allows theory questions with figures/diagrams to store accessible captions.
ALTER TABLE public.theory_questions
    ADD COLUMN IF NOT EXISTS diagram_caption TEXT;

-- 3. Live-Schema-Compliant Aggregate Rating Function
-- Ensures get_question_rating counts evaluations by foreign key (question_id)
-- rather than assuming an 'id' column exists on public.evaluations.
CREATE OR REPLACE FUNCTION public.get_question_rating(p_question_id UUID)
RETURNS TABLE (
    average_score NUMERIC,
    evaluation_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT 
        pg_catalog.round(pg_catalog.coalesce(pg_catalog.avg(e.score), 0)::numeric, 1) AS average_score,
        pg_catalog.count(e.question_id)::bigint AS evaluation_count
    FROM public.theory_questions tq
    JOIN public.units u ON u.id = tq.unit_id
    JOIN public.subjects s ON s.id = u.subject_id
    JOIN public.courses c ON c.id = s.course_id
    LEFT JOIN public.evaluations e ON e.question_id = tq.id
    WHERE tq.id = p_question_id
      AND tq.is_published = true
      AND u.is_published = true
      AND s.is_published = true
      AND c.is_published = true
    GROUP BY tq.id;
$$;

REVOKE ALL ON FUNCTION public.get_question_rating(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_question_rating(UUID) TO anon, authenticated;

-- =========================================================================
-- END OF PROPOSED MIGRATION (NOT YET EXECUTED)
-- =========================================================================
