-- Syllabo: Database Functions
-- Aggregate rating computation and administrative checks
-- Strictly complies with docs/ARCHITECTURE.md and docs/SECURITY.md

-- 1. Helper function to check if the current user is an application admin
CREATE OR REPLACE FUNCTION public.is_app_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.app_admins 
        WHERE user_id = auth.uid()
    );
$$;

-- Revoke all on function from public, grant execute to authenticated
REVOKE ALL ON FUNCTION public.is_app_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_app_admin() TO authenticated;

-- 2. Aggregate question rating function
-- Returns average score and evaluation count for a published theory question.
-- Uses an empty search_path as specified in docs/ARCHITECTURE.md section 3.
-- Does NOT expose individual faculty identities, codes, emails, or individual score rows.
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

-- Revoke all, then grant to anon and authenticated
REVOKE ALL ON FUNCTION public.get_question_rating(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_question_rating(UUID) TO anon, authenticated;
