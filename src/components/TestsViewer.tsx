import React, { useState, useEffect } from 'react';
import { Check, Download, Eye, EyeOff, RotateCcw, X } from 'lucide-react';
import type { TestQuestion } from '../types/lesson';

interface TestsViewerProps {
  questions: TestQuestion[];
  onDownloadPdf: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const TestsViewer: React.FC<TestsViewerProps> = ({ questions, onDownloadPdf }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [teacherMode, setTeacherMode] = useState(false);

  useEffect(() => {
    setSelectedAnswers({});
    setSubmitted(false);
  }, [questions]);

  if (!questions || questions.length === 0) return null;

  const answeredCount = Object.keys(selectedAnswers).length;
  const score = questions.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.correctIndex ? 1 : 0);
  }, 0);
  const percent = Math.round((score / questions.length) * 100);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 font-display">Nazorat testlari</h3>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {questions.length} ta test savoli · Interaktiv yechish yoki javoblar kalitini ko‘rish
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTeacherMode((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            {teacherMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{teacherMode ? 'O‘quvchi rejimi' : 'Javoblar kaliti'}</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Testlarni PDF yuklash</span>
          </button>
        </div>
      </div>

      {/* Quiz Result Banner */}
      {submitted && !teacherMode && (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900 tabular-nums">
              Natija: {score} / {questions.length} ({percent}%)
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              Har bir savol ostida to‘g‘ri javob va qisqa izoh ko‘rsatildi.
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedAnswers({});
              setSubmitted(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Qayta yechish</span>
          </button>
        </div>
      )}

      {/* Questions list */}
      <div className="flex flex-col gap-4">
        {questions.map((q, qIdx) => {
          const userPick = selectedAnswers[q.id];
          const reveal = teacherMode || submitted;

          return (
            <div
              key={q.id}
              className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col gap-3.5"
            >
              <div className="flex items-start gap-2.5">
                <span className="font-mono text-xs font-semibold text-blue-700 mt-1 shrink-0 tabular-nums">
                  {String(qIdx + 1).padStart(2, '0')}.
                </span>
                <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                  {q.question}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-0 sm:pl-6">
                {q.options.map((opt, optIdx) => {
                  const isPicked = userPick === optIdx;
                  const isCorrect = q.correctIndex === optIdx;

                  let styleClass =
                    'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-slate-50';
                  if (reveal) {
                    if (isCorrect) {
                      styleClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium';
                    } else if (isPicked && !isCorrect) {
                      styleClass = 'bg-rose-50 border-rose-300 text-rose-900';
                    } else {
                      styleClass = 'bg-slate-50/50 border-slate-200 text-slate-500';
                    }
                  } else if (isPicked) {
                    styleClass = 'bg-blue-50 border-blue-600 text-blue-950 font-medium';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={reveal}
                      onClick={() =>
                        setSelectedAnswers((prev) => ({
                          ...prev,
                          [q.id]: optIdx,
                        }))
                      }
                      className={`flex items-center justify-between gap-3 text-left px-3.5 py-2.5 rounded-lg border text-sm transition-colors ${styleClass}`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="font-mono text-xs font-semibold shrink-0 mt-0.5">
                          {OPTION_LETTERS[optIdx] || optIdx + 1})
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </div>
                      {reveal && isCorrect && (
                        <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                      )}
                      {reveal && isPicked && !isCorrect && (
                        <X className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {reveal && q.explanation && (
                <div className="sm:ml-6 px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">Izoh: </span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit button for interactive quiz */}
      {!teacherMode && !submitted && (
        <div className="flex items-center justify-between gap-4 pt-2">
          <span className="text-xs text-slate-500 tabular-nums">
            Belgilangan savollar: {answeredCount} / {questions.length}
          </span>
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={answeredCount === 0}
            className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors whitespace-nowrap"
          >
            Testni tekshirish
          </button>
        </div>
      )}
    </div>
  );
};
