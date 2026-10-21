# Syllabo — Product Requirements Document (PRD)

**Product name:** Syllabo  
**Initial audience:** Quantum University students and authorized faculty  
**Document status:** Implementation brief for Antigravity  
**Version:** 1.0

## 1. Product vision

Syllabo is a focused, syllabus-aligned exam-preparation website for Quantum University. It helps students prepare efficiently using a small set of comprehensive questions, worked numerical problems where relevant, MCQs, and optional simple Hinglish explanations. Faculty members can evaluate written answers so students can see an aggregate indication of how exam-ready an answer is.

**Core promise:** less scattered study material, clearer syllabus coverage, and faculty-informed answer quality.

Syllabo is an independent student project. Do not imply that Quantum University officially endorses it unless the owner later confirms formal authorization.

## 2. Goals

1. Let students navigate from program to semester, subject, and unit without creating an account.
2. Present unit content in three clearly separated sections: Theory, Numericals, and MCQs.
3. Make content easy for the owner and trusted collaborators to add or edit later.
4. Let only authenticated, explicitly authorized faculty submit evaluations.
5. Show students the average faculty score and number of evaluations for a question when available.
6. Deliver a polished, responsive interface guided by `../reference/ui.png` and branded with `../reference/logo.png`.
7. Keep the first release manageable, maintainable, and secure by default.

## 3. Non-goals for V1

- Supporting every university or institution.
- Student accounts, student profiles, social features, comments, or student-submitted ratings.
- AI-generated answers at runtime.
- Payments, subscriptions, advertisements, or analytics requiring personal tracking.
- A complex admin CMS unless the owner explicitly approves it later.
- Guaranteeing marks in an actual examination.
- Claiming that faculty ratings are official university grades.

## 4. Users and permissions

### Student / visitor
- No login required.
- Can browse published programs, semesters, subjects, units, and content.
- Can view available aggregate faculty evaluations.
- Cannot create or edit content, submit faculty ratings, or access faculty-only data.

### Authorized faculty
- Must authenticate using Supabase Auth.
- Must have an active faculty profile and explicit authorization for the relevant subject(s).
- Can view the faculty evaluation interface and submit permitted evaluations.
- Cannot grant themselves faculty status, change their own permissions, or evaluate subjects outside their assignment.
- Cannot view other faculty members' private credentials or authentication secrets.

### Project owner / maintainer
- Manages content, database configuration, faculty access, and deployment through controlled administrative workflows.
- Do not build a public self-service faculty registration flow in V1.
- Do not put service-role credentials or other privileged secrets in the browser.

## 5. Information architecture and student journey

`Home → Program/Course → Semester → Subject → Unit → Unit Preparation Hub → Theory | Numericals | MCQs`

### Home page
- Show Syllabo identity and a concise exam-preparation-oriented hook.
- Use the provided logo and follow the UI reference's visual language.
- Provide a visible **Faculty Login** action in the top-right area.
- Do not require student login.
- Include loading, empty, and error states.

### Program, semester, subject, unit selection
- Programs/courses are configurable, not hard-coded throughout components.
- Semester options depend on the selected program where applicable.
- Subjects are filtered by program and semester.
- Units are shown for the selected subject.
- Do not show irrelevant or empty navigation items.

### Unit Preparation Hub
Show three clear destinations:
1. **Theory**
2. **Numericals**
3. **MCQs**

If numericals do not apply, show a clear message such as **“Numericals are not applicable for this unit.”** Do not render a broken or blank page.

## 6. Content requirements

### 6.1 Theory
- Exactly **5 comprehensive questions per published unit** for V1.
- Together, the five questions should cover the unit syllabus as comprehensively as practical.
- Some overlap is acceptable where a topic naturally belongs in more than one answer.
- Show the topics covered for each question.
- Answers should normally be suitable for an 8-mark university exam response and target fewer than 300 words. Treat this as an editorial target, not a hard UI truncation rule.
- Answer structure must be flexible by subject. Common optional sections are:
  - Introduction
  - Main explanation / structured points
  - Diagram, image, formula, or example when useful
  - Conclusion
- Do not force every answer into identical headings if that makes the answer wrong for the subject.
- Support diagrams and images with accessible alternative text and responsive sizing.
- Provide a visible faculty average and evaluation count when data exists. If there are no evaluations, show “Not yet evaluated” rather than a misleading zero.

### 6.2 Hinglish explanation
- An optional, collapsed-by-default section named **“Explain in Simple Hinglish”** may appear under a written answer.
- Target approximately 50–60 words.
- Write Hindi in Roman script mixed naturally with English technical terms.
- Explain the concept to support understanding; it must not replace the formal English answer.
- Do not force an explanation to exist when content has not been authored yet. Hide the section or show an appropriate unavailable state.

### 6.3 Numericals
- Provide a separate Numericals section when relevant.
- Support a flexible worked-solution layout with optional fields:
  - Problem statement
  - Given
  - Required
  - Formula
  - Step-by-step solution
  - Final answer
  - Diagram or table
  - Optional Hinglish explanation
