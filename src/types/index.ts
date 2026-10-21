// Syllabo - Core Domain Types
// Strictly mirrors database schema in supabase/migrations and docs/ARCHITECTURE.md

export interface Course {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  course_id: string;
  semester: number;
  code: string;
  name: string;
  description?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  course?: Course;
}

export interface Unit {
  id: string;
  subject_id: string;
  unit_number: number;
  title: string;
  description?: string;
  numericals_applicable: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

export interface TheoryQuestion {
  id: string;
  unit_id: string;
  question_number: number; // 1 to 5
  topics_covered: string;
  question_text: string;
  answer_intro?: string;
  answer_body: string;
  answer_conclusion?: string;
  diagram_url?: string;
  diagram_caption?: string;
  hinglish_explanation?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  rating?: QuestionRating;
}

export interface Numerical {
  id: string;
  unit_id: string;
  problem_number: number;
  problem_statement: string;
  given?: string;
  required?: string;
  formula?: string;
  solution_steps: string;
  final_answer?: string;
  diagram_url?: string;
  hinglish_explanation?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface MCQ {
  id: string;
  unit_id: string;
  question_number: number;
  question_text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface FacultyProfile {
  id: string;
  user_id: string;
  faculty_code: string;
  display_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FacultySubjectAssignment {
  id: string;
  faculty_id: string;
  subject_id: string;
  created_at: string;
  subject?: Subject;
}

export interface Evaluation {
  id: string;
  question_id: string;
  faculty_id: string;
  score: number; // 0.0 to 8.0
  feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionRating {
  average_score: number;
  evaluation_count: number;
}

export type ViewTab = 'theory' | 'numericals' | 'mcqs';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}
