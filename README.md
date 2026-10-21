# Syllabo — University Exam Preparation Platform

**Syllabo** is a focused, syllabus-aligned exam-preparation website built for **Quantum University** students and authorized faculty. It streamlines exam readiness through a concise student journey, unit-by-unit syllabus coverage, exactly 5 comprehensive theory answers per unit, worked numerical problems where applicable, practice MCQs, and faculty-verified answer scoring out of 8.

---

## 🚀 Key Features

- **No Student Login Required:** Students browse programs, semesters, subjects, and units directly without creating accounts.
- **Unit Preparation Hub:** Three clearly separated destinations for every syllabus unit:
  - **Theory:** Exactly 5 comprehensive questions covering unit topics, structured 8-mark university exam format (Introduction, Main Explanation, Diagram/Formula reference, Conclusion), and optional collapsed **"Explain in Simple Hinglish"** summaries.
  - **Numericals:** Worked step-by-step solutions with Given, Required, Formula, Steps, and Final Answer. Explicitly handles units where numericals are not applicable.
  - **MCQs:** 15–20 multiple-choice questions with interactive option selection, real-time feedback, and expandable answer explanations.
- **Faculty Evaluation System:** Authorized university faculty can evaluate written theory answers on a **0.0 to 8.0 marks** scale.
- **Privacy-Preserving Aggregate Ratings:** Students view average faculty score and evaluation count (`★ 7.5 / 8 (4 faculty evaluations)`); individual faculty identities, codes, and individual score rows are never exposed.
- **Administrator Control Center:** Administrative workflows to manage curriculum structure, question banks, and faculty subject authorizations.
- **Security-First Architecture:** Database-enforced Row Level Security (RLS) on all tables, secure `SECURITY DEFINER` functions, and zero privileged secrets bundled into the client.

---

## 🎨 Visual System & Branding

- **Brand Emblem:** Integrated from `reference/logo.png` featuring the Quantum University royal purple crest, laurel wreath, and academic shield.
- **Dashboard Aesthetics:** Informed by `reference/ui.png` with generous whitespace, rounded card surfaces (`rounded-3xl`), soft pastel surfaces (Coral `#FCE8E6`, Peach `#FDF0DD`, Lilac `#EAE8FC`, Mint `#E2F6EE`), and crisp sans-serif typography (Plus Jakarta Sans).

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, PostCSS, Lucide React Icons
- **Backend / DB:** Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS)
- **Client Library:** `@supabase/supabase-js`

---

## 🏁 Quick Start & Development

### 1. Prerequisites
- Node.js (v18 or higher; tested on v22.15)
- npm (v9 or higher)

### 2. Installation
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. The application runs immediately in preview mode with built-in development sample data.

### 4. Build for Production
```bash
npm run build
```
Generates a optimized, minified production build in the `dist/` folder.

---

## 🔐 Supabase Configuration & Migrations

### 1. Environment Variables
Create a `.env` file in the project root (copied from `.env.example`):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-anon-key
```
> [!NOTE]
> The publishable/anon key is intended for browser use. **Never** put your Supabase `service_role` key or database password into client `.env` files or frontend code.

### 2. Database Migrations
Version-controlled migrations are organized in `supabase/migrations/`:
1. `20261021000001_core_schema.sql` — Creates the 9 core tables (`courses`, `subjects`, `units`, `theory_questions`, `numericals`, `mcqs`, `faculty_profiles`, `faculty_subject_assignments`, `evaluations`) plus `app_admins` with integrity constraints and indexes.
2. `20261021000002_functions.sql` — Creates `is_app_admin()` and the aggregate rating function `get_question_rating(uuid)`.
3. `20261021000003_security_policies.sql` — Enables RLS on all 10 tables and establishes least-privilege policies for public reads, faculty reads/evaluations, and admin management.
4. `20261021000004_seed_dev_sample.sql` — *(Optional)* Sample preview curriculum for local testing.

---

## 👨‍🏫 Faculty Onboarding Procedure

To grant a faculty member evaluation privileges:

1. **Create Supabase Auth User:**
   In Supabase Dashboard → Authentication → Users, invite or create the faculty user with their institutional email address.
2. **Create Faculty Profile:**
   In Supabase SQL Editor:
   ```sql
   INSERT INTO public.faculty_profiles (user_id, faculty_code, display_name, is_active)
   VALUES ('<AUTH-USER-UUID>', 'FAC-QTU-001', 'Dr. R. K. Sharma (Dept of CSE)', true);
   ```
3. **Assign Subject(s):**
   ```sql
   INSERT INTO public.faculty_subject_assignments (faculty_id, subject_id)
   VALUES ('<FACULTY-PROFILE-UUID>', '<SUBJECT-UUID>');
   ```
4. **Faculty Login:**
   The faculty member clicks **Faculty Login** in the top-right of Syllabo and signs in with their Supabase Auth credentials. Database RLS automatically restricts their evaluation workbench to assigned subjects.

---

## 🛡️ Administrator Setup

To designate an administrator:
```sql
INSERT INTO public.app_admins (user_id)
VALUES ('<YOUR-AUTH-USER-UUID>');
```
Admins will automatically see the **Admin Control Center** button in the navigation header.

---

## 📁 Repository Structure

```
Syllabo/
├── docs/                   # Architecture, PRD, Security, Memory, Tasks
├── public/
│   └── logo.png            # Quantum University Syllabo logo
├── reference/
│   ├── logo.png            # Original brand reference
│   └── ui.png              # UI visual reference
├── src/
│   ├── components/
│   │   ├── admin/          # Admin Control Center components
│   │   ├── common/         # Breadcrumbs, RatingDisplay
│   │   ├── faculty/        # Faculty Portal & Evaluation Workbench
│   │   ├── layout/         # Navbar, Sidebar
│   │   └── student/        # HomeView, SubjectDetailView, UnitHubView
│   ├── lib/
│   │   ├── mockData.ts     # Sample development curriculum
│   │   └── supabase.ts     # Supabase client wrapper with fallback
│   ├── services/
│   │   └── api.ts          # Data service layer
│   ├── types/
│   │   └── index.ts        # TypeScript data domain interfaces
│   ├── App.tsx             # Main coordinator component
│   ├── index.css           # Tailwind CSS directives
│   └── main.tsx            # Application entry point
├── supabase/
│   └── migrations/         # Idempotent SQL migrations
├── .env.example            # Environment variables template
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 📜 Disclaimer

Syllabo is an independent student academic project created for Quantum University students. It does not imply official university endorsement. All curriculum specifications and syllabus rights belong to Quantum University.