- Not every numerical requires every field.
- If no numerical problems are available or the topic has none, show an explicit empty/not-applicable state.
- Faculty evaluation of numericals is optional for V1 unless the owner explicitly enables it. The required evaluation workflow is primarily for written theory answers.

### 6.4 MCQs
- Target **15–20 MCQs per unit** when content is ready.
- Each MCQ should support a question, usually four options (A–D), and a correct answer.
- Reveal the correct answer clearly. Do not reveal it in a way that makes the question unreadable before the student attempts it if a quiz interaction is implemented.
- Interactive scoring and quiz history are optional future enhancements, not required for V1.
- MCQs do not need faculty ratings in V1.

### 6.5 Content authoring
- Do not invent or mass-generate academic content as part of the initial scaffold.
- Build reusable content models/components and clearly documented sample placeholders.
- Make it straightforward for the owner and trusted collaborators to add/edit questions, answers, topics, diagrams, Hinglish notes, numerical solutions, and MCQs.
- Prefer typed/data-validated content structures or database records over scattering academic text across UI components.
- Content must be marked as draft/published (or an equivalent explicit publication state) so unfinished content is not accidentally shown as final.
- Preserve a clear relationship between content and program/semester/subject/unit.

## 7. Faculty evaluation requirements

- Faculty login is accessible from the home page.
- No public faculty sign-up.
- After authentication, faculty see only subjects for which they have explicit authorization.
- A faculty member can assign a score from **0 to 8** to an eligible written answer, with clear labels and validation.
- Store the evaluation as a separate database record linked to the question/answer and authenticated faculty user.
- Recommended V1 rule: one current evaluation per faculty member per question; a new submission updates that faculty member's existing score rather than creating unlimited duplicate ratings.
- Display aggregate average and evaluation count on the student page.
- Do not expose individual faculty identity, email, internal faculty ID, or private profile information on public pages.
- Do not let a client submit an arbitrary faculty ID to impersonate a different faculty member. The database must derive/verify the faculty identity from the authenticated session and enforce authorization server-side through PostgreSQL Row Level Security (RLS) and, where needed, trusted database functions.
- Reject out-of-range scores and unauthorized subject/question combinations at the database boundary, not only in UI validation.

## 8. Design and accessibility

- Use `../reference/logo.png` as the brand reference. Preserve its proportions and do not stretch it.
- Use `../reference/ui.png` as the visual direction for layout, whitespace, rounded cards, restrained pastel surfaces, clear typography, and dashboard-like composition. Adapt it to an academic study product rather than copying unrelated course-marketplace text or profile data.
- Do not copy the sample's placeholder name, course names, metrics, or unrelated interface labels.
- Build responsive layouts for mobile, tablet, and desktop.
- Use semantic headings, keyboard-accessible controls, visible focus states, adequate contrast, descriptive button labels, and useful empty/loading/error states.
- Prefer readable academic content over decorative animations.
- Avoid horizontal overflow, clipped answers, fixed-height answer cards, or text truncation that hides required content.
- Use diagrams and images responsively.

## 9. Functional acceptance criteria

- [ ] Visitor can browse the full hierarchy without logging in.
- [ ] Subject choices are correctly filtered by program and semester.
- [ ] Every unit has a Preparation Hub with Theory, Numericals, and MCQs destinations.
- [ ] Numericals show a proper empty/not-applicable state when relevant.
- [ ] Theory supports exactly five questions per published unit and displays topics covered.
- [ ] Answer sections adapt to variable lengths and optional diagrams.
- [ ] Hinglish content is optional and collapsed by default.
- [ ] MCQs support options and answer reveal.
- [ ] Faculty login is available, with no public sign-up.
- [ ] Faculty can evaluate only assigned subjects.
- [ ] Scores are validated to the 0–8 range by the database.
- [ ] Public pages show only aggregate rating and count, not faculty identities.
- [ ] RLS and database policies protect all private and write operations.
- [ ] No privileged Supabase secret is included in client-side code or committed files.
- [ ] Loading, empty, unauthorized, and error states are usable and non-leaky.
- [ ] Site is responsive and visually informed by the supplied reference images.
- [ ] README/setup instructions explain environment variables, database migrations, and deployment.

## 10. Success measures for the first release

- A student can reach a chosen unit in a few intuitive steps.
- Content is readable and usable on a phone.
- The owner can add content without rewriting layout components.
- An unauthorized visitor cannot submit evaluations or retrieve private faculty data.
- Authorized faculty can submit an evaluation and the aggregate updates correctly.
- The project can be installed from a clean checkout using documented steps.

## 11. Open decisions / safe defaults

- Initial programs, semester mapping, and subject data will be supplied by the owner; do not invent official curriculum data.
- Numerical rating is disabled unless explicitly enabled.
- No admin dashboard is required in V1; content may be maintained through approved data files or controlled Supabase tooling, with a documented safe workflow.
- Use a sensible modern React-based stack compatible with the Antigravity environment if the repository is empty. Explain the selected stack and avoid adding unnecessary dependencies.
