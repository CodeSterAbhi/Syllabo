-- Syllabo: Row Level Security Policies and Grants
-- Strictly conforms to docs/SECURITY.md and docs/ARCHITECTURE.md

-- 1. Enable RLS on all 10 tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theory_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.numericals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_subject_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;

-- 2. Basic table grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Public read grants on academic content
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT SELECT ON public.subjects TO anon, authenticated;
GRANT SELECT ON public.units TO anon, authenticated;
GRANT SELECT ON public.theory_questions TO anon, authenticated;
GRANT SELECT ON public.numericals TO anon, authenticated;
GRANT SELECT ON public.mcqs TO anon, authenticated;

-- Faculty grants
GRANT SELECT ON public.faculty_profiles TO authenticated;
GRANT SELECT ON public.faculty_subject_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.evaluations TO authenticated;

-- Admin grants (admin checks will be gated by RLS)
GRANT ALL ON public.courses TO authenticated;
GRANT ALL ON public.subjects TO authenticated;
GRANT ALL ON public.units TO authenticated;
GRANT ALL ON public.theory_questions TO authenticated;
GRANT ALL ON public.numericals TO authenticated;
GRANT ALL ON public.mcqs TO authenticated;
GRANT ALL ON public.faculty_profiles TO authenticated;
GRANT ALL ON public.faculty_subject_assignments TO authenticated;
GRANT ALL ON public.evaluations TO authenticated;
GRANT SELECT ON public.app_admins TO authenticated;

-- -------------------------------------------------------------
-- 3. Academic Content Policies (Public Read for Published Content)
-- -------------------------------------------------------------

DROP POLICY IF EXISTS "Public can view published courses" ON public.courses;
CREATE POLICY "Public can view published courses"
ON public.courses FOR SELECT
USING (is_published = true);

DROP POLICY IF EXISTS "Public can view published subjects" ON public.subjects;
CREATE POLICY "Public can view published subjects"
ON public.subjects FOR SELECT
USING (
    is_published = true 
    AND EXISTS (
        SELECT 1 FROM public.courses c 
        WHERE c.id = subjects.course_id AND c.is_published = true
    )
);

DROP POLICY IF EXISTS "Public can view published units" ON public.units;
CREATE POLICY "Public can view published units"
ON public.units FOR SELECT
USING (
    is_published = true 
    AND EXISTS (
        SELECT 1 FROM public.subjects s
        JOIN public.courses c ON c.id = s.course_id
        WHERE s.id = units.subject_id 
          AND s.is_published = true 
          AND c.is_published = true
    )
);

DROP POLICY IF EXISTS "Public can view published theory questions" ON public.theory_questions;
CREATE POLICY "Public can view published theory questions"
ON public.theory_questions FOR SELECT
USING (
    is_published = true 
    AND EXISTS (
        SELECT 1 FROM public.units u
        JOIN public.subjects s ON s.id = u.subject_id
        JOIN public.courses c ON c.id = s.course_id
        WHERE u.id = theory_questions.unit_id 
          AND u.is_published = true 
          AND s.is_published = true 
          AND c.is_published = true
    )
);

DROP POLICY IF EXISTS "Public can view published numericals" ON public.numericals;
CREATE POLICY "Public can view published numericals"
ON public.numericals FOR SELECT
USING (
    is_published = true 
    AND EXISTS (
        SELECT 1 FROM public.units u
        JOIN public.subjects s ON s.id = u.subject_id
        JOIN public.courses c ON c.id = s.course_id
        WHERE u.id = numericals.unit_id 
          AND u.is_published = true 
          AND s.is_published = true 
          AND c.is_published = true
    )
);

DROP POLICY IF EXISTS "Public can view published mcqs" ON public.mcqs;
CREATE POLICY "Public can view published mcqs"
ON public.mcqs FOR SELECT
USING (
    is_published = true 
    AND EXISTS (
        SELECT 1 FROM public.units u
        JOIN public.subjects s ON s.id = u.subject_id
        JOIN public.courses c ON c.id = s.course_id
        WHERE u.id = mcqs.unit_id 
          AND u.is_published = true 
          AND s.is_published = true 
          AND c.is_published = true
    )
);

-- -------------------------------------------------------------
-- 4. Faculty Self-Access Policies
-- -------------------------------------------------------------

