import React from 'react';
import { BookOpen, Trash2 } from 'lucide-react';
import type { GeneratedLessonPack, MaterialKey } from '../types/lesson';

interface HistoryViewProps {
  history: GeneratedLessonPack[];
  onOpenLesson: (lesson: GeneratedLessonPack) => void;
  onDeleteLesson: (id: string) => void;
  onBackToStudio: () => void;
}

const MATERIAL_LABELS: Record<MaterialKey, string> = {
  slides: 'Taqdimot',
  homework: 'Uyga vazifa',
  puzzle: 'Pazl',
  crossword: 'Krasvord',
  methodologies: 'Metodika',
  tests: 'Testlar',
};

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onOpenLesson,
  onDeleteLesson,
  onBackToStudio,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Saqlangan darslar tarixi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Avval yaratilgan mavzular brauzeringizda saqlanadi va istalgan vaqtda PDF yuklab olishingiz mumkin.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToStudio}
          className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 whitespace-nowrap"
        >
          Studiyaga qaytish
        </button>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center flex flex-col items-center gap-3">
          <BookOpen className="w-8 h-8 text-slate-400" />
          <div className="text-base font-semibold text-slate-900">Hozircha saqlangan darslar yo‘q</div>
          <p className="text-sm text-slate-500 max-w-md">
            Yangi dars mavzusini kiriting va materiallarni yarating — ular avtomatik ravishda shu bo‘limda saqlanadi.
          </p>
          <button
            type="button"
            onClick={onBackToStudio}
            className="mt-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold"
          >
            Birinchi darsni yaratish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((item) => {
            const activeLabels = (Object.keys(item.selected) as MaterialKey[])
              .filter((k) => item.selected[k])
              .map((k) => MATERIAL_LABELS[k]);

            const dateStr = new Date(item.createdAt).toLocaleDateString('uz-UZ', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      {item.subject} · {item.grade}
                    </span>
                    <span className="tabular-nums">{dateStr}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 font-display leading-snug">
                    {item.topic}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="text-xs text-slate-500 pt-1">
                    {activeLabels.join(' · ')}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onOpenLesson(item)}
                    className="px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    Materiallarni ochish
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteLesson(item.id)}
                    aria-label="O‘chirish"
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
