// Syllabo - Core Domain Types
// Authoritative mapping matching live Supabase PostgreSQL schema

export interface Course {
  id: string;
  code: string;
  name: string;
  description?: string; // Optional: not present in current live schema
  is_published: boolean;
  created_at: string;
  updated_at?: string;  // Not present in current live schema
}

export interface Subject {
  id: string;
  course_id: string;
  semester: number;
  code: string;
  name: string;
  description?: string; // Optional: not present in current live schema
  is_published: boolean;
  created_at: string;
  updated_at?: string;  // Not present in current live schema
  course?: Course;
}

export interface Unit {
  id: string;
  subject_id: string;
  unit_number: number;
  title: string;
  description?: string; // Optional: not present in current live schema
  numericals_applicable: boolean;
  is_published: boolean;
  created_at: string;
  updated_at?: string;  // Not present in current live schema
  subject?: Subject;
}

export interface TheoryQuestion {
  id: string;
  unit_id: string;
  question_number: number; // 1 to 5
  topics_covered: string[]; // Live DB uses text[] (array of strings)
  question: string;        // Live DB uses 'question' (not question_text)
  question_text?: string;  // UI & compatibility alias
  answer_intro?: string;
  answer_body: string;
  answer_conclusion?: string;
  diagram_url?: string;
  diagram_caption?: string; // Optional: not present in current live schema
  hinglish_explanation?: string;
  is_published: boolean;
  created_at: string;
  updated_at?: string;     // Not present in current live schema
  rating?: QuestionRating;
}

export interface Numerical {
  id: string;
  unit_id: string;
  problem_number: number;
  problem: string;            // Live DB uses 'problem' (not problem_statement)
  problem_statement?: string; // UI & compatibility alias
  given_data?: string;        // Live DB uses 'given_data' (not given)
  given?: string;             // UI & compatibility alias
  required_result?: string;   // Live DB uses 'required_result' (not required)
  required?: string;          // UI & compatibility alias
  formula?: string;
  solution_steps: string;
  final_answer?: string;
  diagram_url?: string;
  hinglish_explanation?: string;
  is_published: boolean;
  created_at: string;
  updated_at?: string;        // Not present in current live schema
}

export interface MCQ {
  id: string;
  unit_id: string;
  question_number: number;
  question: string;        // Live DB uses 'question' (not question_text)
  question_text?: string;  // UI & compatibility alias
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_option: string;  // Live DB uses text
  explanation?: string;
  is_published: boolean;
  created_at: string;
  updated_at?: string;     // Not present in current live schema
}

export interface FacultyProfile {
  user_id: string;         // Primary Key in live DB (references auth.users.id, no 'id' column)
  faculty_code: string;
  display_name: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;     // Not present in current live schema
}

export interface FacultySubjectAssignment {
  id: string;
  faculty_id: string;      // References faculty_profiles.user_id
  subject_id: string;
  created_at: string;
  subject?: Subject;
  faculty?: FacultyProfile;
}

export interface Evaluation {
  id?: string;             // Live DB might use composite PK or id
  question_id: string;
  faculty_id: string;      // References faculty_profiles.user_id
  score: number;           // 0.0 to 8.0
  feedback?: string;       // Not present in current live schema
  created_at: string;
  updated_at?: string;     // Not present in current live schema
}

export interface AppAdmin {
  user_id: string;         // Primary Key in live DB (references auth.users.id, no 'id' column)
  created_at: string;
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
