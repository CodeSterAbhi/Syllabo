import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { Course, Subject, Unit, TheoryQuestion } from '../../types';

interface AdminPortalProps {
  onBackToStudent: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToStudent }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'questions' | 'faculty'>('curriculum');

  // Curriculum data
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // Selection state
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  // Form states
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');

  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectSem, setNewSubjectSem] = useState(3);

  const [newUnitNumber, setNewUnitNumber] = useState(1);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitNumericals, setNewUnitNumericals] = useState(true);

  // Status message
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkAdmin();
    loadCurriculum();
  }, []);

  const checkAdmin = async () => {
    const adminStatus = await api.checkIsAdmin();
    setIsAdmin(adminStatus);
  };

  const loadCurriculum = async () => {
    const courseList = await api.getCourses();
    setCourses(courseList);
    if (courseList.length > 0) {
      setSelectedCourseId(courseList[0].id);
      loadSubjectsForCourse(courseList[0].id);
    }
  };

  const loadSubjectsForCourse = async (cId: string) => {
    const subList = await api.getSubjects(cId);
    setSubjects(subList);
    if (subList.length > 0) {
      setSelectedSubjectId(subList[0].id);
      loadUnitsForSubject(subList[0].id);
    } else {
      setSelectedSubjectId('');
      setUnits([]);
    }
  };

  const loadUnitsForSubject = async (sId: string) => {
    const uList = await api.getUnits(sId);
    setUnits(uList);
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName) return;

    const res = await api.saveCourse({
      code: newCourseCode.toUpperCase(),
      name: newCourseName,
      is_published: true,
    });

    if (res.success) {
      setStatusMsg({ type: 'success', text: `Course ${newCourseCode} created successfully!` });
      setNewCourseCode('');
      setNewCourseName('');
      loadCurriculum();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to create course.' });
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !newSubjectCode || !newSubjectName) return;

    const res = await api.saveSubject({
      course_id: selectedCourseId,
      semester: Number(newSubjectSem),
      code: newSubjectCode.toUpperCase(),
      name: newSubjectName,
      is_published: true,
    });

    if (res.success) {
      setStatusMsg({ type: 'success', text: `Subject ${newSubjectCode} created successfully!` });
      setNewSubjectCode('');
      setNewSubjectName('');
      loadSubjectsForCourse(selectedCourseId);
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to create subject.' });
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !newUnitTitle) return;

    const res = await api.saveUnit({
      subject_id: selectedSubjectId,
      unit_number: Number(newUnitNumber),
      title: newUnitTitle,
      numericals_applicable: newUnitNumericals,
      is_published: true,
    });

    if (res.success) {
      setStatusMsg({ type: 'success', text: `Unit ${newUnitNumber} created successfully!` });
      setNewUnitTitle('');
      setNewUnitNumber(prev => Math.min(prev + 1, 10));
      loadUnitsForSubject(selectedSubjectId);
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to create unit.' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Admin Control Center</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                app_admins Authorized
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage published programs, subjects, units, question banks, and faculty authorizations.
            </p>
          </div>
        </div>

        <button
          onClick={onBackToStudent}
          className="px-4 py-2 rounded-2xl text-xs font-semibold bg-stone-100 text-slate-700 hover:bg-stone-200 transition-colors self-start sm:self-auto"
        >
          ← Return to Student View
        </button>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'curriculum'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-stone-200 text-slate-700 hover:bg-stone-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Curriculum Structure</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'questions'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-stone-200 text-slate-700 hover:bg-stone-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Theory Question Standards</span>
        </button>

        <button
          onClick={() => setActiveTab('faculty')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'faculty'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-stone-200 text-slate-700 hover:bg-stone-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Faculty Onboarding</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: CURRICULUM MANAGEMENT                                   */}
      {/* ============================================================== */}
      {activeTab === 'curriculum' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Courses */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>1. Degree Programs</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-normal">
                {courses.length}
              </span>
            </h2>

            <form onSubmit={handleAddCourse} className="space-y-2">
              <input
                type="text"
                placeholder="Code (e.g. BTECH-IT)"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-1 focus:ring-syllabo-800"
              />
              <input
                type="text"
                placeholder="Program Full Name"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-1 focus:ring-syllabo-800"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-syllabo-900 text-white text-xs font-semibold hover:bg-syllabo-800 flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Program</span>
              </button>
            </form>

            <div className="space-y-1.5 pt-2 max-h-60 overflow-y-auto">
              {courses.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCourseId(c.id);
                    loadSubjectsForCourse(c.id);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCourseId === c.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-stone-50 hover:bg-stone-100 text-slate-800'
                  }`}
                >
                  <span className="font-bold">{c.code}</span>
                  <span className="block text-[11px] font-normal opacity-80 truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Subjects */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>2. Subjects</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-normal">
                {subjects.length}
              </span>
            </h2>

            <form onSubmit={handleAddSubject} className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Code (CS305)"
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  className="col-span-2 px-3 py-2 rounded-xl border border-stone-200 text-xs"
                />
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={newSubjectSem}
                  onChange={(e) => setNewSubjectSem(Number(e.target.value))}
                  className="px-2 py-2 rounded-xl border border-stone-200 text-xs text-center"
                  title="Semester"
                />
              </div>
              <input
                type="text"
                placeholder="Subject Name"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-syllabo-900 text-white text-xs font-semibold hover:bg-syllabo-800 flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subject</span>
              </button>
            </form>

            <div className="space-y-1.5 pt-2 max-h-60 overflow-y-auto">
              {subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSubjectId(s.id);
                    loadUnitsForSubject(s.id);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedSubjectId === s.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-stone-50 hover:bg-stone-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{s.code}</span>
                    <span className="text-[10px] font-normal opacity-80">Sem {s.semester}</span>
                  </div>
                  <span className="block text-[11px] font-normal opacity-80 truncate">{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Units */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>3. Units in Subject</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-normal">
                {units.length}
              </span>
            </h2>

            <form onSubmit={handleAddUnit} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newUnitNumber}
                  onChange={(e) => setNewUnitNumber(Number(e.target.value))}
                  className="w-16 px-2 py-2 rounded-xl border border-stone-200 text-xs text-center"
                  title="Unit Number"
                />
                <input
                  type="text"
                  placeholder="Unit Title..."
                  value={newUnitTitle}
                  onChange={(e) => setNewUnitTitle(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 py-1">
                <input
                  type="checkbox"
                  id="numApplicable"
                  checked={newUnitNumericals}
                  onChange={(e) => setNewUnitNumericals(e.target.checked)}
                  className="rounded accent-syllabo-900"
                />
                <label htmlFor="numApplicable" className="cursor-pointer select-none">
                  Numericals Applicable
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-syllabo-900 text-white text-xs font-semibold hover:bg-syllabo-800 flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Unit</span>
              </button>
            </form>

            <div className="space-y-1.5 pt-2 max-h-60 overflow-y-auto">
              {units.map(u => (
                <div
                  key={u.id}
                  className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Unit {u.unit_number}</span>
                    <span className="text-[10px] text-slate-500">
                      {u.numericals_applicable ? 'Numericals ON' : 'Theory Only'}
                    </span>
                  </div>
                  <span className="text-slate-600 text-[11px] block truncate">{u.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: THEORY QUESTION STANDARDS                               */}
      {/* ============================================================== */}
      {activeTab === 'questions' && (
        <div className="p-8 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-syllabo-900 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-syllabo-800" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Unit Publication Rule: Exactly 5 Theory Questions
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                As mandated by <code className="bg-stone-100 px-1 py-0.5 rounded">PRD.md</code> and <code className="bg-stone-100 px-1 py-0.5 rounded">ARCHITECTURE.md</code>, every published unit must contain exactly 5 comprehensive theory questions numbered 1 through 5, covering the entire unit syllabus for 8-mark university examinations.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-slate-700 space-y-2">
            <span className="font-bold text-slate-900 block">Question Authoring Guidelines:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li><strong>Target word count:</strong> Under 300 words without rigid truncation.</li>
              <li><strong>Answer structure:</strong> Introduction, Core structured explanation points, Diagram/Formula reference (optional), and Conclusion.</li>
              <li><strong>Topic Tags:</strong> Mandatory comma-separated list of syllabus topics covered.</li>
              <li><strong>Simple Hinglish:</strong> Optional collapsed explanation (50-60 words in Roman Hindi script) to reinforce conceptual understanding.</li>
            </ul>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: FACULTY ONBOARDING WORKFLOW                             */}
      {/* ============================================================== */}
      {activeTab === 'faculty' && (
        <div className="p-8 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              Standard Faculty Provisioning Procedure
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl">
              Strictly follow the documented workflow from <code className="bg-stone-100 px-1 py-0.5 rounded">docs/ARCHITECTURE.md</code> and <code className="bg-stone-100 px-1 py-0.5 rounded">docs/SECURITY.md</code>:
            </p>
          </div>

          <ol className="space-y-4 text-xs text-slate-700">
            <li className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <strong className="block text-slate-900 font-bold mb-1">Step 1: Invite or create Supabase Auth User</strong>
              In the Supabase Dashboard (Authentication → Users), create the faculty member's user account with their university email address.
            </li>

            <li className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <strong className="block text-slate-900 font-bold mb-1">Step 2: Create Faculty Profile Record</strong>
              Insert a row into <code className="bg-white px-1.5 py-0.5 rounded border border-stone-300">faculty_profiles</code> linking the Auth UUID, a unique reference code (e.g. <code className="bg-white px-1.5 py-0.5 rounded border border-stone-300">FAC-QTU-002</code>), and their display name with <code className="bg-white px-1.5 py-0.5 rounded border border-stone-300">is_active = true</code>.
            </li>

            <li className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <strong className="block text-slate-900 font-bold mb-1">Step 3: Assign Authorized Subject(s)</strong>
              Insert rows into <code className="bg-white px-1.5 py-0.5 rounded border border-stone-300">faculty_subject_assignments</code> linking the faculty ID to the allowed subject IDs. Row Level Security will enforce that the faculty member can evaluate only these subjects.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
