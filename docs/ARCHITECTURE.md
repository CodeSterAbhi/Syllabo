# Syllabo — Architecture and Supabase Setup

**Status:** Initial Supabase database created manually in the Supabase SQL Editor. This document describes the intended architecture and the database work already completed. The implementation agent must inspect the live Supabase project configuration supplied by the owner and must not blindly rerun the SQL setup.

## 1. System overview

- **Frontend:** React + TypeScript + Vite (unless the repository already contains a justified existing stack).
- **Backend platform:** Supabase.
- **Database:** Supabase PostgreSQL.
- **Authentication:** Supabase Auth, for faculty and administrator accounts only. Students do not need accounts.
- **Authorization:** PostgreSQL Row Level Security (RLS), table grants, and database-enforced policies. Frontend route guards are for user experience only and are not security boundaries.
- **Academic content:** Stored in PostgreSQL and displayed only when published.
- **Ratings:** Individual faculty evaluations remain private. Students receive only an aggregate average and evaluation count.
- **Reference assets:** `reference/logo.png` and `reference/ui.png`.
- **Project documentation:** `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/TASKS.md`, `docs/MEMORY.md`, and `docs/SECURITY.md`.

## 2. Database tables already created

The owner has successfully run the initial schema SQL in Supabase. The following nine tables exist in the `public` schema:

| Table | Purpose |
|---|---|
| `courses` | University programs/courses, such as B.Tech CSE |
| `subjects` | Subjects linked to a course and semester |
| `units` | Units within a subject; includes whether numericals apply |
| `theory_questions` | Up to five numbered theory questions per unit, topics covered, answer fields, optional diagram URL and Hinglish explanation |
| `numericals` | Numbered numerical problems and solution fields |
| `mcqs` | MCQs, JSONB options, correct option, and optional explanation |
| `faculty_profiles` | Faculty profile linked to a Supabase Auth user UUID, unique faculty code, display name, and active status |
| `faculty_subject_assignments` | Subjects each faculty member is allowed to evaluate |
| `evaluations` | One score per faculty member per theory question, constrained to 0–8 |

The schema includes UUID primary keys, foreign keys, uniqueness constraints, basic indexes, and publication flags. It does not contain real academic content yet.

### Important implementation notes

- The `theory_questions.question_number` constraint allows values 1–5 and the unique key prevents duplicate numbers per unit. It does not itself guarantee that all five questions exist. Add a content-validation check before a unit is marked ready for publication.
- `numericals_applicable = false` should produce an explanatory “Numericals not applicable for this unit” state in the UI.
- `mcqs.options` is expected to be a JSON object with keys `A`, `B`, `C`, and `D`.
- Diagram fields currently store a URL string. If Supabase Storage is adopted, configure a dedicated bucket and secure Storage policies before uploading assets.
- Faculty evaluation currently applies to theory questions. Numerical evaluations are not part of the initial required workflow.
- A faculty member can submit only one evaluation per theory question because of `unique (question_id, faculty_id)`. Editing or replacing a rating is not allowed through the current client grants.

## 3. Database security already applied

RLS is enabled on all nine application tables. The initial SQL also revoked default table privileges from `anon` and `authenticated`, then granted selected operations back.

### Published academic content
- Anonymous and authenticated users may read published courses, subjects, units, theory questions, numericals, and MCQs.
- The policies check that parent records are also published.
- Clients cannot insert, update, or delete academic content unless authorized as an administrator.

### Faculty
- Faculty authenticate through Supabase Auth.
- `faculty_profiles.user_id` references `auth.users.id`.
- `faculty_code` is a human-readable unique reference only; it is **not** a password or authentication factor.
- Faculty can read their own profile and their own subject assignments.
- Public faculty signup must not be implemented.

### Evaluations
- Authenticated faculty can insert evaluations only for their own Auth UUID and an assigned subject, while their faculty profile is active.
- Raw `evaluations` rows are not granted to anonymous or authenticated clients for direct reading.
- Clients cannot update or delete evaluations under the current grants.
- The `get_question_rating(uuid)` SQL function has been created. It returns only `average_score` and `evaluation_count` for a published question and its published parent records. It is a `SECURITY DEFINER` function with an empty `search_path`, and execution is granted to `anon` and `authenticated`.
- The function should be tested through actual anonymous and authenticated client sessions before launch. It must not be expanded to return faculty identities or individual scores.

### Administrator
- The `app_admins` table has been created and RLS enabled. Direct client access to this table is revoked.
- `is_app_admin()` has been created as a restricted helper function.
- The owner has successfully applied administrator-only policies for managing courses, subjects, units, theory questions, numericals, MCQs, faculty profiles, and faculty-subject assignments.
- An administrator account is not automatically created by the schema. The owner must create their Auth user in the Supabase Dashboard, then insert that user's UUID into `public.app_admins` using the SQL Editor.
- Never create a public endpoint that lets a user add themselves to `app_admins`.

