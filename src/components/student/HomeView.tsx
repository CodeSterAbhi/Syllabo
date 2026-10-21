import React, { useState } from 'react';
import { BookOpen, Star, Sparkles, HelpCircle, Layers, CheckCircle2, ChevronRight, Calculator } from 'lucide-react';
import { Course, Subject } from '../../types';

interface HomeViewProps {
  courses: Course[];
  subjects: Subject[];
  onSelectSubject: (subject: Subject) => void;
  onSelectProgram: (course: Course) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  courses,
  subjects,
  onSelectSubject,
  onSelectProgram,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter subjects based on program, semester, and search query
  const filteredSubjects = subjects.filter(subject => {
    if (selectedCourseId !== 'all' && subject.course_id !== selectedCourseId) {
      return false;
    }
    if (selectedSemester !== 'all' && subject.semester !== selectedSemester) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = subject.name.toLowerCase().includes(q);
      const matchCode = subject.code.toLowerCase().includes(q);
      return matchName || matchCode;
    }
    return true;
  });

  // Pastel card styling cycler inspired by reference/ui.png
  const cardStyles = [
    {
      bg: 'bg-[#FCE8E6]',
      border: 'border-[#F8D2CF]',
      badgeBg: 'bg-[#F9D6D3]',
      accentColor: 'text-rose-950',
      badgeText: 'text-rose-800',
    },
    {
      bg: 'bg-[#FDF0DD]',
      border: 'border-[#F9E2C4]',
      badgeBg: 'bg-[#F9E0C1]',
      accentColor: 'text-amber-950',
      badgeText: 'text-amber-900',
    },
    {
      bg: 'bg-[#EAE8FC]',
      border: 'border-[#D9D5FB]',
      badgeBg: 'bg-[#DAD6FA]',
      accentColor: 'text-indigo-950',
      badgeText: 'text-indigo-900',
    },
    {
      bg: 'bg-[#E2F6EE]',
      border: 'border-[#C8EFE0]',
      badgeBg: 'bg-[#CAF0E2]',
      accentColor: 'text-emerald-950',
      badgeText: 'text-emerald-900',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Section inspired by reference/ui.png */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-syllabo-100 text-syllabo-900 text-xs font-semibold mb-3 border border-syllabo-200">
            <Sparkles className="w-3.5 h-3.5 text-syllabo-700" />
            <span>Quantum University Exam Preparation</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Master your syllabus, <br />
            <span className="text-syllabo-900">one unit at a time</span>
          </h1>
          <p className="mt-3 text-slate-600 max-w-xl text-base sm:text-lg">
            Syllabus-aligned preparation with 5 comprehensive theory answers, worked numericals, MCQs, and faculty-verified ratings.
          </p>
        </div>

        {/* Quick search input */}
        <div className="w-full md:w-72">
          <label htmlFor="search-subject" className="sr-only">Search Subject</label>
          <input
            id="search-subject"
            type="text"
            placeholder="Search subject code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-syllabo-800 text-sm shadow-sm"
          />
        </div>
      </div>

      {/* Program / Course Filter Pills inspired by reference/ui.png */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Programs & Courses
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCourseId('all')}
            className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap ${
              selectedCourseId === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-stone-200 hover:border-stone-300'
            }`}
          >
            All Programs
          </button>

          {courses.map(course => (
            <button
              key={course.id}
              onClick={() => setSelectedCourseId(course.id)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCourseId === course.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-stone-200 hover:border-stone-300'
              }`}
            >
              {course.code}
            </button>
          ))}
        </div>
      </div>

      {/* Semester Filter Pills */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Filter by Semester
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedSemester('all')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              selectedSemester === 'all'
                ? 'bg-syllabo-900 text-white'
                : 'bg-white/80 text-slate-600 border border-stone-200/80 hover:bg-stone-50'
            }`}
          >
            All Semesters
          </button>

          {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedSemester === sem
                  ? 'bg-syllabo-900 text-white'
                  : 'bg-white/80 text-slate-600 border border-stone-200/80 hover:bg-stone-50'
              }`}
            >
              Semester {sem}
            </button>
          ))}
        </div>
      </div>

      {/* Academic Highlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-3xl bg-white border border-stone-200/80 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-syllabo-900 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-syllabo-800" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">5 Comprehensive Questions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly covers the unit syllabus designed for 8-mark university questions.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Step-by-Step Numericals</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Worked problem solutions with formulas, given data, and final answers.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Faculty Evaluations</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized university faculty ratings out of 8 with aggregate score badges.
            </p>
          </div>
        </div>
      </div>

      {/* Subjects Grid with Soft Pastel aesthetic inspired by reference/ui.png */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {selectedCourseId === 'all' ? 'All Subjects' : 'Curriculum Subjects'}
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredSubjects.length} {filteredSubjects.length === 1 ? 'subject' : 'subjects'}
          </span>
        </div>

        {filteredSubjects.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-stone-200">
            <Layers className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No subjects found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              No subjects currently match your filter criteria. Try selecting a different program or semester.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSubjects.map((subject, index) => {
              const style = cardStyles[index % cardStyles.length];
              return (
                <div
                  key={subject.id}
                  onClick={() => onSelectSubject(subject)}
                  className={`p-6 rounded-3xl ${style.bg} border ${style.border} transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[190px] group`}
                >
                  <div>
                    {/* Top row: tags and rating */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${style.badgeBg} ${style.badgeText}`}>
                          {subject.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          Semester {subject.semester}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-white/70 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>Faculty Scored</span>
                      </div>
                    </div>

                    {/* Subject Title */}
                    <h3 className={`text-xl font-bold ${style.accentColor} group-hover:underline transition-all line-clamp-2 leading-snug`}>
                      {subject.name}
                    </h3>

                    {/* Description */}
                    {subject.description && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                        {subject.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom row: CTA */}
                  <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Units & Syllabus</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:translate-x-1 transition-transform">
                      <span>Explore Units</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
