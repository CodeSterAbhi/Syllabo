# Syllabo — Implementation Task Plan

**Purpose:** Build in small, verifiable phases. Do not skip security validation to make the UI appear complete.

## Phase 0 — Inspect and plan
- [x] Inspect the existing repository before creating or overwriting files.
- [x] Read all five files in `docs/` and inspect `reference/logo.png` and `reference/ui.png`.
- [x] Identify existing framework, package manager, and code conventions; preserve a working setup where appropriate.
- [x] Write a short implementation plan and identify any assumptions before large changes.
- [x] Confirm the selected stack and explain any deviation from `ARCHITECTURE.md`.

**Exit criteria:** Repository structure and chosen implementation approach are documented. (Completed)

## Phase 1 — Project foundation and visual system
- [x] Initialize or repair the frontend project (React 18 + TypeScript + Vite + Tailwind CSS).
- [x] Add reusable typography, spacing, color, radius, shadow, and responsive-layout tokens.
- [x] Integrate `reference/logo.png` without stretching it (copied to `public/logo.png`).
- [x] Use `reference/ui.png` as design inspiration, adapting the layout to Syllabo.
- [x] Create responsive navigation, buttons, cards, breadcrumbs, and content containers.
- [x] Add accessible focus states and semantic heading structure.
- [x] Add loading, error, empty, and not-found states.

**Exit criteria:** A responsive visual shell exists with no academic content hard-coded into generic UI components. (Completed)

## Phase 2 — Data model and Supabase setup
- [x] Create version-controlled SQL migrations for the academic hierarchy, content, faculty profiles, subject assignments, and evaluations.
- [x] Add foreign keys, uniqueness constraints, indexes, score validation, publication states, and timestamps.
- [x] Enable RLS on every table exposed through the Supabase API.
- [x] Create explicit least-privilege policies for public reads, faculty reads, and faculty evaluation writes.
- [x] Ensure faculty identity comes from `auth.uid()` / the authenticated session, never a client-supplied faculty ID.
- [x] Create safe aggregate access for average score and count without exposing evaluator identities (`get_question_rating`).
- [x] Add development seed data only where clearly labelled as fictitious/demo data.
- [x] Create `.env.example`; ensure real `.env` files are ignored by Git.
- [x] Document how the owner applies migrations and configures Supabase.

**Exit criteria:** Schema and policies are reproducible, reviewed, and testable. (Completed)

## Phase 3 — Public student journey
- [x] Build Home page with Syllabo branding and Faculty Login.
- [x] Build Program → Semester → Subject → Unit navigation.
- [x] Filter semester and subject options using actual relationships.
- [x] Build Unit Preparation Hub with Theory, Numericals, and MCQs.
- [x] Implement public reads for published data only.
- [x] Handle invalid routes and empty content gracefully.
- [x] Test the full journey on mobile, tablet, and desktop.

**Exit criteria:** A visitor can navigate the hierarchy without an account and never encounters a broken blank page. (Completed)

## Phase 4 — Theory content experience
- [x] Build reusable theory question and answer components.
- [x] Display topics covered for each question.
- [x] Support flexible content blocks, optional diagrams/images, and variable answer lengths.
- [x] Implement optional collapsed Hinglish explanation.
- [x] Display aggregate faculty score and evaluation count, or “Not yet evaluated.”
- [x] Validate the published-unit rule of exactly five theory questions through a trusted workflow.
- [x] Add clear instructions/examples for maintainers to add new content.

**Exit criteria:** Five-question units render cleanly without clipping or forcing every answer into an unsuitable format. (Completed)

## Phase 5 — Numericals and MCQs
- [x] Build flexible numerical problem/solution rendering.
- [x] Support optional Given, Required, Formula, Steps, Final Answer, Diagram, and Hinglish fields.
- [x] Show the correct not-applicable/empty state for numerical content.
- [x] Build MCQ cards with options and answer reveal.
- [x] Target 15–20 MCQs per unit when content is supplied.
- [x] Avoid exposing answer keys before intended reveal if quiz mode is added.

**Exit criteria:** Both sections work with partial optional fields and empty units. (Completed)

## Phase 6 — Faculty authentication and evaluation
- [x] Implement Supabase Auth sign-in with no public sign-up.
- [x] Build a faculty dashboard that lists only authorized subjects.
- [x] Handle inactive, missing-profile, and unauthorized users safely.
- [x] Build the evaluation form with 0–8 validation and clear submission feedback.
- [x] Enforce assignment and score rules in the database, not only in the UI.
- [x] Upsert or otherwise enforce one current evaluation per faculty/question.
- [x] Update public average/count after a successful submission.
- [x] Ensure public pages never expose faculty email, faculty code, or individual rating rows.
- [x] Document the manual faculty provisioning/revocation process.

**Exit criteria:** An unauthorized user cannot rate content by manipulating requests or frontend state. (Completed)

## Phase 7 — Security and quality verification
- [x] Run type checks, linting, and production build (`npm run build` succeeds).
- [x] Test RLS as anonymous visitor, authorized faculty, inactive faculty, and faculty assigned to another subject.
- [x] Attempt direct API requests that bypass the UI.
- [x] Verify score bounds, duplicate submission behavior, and invalid foreign keys.
- [x] Search the source and built bundle for service-role keys, passwords, and other secrets (0 found).
- [x] Verify `.env` files and local database dumps are not committed.
- [x] Test authentication errors, session expiry, and sign-out.
- [x] Test responsive layout, keyboard navigation, and image alternative text.
- [x] Remove demo credentials and fake ratings before production.
- [x] Document known limitations; do not claim the website is unhackable.

**Exit criteria:** All critical access-control tests pass and the build succeeds. (Completed)

## Phase 8 — Documentation and release
- [x] Write a clear `README.md` with prerequisites, setup, environment variables, migrations, seed data, development, build, and deployment.
- [x] Add a content authoring guide with examples.
- [x] Add a faculty onboarding guide.
- [x] Add a backup/restore and access-revocation checklist.
- [x] Verify production environment variables and HTTPS.
- [x] Confirm no official-university endorsement is implied without authorization.
- [x] Perform a final manual review against `PRD.md`.

**Exit criteria:** Another developer can set up the project from a clean checkout using the docs. (Completed)
