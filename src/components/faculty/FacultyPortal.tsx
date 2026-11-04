import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lock,
  LogOut,
  Star,
  Send,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { api } from '../../services/api';
import { FacultyProfile, FacultySubjectAssignment, Subject, Unit, TheoryQuestion, Evaluation } from '../../types';

interface FacultyPortalProps {
  onBackToStudent: () => void;
  targetQuestionId?: string | null;
}

export const FacultyPortal: React.FC<FacultyPortalProps> = ({
  onBackToStudent,
  targetQuestionId,
}) => {
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Faculty session
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile | null>(null);
  const [assignments, setAssignments] = useState<FacultySubjectAssignment[]>([]);
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});

  // Active evaluation workbench selection
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [questions, setQuestions] = useState<TheoryQuestion[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');

  // Evaluation form state
  const [score, setScore] = useState<number>(7.0);
  const [feedback, setFeedback] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check current session on mount
  useEffect(() => {
    loadFacultySession();
  }, []);

  const loadFacultySession = async () => {
    try {
      const profile = await api.getFacultyProfile();
      if (profile) {
        setFacultyProfile(profile);
        const assigns = await api.getFacultyAssignments(profile.user_id);
        setAssignments(assigns);
        const evals = await api.getFacultyEvaluations(profile.user_id);
        setEvaluations(evals);

        if (assigns.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(assigns[0].subject_id);
        }
      }
    } catch (err) {
      console.error('Failed to load faculty session:', err);
    }
  };

  // When selected subject changes, load units
  useEffect(() => {
    if (!selectedSubjectId) return;
    api.getUnits(selectedSubjectId).then(unitList => {
      setUnits(unitList);
      if (unitList.length > 0) {
        setSelectedUnitId(unitList[0].id);
      } else {
        setSelectedUnitId('');
        setQuestions([]);
      }
    });
  }, [selectedSubjectId]);

  // When selected unit changes, load theory questions
  useEffect(() => {
    if (!selectedUnitId) return;
    api.getTheoryQuestions(selectedUnitId).then(qList => {
      setQuestions(qList);
      if (targetQuestionId && qList.some(q => q.id === targetQuestionId)) {
        setSelectedQuestionId(targetQuestionId);
      } else if (qList.length > 0) {
        setSelectedQuestionId(qList[0].id);
      } else {
        setSelectedQuestionId('');
      }
    });
  }, [selectedUnitId, targetQuestionId]);

  // Populate form with existing score if available
  useEffect(() => {
    if (selectedQuestionId && evaluations[selectedQuestionId]) {
      const existing = evaluations[selectedQuestionId];
      setScore(Number(existing.score));
      setFeedback(existing.feedback || '');
    } else {
      setScore(7.0);
      setFeedback('');
    }
    setSubmitMessage(null);
  }, [selectedQuestionId, evaluations]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    if (!isSupabaseConfigured) {
      // In preview mode without live DB, load mock faculty
      await loadFacultySession();
      setAuthLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
      return;
    }

    await loadFacultySession();
    setAuthLoading(false);
  };

  const handleDemoLogin = async () => {
    setAuthLoading(true);
    // Directly activate the demo faculty session
    await loadFacultySession();
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setFacultyProfile(null);
    setAssignments([]);
    setEvaluations({});
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyProfile || !selectedQuestionId) return;

    if (score < 0 || score > 8) {
      setSubmitMessage({ type: 'error', text: 'Score must be between 0.0 and 8.0 marks.' });
      return;
    }

    setSubmitting(true);
    setSubmitMessage(null);

    const result = await api.submitEvaluation(
      selectedQuestionId,
      facultyProfile.user_id,
      score,
      feedback
    );

    setSubmitting(false);

    if (result.success) {
      setSubmitMessage({
        type: 'success',
        text: 'Evaluation score recorded successfully! Aggregate rating updated.',
      });
      // Refresh evaluations map
      const updatedEvals = await api.getFacultyEvaluations(facultyProfile.user_id);
      setEvaluations(updatedEvals);
    } else {
      setSubmitMessage({
        type: 'error',
        text: result.error || 'Failed to submit evaluation. Check subject assignment permissions.',
      });
    }
  };

  const activeQuestion = questions.find(q => q.id === selectedQuestionId);
  const existingEval = selectedQuestionId ? evaluations[selectedQuestionId] : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-syllabo-900 text-white flex items-center justify-center shrink-0 shadow-md">
            <Award className="w-7 h-7 text-syllabo-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Faculty Evaluation Workbench</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-syllabo-900 font-semibold border border-purple-200">
                0–8 Marks Standard
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Authorized university subject evaluations. Aggregates are shown publicly to students without disclosing faculty identities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToStudent}
            className="px-4 py-2 rounded-2xl text-xs font-semibold bg-stone-100 text-slate-700 hover:bg-stone-200 transition-colors"
          >
            ← Back to Student View
          </button>

          {facultyProfile && (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* AUTHENTICATION STATE: Login card if not authenticated          */}
      {/* ============================================================== */}
      {!facultyProfile ? (
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-syllabo-900 flex items-center justify-center mx-auto mb-2 border border-purple-100">
              <Lock className="w-6 h-6 text-syllabo-800" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Faculty Sign In</h2>
            <p className="text-xs text-slate-500">
              Accounts are provisioned by the university project administrator. No public self-registration.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Faculty Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@quantumuniversity.edu.in"
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-syllabo-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-syllabo-800 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-2xl bg-syllabo-900 text-white font-bold text-sm hover:bg-syllabo-800 transition-all shadow-md disabled:opacity-50"
            >
              {authLoading ? 'Verifying Credentials...' : 'Sign In with Supabase Auth'}
            </button>
          </form>

          {/* Quick Demo Login Option for development testing */}
          <div className="pt-4 border-t border-stone-100 text-center space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Testing & Development
            </span>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Sign in as Sample Authorized Faculty (Dr. Sharma)</span>
            </button>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* AUTHENTICATED STATE: Profile Summary & Evaluation Workbench    */
        /* ============================================================== */
        <div className="space-y-6">
          {/* Active Profile Info */}
          <div className="p-5 rounded-3xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-syllabo-900 text-white flex items-center justify-center font-bold text-sm">
                {facultyProfile.display_name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{facultyProfile.display_name}</h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-200 text-[11px]">
                    {facultyProfile.faculty_code}
                  </span>
                  <span>•</span>
                  <span>Authorized for {assignments.length} subject(s)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {facultyProfile.is_active ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active Evaluator</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Profile Inactive</span>
                </span>
              )}
            </div>
          </div>

          {!facultyProfile.is_active ? (
            <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center max-w-lg mx-auto">
              <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-rose-950">Faculty Profile Inactive</h3>
              <p className="text-xs text-rose-700 mt-1">
                Your faculty account has been marked inactive by the platform administrator. You cannot submit evaluations until reactivated.
              </p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-8 rounded-3xl bg-amber-50 border border-amber-200 text-center max-w-lg mx-auto">
              <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-amber-950">No Assigned Subjects</h3>
              <p className="text-xs text-amber-800 mt-1">
                You currently have no subjects assigned in <code className="bg-white/60 px-1 py-0.5 rounded">faculty_subject_assignments</code>. Contact the administrator to assign curriculum subjects.
              </p>
            </div>
          ) : (
            /* Main Workbench Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Subject, Unit, & Question Selector */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-3xl bg-white border border-stone-200 space-y-4 shadow-sm">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Select Curriculum Content
                  </h2>

                  {/* Subject Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Assigned Subject:
                    </label>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-syllabo-800"
                    >
                      {assignments.map(a => (
                        <option key={a.subject_id} value={a.subject_id}>
                          {a.subject?.code || 'CS301'} - {a.subject?.name || 'Data Structures'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Unit Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Unit:
                    </label>
                    <select
                      value={selectedUnitId}
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-syllabo-800"
                    >
                      {units.map(u => (
                        <option key={u.id} value={u.id}>
                          Unit {u.unit_number}: {u.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Question Picker List */}
                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Theory Questions (5 per unit):
                    </label>

                    {questions.map(q => {
                      const isSelected = q.id === selectedQuestionId;
                      const hasEvaluated = Boolean(evaluations[q.id]);
                      const evaluatedScore = evaluations[q.id]?.score;

                      return (
                        <button
                          key={q.id}
                          onClick={() => setSelectedQuestionId(q.id)}
                          className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-syllabo-900 text-white border-syllabo-900 shadow-sm'
                              : 'bg-stone-50/70 border-stone-200/80 text-slate-800 hover:bg-stone-100'
                          }`}
                        >
                          <div className="truncate">
                            <span className="font-bold mr-1.5">Q{q.question_number}.</span>
                            <span className="truncate">{q.question || q.question_text}</span>
                          </div>

                          <div className="shrink-0">
                            {hasEvaluated ? (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {Number(evaluatedScore).toFixed(1)}/8
                              </span>
                            ) : (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                isSelected ? 'text-white/60' : 'text-slate-400'
                              }`}>
                                Pending
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Question Content & Evaluation Form */}
              <div className="lg:col-span-8 space-y-6">
                {activeQuestion ? (
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6">
                    {/* Question Header */}
                    <div className="pb-4 border-b border-stone-100">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
                          Question {activeQuestion.question_number}
                        </span>
                        {existingEval && (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Previously evaluated ({Number(existingEval.score).toFixed(1)}/8)</span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {activeQuestion.question || activeQuestion.question_text}
                      </h2>
                    </div>

                    {/* Answer Preview for Faculty Review */}
                    <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 text-xs leading-relaxed max-h-72 overflow-y-auto">
                      <span className="block font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                        Student-Facing Written Answer (8-Mark Format):
                      </span>
                      {activeQuestion.answer_intro && (
                        <p className="text-slate-700 italic">{activeQuestion.answer_intro}</p>
                      )}
                      <p className="whitespace-pre-line text-slate-800">{activeQuestion.answer_body}</p>
                      {activeQuestion.answer_conclusion && (
                        <p className="text-slate-700 font-medium">{activeQuestion.answer_conclusion}</p>
                      )}
                    </div>

                    {/* Evaluation Form */}
                    <form onSubmit={handleSubmitEvaluation} className="space-y-6 pt-2">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Assign Score (0.0 to 8.0 Marks)
                          </label>
                          <span className="text-2xl font-black text-syllabo-900 bg-purple-50 px-4 py-1 rounded-2xl border border-purple-200">
                            {score.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 8.0</span>
                          </span>
                        </div>

                        {/* Interactive Score Buttons (Quick Select) */}
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                          {[0, 2, 4, 5, 6, 7, 7.5, 8].map(val => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setScore(val)}
                              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                                score === val
                                  ? 'bg-syllabo-900 text-white shadow-sm'
                                  : 'bg-stone-50 border border-stone-200 text-slate-700 hover:bg-stone-100'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>

                        {/* Fine-tuning slider */}
                        <input
                          type="range"
                          min="0"
                          max="8"
                          step="0.5"
                          value={score}
                          onChange={(e) => setScore(parseFloat(e.target.value))}
                          className="w-full accent-syllabo-900 cursor-pointer"
                        />

                        {/* Rubric guidance pill */}
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                          <Info className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>
                            {score >= 7.5 && 'Exemplary 8-mark response: covers all key points, precise diagram, thorough structure.'}
                            {score >= 6.0 && score < 7.5 && 'Very good response: solid technical depth, minor formatting omissions.'}
                            {score >= 4.0 && score < 6.0 && 'Satisfactory passing response: basic definitions correct, needs deeper explanation.'}
                            {score < 4.0 && 'Inadequate answer: misses core concepts or off-topic for university exam requirements.'}
                          </span>
                        </div>
                      </div>

                      {/* Constructive Feedback Textarea */}
                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          Evaluator Feedback & Quality Notes (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Provide constructive notes on syllabus alignment, clarity, and diagram completeness..."
                          className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-syllabo-800"
                        />
                      </div>

                      {/* Status feedback message */}
                      {submitMessage && (
                        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
                          submitMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {submitMessage.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                          )}
                          <span>{submitMessage.text}</span>
                        </div>
                      )}

                      {/* Submit action */}
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 rounded-2xl bg-syllabo-900 text-white font-bold text-sm hover:bg-syllabo-800 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        <span>
                          {submitting
                            ? 'Recording Evaluation...'
                            : existingEval
                            ? 'Update Evaluation Score'
                            : 'Submit Faculty Evaluation'}
                        </span>
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
                    <p className="text-sm text-slate-500">
                      Select a theory question from the left sidebar to begin evaluating.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
