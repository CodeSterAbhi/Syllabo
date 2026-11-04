import React, { useState } from 'react';
import {
  FileText,
  Calculator,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  HelpCircle as QuestionIcon,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  Info
} from 'lucide-react';
import { Unit, Subject, TheoryQuestion, Numerical, MCQ, ViewTab } from '../../types';
import { RatingDisplay } from '../common/RatingDisplay';
import { AcademicContentRenderer } from '../common/AcademicContentRenderer';

interface UnitHubViewProps {
  unit: Unit;
  subject: Subject;
  theoryQuestions: TheoryQuestion[];
  numericals: Numerical[];
  mcqs: MCQ[];
  onOpenFacultyEvaluation?: (questionId: string) => void;
  isFaculty?: boolean;
}

export const UnitHubView: React.FC<UnitHubViewProps> = ({
  unit,
  subject,
  theoryQuestions,
  numericals,
  mcqs,
  onOpenFacultyEvaluation,
  isFaculty = false,
}) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('theory');

  // Theory Hinglish accordion state (collapsed by default)
  const [expandedHinglish, setExpandedHinglish] = useState<Record<string, boolean>>({});

  // Numericals Hinglish accordion state
  const [expandedNumHinglish, setExpandedNumHinglish] = useState<Record<string, boolean>>({});

  // MCQ state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  const toggleHinglish = (id: string) => {
    setExpandedHinglish(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleNumHinglish = (id: string) => {
    setExpandedNumHinglish(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectMCQ = (mcqId: string, option: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswers(prev => ({ ...prev, [mcqId]: option }));
  };

  const toggleRevealMCQ = (mcqId: string) => {
    setRevealedAnswers(prev => ({ ...prev, [mcqId]: !prev[mcqId] }));
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setRevealedAnswers({});
  };

  // MCQ score calculations
  const totalAttempted = Object.keys(selectedAnswers).length;
  const correctCount = mcqs.reduce((acc, mcq) => {
    return selectedAnswers[mcq.id] === mcq.correct_option ? acc + 1 : acc;
  }, 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Unit Preparation Hub Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-syllabo-100 text-syllabo-900 border border-syllabo-200">
                {subject.code} • Semester {subject.semester}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Unit {unit.unit_number} of 5
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {unit.title}
            </h1>
            {unit.description && (
              <p className="mt-2 text-slate-600 text-sm max-w-3xl leading-relaxed">
                {unit.description}
              </p>
            )}
          </div>
        </div>

        {/* 3 Core Destination Tabs */}
        <div className="flex items-center gap-3 pt-6 overflow-x-auto scrollbar-none">
          {/* Tab 1: Theory */}
          <button
            onClick={() => setActiveTab('theory')}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm ${
              activeTab === 'theory'
                ? 'bg-syllabo-900 text-white shadow-purple-900/10'
                : 'bg-stone-50 text-slate-700 hover:bg-stone-100 border border-stone-200/80'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Theory ({theoryQuestions.length})</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeTab === 'theory' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              5 Questions
            </span>
          </button>

          {/* Tab 2: Numericals */}
          <button
            onClick={() => setActiveTab('numericals')}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm ${
              activeTab === 'numericals'
                ? 'bg-syllabo-900 text-white shadow-purple-900/10'
                : 'bg-stone-50 text-slate-700 hover:bg-stone-100 border border-stone-200/80'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>2. Numericals</span>
            {!unit.numericals_applicable && (
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-slate-600">
                N/A
              </span>
            )}
          </button>

          {/* Tab 3: MCQs */}
          <button
            onClick={() => setActiveTab('mcqs')}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm ${
              activeTab === 'mcqs'
                ? 'bg-syllabo-900 text-white shadow-purple-900/10'
                : 'bg-stone-50 text-slate-700 hover:bg-stone-100 border border-stone-200/80'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>3. MCQs ({mcqs.length})</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: THEORY (Exactly 5 Comprehensive Questions)              */}
      {/* ============================================================== */}
      {activeTab === 'theory' && (
        <div className="space-y-6">
          {/* Section banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-syllabo-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-syllabo-700 shrink-0" />
              <span className="font-semibold">
                Unit Coverage Guarantee: Exactly 5 comprehensive questions covering the entire unit syllabus for 8-mark university answers.
              </span>
            </div>
            <span className="text-slate-500 text-[11px] font-medium">
              Average target: &lt;300 words with topic tags
            </span>
          </div>

          {theoryQuestions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No theory questions published</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Theory questions for this unit are being prepared according to the 5-question standard.
              </p>
            </div>
          ) : (
            theoryQuestions.map((q) => {
              const isHinglishOpen = Boolean(expandedHinglish[q.id]);
              return (
                <article
                  key={q.id}
                  className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-5 transition-all"
                >
                  {/* Question Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-stone-100">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-900 text-white tracking-wide">
                          Question {q.question_number}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          8-Mark University Format
                        </span>
                      </div>

                      {/* Question Text */}
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                        {q.question || q.question_text}
                      </h2>
                    </div>

                    {/* Aggregate Rating Display & Faculty Action */}
                    <div className="shrink-0 flex flex-col items-start sm:items-end gap-2">
                      <RatingDisplay rating={q.rating} size="md" />

                      {isFaculty && onOpenFacultyEvaluation && (
                        <button
                          onClick={() => onOpenFacultyEvaluation(q.id)}
                          className="text-xs font-semibold text-syllabo-900 hover:underline flex items-center gap-1 focus:outline-none"
                        >
                          <span>Evaluate Answer</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Topics Covered Tag Bar */}
                  {q.topics_covered && (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mr-1">
                        Topics Covered:
                      </span>
                      {(Array.isArray(q.topics_covered)
                        ? q.topics_covered
                        : typeof q.topics_covered === 'string'
                        ? (q.topics_covered as string).split(',')
                        : []
                      ).map((topic: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-lg bg-stone-100 text-slate-700 font-medium"
                        >
                          #{topic.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Structured Answer Body */}
                  <div className="space-y-4 text-slate-800 text-sm sm:text-base leading-relaxed">
                    {/* Introduction */}
                    {q.answer_intro && (
                      <div className="p-4 rounded-2xl bg-stone-50 border-l-4 border-syllabo-800 text-slate-700">
                        <span className="block text-[11px] uppercase tracking-wider font-bold text-syllabo-900 mb-1">
                          Introduction
                        </span>
                        <AcademicContentRenderer content={q.answer_intro} />
                      </div>
                    )}

                    {/* Main Body */}
                    <div className="text-slate-800 font-normal leading-relaxed pl-1">
                      <AcademicContentRenderer content={q.answer_body} />
                    </div>

                    {/* Diagram or Visual representation */}
                    {q.diagram_url && (
                      <div className="my-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                        <img
                          src={q.diagram_url}
                          alt={q.diagram_caption || 'Concept Diagram'}
                          className="max-h-72 mx-auto rounded-xl object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="80"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="11">Diagram Unavailable</text></svg>';
                          }}
                        />
                        {q.diagram_caption && (
                          <p className="text-xs text-slate-500 mt-2 font-medium">
                            {q.diagram_caption}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Conclusion */}
                    {q.answer_conclusion && (
                      <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-slate-700 text-sm">
                        <span className="block text-[11px] uppercase tracking-wider font-bold text-syllabo-900 mb-1">
                          Conclusion & Exam Tip
                        </span>
                        <AcademicContentRenderer content={q.answer_conclusion} />
                      </div>
                    )}
                  </div>

                  {/* Optional Collapsed Hinglish Explanation */}
                  {q.hinglish_explanation && (
                    <div className="pt-2">
                      <button
                        onClick={() => toggleHinglish(q.id)}
                        className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/80 hover:bg-amber-100/70 border border-amber-200/80 transition-all text-xs font-bold text-amber-950 focus:outline-none"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>Explain in Simple Hinglish</span>
                          <span className="text-[10px] font-normal text-amber-800 px-2 py-0.5 rounded-full bg-amber-200/60">
                            Quick Summary
                          </span>
                        </div>
                        {isHinglishOpen ? (
                          <ChevronUp className="w-4 h-4 text-amber-800" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-amber-800" />
                        )}
                      </button>

                      {isHinglishOpen && (
                        <div className="mt-2 p-4 rounded-2xl bg-[#FFFDF9] border border-amber-200 text-slate-800 text-sm leading-relaxed animate-fadeIn">
                          <p className="italic font-medium text-slate-800">
                            "{q.hinglish_explanation}"
                          </p>
                          <span className="block text-[10px] text-amber-800/80 mt-2 font-medium">
                            * Note: For examination writing, present the formal English answer above.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: NUMERICALS (Worked Step-by-Step Solutions)              */}
      {/* ============================================================== */}
      {activeTab === 'numericals' && (
        <div className="space-y-6">
          {!unit.numericals_applicable ? (
            /* Explicit requirement: When numericals not applicable, render clear friendly state */
            <div className="p-8 sm:p-12 rounded-3xl bg-white border border-stone-200 text-center max-w-xl mx-auto shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                <Info className="w-7 h-7 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Numericals are not applicable for this unit
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                This unit is dedicated entirely to theoretical foundations, architectures, and concepts.
                Focus your preparation on the <strong className="text-syllabo-900">Theory</strong> and <strong className="text-syllabo-900">MCQs</strong> sections.
              </p>
              <button
                onClick={() => setActiveTab('theory')}
                className="mt-6 px-6 py-2.5 rounded-2xl bg-syllabo-900 text-white font-semibold text-xs shadow-md hover:bg-syllabo-800 transition-all"
              >
                Go to Theory Questions
              </button>
            </div>
          ) : numericals.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
              <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No numerical problems added yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Worked numerical solutions for this unit will be published soon.
              </p>
            </div>
          ) : (
            numericals.map((num) => {
              const isHinglishOpen = Boolean(expandedNumHinglish[num.id]);
              return (
                <div
                  key={num.id}
                  className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6"
                >
                  {/* Problem Statement */}
                  <div className="space-y-2 pb-4 border-b border-stone-100">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-600 text-white">
                      Problem {num.problem_number}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 leading-snug">
                      <AcademicContentRenderer content={num.problem || num.problem_statement} />
                    </h2>
                  </div>

                  {/* Given & Required */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {(num.given_data || num.given) && (
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                        <span className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Given Parameters
                        </span>
                        <AcademicContentRenderer
                          content={num.given_data || num.given}
                          isMono={true}
                          className="text-slate-700 leading-relaxed"
                        />
                      </div>
                    )}

                    {(num.required_result || num.required) && (
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                        <span className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Required To Find
                        </span>
                        <AcademicContentRenderer
                          content={num.required_result || num.required}
                          className="text-slate-700 leading-relaxed font-medium"
                        />
                      </div>
                    )}
                  </div>

                  {/* Formula */}
                  {num.formula && (
                    <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs">
                      <span className="block font-bold text-syllabo-900 uppercase tracking-wider mb-1">
                        Formula Applied
                      </span>
                      <AcademicContentRenderer
                        content={num.formula}
                        isMono={true}
                        className="text-sm text-slate-800"
                      />
                    </div>
                  )}

                  {/* Step-by-Step Solution */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Step-by-Step Worked Solution
                    </span>
                    <div className="p-5 rounded-2xl bg-stone-50/70 border border-stone-200 text-sm text-slate-800 leading-relaxed">
                      <AcademicContentRenderer
                        content={num.solution_steps}
                        className="text-slate-800 leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Final Answer Badge */}
                  {num.final_answer && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                        Final Answer
                      </span>
                      <div className="text-sm font-black text-emerald-950 font-mono">
                        <AcademicContentRenderer content={num.final_answer} isMono={true} />
                      </div>
                    </div>
                  )}

                  {/* Optional Hinglish Explanation */}
                  {num.hinglish_explanation && (
                    <div className="pt-2">
                      <button
                        onClick={() => toggleNumHinglish(num.id)}
                        className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/80 hover:bg-amber-100/70 border border-amber-200 text-xs font-bold text-amber-950 focus:outline-none"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>Calculation Explanation in Simple Hinglish</span>
                        </div>
                        {isHinglishOpen ? (
                          <ChevronUp className="w-4 h-4 text-amber-800" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-amber-800" />
                        )}
                      </button>

                      {isHinglishOpen && (
                        <div className="mt-2 p-4 rounded-2xl bg-[#FFFDF9] border border-amber-200 text-slate-800 text-sm leading-relaxed animate-fadeIn">
                          <p className="italic font-medium text-slate-800">
                            "{num.hinglish_explanation}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: MCQS (15-20 Target Practice Questions)                  */}
      {/* ============================================================== */}
      {activeTab === 'mcqs' && (
        <div className="space-y-6">
          {/* MCQ Tracker Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-stone-200 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Unit Practice Questions ({mcqs.length} Available)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target 15–20 MCQs with instant feedback and answer explanations.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-stone-100 px-3 py-1.5 rounded-xl">
                <span>Score:</span>
                <span className="text-syllabo-900 font-extrabold text-sm">
                  {correctCount} / {totalAttempted}
                </span>
                <span className="text-slate-400 font-normal">attempted</span>
              </div>

              <button
                onClick={resetQuiz}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-stone-100 border border-stone-200 transition-colors"
                title="Reset answers"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {mcqs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
              <QuestionIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No MCQs published yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Multiple choice questions for this unit are being prepared.
              </p>
            </div>
          ) : (
            mcqs.map((mcq) => {
              const selected = selectedAnswers[mcq.id];
              const isRevealed = revealedAnswers[mcq.id];
              const isCorrect = selected === mcq.correct_option;

              return (
                <div
                  key={mcq.id}
                  className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {mcq.question_number}
                      </span>
                      <h2 className="text-base font-bold text-slate-900">
                        {mcq.question || mcq.question_text}
                      </h2>
                    </div>

                    {selected && (
                      <div className="shrink-0">
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Options A, B, C, D */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                      const optionText = mcq.options[optKey];
                      const isSelected = selected === optKey;
                      const isCorrectOption = mcq.correct_option === optKey;

                      let btnStyle = 'bg-stone-50 border-stone-200 text-slate-700 hover:bg-stone-100';

                      if (selected) {
                        if (isCorrectOption) {
                          btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold ring-1 ring-emerald-300';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-rose-50 border-rose-300 text-rose-950 font-semibold';
                        }
                      }

                      return (
                        <button
                          key={optKey}
                          onClick={() => handleSelectMCQ(mcq.id, optKey)}
                          className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left text-sm transition-all ${btnStyle}`}
                        >
                          <span className="w-6 h-6 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                            {optKey}
                          </span>
                          <span className="leading-snug">{optionText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Reveal Answer & Explanation Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => toggleRevealMCQ(mcq.id)}
                      className="text-xs font-semibold text-syllabo-900 hover:underline flex items-center gap-1"
                    >
                      <span>{isRevealed ? 'Hide Explanation' : 'Reveal Answer & Explanation'}</span>
                    </button>

                    {selected && (
                      <span className="text-xs text-slate-400">
                        Correct Answer: <strong className="text-slate-700">{mcq.correct_option}</strong>
                      </span>
                    )}
                  </div>

                  {/* Explanation card */}
                  {isRevealed && (
                    <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-slate-700 leading-relaxed animate-fadeIn">
                      <span className="block font-bold text-syllabo-900 uppercase tracking-wider mb-1">
                        Explanation (Option {mcq.correct_option})
                      </span>
                      <p>{mcq.explanation || 'No explanation provided for this question.'}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