## 4. Faculty onboarding workflow

1. Owner creates/invites a faculty user through Supabase Auth in the dashboard or a trusted server-side admin workflow.
2. Owner records the Auth user's UUID in `faculty_profiles`, together with a unique code such as `FAC-QTU-001`, display name, and active status.
3. Owner inserts a row in `faculty_subject_assignments` for each subject that faculty member may evaluate.
4. Faculty signs in using the Supabase Auth flow.
5. Database policies—not frontend-only checks—enforce active status and subject assignment when an evaluation is inserted.
6. When access must be withdrawn, deactivate the profile and remove assignments; also revoke the user's authentication access as appropriate.

Never store passwords, invitation tokens, Supabase secret keys, or service-role keys in JSON files, source control, or frontend bundles.

## 5. SQL already run manually in Supabase

The following setup actions have been completed and reported successful by the owner:

1. Created the nine core tables, indexes, constraints, RLS settings, grants, and initial read/evaluation policies.
2. Created `public.get_question_rating(uuid)` for aggregate rating output.
3. Created `public.app_admins` and `public.is_app_admin()`.
4. Added administrator-only policies and grants for content and faculty-management tables.

**Do not ask the owner to rerun those initial SQL scripts blindly.** They are not yet stored as repository migrations. During implementation, create version-controlled SQL migration files that accurately represent the live database state. Inspect the current schema and policies first, compare them with the migration files, and ensure a fresh database can be recreated without duplicate-object errors. Do not reset or drop the owner's existing Supabase project.

## 6. Remaining database work before production

The initial database is created, but it is not yet a fully audited production backend. Complete these items before public launch:

1. **Verify the administrator bootstrap:** confirm the owner's Auth UUID exists in `app_admins`. Do not ask the owner to expose credentials in chat.
2. **Create and test migration files:** preserve the live schema in version control; document the order in which migrations run.
3. **Test RLS using real client roles:** test anonymous visitors, ordinary authenticated users, assigned faculty, unassigned faculty, inactive faculty, and administrator. Confirm direct API calls cannot bypass policies.
4. **Test aggregate ratings:** verify anonymous users can get only average/count for published questions; unpublished or nonexistent questions should disclose no private data.
5. **Test rating integrity:** confirm scores outside 0–8 fail, duplicate ratings fail, unassigned faculty fail, and inactive faculty fail.
6. **Validate content publication:** do not publish a unit until it meets content requirements (five theory questions; MCQs target 15–20; numericals when applicable).
7. **Review admin privileges:** only the owner's trusted admin UUID(s) should exist in `app_admins`. Admin actions must require a valid authenticated session.
8. **Configure Auth:** set allowed redirect URLs, production site URL, secure invitation flow, and appropriate email confirmation/password-reset settings.
9. **Configure rate limits and abuse protection:** use Supabase/Auth protections and, where needed, server-side controls. Do not rely on frontend throttling.
10. **Storage (if used):** create a bucket for diagrams and define read/upload policies. Do not leave arbitrary uploads public by accident.
11. **Backups and recovery:** understand the project's backup/restore options and test a recovery procedure before relying on the content.
12. **Security review:** check database grants, RLS policies, function privileges, secrets, and logs before production.

## 7. Environment variables

Frontend variables should contain only the Supabase project URL and the publishable/anon key, for example:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Use the exact key label provided by the current Supabase dashboard. These frontend values are not substitutes for RLS. Never put the service-role/secret key, database password, or privileged server secret in any `VITE_*` variable. If a trusted server-side component is introduced, keep its secrets in server-only environment variables and deploy them only to the server environment.

Do not commit real `.env` files. Commit an `.env.example` containing placeholders only.

## 8. Expected application data flow

### Student
`Home → Course → Semester → Subject → Unit → Theory / Numericals / MCQs`

The frontend queries published content. For a theory question, it calls `get_question_rating(question_id)` to display the aggregate score and count. It never queries raw evaluations.

### Faculty
`Faculty login → Auth session → Authorized subject → Theory answer → Submit score (0–8)`

The database validates the Auth UUID, active faculty status, subject assignment, and uniqueness of the rating.

### Administrator
`Admin login → app_admins verification → Manage content and faculty assignments`

The frontend may hide admin screens from non-admins for usability, but RLS and database grants remain the security boundary.

## 9. Instructions to the coding agent

- Read this document and `SECURITY.md` before implementing Supabase integration.
- Inspect the existing repository and the actual database state before creating migrations.
- Do not rerun the original setup SQL without comparing it to the live database.
- Do not use JSON or localStorage as the authority for faculty identity, permissions, or ratings.
- Do not add public faculty signup.
- Do not expose raw evaluation rows, Auth users, or administrator records to students.
- Never place privileged keys in frontend code.
- Build an understandable, documented faculty onboarding procedure and test all permission boundaries.
- If a migration or policy conflicts with the live database, stop and explain the discrepancy rather than dropping tables or weakening security.
