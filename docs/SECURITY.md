# Syllabo — Security Design and Threat Model

**Important:** No website can be guaranteed “unhackable.” This document defines layered protections and required verification. Security is not achieved by hiding a frontend bundle or by keeping the Supabase publishable key secret.

## 1. Security objectives

- Visitors can read only intentionally public, published academic content and public aggregate evaluations.
- Only authenticated, active, authorized faculty can submit evaluations for assigned subjects.
- No user can self-register as faculty or change their own role/assignments.
- Private faculty details and individual evaluation records are not publicly accessible.
- Privileged credentials and database secrets never reach the browser.
- Invalid, malicious, or manipulated requests are rejected by the database/API boundary.
- Errors do not reveal secrets, stack traces, private records, or internal configuration.

## 2. Security reality: what users can and cannot see

### Frontend code
Anything shipped to a browser—including HTML, CSS, JavaScript bundles, route names, and public configuration—can be inspected or downloaded. Do not attempt to store secrets in frontend code. Minification is not a security boundary.

### Supabase project URL and publishable/anon key
These are designed to be used by a client application and are not secrets. They identify the project but must not grant unrestricted access. RLS, grants, constraints, and Auth must protect the data.

### Protected resources
The service-role key, database password, private API keys, SMTP credentials, and other privileged secrets must remain only in trusted server-side or owner-controlled environments. Never include them in `VITE_*` variables or any variable bundled into browser code.

### Database access
A determined user can inspect network requests and call public APIs directly. Security must therefore be enforced by PostgreSQL RLS, grants, constraints, and trusted functions—not by hiding buttons, routes, IDs, or API calls.

## 3. Threats and controls

| Threat | Required controls |
|---|---|
| Anonymous visitor submits a rating | RLS denies writes unless an authenticated, active faculty profile and valid assignment exist |
| User edits request to impersonate faculty | Derive identity from `auth.uid()`; ignore/reject client-supplied evaluator identity |
| Faculty rates an unassigned subject | Database policy/function checks active subject assignment |
| User promotes self to faculty | No public sign-up/role-update path; only owner-controlled provisioning; deny profile/assignment writes to clients |
| Public reads private faculty details | Restrictive table grants/RLS; expose only safe aggregate view/function |
| Arbitrary score or malformed payload | Database `CHECK`, foreign keys, type validation, size limits, and safe error handling |
| Duplicate rating inflation | Unique `(question_id, faculty_user_id)` constraint; update existing evaluation according to the approved policy |
| SQL injection | Use parameterized Supabase client queries; never concatenate untrusted input into raw SQL; carefully review any RPC/function |
| Cross-site scripting (XSS) | Render content as text by default; sanitize any rich HTML/Markdown; avoid unsafe HTML injection; validate uploaded/remote content |
| Credential theft | Supabase Auth, secure reset/invite flow, strong unique passwords or supported magic links, no password storage by Syllabo |
| Brute-force login | Use Supabase Auth protections/rate limits and hosting/provider controls; avoid revealing whether an email exists |
| Secret leakage in Git/build/logs | `.env` ignored, `.env.example` placeholders only, secret scanning, bundle scan, rotate exposed secrets immediately |
| Dependency compromise | Keep dependencies minimal, review lockfile, update responsibly, run audit tools available in the environment |
| Denial of service / scraping | Provider limits, pagination, query limits, sensible indexes, hosting protections; monitor usage and errors |
| Unauthorized content editing | No public content writes; use trusted maintainer workflow and reviewed migrations/seed files |
| Misconfigured deployment | HTTPS, correct production environment, restrictive headers/CSP where compatible, no debug mode |
| Data loss | Backups/export plan, migration discipline, and periodic restore verification |

## 4. Supabase configuration requirements

1. Enable RLS on every table exposed through the Supabase Data API.
2. Explicitly review table grants and policies. Do not assume enabling RLS alone is sufficient if privileged grants or functions bypass it.
3. Default to deny. Add only the minimum policies needed.
4. Public/anonymous role may `SELECT` only intended published academic content and safe aggregate results.
5. Anonymous role must not insert, update, or delete content, faculty profiles, subject assignments, or evaluations.
6. Authenticated faculty may read only the information required for their dashboard and submit evaluations only for assigned subjects.
7. Faculty cannot edit `is_active`, faculty role, faculty code, user ID, or subject assignments.
8. Protect aggregate views/functions: use invoker security where suitable; if `SECURITY DEFINER` is necessary, set a fixed safe `search_path`, fully qualify objects, restrict `EXECUTE` grants, validate all inputs, and review it carefully.
9. Ensure public aggregate access does not expose individual evaluator IDs or permit trivial reconstruction of private records.
10. Use foreign keys, unique constraints, score checks, and indexes. Avoid trusting frontend validation.
11. Do not put the service-role key into the frontend or use it for ordinary client requests.
12. Review Supabase Auth redirect URLs and allowed origins; use only intended domains.
13. Use separate development and production projects where feasible.

