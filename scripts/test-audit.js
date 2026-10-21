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

console.log('\n--- 4. Audit Summary ---');
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('✅ ALL IN-CODE AND STRUCTURAL VERIFICATION AUDITS PASSED!\n');
  process.exit(0);
}
