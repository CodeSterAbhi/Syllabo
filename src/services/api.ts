import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Course,
  Subject,
  Unit,
  TheoryQuestion,
  Numerical,
  MCQ,
  FacultyProfile,
  FacultySubjectAssignment,
  Evaluation,
  QuestionRating
} from '../types';
import {
  MOCK_COURSES,
  MOCK_SUBJECTS,
  MOCK_UNITS,
  MOCK_THEORY_QUESTIONS,
  MOCK_NUMERICALS,
  MOCK_MCQS,
  MOCK_FACULTY,
  MOCK_FACULTY_LIST,
  MOCK_ASSIGNMENTS,
  MOCK_EVALUATIONS
} from '../lib/mockData';

// Normalizers reconciling live Supabase PostgreSQL schema with application types
export function normalizeTheoryQuestion(row: any): TheoryQuestion {
  const topics: string[] = Array.isArray(row.topics_covered)
    ? row.topics_covered
    : typeof row.topics_covered === 'string'
    ? row.topics_covered.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const qText = row.question ?? row.question_text ?? '';

  return {
    id: row.id,
    unit_id: row.unit_id,
    question_number: row.question_number,
    topics_covered: topics,
    question: qText,
    question_text: qText,
    answer_intro: row.answer_intro ?? undefined,
    answer_body: row.answer_body ?? '',
    answer_conclusion: row.answer_conclusion ?? undefined,
    diagram_url: row.diagram_url ?? undefined,
    diagram_caption: row.diagram_caption ?? undefined,
    hinglish_explanation: row.hinglish_explanation ?? undefined,
    is_published: row.is_published ?? true,
    created_at: row.created_at,
    updated_at: row.updated_at ?? undefined,
  };
}

export function normalizeNumerical(row: any): Numerical {
  const problemText = row.problem ?? row.problem_statement ?? '';
  const givenText = row.given_data ?? row.given ?? undefined;
  const requiredText = row.required_result ?? row.required ?? undefined;

  return {
    id: row.id,
    unit_id: row.unit_id,
    problem_number: row.problem_number,
    problem: problemText,
    problem_statement: problemText,
    given_data: givenText,
    given: givenText,
    required_result: requiredText,
    required: requiredText,
    formula: row.formula ?? undefined,
    solution_steps: row.solution_steps ?? '',
    final_answer: row.final_answer ?? undefined,
    diagram_url: row.diagram_url ?? undefined,
    hinglish_explanation: row.hinglish_explanation ?? undefined,
    is_published: row.is_published ?? true,
    created_at: row.created_at,
    updated_at: row.updated_at ?? undefined,
  };
}

export function normalizeMCQ(row: any): MCQ {
  const qText = row.question ?? row.question_text ?? '';
  return {
    id: row.id,
    unit_id: row.unit_id,
    question_number: row.question_number,
    question: qText,
    question_text: qText,
    options: row.options,
    correct_option: String(row.correct_option),
    explanation: row.explanation ?? undefined,
    is_published: row.is_published ?? true,
    created_at: row.created_at,
    updated_at: row.updated_at ?? undefined,
  };
}

// Local preview cache for testing faculty evaluations and admin workflows without live DB connection
let localEvaluations = { ...MOCK_EVALUATIONS };
let localFacultyList = [...MOCK_FACULTY_LIST];
let localAssignments = [...MOCK_ASSIGNMENTS];

