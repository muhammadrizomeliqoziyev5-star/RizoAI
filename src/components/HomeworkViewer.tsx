import React, { useState } from 'react';
import { Clock, Download, Eye, EyeOff } from 'lucide-react';
import type { HomeworkData } from '../types/lesson';

interface HomeworkViewerProps {
  homework: HomeworkData;
  onDownloadPdf: () => void;
}

export const HomeworkViewer: React.FC<HomeworkViewerProps> = ({ homework, onDownloadPdf }) => {
  const [showHints, setShowHints] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="max-w-2xl">
          <h3 className="text-lg font-semibold text-slate-900 font-display">Uyga vazifalar</h3>
          <p className="text-xs text-slate-500 mt-0.5">{homework.overview}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHints((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            {showHints ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showHints ? 'Yechimlarni yashirish' : 'O‘qituvchi yechimlari'}</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Uyga vazifani PDF yuklash</span>
          </button>
        </div>
      </div>

      {/* Tiered assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {homework.tiers.map((tier, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <span className="font-semibold text-blue-700">{tier.level}</span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Clock className="w-3.5 h-3.5" />
                  {tier.estimatedMinutes} daqiqa
                </span>
              </div>

              <h4 className="text-base font-semibold text-slate-900 font-display leading-snug">
                {tier.title}
              </h4>

              <p className="text-sm text-slate-600 leading-relaxed">{tier.taskDescription}</p>

              <ol className="flex flex-col gap-1.5 pt-1 border-t border-slate-100">
                {tier.steps.map((step, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                    <span className="font-mono text-slate-400 tabular-nums shrink-0">
                      {sIdx + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {showHints && tier.answerHint && (
              <div className="pt-3 border-t border-emerald-200 bg-emerald-50/60 -mx-5 -mb-5 px-5 py-3 rounded-b-xl">
                <div className="text-xs font-semibold text-emerald-800 mb-1">
                  Kutilayotgan javob / yo‘riqnoma
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{tier.answerHint}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rubric Table */}
      {homework.rubric && homework.rubric.length > 0 && (
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-slate-900 font-display">Baholash mezoni</h4>
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
                  <th className="py-2.5 px-4">Mezon</th>
                  <th className="py-2.5 px-4 w-24 text-right">Maks. ball</th>
                  <th className="py-2.5 px-4">Tavsif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {homework.rubric.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-medium text-slate-900">{r.criterion}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-blue-700 tabular-nums">
                      {r.maxPoints}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 text-xs leading-relaxed">
                      {r.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
