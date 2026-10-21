import React from 'react';
import { LogIn, ShieldCheck, Database, UserCheck, Sparkles } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { FacultyProfile } from '../../types';

interface NavbarProps {
  onFacultyClick: () => void;
  onAdminClick: () => void;
  onHomeClick: () => void;
  facultyProfile: FacultyProfile | null;
  isAdmin: boolean;
  currentRole: 'student' | 'faculty' | 'admin';
}

export const Navbar: React.FC<NavbarProps> = ({
  onFacultyClick,
  onAdminClick,
  onHomeClick,
  facultyProfile,
  isAdmin,
  currentRole,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-surface-canvas/90 backdrop-blur-md border-b border-stone-200/60 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand identity */}
        <button
          onClick={onHomeClick}
          className="flex items-center gap-3.5 group focus:outline-none text-left"
        >
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-sm ring-1 ring-purple-900/10 group-hover:shadow-md transition-all">
            <img
              src="/logo.png"
              alt="Syllabo Logo"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-syllabo-900 transition-colors">
                Syllabo
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-syllabo-100 text-syllabo-900 border border-syllabo-200/80">
                Quantum Univ
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Exam-Ready Syllabus Hub
            </p>
          </div>
        </button>

        {/* Center / Status */}
        <div className="hidden md:flex items-center gap-2">
          {isSupabaseConfigured ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Supabase Connected</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200"
              title="Add your VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY to .env to connect live project"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Preview Mode (Sample Data)</span>
            </div>
          )}
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-3">
          {/* Admin toggle if authorized */}
          {isAdmin && (
            <button
              onClick={onAdminClick}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition-all shadow-sm ${
                currentRole === 'admin'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Faculty Login / Portal action */}
          <button
            onClick={onFacultyClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all shadow-sm ${
              currentRole === 'faculty'
                ? 'bg-syllabo-900 text-white shadow-purple-900/20'
                : 'bg-white text-slate-800 border border-stone-200 hover:bg-stone-50 hover:border-stone-300'
            }`}
          >
            {facultyProfile ? (
              <>
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline truncate max-w-[140px]">
                  {facultyProfile.display_name.split(' ')[0]} (Faculty)
                </span>
                <span className="sm:hidden">Faculty</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-syllabo-800" />
                <span>Faculty Login</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
