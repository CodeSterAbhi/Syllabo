import React from 'react';
import { ArrowLeft, BookOpen, ShieldCheck, AlertCircle, FileText, Lock, RefreshCw, GraduationCap } from 'lucide-react';

interface TermsPageProps {
  onBackToHome: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBackToHome }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Top Header / Back Button */}
      <div className="flex items-center justify-between border-b border-stone-200/80 pb-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-stone-200 text-xs font-bold text-slate-700 hover:bg-stone-50 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Curriculum</span>
        </button>

        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Effective as of 2026 Academic Term
        </span>
      </div>

      {/* Main Title Hero */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-syllabo-100 text-syllabo-900 text-xs font-bold">
          <FileText className="w-3.5 h-3.5 text-syllabo-900" />
          <span>Platform Policies & Student Guidance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Terms & Conditions of Use
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
          Please review these terms carefully. By accessing or utilizing the Syllabo examination preparation platform,
          you acknowledge and agree to abide by the principles and conditions outlined below.
        </p>
      </div>

      {/* Core Terms Sections */}
      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        {/* Section 1: Purpose of Syllabo */}
        <section className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-syllabo-900 font-bold text-base">
            <GraduationCap className="w-5 h-5" />
            <h2>1. Purpose of Syllabo</h2>
          </div>
          <p>
            Syllabo is a specialized academic preparation and learning platform engineered to help university students
            systematically study course subjects, review worked numerical problems, practice multiple-choice questions,
            and prepare for semester examinations through structured, unit-by-unit study modules.
          </p>
        </section>

        {/* Section 2: Independent Student Project Disclaimer */}
        <section className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-amber-950 font-bold text-base">
            <AlertCircle className="w-5 h-5 text-amber-700" />
            <h2>2. Independent Academic Project Disclaimer</h2>
          </div>
          <p className="text-amber-900">
            <strong>Syllabo is an independent student academic project</strong> designed to facilitate structured university
            exam preparation. Unless explicitly stated otherwise in writing, Syllabo is not an official branch, administrative portal,
            or legally endorsed representative of Quantum University or any examination board.
          </p>
          <p className="text-amber-900 text-xs leading-normal">
            All course titles, subject codes, and curriculum references are cited strictly under fair academic reference
            to align learning outcomes with prescribed syllabi.
          </p>
        </section>

        {/* Section 3: Educational and Informational Use */}
        <section className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-syllabo-900 font-bold text-base">
            <BookOpen className="w-5 h-5" />
            <h2>3. Educational and Informational Use</h2>
          </div>
          <p>
            All content available on Syllabo—including theory question solutions, worked step-by-step numerical examples,
            formula summaries, conceptual diagrams, and Hinglish concept breakdowns—is provided solely for personal educational,
            self-study, and non-commercial informational purposes.
          </p>
        </section>

        {/* Section 4: No Guarantee of Examination Questions or Results */}
        <section className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h2>4. No Examination Guarantee</h2>
          </div>
          <p>
            The academic materials, sample university-format questions, and estimated mark allocations reflect standard curriculum patterns.
            However, <strong>Syllabo makes no warranty or representation that identical or similar questions will appear
            in actual university or institutional examinations</strong>.
          </p>
          <p className="text-xs text-slate-500">
            Academic outcomes and grades depend on individual student preparation, institutional grading standards, and university criteria.
          </p>
        </section>

        {/* Section 5: Accuracy & Student Verification Responsibility */}
        <section className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <RefreshCw className="w-5 h-5 text-purple-700" />
            <h2>5. Content Accuracy & Verification</h2>
          </div>
          <p>
            While diligent efforts are made by student contributors and academic faculty to verify answers, numerical calculations,
            and mathematical proofs, errors or curriculum updates may occasionally occur.
          </p>
          <p>
            Students are strongly advised to cross-verify vital formulas, definitions, and examination schedules with official
            prescribed textbooks, professor lecture notes, and authoritative university departmental notices.
          </p>
        </section>

        {/* Section 6: Responsible Usage */}
        <section className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Lock className="w-5 h-5 text-slate-700" />
            <h2>6. Responsible Usage of the Platform</h2>
          </div>
          <p>
            Users agree to use Syllabo ethically and responsibly. Prohibited behaviors include:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-slate-600">
            <li>Attempting unauthorized access to administrative controls or faculty evaluation interfaces.</li>
            <li>Interfering with server infrastructure, security policies, or database operations.</li>
            <li>Automated scraping, bulk extraction, or disruptive denial of service attacks.</li>
            <li>Submitting malicious or falsified academic submissions.</li>
          </ul>
        </section>

        {/* Section 7: Intellectual Property & Content Rights */}
        <section className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <FileText className="w-5 h-5 text-blue-700" />
            <h2>7. Content Ownership & Restrictions on Redistribution</h2>
          </div>
          <p>
            Curriculum content, official course outlines, and syllabus trademarks remain the intellectual property of their respective
            educational institutions. The application software, presentation structure, and student interface are created by the Syllabo project.
          </p>
          <p className="text-xs text-slate-500">
            You may view, read, and use content for personal preparation. Commercial resale, systematic mirroring, or bulk redistribution
            without prior authorization is prohibited.
          </p>
        </section>

        {/* Section 8: Platform Availability */}
        <section className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <RefreshCw className="w-5 h-5 text-stone-600" />
            <h2>8. Platform Availability & Maintenance</h2>
          </div>
          <p>
            Syllabo is maintained as an active learning project. While we strive for continuous availability, uninterrupted uptime
            is not guaranteed. The platform may undergo periodic maintenance, server updates, feature upgrades, or technical adjustments.
          </p>
        </section>

        {/* Section 9: Changes to Terms */}
        <section className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <RefreshCw className="w-5 h-5 text-emerald-600" />
            <h2>9. Revisions & Updates to Terms</h2>
          </div>
          <p>
            These terms may be revised periodically to reflect enhancements, new academic tools, or updated regulatory guidelines.
            Continued usage of Syllabo following revisions signifies acceptance of the updated terms.
          </p>
        </section>

        {/* Section 10: Feedback & Clarifications */}
        <section className="p-6 rounded-3xl bg-stone-50 border border-stone-200 shadow-2xs space-y-2 text-xs text-slate-600">
          <h2 className="font-bold text-slate-800 text-sm">10. Inquiries and Academic Clarifications</h2>
          <p>
            For questions regarding academic solutions, typographical corrections, or constructive suggestions regarding Syllabo,
            please connect with the project developer or your designated department faculty mentors.
          </p>
        </section>
      </div>

      {/* Footer Return Action */}
      <div className="text-center pt-4">
        <button
          onClick={onBackToHome}
          className="px-6 py-3 rounded-2xl bg-syllabo-900 text-white font-bold text-xs hover:bg-syllabo-800 transition-all shadow-sm"
        >
          Return to Course Catalog
        </button>
      </div>
    </div>
  );
};

export default TermsPage;