## 5. Faculty identity and onboarding

- Supabase Auth is the authentication system; it owns credential handling.
- `faculty_profiles.user_id` links to `auth.users.id`.
- `faculty_code` is a unique internal identifier for administration/support, not a password and not sufficient to log in or submit ratings.
- The owner provisions accounts/invitations and assigns authorized subjects through the Supabase dashboard or a trusted server-side admin workflow.
- Send each faculty member their individual invitation or password-setup link via a trusted channel.
- Do not place usable faculty credentials in a public JSON file, frontend bundle, repository, or shared screenshot.
- Do not use a shared password across faculty members.
- Deactivate access promptly when a faculty member should no longer evaluate content.
- Keep service-role actions confined to the trusted owner environment or a protected server-side function.

## 6. Secret and environment management

- Commit `.env.example` with placeholder values only.
- Ignore `.env`, `.env.local`, credentials files, private keys, production dumps, and local backups in `.gitignore`.
- Frontend environment variables such as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are public configuration, not secrets.
- Never name a privileged secret with a frontend-exposed prefix or reference it in browser code.
- If a privileged key is accidentally committed or deployed, treat it as compromised: revoke/rotate it, inspect logs and access, and remove it from history where appropriate.
- Never paste production secrets into AI prompts, source comments, issue trackers, or this documentation.

## 7. Data minimization and privacy

- Store only data required for content delivery and faculty evaluation.
- Do not display faculty email, internal ID/code, or individual score history on public pages.
- Avoid collecting student personal data in V1.
- Do not add tracking or analytics that collect personal data without a clear need and appropriate disclosure.
- Avoid logging passwords, tokens, authorization headers, or private records.
- Define retention and backup practices before collecting real faculty data.

## 8. Frontend and API safety

- Validate route parameters and all submitted values.
- Use parameterized database queries and safe Supabase client methods.
- Do not build SQL by concatenating user input.
- Do not render user-controlled or database-sourced HTML unsafely.
- Use a Content Security Policy where supported and compatible with the chosen hosting/auth setup.
- Use HTTPS in production.
- Use generic authentication error messages and production-safe error handling.
- Avoid exposing detailed database errors to visitors; log only safe, redacted diagnostics.
- Add reasonable pagination and query limits to public reads.
- Keep dependencies limited and maintained.

## 9. Required security tests before release

Test using real roles and direct API requests, not just the UI:

- [ ] Anonymous user cannot insert/update/delete evaluations.
- [ ] Anonymous user cannot read faculty profiles, assignments, or individual evaluations.
- [ ] Authenticated non-faculty user cannot submit evaluations.
- [ ] Inactive faculty cannot submit evaluations.
- [ ] Faculty A cannot evaluate a subject assigned only to Faculty B.
- [ ] Client cannot impersonate another evaluator by changing a user/faculty ID in the request.
- [ ] Scores below 0 or above 8 are rejected by the database.
- [ ] Duplicate evaluations follow the unique/upsert rule.
- [ ] Faculty cannot alter their own role, active status, code, or subject assignments.
- [ ] Public aggregate returns only the intended average/count.
- [ ] Unpublished content is not returned to anonymous users.
- [ ] Service-role keys and database passwords are absent from Git, browser bundles, and client-visible logs.
- [ ] Expired sessions and sign-out revoke faculty UI access and writes.
- [ ] Production build and dependency checks complete successfully.

## 10. Incident response checklist

If a secret or access-control flaw is discovered:
1. Restrict or disable the affected endpoint/account/policy.
2. Rotate/revoke any exposed privileged key immediately.
3. Review logs and affected records where available.
4. Fix the root cause and add a regression test.
5. Re-test with anonymous, authorized, unauthorized, and inactive roles.
6. Document the incident and notify affected parties if necessary.

## 11. Release gate

Do not deploy with known critical/high authorization issues, exposed privileged secrets, missing RLS on exposed tables, public write policies, or untested faculty permissions. Do not describe the system as impossible to hack; describe the controls implemented and the tests that passed.
