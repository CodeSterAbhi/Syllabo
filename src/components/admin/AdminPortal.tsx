import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Calculator,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  Link,
  Unlink,
  Check,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import {
  Course,
  Subject,
  Unit,
  TheoryQuestion,
  Numerical,
  MCQ,
  FacultyProfile,
  FacultySubjectAssignment
} from '../../types';

interface AdminPortalProps {
  onBackToStudent: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToStudent }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'questions' | 'faculty'>('curriculum');
  const [questionsSubTab, setQuestionsSubTab] = useState<'theory' | 'numericals' | 'mcqs'>('theory');

  // Curriculum data
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // Selection state
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  // Questions data for selected unit
  const [unitTheoryQuestions, setUnitTheoryQuestions] = useState<TheoryQuestion[]>([]);
  const [unitNumericals, setUnitNumericals] = useState<Numerical[]>([]);
  const [unitMCQs, setUnitMCQs] = useState<MCQ[]>([]);

  // Faculty management data
  const [allFaculty, setAllFaculty] = useState<FacultyProfile[]>([]);
  const [allAssignments, setAllAssignments] = useState<(FacultySubjectAssignment & { faculty?: FacultyProfile; subject?: Subject })[]>([]);

  // Form states: Curriculum
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');

  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectSem, setNewSubjectSem] = useState(3);
  const [newSubjectDesc, setNewSubjectDesc] = useState('');

  const [newUnitNumber, setNewUnitNumber] = useState(1);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitDesc, setNewUnitDesc] = useState('');
  const [newUnitNumericals, setNewUnitNumericals] = useState(true);

  // Form states: Theory Question
  const [qNum, setQNum] = useState<number>(1);
  const [qTopics, setQTopics] = useState<string>('');
  const [qText, setQText] = useState<string>('');
  const [qIntro, setQIntro] = useState<string>('');
  const [qBody, setQBody] = useState<string>('');
  const [qConclusion, setQConclusion] = useState<string>('');
  const [qDiagramUrl, setQDiagramUrl] = useState<string>('');
  const [qDiagramCaption, setQDiagramCaption] = useState<string>('');
  const [qHinglish, setQHinglish] = useState<string>('');

  // Form states: Numerical
  const [numProblemNumber, setNumProblemNumber] = useState<number>(1);
  const [numProblemStatement, setNumProblemStatement] = useState<string>('');
  const [numGiven, setNumGiven] = useState<string>('');
  const [numRequired, setNumRequired] = useState<string>('');
  const [numFormula, setNumFormula] = useState<string>('');
  const [numSteps, setNumSteps] = useState<string>('');
  const [numFinalAnswer, setNumFinalAnswer] = useState<string>('');
  const [numHinglish, setNumHinglish] = useState<string>('');

  // Form states: MCQ
  const [mcqNumber, setMcqNumber] = useState<number>(1);
  const [mcqText, setMcqText] = useState<string>('');
  const [mcqOptA, setMcqOptA] = useState<string>('');
  const [mcqOptB, setMcqOptB] = useState<string>('');
  const [mcqOptC, setMcqOptC] = useState<string>('');
  const [mcqOptD, setMcqOptD] = useState<string>('');
  const [mcqCorrect, setMcqCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [mcqExplanation, setMcqExplanation] = useState<string>('');

  // Form states: Faculty
  const [facUserId, setFacUserId] = useState<string>('');
  const [facCode, setFacCode] = useState<string>('');
  const [facDisplayName, setFacDisplayName] = useState<string>('');
  const [facIsActive, setFacIsActive] = useState<boolean>(true);

  // Form states: Assignment
  const [assignFacultyId, setAssignFacultyId] = useState<string>('');
  const [assignSubjectId, setAssignSubjectId] = useState<string>('');

  // Status message
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkAdmin();
    loadCurriculum();
    loadFacultyData();
  }, []);

  const checkAdmin = async () => {
    const adminStatus = await api.checkIsAdmin();
    setIsAdmin(adminStatus);
  };

  const loadCurriculum = async () => {
    const courseList = await api.getAllCoursesAdmin();
    setCourses(courseList);
    if (courseList.length > 0) {
      const activeCId = selectedCourseId || courseList[0].id;
      setSelectedCourseId(activeCId);
      loadSubjectsForCourse(activeCId);
    }
  };

  const loadSubjectsForCourse = async (cId: string) => {
    const subList = await api.getAllSubjectsAdmin(cId);
    setSubjects(subList);
    if (subList.length > 0) {
      const activeSId = selectedSubjectId || subList[0].id;
      setSelectedSubjectId(activeSId);
      loadUnitsForSubject(activeSId);
    } else {
      setSelectedSubjectId('');
      setUnits([]);
      setSelectedUnitId('');
    }
  };

  const loadUnitsForSubject = async (sId: string) => {
    const uList = await api.getAllUnitsAdmin(sId);
    setUnits(uList);
    if (uList.length > 0) {
      const activeUId = selectedUnitId || uList[0].id;
      setSelectedUnitId(activeUId);
      loadUnitQuestions(activeUId);
    } else {
      setSelectedUnitId('');
      setUnitTheoryQuestions([]);
      setUnitNumericals([]);
      setUnitMCQs([]);
    }
  };

  const loadUnitQuestions = async (uId: string) => {
    const [tList, nList, mList] = await Promise.all([
      api.getAllTheoryQuestionsAdmin(uId),
      api.getAllNumericalsAdmin(uId),
      api.getAllMCQsAdmin(uId),
    ]);
    setUnitTheoryQuestions(tList);
    setUnitNumericals(nList);
    setUnitMCQs(mList);

    // Auto-advance next question numbers
    setQNum(Math.min(tList.length + 1, 5));
    setNumProblemNumber(nList.length + 1);
    setMcqNumber(mList.length + 1);
  };

  const loadFacultyData = async () => {
    const [fList, aList] = await Promise.all([
      api.getAllFacultyProfiles(),
      api.getAllFacultyAssignments(),
    ]);
    setAllFaculty(fList);
    setAllAssignments(aList);
    if (fList.length > 0 && !assignFacultyId) {
      setAssignFacultyId(fList[0].id);
    }
    if (subjects.length > 0 && !assignSubjectId) {
      setAssignSubjectId(subjects[0].id);
    }
  };

  // -------------------------------------------------------------
  // Curriculum Handlers
  // -------------------------------------------------------------

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName) return;

    const res = await api.saveCourse({
      code: newCourseCode.toUpperCase().trim(),
      name: newCourseName.trim(),
      description: newCourseDesc.trim(),
      is_published: true,
    });

    if (res.success) {
      setStatusMsg({ type: 'success', text: `Course ${newCourseCode} added successfully!` });
      setNewCourseCode('');
      setNewCourseName('');
      setNewCourseDesc('');
      loadCurriculum();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to add course.' });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? All associated subjects and units will be removed.')) return;
    const res = await api.deleteCourse(courseId);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Course deleted successfully.' });
      loadCurriculum();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to delete course.' });
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !newSubjectCode || !newSubjectName) return;

    const res = await api.saveSubject({
      course_id: selectedCourseId,
      semester: Number(newSubjectSem),
      code: newSubjectCode.toUpperCase().trim(),
      name: newSubjectName.trim(),
      description: newSubjectDesc.trim(),
      is_published: true,
    });

    if (res.success) {
      setStatusMsg({ type: 'success', text: `Subject ${newSubjectCode} added successfully!` });
      setNewSubjectCode('');
      setNewSubjectName('');
      setNewSubjectDesc('');
      loadSubjectsForCourse(selectedCourseId);
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to add subject.' });
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Delete this subject and all its units?')) return;
    const res = await api.deleteSubject(subjectId);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Subject deleted successfully.' });
      loadSubjectsForCourse(selectedCourseId);
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to delete subject.' });
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !newUnitTitle) return;

    const res = await api.saveUnit({
      subject_id: selectedSubjectId,
      unit_number: Number(newUnitNumber),
      title: newUnitTitle.trim(),
      description: newUnitDesc.trim(),
      numericals_applicable: newUnitNumericals,
      is_published: true,
    });

    if (res.success) {
      setStatusMsg({ type: 'success', text: `Unit ${newUnitNumber} added successfully!` });
      setNewUnitTitle('');
      setNewUnitDesc('');
      setNewUnitNumber(prev => Math.min(prev + 1, 10));
      loadUnitsForSubject(selectedSubjectId);
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to add unit.' });
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Delete this unit?')) return;
    const res = await api.deleteUnit(unitId);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Unit deleted successfully.' });
      loadUnitsForSubject(selectedSubjectId);
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to delete unit.' });
    }
  };

  // -------------------------------------------------------------
  // Question Handlers
  // -------------------------------------------------------------

  const handleSaveTheoryQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId || !qText || !qBody) return;

    const res = await api.saveTheoryQuestion({
      unit_id: selectedUnitId,
      question_number: Number(qNum),
      topics_covered: qTopics.trim(),
      question_text: qText.trim(),
      answer_intro: qIntro.trim(),
      answer_body: qBody.trim(),
      answer_conclusion: qConclusion.trim(),
      diagram_url: qDiagramUrl.trim(),
      diagram_caption: qDiagramCaption.trim(),
      hinglish_explanation: qHinglish.trim(),
      is_published: true,
    });

    if (res.success) {
      setStatusMsg({ type: 'success', text: `Theory Question ${qNum} saved successfully!` });
      setQText('');
      setQIntro('');
      setQBody('');
      setQConclusion('');
      setQDiagramUrl('');
      setQDiagramCaption('');
      setQHinglish('');
      loadUnitQuestions(selectedUnitId);
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save question.' });
    }
  };

  const handleDeleteTheoryQuestion = async (questionId: string) => {
    if (!confirm('Delete this theory question?')) return;
    const res = await api.deleteTheoryQuestion(questionId);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Theory question removed.' });
      loadUnitQuestions(selectedUnitId);
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to delete theory question.' });
    }
  };

  const handleSaveNumerical = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId || !numProblemStatement || !numSteps) return;

    const res = await api.saveNumerical({
      unit_id: selectedUnitId,
      problem_number: Number(numProblemNumber),
      problem_statement: numProblemStatement.trim(),
      given: numGiven.trim(),
      required: numRequired.trim(),
      formula: numFormula.trim(),
      solution_steps: numSteps.trim(),
      final_answer: numFinalAnswer.trim(),
      hinglish_explanation: numHinglish.trim(),
      is_published: true,
    });

    if (res.success) {
      setStatusMsg({ type: 'success', text: `Numerical Problem ${numProblemNumber} saved!` });
      setNumProblemStatement('');
      setNumGiven('');
      setNumRequired('');
      setNumFormula('');
      setNumSteps('');
      setNumFinalAnswer('');
      setNumHinglish('');
      loadUnitQuestions(selectedUnitId);
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save numerical.' });
    }
  };

  const handleDeleteNumerical = async (numId: string) => {
    if (!confirm('Delete this numerical problem?')) return;
    const res = await api.deleteNumerical(numId);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Numerical problem deleted.' });
      loadUnitQuestions(selectedUnitId);
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to delete numerical.' });
    }
  };

  const handleSaveMCQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId || !mcqText || !mcqOptA || !mcqOptB) return;

    const res = await api.saveMCQ({
      unit_id: selectedUnitId,
      question_number: Number(mcqNumber),
      question_text: mcqText.trim(),
      options: {
        A: mcqOptA.trim(),
        B: mcqOptB.trim(),
        C: mcqOptC.trim(),
        D: mcqOptD.trim(),
      },
      correct_option: mcqCorrect,
      explanation: mcqExplanation.trim(),
      is_published: true,
    });

    if (res.success) {
      setStatusMsg({ type: 'success', text: `MCQ ${mcqNumber} saved!` });
      setMcqText('');
      setMcqOptA('');
      setMcqOptB('');
      setMcqOptC('');
      setMcqOptD('');
      setMcqExplanation('');
      loadUnitQuestions(selectedUnitId);
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save MCQ.' });
    }
  };

  const handleDeleteMCQ = async (mcqId: string) => {
    if (!confirm('Delete this MCQ?')) return;
    const res = await api.deleteMCQ(mcqId);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'MCQ deleted.' });
      loadUnitQuestions(selectedUnitId);
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to delete MCQ.' });
    }
  };

  // -------------------------------------------------------------
  // Faculty Handlers
  // -------------------------------------------------------------

  const handleCreateFacultyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facUserId || !facCode || !facDisplayName) return;

    const res = await api.saveFacultyProfile({
      user_id: facUserId.trim(),
      faculty_code: facCode.toUpperCase().trim(),
      display_name: facDisplayName.trim(),
      is_active: facIsActive,
    });

    if (res.success) {
      setStatusMsg({ type: 'success', text: `Faculty profile ${facCode} created successfully!` });
      setFacUserId('');
      setFacCode('');
      setFacDisplayName('');
      loadFacultyData();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to create faculty profile.' });
    }
  };

  const handleToggleFacultyActive = async (facultyId: string, currentActive: boolean) => {
    const res = await api.toggleFacultyStatus(facultyId, !currentActive);
    if (res.success) {
      setStatusMsg({ type: 'success', text: `Faculty status updated to ${!currentActive ? 'Active' : 'Inactive'}.` });
      loadFacultyData();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to update faculty status.' });
    }
  };

  const handleAssignSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignFacultyId || !assignSubjectId) return;

    const res = await api.assignSubjectToFaculty(assignFacultyId, assignSubjectId);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Subject successfully assigned to faculty!' });
      loadFacultyData();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to assign subject.' });
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm('Revoke this subject assignment?')) return;
    const res = await api.removeFacultyAssignment(assignmentId);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Subject assignment revoked.' });
      loadFacultyData();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to revoke assignment.' });
    }
  };

  const activeUnit = units.find(u => u.id === selectedUnitId);

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
              Full curriculum administration, question authoring, publication verification, and faculty assignment controls.
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
        <div className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-2 ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-600 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
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
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'questions'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-stone-200 text-slate-700 hover:bg-stone-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Question Bank Manager</span>
        </button>

        <button
          onClick={() => setActiveTab('faculty')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'faculty'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-stone-200 text-slate-700 hover:bg-stone-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Faculty & Assignments</span>
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
              <span>1. Programs / Courses</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-normal">
                {courses.length}
              </span>
            </h2>

            <form onSubmit={handleAddCourse} className="space-y-2">
              <input
                type="text"
                placeholder="Code (e.g. BTECH-CSE)"
                required
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-1 focus:ring-syllabo-800"
              />
              <input
                type="text"
                placeholder="Program Full Name"
                required
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-1 focus:ring-syllabo-800"
              />
              <textarea
                placeholder="Description..."
                rows={2}
                value={newCourseDesc}
                onChange={(e) => setNewCourseDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-syllabo-900 text-white text-xs font-semibold hover:bg-syllabo-800 flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Program</span>
              </button>
            </form>

            <div className="space-y-1.5 pt-2 max-h-72 overflow-y-auto">
              {courses.map(c => (
                <div
                  key={c.id}
                  className={`p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-2 ${
                    selectedCourseId === c.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-stone-50 hover:bg-stone-100 text-slate-800'
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelectedCourseId(c.id);
                      loadSubjectsForCourse(c.id);
                    }}
                    className="flex-1 text-left truncate"
                  >
                    <span className="font-bold">{c.code}</span>
                    <span className="block text-[11px] font-normal opacity-80 truncate">{c.name}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(c.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded"
                    title="Delete Course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                  placeholder="Code (CS301)"
                  required
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  className="col-span-2 px-3 py-2 rounded-xl border border-stone-200 text-xs"
                />
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={newSubjectSem}
                  onChange={(e) => setNewSubjectSem(Number(e.target.value))}
                  className="px-2 py-2 rounded-xl border border-stone-200 text-xs text-center"
                  title="Semester"
                />
              </div>
              <input
                type="text"
                placeholder="Subject Name"
                required
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

            <div className="space-y-1.5 pt-2 max-h-72 overflow-y-auto">
              {subjects.map(s => (
                <div
                  key={s.id}
                  className={`p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-2 ${
                    selectedSubjectId === s.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-stone-50 hover:bg-stone-100 text-slate-800'
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelectedSubjectId(s.id);
                      loadUnitsForSubject(s.id);
                    }}
                    className="flex-1 text-left truncate"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{s.code}</span>
                      <span className="text-[10px] font-normal opacity-80">Sem {s.semester}</span>
                    </div>
                    <span className="block text-[11px] font-normal opacity-80 truncate">{s.name}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(s.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Units & Publication Validation */}
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
                  placeholder="Unit Title (e.g. Linear Data Structures)"
                  required
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

            <div className="space-y-1.5 pt-2 max-h-72 overflow-y-auto">
              {units.map(u => (
                <div
                  key={u.id}
                  className={`p-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-2 ${
                    selectedUnitId === u.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-stone-50 hover:bg-stone-100 text-slate-800'
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelectedUnitId(u.id);
                      loadUnitQuestions(u.id);
                    }}
                    className="flex-1 text-left truncate"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Unit {u.unit_number}</span>
                      <span className="text-[10px] opacity-75">
                        {u.numericals_applicable ? 'Numericals ON' : 'Theory Only'}
                      </span>
                    </div>
                    <span className="block text-[11px] truncate opacity-90">{u.title}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteUnit(u.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded"
                    title="Delete Unit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: QUESTION BANK MANAGER                                   */}
      {/* ============================================================== */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Unit Readiness Checklist & Context Card */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
              <div>
                <span className="text-xs font-bold text-syllabo-900 uppercase tracking-wider">
                  Selected Unit Context:
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  {activeUnit ? `Unit ${activeUnit.unit_number}: ${activeUnit.title}` : 'No unit selected'}
                </h2>
              </div>

              {/* Unit publication readiness pill */}
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                  unitTheoryQuestions.length === 5
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {unitTheoryQuestions.length === 5 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  <span>
                    {unitTheoryQuestions.length} / 5 Theory Questions
                  </span>
                </div>

                <div className="px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-100 text-slate-700">
                  {unitMCQs.length} MCQs
                </div>
              </div>
            </div>

            {/* Subtabs for Questions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuestionsSubTab('theory')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  questionsSubTab === 'theory'
                    ? 'bg-syllabo-900 text-white'
                    : 'bg-stone-50 border border-stone-200 text-slate-700 hover:bg-stone-100'
                }`}
              >
                Theory Questions (5 Required)
              </button>

              <button
                onClick={() => setQuestionsSubTab('numericals')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  questionsSubTab === 'numericals'
                    ? 'bg-syllabo-900 text-white'
                    : 'bg-stone-50 border border-stone-200 text-slate-700 hover:bg-stone-100'
                }`}
              >
                Numericals ({unitNumericals.length})
              </button>

              <button
                onClick={() => setQuestionsSubTab('mcqs')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  questionsSubTab === 'mcqs'
                    ? 'bg-syllabo-900 text-white'
                    : 'bg-stone-50 border border-stone-200 text-slate-700 hover:bg-stone-100'
                }`}
              >
                MCQs ({unitMCQs.length} / 15-20 Target)
              </button>
            </div>
          </div>

          {/* Subtab 1: Theory Questions Authoring */}
          {questionsSubTab === 'theory' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Existing questions in this unit */}
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Authored Theory Questions ({unitTheoryQuestions.length} / 5)
                </h3>

                {unitTheoryQuestions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-4 rounded-2xl bg-white border border-stone-200">
                    No theory questions created yet. Use the authoring form to create questions 1 through 5.
                  </p>
                ) : (
                  unitTheoryQuestions.map(q => (
                    <div key={q.id} className="p-4 rounded-2xl bg-white border border-stone-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Question {q.question_number}</span>
                        <button
                          onClick={() => handleDeleteTheoryQuestion(q.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="font-semibold text-slate-800 line-clamp-2">{q.question_text}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">Topics: {q.topics_covered}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Right: Authoring Form */}
              <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Author Theory Question
                </h3>

                <form onSubmit={handleSaveTheoryQuestion} className="space-y-3 text-xs">
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Q# (1–5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        required
                        value={qNum}
                        onChange={(e) => setQNum(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-center font-bold"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Topics Covered (Comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Asymptotic Notations, Big-O, Theta"
                        required
                        value={qTopics}
                        onChange={(e) => setQTopics(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Question Text</label>
                    <input
                      type="text"
                      placeholder="University examination question prompt..."
                      required
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Introduction (Optional)</label>
                    <textarea
                      placeholder="Introductory context/definition..."
                      rows={2}
                      value={qIntro}
                      onChange={(e) => setQIntro(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Answer Body (8-Mark University Standard)</label>
                    <textarea
                      placeholder="Structured answer points..."
                      rows={5}
                      required
                      value={qBody}
                      onChange={(e) => setQBody(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Conclusion & Exam Tip (Optional)</label>
                    <textarea
                      placeholder="Concluding remark or key takeaway..."
                      rows={2}
                      value={qConclusion}
                      onChange={(e) => setQConclusion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Diagram URL (Optional)</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={qDiagramUrl}
                        onChange={(e) => setQDiagramUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Diagram Caption</label>
                      <input
                        type="text"
                        placeholder="Caption description..."
                        value={qDiagramCaption}
                        onChange={(e) => setQDiagramCaption(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Explain in Simple Hinglish (Optional, ~50 words)</label>
                    <textarea
                      placeholder="Roman Hindi explanation for concept reinforcement..."
                      rows={2}
                      value={qHinglish}
                      onChange={(e) => setQHinglish(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-syllabo-900 text-white font-bold text-xs hover:bg-syllabo-800 shadow-sm"
                  >
                    Save Theory Question
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Subtab 2: Numericals Authoring */}
          {questionsSubTab === 'numericals' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Authored Numericals ({unitNumericals.length})
                </h3>

                {unitNumericals.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-4 rounded-2xl bg-white border border-stone-200">
                    No worked numericals authored yet for this unit.
                  </p>
                ) : (
                  unitNumericals.map(num => (
                    <div key={num.id} className="p-4 rounded-2xl bg-white border border-stone-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Problem {num.problem_number}</span>
                        <button
                          onClick={() => handleDeleteNumerical(num.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Delete Numerical"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="font-semibold text-slate-800 line-clamp-2">{num.problem_statement}</p>
                      {num.final_answer && (
                        <p className="text-[11px] font-mono text-emerald-800">Answer: {num.final_answer}</p>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Form */}
              <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Author Worked Numerical Problem
                </h3>

                <form onSubmit={handleSaveNumerical} className="space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-20">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Problem #</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={numProblemNumber}
                        onChange={(e) => setNumProblemNumber(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-center font-bold"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Final Answer</label>
                      <input
                        type="text"
                        placeholder="e.g. Address of A[15, 8] = 2328"
                        value={numFinalAnswer}
                        onChange={(e) => setNumFinalAnswer(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Problem Statement</label>
                    <textarea
                      placeholder="Numerical problem statement..."
                      rows={2}
                      required
                      value={numProblemStatement}
                      onChange={(e) => setNumProblemStatement(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Given Parameters</label>
                      <textarea
                        placeholder="LB1=10, Base=2000..."
                        rows={2}
                        value={numGiven}
                        onChange={(e) => setNumGiven(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Required To Find</label>
                      <textarea
                        placeholder="Memory address..."
                        rows={2}
                        value={numRequired}
                        onChange={(e) => setNumRequired(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Formula</label>
                    <input
                      type="text"
                      placeholder="Address = Base + W * [ ... ]"
                      value={numFormula}
                      onChange={(e) => setNumFormula(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Step-by-Step Solution</label>
                    <textarea
                      placeholder="Step 1: Compute columns...&#10;Step 2: Calculate offset..."
                      rows={4}
                      required
                      value={numSteps}
                      onChange={(e) => setNumSteps(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-syllabo-900 text-white font-bold text-xs hover:bg-syllabo-800 shadow-sm"
                  >
                    Save Numerical Problem
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Subtab 3: MCQs Authoring */}
          {questionsSubTab === 'mcqs' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Authored MCQs ({unitMCQs.length} / 15-20 Target)
                </h3>

                {unitMCQs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-4 rounded-2xl bg-white border border-stone-200">
                    No MCQs authored yet. Target 15 to 20 MCQs for complete practice coverage.
                  </p>
                ) : (
                  unitMCQs.map(m => (
                    <div key={m.id} className="p-4 rounded-2xl bg-white border border-stone-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">MCQ {m.question_number}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Ans: {m.correct_option}
                          </span>
                          <button
                            onClick={() => handleDeleteMCQ(m.id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="Delete MCQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="font-medium text-slate-800 line-clamp-2">{m.question_text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Form */}
              <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Author Multiple Choice Question
                </h3>

                <form onSubmit={handleSaveMCQ} className="space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-20">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">MCQ #</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={mcqNumber}
                        onChange={(e) => setMcqNumber(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-center font-bold"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Correct Option</label>
                      <select
                        value={mcqCorrect}
                        onChange={(e) => setMcqCorrect(e.target.value as 'A' | 'B' | 'C' | 'D')}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 font-bold text-syllabo-900"
                      >
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Question Prompt</label>
                    <textarea
                      placeholder="MCQ prompt..."
                      rows={2}
                      required
                      value={mcqText}
                      onChange={(e) => setMcqText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Option A</label>
                      <input
                        type="text"
                        required
                        value={mcqOptA}
                        onChange={(e) => setMcqOptA(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Option B</label>
                      <input
                        type="text"
                        required
                        value={mcqOptB}
                        onChange={(e) => setMcqOptB(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Option C</label>
                      <input
                        type="text"
                        required
                        value={mcqOptC}
                        onChange={(e) => setMcqOptC(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Option D</label>
                      <input
                        type="text"
                        required
                        value={mcqOptD}
                        onChange={(e) => setMcqOptD(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Explanation</label>
                    <textarea
                      placeholder="Why is this option correct?"
                      rows={2}
                      value={mcqExplanation}
                      onChange={(e) => setMcqExplanation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-syllabo-900 text-white font-bold text-xs hover:bg-syllabo-800 shadow-sm"
                  >
                    Save MCQ
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: FACULTY ONBOARDING & SUBJECT ASSIGNMENTS                */}
      {/* ============================================================== */}
      {activeTab === 'faculty' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Section 1: Create Faculty Profile */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-700" />
              <span>Register Faculty Profile</span>
            </h3>

            <p className="text-xs text-slate-500">
              Link a Supabase Auth user UUID to an active faculty record. No public registration is permitted.
            </p>

            <form onSubmit={handleCreateFacultyProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Auth User UUID (from Supabase Auth dashboard)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7c9e6679-7425-40de-944b-e07fc1f90ae7"
                  value={facUserId}
                  onChange={(e) => setFacUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Faculty Code (Unique)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="FAC-QTU-003"
                    value={facCode}
                    onChange={(e) => setFacCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. John Doe (Dept of CSE)"
                    value={facDisplayName}
                    onChange={(e) => setFacDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="facActive"
                  checked={facIsActive}
                  onChange={(e) => setFacIsActive(e.target.checked)}
                  className="rounded accent-syllabo-900"
                />
                <label htmlFor="facActive" className="text-xs text-slate-700 cursor-pointer select-none">
                  Mark as Active Evaluator
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-syllabo-900 text-white font-bold text-xs hover:bg-syllabo-800"
              >
                Create Faculty Profile
              </button>
            </form>

            {/* List of registered faculty profiles */}
            <div className="pt-4 border-t border-stone-100 space-y-2">
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Existing Faculty Profiles ({allFaculty.length})
              </span>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {allFaculty.map(f => (
                  <div key={f.id} className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{f.display_name}</span>
                        <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-stone-200">
                          {f.faculty_code}
                        </span>
                      </div>
                      <span className="block font-mono text-[10px] text-slate-400 truncate max-w-[220px]">
                        {f.user_id}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleFacultyActive(f.id, f.is_active)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                        f.is_active
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {f.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Manage Subject Assignments */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Link className="w-4 h-4 text-syllabo-700" />
              <span>Authorize Subject Evaluation</span>
            </h3>

            <p className="text-xs text-slate-500">
              Assign curriculum subjects to faculty members. Database RLS permits evaluation submissions only for assigned subjects.
            </p>

            <form onSubmit={handleAssignSubject} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Faculty Member
                </label>
                <select
                  value={assignFacultyId}
                  onChange={(e) => setAssignFacultyId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                >
                  {allFaculty.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.faculty_code} — {f.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Subject to Authorize
                </label>
                <select
                  value={assignSubjectId}
                  onChange={(e) => setAssignSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name} (Sem {s.semester})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-syllabo-900 text-white font-bold text-xs hover:bg-syllabo-800"
              >
                Assign Subject
              </button>
            </form>

            {/* List of active subject assignments */}
            <div className="pt-4 border-t border-stone-100 space-y-2">
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Current Subject Assignments ({allAssignments.length})
              </span>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {allAssignments.map(a => (
                  <div key={a.id} className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {a.faculty?.display_name || 'Faculty Member'}
                      </span>
                      <span className="text-[11px] text-slate-600">
                        Authorized for: <strong className="text-syllabo-900">{a.subject?.code} - {a.subject?.name}</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveAssignment(a.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Revoke Assignment"
                    >
                      <Unlink className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