DROP POLICY IF EXISTS "Faculty can view own profile" ON public.faculty_profiles;
CREATE POLICY "Faculty can view own profile"
ON public.faculty_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Faculty can view own assignments" ON public.faculty_subject_assignments;
CREATE POLICY "Faculty can view own assignments"
ON public.faculty_subject_assignments FOR SELECT
TO authenticated
USING (
    faculty_id IN (
        SELECT id FROM public.faculty_profiles 
        WHERE user_id = auth.uid()
    )
);

-- -------------------------------------------------------------
-- 5. Evaluation Policies
-- -------------------------------------------------------------

-- Faculty can read ONLY their own submitted evaluations (for UI state)
DROP POLICY IF EXISTS "Faculty can view own evaluations" ON public.evaluations;
CREATE POLICY "Faculty can view own evaluations"
ON public.evaluations FOR SELECT
TO authenticated
USING (
    faculty_id IN (
        SELECT id FROM public.faculty_profiles 
        WHERE user_id = auth.uid()
    )
);

-- Active faculty can insert evaluations ONLY for assigned subjects and own faculty ID
DROP POLICY IF EXISTS "Authorized faculty can submit evaluation" ON public.evaluations;
CREATE POLICY "Authorized faculty can submit evaluation"
ON public.evaluations FOR INSERT
TO authenticated
WITH CHECK (
    -- Must link to the authenticated faculty user's active profile
    faculty_id IN (
        SELECT id FROM public.faculty_profiles 
        WHERE user_id = auth.uid() AND is_active = true
    )
    -- Must be assigned to the subject of this question
    AND EXISTS (
        SELECT 1 
        FROM public.theory_questions tq
        JOIN public.units u ON u.id = tq.unit_id
        JOIN public.faculty_subject_assignments fsa ON fsa.subject_id = u.subject_id
        WHERE tq.id = evaluations.question_id
          AND fsa.faculty_id = evaluations.faculty_id
    )
    -- Valid score range
    AND score >= 0.0 AND score <= 8.0
);

-- Active faculty can update their own evaluation (resubmission)
DROP POLICY IF EXISTS "Faculty can update own evaluation" ON public.evaluations;
CREATE POLICY "Faculty can update own evaluation"
ON public.evaluations FOR UPDATE
TO authenticated
USING (
    faculty_id IN (
        SELECT id FROM public.faculty_profiles 
        WHERE user_id = auth.uid() AND is_active = true
    )
)
WITH CHECK (
    score >= 0.0 AND score <= 8.0
);

-- -------------------------------------------------------------
-- 6. Administrator Policies (Full Access via is_app_admin)
-- -------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL TO authenticated
USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
CREATE POLICY "Admins can manage subjects" ON public.subjects FOR ALL TO authenticated
USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

DROP POLICY IF EXISTS "Admins can manage units" ON public.units;
CREATE POLICY "Admins can manage units" ON public.units FOR ALL TO authenticated
USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

DROP POLICY IF EXISTS "Admins can manage theory questions" ON public.theory_questions;
CREATE POLICY "Admins can manage theory questions" ON public.theory_questions FOR ALL TO authenticated
USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

DROP POLICY IF EXISTS "Admins can manage numericals" ON public.numericals;
CREATE POLICY "Admins can manage numericals" ON public.numericals FOR ALL TO authenticated
USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

DROP POLICY IF EXISTS "Admins can manage mcqs" ON public.mcqs;
CREATE POLICY "Admins can manage mcqs" ON public.mcqs FOR ALL TO authenticated
USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

DROP POLICY IF EXISTS "Admins can manage faculty profiles" ON public.faculty_profiles;
CREATE POLICY "Admins can manage faculty profiles" ON public.faculty_profiles FOR ALL TO authenticated
USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

DROP POLICY IF EXISTS "Admins can manage assignments" ON public.faculty_subject_assignments;
CREATE POLICY "Admins can manage assignments" ON public.faculty_subject_assignments FOR ALL TO authenticated
USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

DROP POLICY IF EXISTS "Admins can view all evaluations" ON public.evaluations;
CREATE POLICY "Admins can view all evaluations" ON public.evaluations FOR ALL TO authenticated
USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

DROP POLICY IF EXISTS "Admins can view app_admins" ON public.app_admins;
CREATE POLICY "Admins can view app_admins" ON public.app_admins FOR SELECT TO authenticated
USING (public.is_app_admin());
