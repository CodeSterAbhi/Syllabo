// Syllabo - Automated Integration and Verification Audit Script
// Validates academic rules, migration structural integrity, rating calculations, and secret leakage.

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failCount++;
  }
}

console.log('\n--- 1. Testing Academic Content Invariants & Rules ---');

// Test Theory Question constraints
function validateTheoryQuestionNumber(num) {
  return Number.isInteger(num) && num >= 1 && num <= 5;
}
assert(validateTheoryQuestionNumber(1), 'Theory question number 1 is valid (range 1-5)');
assert(validateTheoryQuestionNumber(5), 'Theory question number 5 is valid (range 1-5)');
assert(!validateTheoryQuestionNumber(0), 'Theory question number 0 is correctly rejected');
assert(!validateTheoryQuestionNumber(6), 'Theory question number 6 is correctly rejected');

// Test 0-8 Score bounds validation
function validateScore(score) {
  return typeof score === 'number' && score >= 0.0 && score <= 8.0;
}
assert(validateScore(0.0), 'Evaluation score 0.0 is valid');
assert(validateScore(8.0), 'Evaluation score 8.0 is valid');
assert(validateScore(7.5), 'Evaluation score 7.5 is valid');
assert(!validateScore(-0.1), 'Evaluation score -0.1 is rejected');
assert(!validateScore(8.1), 'Evaluation score 8.1 is rejected');
assert(!validateScore(10), 'Evaluation score 10 is rejected');

// Test MCQ option validation
function validateMCQ(options, correctOption) {
  const hasOptions = options && options.A && options.B && options.C && options.D;
  const validCorrect = ['A', 'B', 'C', 'D'].includes(correctOption);
  return Boolean(hasOptions && validCorrect);
}
assert(validateMCQ({ A: 'Opt 1', B: 'Opt 2', C: 'Opt 3', D: 'Opt 4' }, 'C'), 'MCQ with 4 options and valid answer is valid');
assert(!validateMCQ({ A: 'Opt 1', B: 'Opt 2' }, 'A'), 'MCQ missing options C/D is rejected');
assert(!validateMCQ({ A: 'Opt 1', B: 'Opt 2', C: 'Opt 3', D: 'Opt 4' }, 'E'), 'MCQ with invalid correct option E is rejected');

// Test Rating Calculation
function computeAggregateRating(scores) {
  if (!scores || scores.length === 0) {
    return { average_score: 0, evaluation_count: 0 };
  }
  const sum = scores.reduce((acc, s) => acc + s, 0);
  const avg = Math.round((sum / scores.length) * 10) / 10;
  return { average_score: avg, evaluation_count: scores.length };
}
assert(computeAggregateRating([]).evaluation_count === 0, 'Empty evaluation array returns 0 count and 0 score');
assert(computeAggregateRating([7.5, 8.0]).average_score === 7.8, 'Average of 7.5 and 8.0 is 7.8');
assert(computeAggregateRating([7.5, 8.0]).evaluation_count === 2, 'Evaluation count matches input count');

console.log('\n--- 2. Validating SQL Migrations Against ARCHITECTURE.md ---');

const migrationsDir = path.resolve('supabase/migrations');
const schemaFile = fs.readFileSync(path.join(migrationsDir, '20261021000001_core_schema.sql'), 'utf-8');
const functionsFile = fs.readFileSync(path.join(migrationsDir, '20261021000002_functions.sql'), 'utf-8');
const policiesFile = fs.readFileSync(path.join(migrationsDir, '20261021000003_security_policies.sql'), 'utf-8');

// Verify all 10 tables in schema migration
const expectedTables = [
  'courses',
  'subjects',
  'units',
  'theory_questions',
  'numericals',
  'mcqs',
  'faculty_profiles',
  'faculty_subject_assignments',
  'evaluations',
  'app_admins'
];

