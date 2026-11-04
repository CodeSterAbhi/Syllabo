import React from 'react';
import { Home, BookOpen, GraduationCap, CheckCircle2, Award, Settings } from 'lucide-react';

interface SidebarProps {
  currentView: 'home' | 'subject' | 'unit' | 'faculty' | 'admin' | 'terms';
  onNavigateHome: () => void;
  onNavigateFaculty: () => void;
  onNavigateAdmin: () => void;
  isAdmin: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigateHome,
  onNavigateFaculty,
  onNavigateAdmin,
  isAdmin,
}) => {
  const isHomeActive = currentView === 'home';
  const isAcademicActive = currentView === 'subject' || currentView === 'unit';
  const isFacultyActive = currentView === 'faculty';
  const isAdminActive = currentView === 'admin';

  return (
    <aside className="hidden lg:flex flex-col items-center py-6 px-3 bg-[#F5EFEB] rounded-3xl my-4 ml-4 w-20 shrink-0 border border-stone-200/50 shadow-sm justify-between min-h-[calc(100vh-2.5rem)] sticky top-4">
      {/* Top brand icon */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={onNavigateHome}
          className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center p-2 ring-1 ring-black/5 hover:scale-105 transition-all"
          title="Syllabo Home"
        >
          <img src="/logo.png" alt="Syllabo" className="w-full h-full object-contain" />
        </button>

        {/* Primary nav pills */}
        <nav className="flex flex-col items-center gap-4 mt-2">
          {/* Home */}
          <button
            onClick={onNavigateHome}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isHomeActive
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
            title="Home - Academic Programs"
          >
            <Home className="w-5 h-5" />
          </button>

          {/* Academic Courses / Subjects */}
          <button
            onClick={onNavigateHome}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isAcademicActive
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
            title="Curriculum & Subjects"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          {/* Degree Programs */}
          <button
            onClick={onNavigateHome}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-all"
            title="Quantum University Programs"
          >
            <GraduationCap className="w-5 h-5" />
          </button>

          {/* Faculty Evaluation Workbench */}
          <button
            onClick={onNavigateFaculty}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isFacultyActive
                ? 'bg-syllabo-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-white hover:text-syllabo-900'
            }`}
            title="Faculty Evaluation Portal"
          >
            <Award className="w-5 h-5" />
          </button>
        </nav>
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-3">
        {isAdmin && (
          <button
            onClick={onNavigateAdmin}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isAdminActive
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
            title="Admin Management"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}

        <div className="w-10 h-10 rounded-full bg-syllabo-100 border border-syllabo-200 flex items-center justify-center text-syllabo-900 font-bold text-xs" title="Quantum University Verified">
          QU
        </div>
      </div>
    </aside>
  );
};
