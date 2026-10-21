import React from 'react';
import { BookOpen, Calculator, HelpCircle, CheckCircle2, ChevronRight, AlertCircle, FileText } from 'lucide-react';
import { Subject, Unit } from '../../types';

interface SubjectDetailViewProps {
  subject: Subject;
  units: Unit[];
  onSelectUnit: (unit: Unit) => void;
  onBack: () => void;
}

export const SubjectDetailView: React.FC<SubjectDetailViewProps> = ({
  subject,
  units,
  onSelectUnit,
  onBack,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Subject Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-syllabo-100 text-syllabo-900 border border-syllabo-200">
                {subject.code}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Semester {subject.semester}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {subject.name}
            </h1>
            {subject.description && (
              <p className="mt-2 text-slate-600 text-sm max-w-2xl leading-relaxed">
                {subject.description}
              </p>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-center">
              <span className="block text-2xl font-black text-slate-900">{units.length}</span>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Units Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Units List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Syllabus Units
          </h2>
          <span className="text-xs text-slate-500">
            Select a unit to access Theory, Numericals, and MCQs
          </span>
        </div>

        {units.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-6">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No units published yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Curriculum content for this subject has not been published yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {units.map((unit) => (
              <div
                key={unit.id}
                onClick={() => onSelectUnit(unit)}
                className="p-6 rounded-3xl bg-white border border-stone-200/90 hover:border-syllabo-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Unit {unit.unit_number}
                    </span>
                    {unit.numericals_applicable ? (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1">
                        <Calculator className="w-3 h-3" />
                        Numericals Applicable
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200 flex items-center gap-1">
                        Theory & MCQs Only
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-syllabo-900 transition-colors">
                    {unit.title}
                  </h3>

                  {unit.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl leading-relaxed">
                      {unit.description}
                    </p>
                  )}

                  {/* Section badges preview */}
                  <div className="flex items-center gap-4 pt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-syllabo-700" />
                      5 Theory Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                      MCQs Included
                    </span>
                  </div>
                </div>

                {/* Enter Hub CTA */}
                <div className="shrink-0 flex items-center self-end md:self-center">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-surface-canvas border border-stone-200 group-hover:bg-syllabo-900 group-hover:text-white transition-all text-sm font-semibold text-slate-800 shadow-sm">
                    <span>Open Unit Hub</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
