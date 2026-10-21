# Syllabo — Persistent AI Coding Context

Read this file at the start of each coding session and follow it alongside `PRD.md`, `ARCHITECTURE.md`, `TASKS.md`, and `SECURITY.md`.

## Product identity
- Product name is **Syllabo**. Use this spelling consistently.
- Initial scope is Quantum University programs/courses only.
- `reference/logo.png` is the logo reference (copied to `public/logo.png`).
- `reference/ui.png` is the desired visual-design reference.
- The app is an exam-preparation website, not a generic course marketplace.

## Core student journey
`Home → Program/Course → Semester → Subject → Unit → Unit Preparation Hub → Theory | Numericals | MCQs`

Students do not need an account. Faculty Login appears at the top-right of the home page.

## Content rules
- Each published unit has exactly five comprehensive theory questions.
- Collectively, the five questions should cover the unit's topics; show topics covered for each question.
- Formal answers are intended for 8-mark exam questions and usually under 300 words, but never truncate content just to satisfy a rigid UI height.
- Answer sections are flexible: introduction, main body, optional diagram/example, conclusion as appropriate to the subject.
- Hinglish explanation is optional, collapsed by default, around 50–60 words, Hindi in Roman script mixed with English terms.
- Numericals use flexible step-by-step solutions. If not applicable, show an explicit message rather than an empty/broken page.
- Target 15–20 MCQs per unit with answers.
- Do not invent real university syllabus or faculty data. Use clearly labelled placeholders only until the owner provides content.
- Content must be easy to add/edit without rewriting the visual components.

## Faculty evaluations & database permissions
- Faculty scores written theory answers from 0 to 8.
- Public pages show average score and evaluation count, not evaluator identity or private details.
- No public faculty sign-up.
- Faculty accounts must be provisioned by the owner and tied to Supabase Auth.
- Authorization is based on active faculty profile plus subject assignment.
- Never trust a faculty ID supplied by the browser as proof of identity.
- Database RLS/constraints/functions must enforce who can evaluate which question and valid score ranges.
- **Permission nuance:** In the live database created by the owner, default privileges were revoked from clients, and `evaluations` was granted for `INSERT` only (raw `evaluations` rows cannot be directly selected or updated by clients). The frontend code performs `INSERT` directly, derives identity from `auth.uid()`, and safely handles duplicate constraint errors (code 23505) without crashing.
- `get_question_rating(uuid)` is a `SECURITY DEFINER` function with `SET search_path = ''` returning only aggregate average and count.
- Numerical evaluation is optional unless the owner later requests it.
- Faculty code/ID is an internal identifier, not a password and not a substitute for authentication.

## Technical implementation summary
- React 18 + TypeScript + Vite + Tailwind CSS stack.
- Version-controlled SQL migrations created in `supabase/migrations/`:
  - `20261021000001_core_schema.sql` (9 tables + `app_admins`)
  - `20261021000002_functions.sql` (`get_question_rating` & `is_app_admin` with `SET search_path = ''`)
  - `20261021000003_security_policies.sql` (RLS policies, grants)
  - `20261021000004_seed_dev_sample.sql` (labelled sample preview data)
- Dual-mode data client in `src/lib/supabase.ts` and `src/services/api.ts`: runs immediately in preview mode with sample data when `.env` is unconfigured, and automatically connects to live Supabase once `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided.
- Full Admin Control Center implemented in `src/components/admin/AdminPortal.tsx`:
  - Curriculum Manager (Programs, Subjects, Units with 5-question readiness check)
  - Question Bank Manager (Theory questions 1–5, Numericals with formula/steps, MCQs with options A-D)
  - Faculty Onboarding Workbench (Register Auth UUIDs, toggle active status, assign/revoke subjects)
- Automated verification: `npm test` runs 46 assertions across academic rules, migration structure, and secret scanning; `npm run build` succeeds cleanly.