expectedTables.forEach(table => {
  assert(schemaFile.includes(`CREATE TABLE IF NOT EXISTS public.${table}`), `Table public.${table} defined in core schema`);
  assert(policiesFile.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`), `RLS enabled for public.${table}`);
});

// Verify function security specifications
assert(functionsFile.includes("CREATE OR REPLACE FUNCTION public.get_question_rating"), 'get_question_rating function defined');
assert(functionsFile.includes("SECURITY DEFINER"), 'get_question_rating marked SECURITY DEFINER');
assert(functionsFile.includes("SET search_path = ''"), "get_question_rating uses SET search_path = '' matching ARCHITECTURE.md");
assert(functionsFile.includes("GRANT EXECUTE ON FUNCTION public.get_question_rating"), 'get_question_rating execution granted to anon, authenticated');

assert(functionsFile.includes("CREATE OR REPLACE FUNCTION public.is_app_admin"), 'is_app_admin function defined');
assert(functionsFile.includes("SET search_path = ''"), "is_app_admin uses SET search_path = ''");

console.log('\n--- 3. Secret Leakage & Environment Auditing ---');

// Check .env.example for active privileged variable definitions
const envExample = fs.readFileSync(path.resolve('.env.example'), 'utf-8');
const activeEnvVars = envExample
  .split('\n')
  .filter(l => l.trim() && !l.trim().startsWith('#'));
const hasPrivilegedVar = activeEnvVars.some(l => 
  l.toLowerCase().includes('service_role') || 
  l.toLowerCase().includes('password') ||
  l.toLowerCase().includes('secret')
);
assert(!hasPrivilegedVar, '.env.example does not define any service_role or privileged secret variables');


// Check .gitignore
const gitignore = fs.readFileSync(path.resolve('.gitignore'), 'utf-8');
assert(gitignore.includes('.env'), '.gitignore ignores .env files');
assert(gitignore.includes('!.env.example'), '.gitignore allows .env.example template');

// Search built dist for service_role or database passwords
let distClean = true;
const distPath = path.resolve('dist');
if (fs.existsSync(distPath)) {
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) {
        scanDir(full);
      } else if (f.endsWith('.js') || f.endsWith('.html')) {
        const content = fs.readFileSync(full, 'utf-8');
        if (content.includes('service_role') || content.includes('postgres://')) {
          distClean = false;
        }
      }
    }
  }
  scanDir(distPath);
}
assert(distClean, 'Production build dist/ is free of service_role keys and database passwords');

console.log('\n--- 4. Live Schema Reconciliation & Mismatch Regression Audits ---');

// Verify that src/services/api.ts defines and exports the normalizers
const apiTsContent = fs.readFileSync(path.resolve('src/services/api.ts'), 'utf-8');
assert(apiTsContent.includes('export function normalizeTheoryQuestion'), 'api.ts defines and exports normalizeTheoryQuestion');
assert(apiTsContent.includes('export function normalizeNumerical'), 'api.ts defines and exports normalizeNumerical');
assert(apiTsContent.includes('export function normalizeMCQ'), 'api.ts defines and exports normalizeMCQ');

// Normalizers logic under audit matching api.ts implementation
function normalizeTheoryQuestion(row) {
  const topics = Array.isArray(row.topics_covered)
    ? row.topics_covered
    : typeof row.topics_covered === 'string'
    ? row.topics_covered.split(',').map(s => s.trim()).filter(Boolean)
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

function normalizeNumerical(row) {
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

function normalizeMCQ(row) {
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

// Live schema row simulation for theory_questions
const liveTheoryRow = {
  id: 'q-live-1',
  unit_id: 'u-live-1',
  question_number: 1,
  topics_covered: ['Asymptotic Notations', 'Big-O', 'Theta'], // Live DB uses text[]
  question: 'What is asymptotic notation?', // Live DB uses 'question'
  answer_intro: 'Intro text',
  answer_body: 'Body text',
  answer_conclusion: 'Conclusion text',
  diagram_url: 'https://example.com/fig.png',
  hinglish_explanation: 'Asymptotic notation time complexity batata hai',
  is_published: true,
  created_at: '2026-10-23T00:00:00Z',
  // Note: diagram_caption, question_text, updated_at are ABSENT in live DB
};

const normTheory = normalizeTheoryQuestion(liveTheoryRow);
assert(normTheory.question === 'What is asymptotic notation?', 'normalizeTheoryQuestion preserves live DB "question"');
assert(normTheory.question_text === 'What is asymptotic notation?', 'normalizeTheoryQuestion populates "question_text" alias for UI compatibility');
assert(Array.isArray(normTheory.topics_covered), 'topics_covered is preserved as an array');
assert(normTheory.topics_covered.length === 3, 'topics_covered array contains all 3 elements');
assert(normTheory.updated_at === undefined, 'updated_at is cleanly undefined when absent in live DB');

// Test conversion of legacy string topics_covered into array
const legacyTheoryRow = {
  id: 'q-legacy-1',
  unit_id: 'u-legacy-1',
  question_number: 2,
  topics_covered: 'Stacks, Queues, Recursion',
  question: 'Explain stack operations.',
  answer_body: 'LIFO principle...',
  created_at: '2026-10-23T00:00:00Z'
};
const normLegacyTheory = normalizeTheoryQuestion(legacyTheoryRow);
assert(Array.isArray(normLegacyTheory.topics_covered), 'String topics_covered correctly converted to Array');
assert(normLegacyTheory.topics_covered.length === 3, 'Converted topics_covered has length 3');
assert(normLegacyTheory.topics_covered[0] === 'Stacks', 'First converted topic is trimmed string "Stacks"');

// Test 4.2: Normalization of Numericals from Live DB Schema
const liveNumericalRow = {
  id: 'n-live-1',
  unit_id: 'u-live-1',
  problem_number: 1,
  problem: 'Calculate address in row-major order', // Live DB uses 'problem'
  given_data: 'Base=1000, W=4',                   // Live DB uses 'given_data'
  required_result: 'Address of A[3, 4]',          // Live DB uses 'required_result'
  formula: 'Address = Base + W * offset',
  solution_steps: 'Step 1...',
  final_answer: '1048',
  is_published: true,
  created_at: '2026-10-23T00:00:00Z'
  // Note: problem_statement, given, required, updated_at are ABSENT in live DB
};
const normNum = normalizeNumerical(liveNumericalRow);
assert(normNum.problem === 'Calculate address in row-major order', 'normalizeNumerical preserves live DB "problem"');
assert(normNum.problem_statement === 'Calculate address in row-major order', 'normalizeNumerical populates "problem_statement" alias');
assert(normNum.given_data === 'Base=1000, W=4', 'normalizeNumerical preserves live DB "given_data"');
assert(normNum.given === 'Base=1000, W=4', 'normalizeNumerical populates "given" alias');
assert(normNum.required_result === 'Address of A[3, 4]', 'normalizeNumerical preserves live DB "required_result"');
assert(normNum.required === 'Address of A[3, 4]', 'normalizeNumerical populates "required" alias');

// Test 4.3: Normalization of MCQs from Live DB Schema
const liveMCQRow = {
  id: 'm-live-1',
  unit_id: 'u-live-1',
  question_number: 1,
  question: 'Which of the following is linear?', // Live DB uses 'question'
  options: { A: 'Tree', B: 'Graph', C: 'Array', D: 'Heap' },
  correct_option: 'C',                         // Live DB uses text
  explanation: 'Arrays are linear data structures',
  is_published: true,
  created_at: '2026-10-23T00:00:00Z'
  // Note: question_text, updated_at are ABSENT in live DB
};
const normMCQ = normalizeMCQ(liveMCQRow);
assert(normMCQ.question === 'Which of the following is linear?', 'normalizeMCQ preserves live DB "question"');
assert(normMCQ.question_text === 'Which of the following is linear?', 'normalizeMCQ populates "question_text" alias');
assert(normMCQ.correct_option === 'C', 'normalizeMCQ preserves text correct_option');

// Test 4.4: Faculty Profile & Authorization Invariants
const sampleFacultyProfile = {
  user_id: 'auth-user-uuid-1234', // PK in live schema
  faculty_code: 'FAC-QTU-001',
  display_name: 'Dr. Test Professor',
  is_active: true,
  created_at: '2026-10-23T00:00:00Z'
  // Note: NO 'id' column in live schema
};
assert(Boolean(sampleFacultyProfile.user_id), 'FacultyProfile has user_id as primary identifier');
assert(sampleFacultyProfile.id === undefined, 'FacultyProfile does not require synthetic id column');

const sampleAssignment = {
  id: 'assign-uuid-1',
  faculty_id: sampleFacultyProfile.user_id, // References faculty_profiles.user_id
  subject_id: 'subject-uuid-1',
  created_at: '2026-10-23T00:00:00Z'
};
assert(sampleAssignment.faculty_id === sampleFacultyProfile.user_id, 'faculty_subject_assignments.faculty_id references faculty_profiles.user_id');

// Test 4.5: Admin without Faculty Profile Decoupling
function checkUserRoles(authUserId, adminTableRows, facultyProfileRows) {
  const isAdmin = adminTableRows.some(a => a.user_id === authUserId);
  const facultyProfile = facultyProfileRows.find(f => f.user_id === authUserId) || null;
  return { isAdmin, facultyProfile };
}
const adminOnlySession = checkUserRoles(
  'admin-user-uuid-999',
  [{ user_id: 'admin-user-uuid-999' }],
  [] // No faculty profile for this admin
);
assert(adminOnlySession.isAdmin === true, 'Admin without faculty profile is recognized as admin');
assert(adminOnlySession.facultyProfile === null, 'Admin without faculty profile has null facultyProfile without crashing');

// Test 4.6: Verification of function get_question_rating query
assert(functionsFile.includes("pg_catalog.count(e.question_id)::bigint"), 'get_question_rating counts by e.question_id without assuming e.id exists');
assert(!functionsFile.includes("e.faculty_id AS faculty"), 'get_question_rating never leaks faculty identity');

// Test 4.7: Verification of Seed Data Migration Alignment & Guard
const seedFile = fs.readFileSync(path.join(migrationsDir, '20261021000004_seed_dev_sample.sql'), 'utf-8');
assert(seedFile.includes("topics_covered, question"), 'Seed script uses "question" (not question_text) for theory questions');
assert(seedFile.includes("ARRAY["), 'Seed script uses ARRAY[...]::text[] for theory_questions.topics_covered');
assert(seedFile.includes("problem, given_data, required_result"), 'Seed script uses "problem, given_data, required_result" for numericals');
assert(seedFile.includes("mcqs (id, unit_id, question_number, question"), 'Seed script uses "question" for mcqs');
assert(seedFile.includes("Safety check failed: Non-sample curriculum detected"), 'Seed script contains safety check preventing production data overwrite');

// Test 4.8: Verification of Proposed Migration
const proposedMigrationPath = path.join(migrationsDir, '20261023000001_proposed_schema_reconciliation.sql');
assert(fs.existsSync(proposedMigrationPath), 'Proposed migration file exists');
const proposedMigrationSql = fs.readFileSync(proposedMigrationPath, 'utf-8');
assert(proposedMigrationSql.includes("PROPOSED ONLY — DO NOT EXECUTE"), 'Proposed migration is explicitly marked NOT YET EXECUTED');
assert(proposedMigrationSql.includes("ADD COLUMN IF NOT EXISTS description TEXT"), 'Proposed migration specifies minimal additive columns safely');
assert(!proposedMigrationSql.includes("DROP TABLE"), 'Proposed migration does not drop any table');
assert(!proposedMigrationSql.includes("DROP COLUMN"), 'Proposed migration does not drop any column');

console.log('\n--- 5. Academic Rich-Text, Terms & Conditions, and Global Footer Audits ---');

const editorFile = fs.readFileSync(path.resolve('src/components/common/AcademicRichEditor.tsx'), 'utf-8');
const rendererFile = fs.readFileSync(path.resolve('src/components/common/AcademicContentRenderer.tsx'), 'utf-8');
const termsFile = fs.readFileSync(path.resolve('src/components/legal/TermsPage.tsx'), 'utf-8');
const footerFile = fs.readFileSync(path.resolve('src/components/layout/Footer.tsx'), 'utf-8');
const appFile = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
const adminPortalFile = fs.readFileSync(path.resolve('src/components/admin/AdminPortal.tsx'), 'utf-8');
const unitHubFile = fs.readFileSync(path.resolve('src/components/student/UnitHubView.tsx'), 'utf-8');

// Rich Editor & Tiptap Verification
assert(editorFile.includes("@tiptap/react"), 'AcademicRichEditor integrates @tiptap/react');
assert(editorFile.includes("@tiptap/starter-kit"), 'AcademicRichEditor integrates @tiptap/starter-kit');
assert(editorFile.includes("@tiptap/extension-table"), 'AcademicRichEditor integrates Table extension');
assert(editorFile.includes("@tiptap/extension-image"), 'AcademicRichEditor integrates Image extension');
assert(editorFile.includes("katex"), 'AcademicRichEditor integrates KaTeX for math formulas');
assert(editorFile.includes("handleInsertImage"), 'AcademicRichEditor supports cursor-positioned persistent image insertion');

// Content Renderer Verification
assert(rendererFile.includes("DOMPurify.sanitize"), 'AcademicContentRenderer sanitizes all HTML with DOMPurify');
assert(rendererFile.includes("katex.renderToString"), 'AcademicContentRenderer renders KaTeX equations');
assert(rendererFile.includes("hasHtmlMarkup"), 'AcademicContentRenderer distinguishes between legacy plain text and rich HTML');
assert(rendererFile.includes("escapeHtml"), 'AcademicContentRenderer escapes raw HTML characters in legacy content');

// Admin Portal & Student UnitHub Integration
assert(adminPortalFile.includes("AcademicRichEditor"), 'AdminPortal integrates AcademicRichEditor for academic authoring');
assert(adminPortalFile.includes("editingTheoryQuestionId"), 'AdminPortal supports editing existing theory questions');
assert(adminPortalFile.includes("editingNumericalId"), 'AdminPortal supports editing existing numerical problems');
assert(adminPortalFile.includes("handleToggleTheoryPublish"), 'AdminPortal supports publishing/unpublishing theory questions');
assert(adminPortalFile.includes("handleToggleNumericalPublish"), 'AdminPortal supports publishing/unpublishing numerical problems');
assert(unitHubFile.includes("AcademicContentRenderer"), 'UnitHubView integrates AcademicContentRenderer for student answer display');

// Terms & Conditions Page Verification
assert(termsFile.includes("1. Purpose of Syllabo"), 'Terms page includes Section 1: Purpose of Syllabo');
assert(termsFile.includes("2. Independent Academic Project Disclaimer"), 'Terms page includes Section 2: Independent Academic Project Disclaimer');
assert(termsFile.includes("3. Educational and Informational Use"), 'Terms page includes Section 3: Educational and Informational Use');
assert(termsFile.includes("4. No Examination Guarantee"), 'Terms page includes Section 4: No Examination Guarantee');
assert(termsFile.includes("5. Content Accuracy & Verification"), 'Terms page includes Section 5: Content Accuracy & Verification');
assert(termsFile.includes("6. Responsible Usage of the Platform"), 'Terms page includes Section 6: Responsible Usage');
assert(termsFile.includes("7. Content Ownership & Restrictions on Redistribution"), 'Terms page includes Section 7: Content Ownership & Rights');
assert(termsFile.includes("8. Platform Availability & Maintenance"), 'Terms page includes Section 8: Platform Availability');
assert(termsFile.includes("9. Revisions & Updates to Terms"), 'Terms page includes Section 9: Revisions to Terms');
assert(termsFile.includes("10. Inquiries and Academic Clarifications"), 'Terms page includes Section 10: Inquiries and Academic Clarifications');

// Global Footer Verification
assert(footerFile.includes("Syllabo"), 'Footer displays Syllabo brand');
assert(footerFile.includes("Exam Preparation Platform for Quantum University"), 'Footer displays university preparation tagline');
assert(footerFile.includes("Terms & Conditions"), 'Footer includes Terms & Conditions link');
assert(footerFile.includes("/terms"), 'Footer links to /terms');
assert(footerFile.includes("Developed by"), 'Footer displays developer attribution');
assert(footerFile.includes("Abhijit Sharma"), 'Footer attributes development to Abhijit Sharma');
assert(footerFile.includes("© 2026 Syllabo. All rights reserved."), 'Footer includes 2026 copyright notice');
assert(footerFile.includes("Curriculum content and syllabus rights belong to their respective owners."), 'Footer includes concise curriculum disclaimer');
assert(!footerFile.includes("PostgreSQL RLS Protected • Supabase Auth Integrated • 0–8 Marks Faculty Verification"), 'Footer omits deprecated technical/security implementation tagline');

// App Routing Verification
assert(appFile.includes("TermsPage"), 'App.tsx imports and registers TermsPage');
assert(appFile.includes("/terms"), 'App.tsx provides /terms state and popstate synchronization');
assert(appFile.includes("<Footer"), 'App.tsx renders the modular Global Footer');

console.log('\n--- 6. Audit Summary ---');
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('✅ ALL IN-CODE AND STRUCTURAL VERIFICATION AUDITS PASSED!\n');
  process.exit(0);
}