export const api = {
  // -------------------------------------------------------------
  // Public Academic Content APIs
  // -------------------------------------------------------------

  async getCourses(): Promise<Course[]> {
    if (!isSupabaseConfigured) {
      return MOCK_COURSES.filter(c => c.is_published);
    }
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('code');
    if (error) {
      console.error('Error fetching courses:', error);
      return MOCK_COURSES;
    }
    return data || [];
  },

  async getSubjects(courseId?: string, semester?: number): Promise<Subject[]> {
    if (!isSupabaseConfigured) {
      return MOCK_SUBJECTS.filter(s => {
        if (!s.is_published) return false;
        if (courseId && s.course_id !== courseId) return false;
        if (semester && s.semester !== semester) return false;
        return true;
      });
    }

    let query = supabase
      .from('subjects')
      .select('*')
      .eq('is_published', true)
      .order('code');

    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    if (semester) {
      query = query.eq('semester', semester);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
    return data || [];
  },

  async getSubjectById(subjectId: string): Promise<Subject | null> {
    if (!isSupabaseConfigured) {
      return MOCK_SUBJECTS.find(s => s.id === subjectId) || null;
    }
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .single();
    if (error) {
      console.error('Error fetching subject by id:', error);
      return null;
    }
    return data;
  },

  async getUnits(subjectId: string): Promise<Unit[]> {
    if (!isSupabaseConfigured) {
      return MOCK_UNITS.filter(u => u.subject_id === subjectId && u.is_published)
        .sort((a, b) => a.unit_number - b.unit_number);
    }
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('is_published', true)
      .order('unit_number');
    if (error) {
      console.error('Error fetching units:', error);
      return [];
    }
    return data || [];
  },

  async getUnitById(unitId: string): Promise<Unit | null> {
    if (!isSupabaseConfigured) {
      return MOCK_UNITS.find(u => u.id === unitId) || null;
    }
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('id', unitId)
      .single();
    if (error) {
      console.error('Error fetching unit by id:', error);
      return null;
    }
    return data;
  },

  async getTheoryQuestions(unitId: string): Promise<TheoryQuestion[]> {
    if (!isSupabaseConfigured) {
      const questions = MOCK_THEORY_QUESTIONS.filter(q => q.unit_id === unitId && q.is_published)
        .sort((a, b) => a.question_number - b.question_number);

      // Attach ratings from local evaluations
      return questions.map(q => {
        const ev = localEvaluations[q.id];
        return {
          ...q,
          rating: ev
            ? { average_score: ev.score, evaluation_count: 1 }
            : { average_score: 0, evaluation_count: 0 }
        };
      });
    }

    const { data: questions, error } = await supabase
      .from('theory_questions')
      .select('*')
      .eq('unit_id', unitId)
      .eq('is_published', true)
      .order('question_number');

    if (error || !questions) {
      console.error('Error fetching theory questions:', error);
      return [];
    }

    // Normalize each question from live schema
    const normalized = questions.map(normalizeTheoryQuestion);

    // Fetch aggregate rating for each question using database function get_question_rating
    const withRatings = await Promise.all(
      normalized.map(async q => {
        const rating = await this.getQuestionRating(q.id);
        return { ...q, rating };
      })
    );

    return withRatings;
  },

  async getNumericals(unitId: string): Promise<Numerical[]> {
    if (!isSupabaseConfigured) {
      return MOCK_NUMERICALS.filter(n => n.unit_id === unitId && n.is_published)
        .sort((a, b) => a.problem_number - b.problem_number);
    }
    const { data, error } = await supabase
      .from('numericals')
      .select('*')
      .eq('unit_id', unitId)
      .eq('is_published', true)
      .order('problem_number');
    if (error) {
      console.error('Error fetching numericals:', error);
      return [];
    }
    return (data || []).map(normalizeNumerical);
  },

  async getMCQs(unitId: string): Promise<MCQ[]> {
    if (!isSupabaseConfigured) {
      return MOCK_MCQS.filter(m => m.unit_id === unitId && m.is_published)
        .sort((a, b) => a.question_number - b.question_number);
    }
    const { data, error } = await supabase
      .from('mcqs')
      .select('*')
      .eq('unit_id', unitId)
      .eq('is_published', true)
      .order('question_number');
    if (error) {
      console.error('Error fetching mcqs:', error);
      return [];
    }
    return (data || []).map(normalizeMCQ);
  },

  async getQuestionRating(questionId: string): Promise<QuestionRating> {
    if (!isSupabaseConfigured) {
      const ev = localEvaluations[questionId];
      if (ev) {
        return { average_score: ev.score, evaluation_count: 1 };
      }
      return { average_score: 0, evaluation_count: 0 };
    }

    try {
      // First try standard parameter name p_question_id
      let { data, error } = await supabase.rpc('get_question_rating', {
        p_question_id: questionId
      });

      // If function parameter is named question_id in the live DB, retry with question_id
      if (error && (error.message.includes('named parameter') || error.code === 'PGRST202')) {
        const retry = await supabase.rpc('get_question_rating', {
          question_id: questionId
        });
        data = retry.data;
        error = retry.error;
      }

      if (error || !data || data.length === 0) {
        return { average_score: 0, evaluation_count: 0 };
      }
      return {
        average_score: Number(data[0].average_score) || 0,
        evaluation_count: Number(data[0].evaluation_count) || 0
      };
    } catch {
      return { average_score: 0, evaluation_count: 0 };
    }
  },

  // -------------------------------------------------------------
  // Faculty Authentication & Authorization APIs
  // -------------------------------------------------------------

  async getFacultyProfile(): Promise<FacultyProfile | null> {
    if (!isSupabaseConfigured) {
      return MOCK_FACULTY;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('faculty_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching faculty profile:', error);
      return null;
    }
    return data;
  },

  async getFacultyAssignments(facultyUserId: string): Promise<FacultySubjectAssignment[]> {
    if (!isSupabaseConfigured) {
      return localAssignments
        .filter(a => a.faculty_id === facultyUserId)
        .map(a => ({
          ...a,
          subject: MOCK_SUBJECTS.find(s => s.id === a.subject_id)
        }));
    }

    const { data, error } = await supabase
      .from('faculty_subject_assignments')
      .select('*, subject:subjects(*)')
      .eq('faculty_id', facultyUserId);

    if (error) {
      console.error('Error fetching faculty assignments:', error);
      return [];
    }
    return data || [];
  },

  async getFacultyEvaluations(facultyUserId: string): Promise<Record<string, Evaluation>> {
    if (!isSupabaseConfigured) {
      return localEvaluations;
    }

    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .eq('faculty_id', facultyUserId);

      // In the live database where raw evaluation rows are restricted from direct reading,
      // catch error 42501 quietly without breaking the workbench
      if (error || !data) {
        return {};
      }

      const map: Record<string, Evaluation> = {};
      for (const ev of data) {
        map[ev.question_id] = ev;
      }
      return map;
    } catch {
      return {};
    }
  },

  async submitEvaluation(
    questionId: string,
    facultyUserId: string,
    score: number,
    _feedback?: string
  ): Promise<{ success: boolean; error?: string }> {
    // Validate score bounds strictly 0 to 8
    if (score < 0 || score > 8) {
      return { success: false, error: 'Evaluation score must be between 0.0 and 8.0 marks.' };
    }

    if (!isSupabaseConfigured) {
      localEvaluations[questionId] = {
        id: `ev-${Date.now()}`,
        question_id: questionId,
        faculty_id: facultyUserId,
        score,
        created_at: new Date().toISOString(),
      };
      return { success: true };
    }

    // Under least-privilege database grants, insert into evaluations
    // Live schema: evaluations table has (question_id, faculty_id, score, created_at)
    // No feedback or updated_at columns exist in the live schema.
    const { error: insertError } = await supabase
      .from('evaluations')
      .insert({
        question_id: questionId,
        faculty_id: facultyUserId,
        score,
      });

    if (!insertError) {
      return { success: true };
    }

    // If duplicate violation occurs (code 23505), try UPDATE if granted
    if (insertError.code === '23505') {
      const { error: updateError } = await supabase
        .from('evaluations')
        .update({ score })
        .match({ question_id: questionId, faculty_id: facultyUserId });

      if (!updateError) {
        return { success: true };
      }

      // If UPDATE is not granted (42501)
      if (updateError.code === '42501') {
        return {
          success: false,
          error: 'An evaluation for this question has already been submitted by your account. Under university database permissions, ratings cannot be overwritten.'
        };
      }
      return { success: false, error: updateError.message };
    }

    return { success: false, error: insertError.message };
  },

  // -------------------------------------------------------------
  // Administrator APIs
  // -------------------------------------------------------------

  async checkIsAdmin(): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return true; // Admin panel unlocked in local dev preview mode
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check via RPC is_app_admin or direct query on app_admins
      const { data, error } = await supabase.rpc('is_app_admin');
      if (!error && data !== null) {
        return Boolean(data);
      }
      // Fallback query to app_admins table (user_id is primary key)
      const { data: adminRow } = await supabase
        .from('app_admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      return Boolean(adminRow);
    } catch {
      return false;
    }
  },

  async getAllCoursesAdmin(): Promise<Course[]> {
    if (!isSupabaseConfigured) {
      return MOCK_COURSES;
    }
    const { data } = await supabase.from('courses').select('*').order('code');
    return data || [];
  },

  async saveCourse(course: Partial<Course>): Promise<{ success: boolean; data?: Course; error?: string }> {
    if (!isSupabaseConfigured) {
      if (course.id) {
        const idx = MOCK_COURSES.findIndex(c => c.id === course.id);
        if (idx >= 0) Object.assign(MOCK_COURSES[idx], course);
      } else {
        const newCourse: Course = {
          id: `c-${Date.now()}`,
          code: course.code || 'NEW',
          name: course.name || 'New Course',
          description: course.description,
          is_published: course.is_published ?? true,
          created_at: new Date().toISOString(),
        };
        MOCK_COURSES.push(newCourse);
      }
      return { success: true };
    }

    // Live schema: courses has (id, code, name, is_published, created_at).
    // description and updated_at are not present in the live schema.
    const payload: Record<string, any> = {
      code: course.code,
      name: course.name,
      is_published: course.is_published ?? true,
    };

    if (course.id) {
      const { data, error } = await supabase
        .from('courses')
        .update(payload)
        .eq('id', course.id)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } else {
      const { data, error } = await supabase
        .from('courses')
        .insert(payload)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    }
  },

  async deleteCourse(courseId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      const idx = MOCK_COURSES.findIndex(c => c.id === courseId);
      if (idx >= 0) MOCK_COURSES.splice(idx, 1);
      return { success: true };
    }
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async getAllSubjectsAdmin(courseId?: string): Promise<Subject[]> {
    if (!isSupabaseConfigured) {
      return courseId ? MOCK_SUBJECTS.filter(s => s.course_id === courseId) : MOCK_SUBJECTS;
    }
    let query = supabase.from('subjects').select('*').order('code');
    if (courseId) query = query.eq('course_id', courseId);
    const { data } = await query;
    return data || [];
  },

  async saveSubject(subject: Partial<Subject>): Promise<{ success: boolean; data?: Subject; error?: string }> {
    if (!isSupabaseConfigured) {
      if (subject.id) {
        const idx = MOCK_SUBJECTS.findIndex(s => s.id === subject.id);
        if (idx >= 0) Object.assign(MOCK_SUBJECTS[idx], subject);
      } else {
        const newSubject: Subject = {
          id: `s-${Date.now()}`,
          course_id: subject.course_id!,
          semester: subject.semester || 1,
          code: subject.code || 'NEW',
          name: subject.name || 'New Subject',
          description: subject.description,
          is_published: subject.is_published ?? true,
          created_at: new Date().toISOString(),
        };
        MOCK_SUBJECTS.push(newSubject);
      }
      return { success: true };
    }

    // Live schema: subjects has (id, course_id, semester, code, name, is_published, created_at).
    // description and updated_at are not present in the live schema.
    const payload: Record<string, any> = {
      course_id: subject.course_id,
      semester: subject.semester,
      code: subject.code,
      name: subject.name,
      is_published: subject.is_published ?? true,
    };

    if (subject.id) {
      const { data, error } = await supabase
        .from('subjects')
        .update(payload)
        .eq('id', subject.id)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } else {
      const { data, error } = await supabase
        .from('subjects')
        .insert(payload)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    }
  },

  async deleteSubject(subjectId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      const idx = MOCK_SUBJECTS.findIndex(s => s.id === subjectId);
      if (idx >= 0) MOCK_SUBJECTS.splice(idx, 1);
      return { success: true };
    }
    const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async getAllUnitsAdmin(subjectId: string): Promise<Unit[]> {
    if (!isSupabaseConfigured) {
      return MOCK_UNITS.filter(u => u.subject_id === subjectId).sort((a, b) => a.unit_number - b.unit_number);
    }
    const { data } = await supabase
      .from('units')
      .select('*')
      .eq('subject_id', subjectId)
      .order('unit_number');
    return data || [];
  },

  async saveUnit(unit: Partial<Unit>): Promise<{ success: boolean; data?: Unit; error?: string }> {
    if (!isSupabaseConfigured) {
      if (unit.id) {
        const idx = MOCK_UNITS.findIndex(u => u.id === unit.id);
        if (idx >= 0) Object.assign(MOCK_UNITS[idx], unit);
      } else {
        const newUnit: Unit = {
          id: `u-${Date.now()}`,
          subject_id: unit.subject_id!,
          unit_number: unit.unit_number || 1,
          title: unit.title || 'New Unit',
          description: unit.description,
          numericals_applicable: unit.numericals_applicable ?? true,
          is_published: unit.is_published ?? true,
          created_at: new Date().toISOString(),
        };
        MOCK_UNITS.push(newUnit);
      }
      return { success: true };
    }

    // Live schema: units has (id, subject_id, unit_number, title, numericals_applicable, is_published, created_at).
    // description and updated_at are not present in the live schema.
    const payload: Record<string, any> = {
      subject_id: unit.subject_id,
      unit_number: unit.unit_number,
      title: unit.title,
      numericals_applicable: unit.numericals_applicable ?? true,
      is_published: unit.is_published ?? true,
    };

    if (unit.id) {
      const { data, error } = await supabase
        .from('units')
        .update(payload)
        .eq('id', unit.id)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } else {
      const { data, error } = await supabase
        .from('units')
        .insert(payload)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    }
  },

  async deleteUnit(unitId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      const idx = MOCK_UNITS.findIndex(u => u.id === unitId);
      if (idx >= 0) MOCK_UNITS.splice(idx, 1);
      return { success: true };
    }
    const { error } = await supabase.from('units').delete().eq('id', unitId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  // Theory Questions CRUD
  async getAllTheoryQuestionsAdmin(unitId: string): Promise<TheoryQuestion[]> {
    if (!isSupabaseConfigured) {
      return MOCK_THEORY_QUESTIONS.filter(q => q.unit_id === unitId).sort((a, b) => a.question_number - b.question_number);
    }
    const { data } = await supabase
      .from('theory_questions')
      .select('*')
      .eq('unit_id', unitId)
      .order('question_number');
    return (data || []).map(normalizeTheoryQuestion);
  },

  async saveTheoryQuestion(q: Partial<TheoryQuestion>): Promise<{ success: boolean; error?: string }> {
    const topicsArray: string[] = Array.isArray(q.topics_covered)
      ? q.topics_covered
      : typeof q.topics_covered === 'string'
      ? (q.topics_covered as string).split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];
    const questionText = q.question || q.question_text || '';

    if (!isSupabaseConfigured) {
      if (q.id) {
        const idx = MOCK_THEORY_QUESTIONS.findIndex(item => item.id === q.id);
        if (idx >= 0) {
          Object.assign(MOCK_THEORY_QUESTIONS[idx], {
            ...q,
            topics_covered: topicsArray,
            question: questionText,
            question_text: questionText,
          });
        }
      } else {
        MOCK_THEORY_QUESTIONS.push({
          id: `q-${Date.now()}`,
          unit_id: q.unit_id!,
          question_number: q.question_number || 1,
          topics_covered: topicsArray,
          question: questionText,
          question_text: questionText,
          answer_intro: q.answer_intro,
          answer_body: q.answer_body || '',
          answer_conclusion: q.answer_conclusion,
          diagram_url: q.diagram_url,
          diagram_caption: q.diagram_caption,
          hinglish_explanation: q.hinglish_explanation,
          is_published: q.is_published ?? true,
          created_at: new Date().toISOString(),
        });
      }
      return { success: true };
    }

    // Live schema: theory_questions uses 'question' (not question_text) and 'topics_covered' as text[].
    // diagram_caption and updated_at are not present in live DB schema.
    const payload: Record<string, any> = {
      unit_id: q.unit_id,
      question_number: q.question_number,
      topics_covered: topicsArray,
      question: questionText,
      answer_intro: q.answer_intro || null,
      answer_body: q.answer_body || '',
      answer_conclusion: q.answer_conclusion || null,
      diagram_url: q.diagram_url || null,
      hinglish_explanation: q.hinglish_explanation || null,
      is_published: q.is_published ?? true,
    };

    if (q.id) {
      const { error } = await supabase
        .from('theory_questions')
        .update(payload)
        .eq('id', q.id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } else {
      const { error } = await supabase
        .from('theory_questions')
        .insert(payload);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }
  },

  async deleteTheoryQuestion(questionId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      const idx = MOCK_THEORY_QUESTIONS.findIndex(q => q.id === questionId);
      if (idx >= 0) MOCK_THEORY_QUESTIONS.splice(idx, 1);
      return { success: true };
    }
    const { error } = await supabase.from('theory_questions').delete().eq('id', questionId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  // Numericals CRUD
  async getAllNumericalsAdmin(unitId: string): Promise<Numerical[]> {
    if (!isSupabaseConfigured) {
      return MOCK_NUMERICALS.filter(n => n.unit_id === unitId).sort((a, b) => a.problem_number - b.problem_number);
    }
    const { data } = await supabase
      .from('numericals')
      .select('*')
      .eq('unit_id', unitId)
      .order('problem_number');
    return (data || []).map(normalizeNumerical);
  },

  async saveNumerical(n: Partial<Numerical>): Promise<{ success: boolean; error?: string }> {
    const problemText = n.problem || n.problem_statement || '';
    const givenText = n.given_data ?? n.given ?? null;
    const requiredText = n.required_result ?? n.required ?? null;

    if (!isSupabaseConfigured) {
      if (n.id) {
        const idx = MOCK_NUMERICALS.findIndex(item => item.id === n.id);
        if (idx >= 0) {
          Object.assign(MOCK_NUMERICALS[idx], {
            ...n,
            problem: problemText,
            problem_statement: problemText,
            given_data: givenText ?? undefined,
            given: givenText ?? undefined,
            required_result: requiredText ?? undefined,
            required: requiredText ?? undefined,
          });
        }
      } else {
        MOCK_NUMERICALS.push({
          id: `n-${Date.now()}`,
          unit_id: n.unit_id!,
          problem_number: n.problem_number || 1,
          problem: problemText,
          problem_statement: problemText,
          given_data: givenText ?? undefined,
          given: givenText ?? undefined,
          required_result: requiredText ?? undefined,
          required: requiredText ?? undefined,
          formula: n.formula,
          solution_steps: n.solution_steps || '',
          final_answer: n.final_answer,
          diagram_url: n.diagram_url,
          hinglish_explanation: n.hinglish_explanation,
          is_published: n.is_published ?? true,
          created_at: new Date().toISOString(),
        });
      }
      return { success: true };
    }

    // Live schema: numericals uses 'problem', 'given_data', 'required_result'.
    // updated_at is not present in live DB schema.
    const payload: Record<string, any> = {
      unit_id: n.unit_id,
      problem_number: n.problem_number,
      problem: problemText,
      given_data: givenText,
      required_result: requiredText,
      formula: n.formula || null,
      solution_steps: n.solution_steps || '',
      final_answer: n.final_answer || null,
      diagram_url: n.diagram_url || null,
      hinglish_explanation: n.hinglish_explanation || null,
      is_published: n.is_published ?? true,
    };

    if (n.id) {
      const { error } = await supabase.from('numericals').update(payload).eq('id', n.id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } else {
      const { error } = await supabase.from('numericals').insert(payload);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }
  },

  async deleteNumerical(numId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      const idx = MOCK_NUMERICALS.findIndex(n => n.id === numId);
      if (idx >= 0) MOCK_NUMERICALS.splice(idx, 1);
      return { success: true };
    }
    const { error } = await supabase.from('numericals').delete().eq('id', numId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  // MCQs CRUD
  async getAllMCQsAdmin(unitId: string): Promise<MCQ[]> {
    if (!isSupabaseConfigured) {
      return MOCK_MCQS.filter(m => m.unit_id === unitId).sort((a, b) => a.question_number - b.question_number);
    }
    const { data } = await supabase
      .from('mcqs')
      .select('*')
      .eq('unit_id', unitId)
      .order('question_number');
    return (data || []).map(normalizeMCQ);
  },

  async saveMCQ(m: Partial<MCQ>): Promise<{ success: boolean; error?: string }> {
    const questionText = m.question || m.question_text || '';
    const correctOpt = String(m.correct_option || 'A');

    if (!isSupabaseConfigured) {
      if (m.id) {
        const idx = MOCK_MCQS.findIndex(item => item.id === m.id);
        if (idx >= 0) {
          Object.assign(MOCK_MCQS[idx], {
            ...m,
            question: questionText,
            question_text: questionText,
            correct_option: correctOpt,
          });
        }
      } else {
        MOCK_MCQS.push({
          id: `m-${Date.now()}`,
          unit_id: m.unit_id!,
          question_number: m.question_number || 1,
          question: questionText,
          question_text: questionText,
          options: m.options || { A: '', B: '', C: '', D: '' },
          correct_option: correctOpt,
          explanation: m.explanation,
          is_published: m.is_published ?? true,
          created_at: new Date().toISOString(),
        });
      }
      return { success: true };
    }

    // Live schema: mcqs uses 'question' (not question_text) and correct_option as text.
    // updated_at is not present in live DB schema.
    const payload: Record<string, any> = {
      unit_id: m.unit_id,
      question_number: m.question_number,
      question: questionText,
      options: m.options,
      correct_option: correctOpt,
      explanation: m.explanation || null,
      is_published: m.is_published ?? true,
    };

    if (m.id) {
      const { error } = await supabase.from('mcqs').update(payload).eq('id', m.id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } else {
      const { error } = await supabase.from('mcqs').insert(payload);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }
  },

  async deleteMCQ(mcqId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      const idx = MOCK_MCQS.findIndex(m => m.id === mcqId);
      if (idx >= 0) MOCK_MCQS.splice(idx, 1);
      return { success: true };
    }
    const { error } = await supabase.from('mcqs').delete().eq('id', mcqId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  // Faculty Management APIs
  async getAllFacultyProfiles(): Promise<FacultyProfile[]> {
    if (!isSupabaseConfigured) {
      return localFacultyList;
    }
    const { data, error } = await supabase
      .from('faculty_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching faculty profiles:', error);
      return [];
    }
    return data || [];
  },

  async saveFacultyProfile(profile: {
    user_id: string;
    faculty_code: string;
    display_name: string;
    is_active: boolean;
  }): Promise<{ success: boolean; data?: FacultyProfile; error?: string }> {
    if (!isSupabaseConfigured) {
      const idx = localFacultyList.findIndex(f => f.user_id === profile.user_id);
      if (idx >= 0) {
        Object.assign(localFacultyList[idx], profile);
      } else {
        const newProf: FacultyProfile = {
          user_id: profile.user_id,
          faculty_code: profile.faculty_code,
          display_name: profile.display_name,
          is_active: profile.is_active,
          created_at: new Date().toISOString(),
        };
        localFacultyList.push(newProf);
      }
      return { success: true };
    }

    // Live schema: faculty_profiles primary key is user_id, no 'id' column, no 'updated_at'
    const { data: existing } = await supabase
      .from('faculty_profiles')
      .select('user_id')
      .eq('user_id', profile.user_id)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('faculty_profiles')
        .update({
          faculty_code: profile.faculty_code,
          display_name: profile.display_name,
          is_active: profile.is_active,
        })
        .eq('user_id', profile.user_id)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } else {
      const { data, error } = await supabase
        .from('faculty_profiles')
        .insert({
          user_id: profile.user_id,
          faculty_code: profile.faculty_code,
          display_name: profile.display_name,
          is_active: profile.is_active,
        })
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    }
  },

  async toggleFacultyStatus(facultyUserId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      const target = localFacultyList.find(f => f.user_id === facultyUserId);
      if (target) target.is_active = isActive;
      return { success: true };
    }

    // Live schema: update by user_id, no updated_at column
    const { error } = await supabase
      .from('faculty_profiles')
      .update({ is_active: isActive })
      .eq('user_id', facultyUserId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async getAllFacultyAssignments(): Promise<(FacultySubjectAssignment & { faculty?: FacultyProfile; subject?: Subject })[]> {
    if (!isSupabaseConfigured) {
      return localAssignments.map(a => ({
        ...a,
        faculty: localFacultyList.find(f => f.user_id === a.faculty_id),
        subject: MOCK_SUBJECTS.find(s => s.id === a.subject_id),
      }));
    }

    const { data, error } = await supabase
      .from('faculty_subject_assignments')
      .select('*, faculty:faculty_profiles(*), subject:subjects(*)');

    if (error) {
      console.error('Error fetching all faculty assignments:', error);
      return [];
    }
    return data || [];
  },

  async assignSubjectToFaculty(facultyUserId: string, subjectId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      const exists = localAssignments.some(a => a.faculty_id === facultyUserId && a.subject_id === subjectId);
      if (exists) return { success: false, error: 'Subject is already assigned to this faculty member.' };

      localAssignments.push({
        id: `a-${Date.now()}`,
        faculty_id: facultyUserId,
        subject_id: subjectId,
        created_at: new Date().toISOString(),
      });
      return { success: true };
    }

    // Live schema: faculty_id references faculty_profiles.user_id
    const { error } = await supabase
      .from('faculty_subject_assignments')
      .insert({
        faculty_id: facultyUserId,
        subject_id: subjectId,
      });

    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async removeFacultyAssignment(assignmentId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      const idx = localAssignments.findIndex(a => a.id === assignmentId);
      if (idx >= 0) localAssignments.splice(idx, 1);
      return { success: true };
    }

    const { error } = await supabase
      .from('faculty_subject_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  }
};
