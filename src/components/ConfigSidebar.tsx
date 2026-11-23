import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import type { LessonLanguage, MaterialKey, MaterialSelection } from '../types/lesson';

interface ConfigSidebarProps {
  topic: string;
  onTopicChange: (val: string) => void;
  grade: string;
  onGradeChange: (val: string) => void;
  subject: string;
  onSubjectChange: (val: string) => void;
  language: LessonLanguage;
  onLanguageChange: (val: LessonLanguage) => void;
  selected: MaterialSelection;
  onToggleMaterial: (key: MaterialKey) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onGenerate: () => void;
  isLoading: boolean;
  topicInputRef: React.RefObject<HTMLTextAreaElement | null>;
}

const MATERIAL_OPTIONS: Array<{
  key: MaterialKey;
  label: string;
  description: string;
}> = [
  {
    key: 'slides',
    label: 'Taqdimot slaydlari',
    description: '8 slaydli dars taqdimoti va o‘qituvchi nutqi',
  },
  {
    key: 'homework',
    label: 'Uyga vazifalar',
    description: 'A, B, C darajali topshiriqlar va baholash mezoni',
  },
  {
    key: 'puzzle',
    label: 'Interaktiv o‘yin (Pazl)',
    description: 'Juftlik va ketma-ketlik pazl o‘yinlari',
  },
  {
    key: 'crossword',
    label: 'Krasvord',
    description: 'Kesishuvchi katakli krossvord va savollar',
  },
  {
    key: 'methodologies',
    label: 'Turli xil metodikalar',
    description: 'Klaster, Sinkveyn, BBB va Baliq skeleti',
  },
  {
    key: 'tests',
    label: 'Testlar',
    description: '10 ta savol, 4 variant va javoblar kaliti',
  },
];

const SAMPLE_TOPICS = [
  { topic: 'Fotosintez jarayoni', grade: '6-sinf', subject: 'Biologiya' },
  { topic: 'Kvadrat tenglamalar', grade: '8-sinf', subject: 'Algebra' },
  { topic: 'Amir Temur davlati', grade: '7-sinf', subject: 'Tarix' },
  { topic: 'Present Simple zamoni', grade: '5-sinf', subject: 'Ingliz tili' },
];

export const ConfigSidebar: React.FC<ConfigSidebarProps> = ({
  topic,
  onTopicChange,
  grade,
  onGradeChange,
  subject,
  onSubjectChange,
  language,
  onLanguageChange,
  selected,
  onToggleMaterial,
  onSelectAll,
  onClearAll,
  onGenerate,
  isLoading,
  topicInputRef,
}) => {
  const selectedCount = Object.values(selected).filter(Boolean).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <aside className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 font-display">
          Dars parametrlarini kiriting
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Mavzuni yozing va kerakli o‘quv materiallariga ptichka qo‘ying.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Mavzu input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lesson-topic" className="text-xs font-semibold text-slate-700">
            Dars mavzusi
          </label>
          <textarea
            ref={topicInputRef}
            id="lesson-topic"
            rows={2}
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder="Masalan: Fotosintez jarayoni yoki Kvadrat tenglamalar..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 resize-none"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SAMPLE_TOPICS.map((item) => (
              <button
                key={item.topic}
                type="button"
                onClick={() => {
                  onTopicChange(item.topic);
                  onGradeChange(item.grade);
                  onSubjectChange(item.subject);
                }}
                className="text-xs px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors whitespace-nowrap"
              >
                {item.topic}
              </button>
            ))}
          </div>
        </div>

        {/* Sinf va Fan */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lesson-grade" className="text-xs font-semibold text-slate-700">
              Sinf / Bosqich
            </label>
            <select
              id="lesson-grade"
              value={grade}
              onChange={(e) => onGradeChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
            >
              <option value="1–4-sinf (Boshlang‘ich)">1–4-sinf</option>
              <option value="5-sinf">5-sinf</option>
              <option value="6-sinf">6-sinf</option>
              <option value="7-sinf">7-sinf</option>
              <option value="8-sinf">8-sinf</option>
              <option value="9-sinf">9-sinf</option>
              <option value="10–11-sinf (Yuqori)">10–11-sinf</option>
              <option value="OTM / Kollej">OTM / Kollej</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="lesson-subject" className="text-xs font-semibold text-slate-700">
              Fan (ixtiyoriy)
            </label>
            <input
              id="lesson-subject"
              type="text"
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              placeholder="Avto aniqlanadi"
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
            />
          </div>
        </div>

        {/* Til tanlash */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-700">Materiallar tili</span>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { id: 'uz_latin', label: 'O‘zbek (Lotin)' },
                { id: 'uz_cyrillic', label: 'Ўзбек (Кирилл)' },
                { id: 'en', label: 'Ingliz tili' },
                { id: 'ru', label: 'Rus tili' },
              ] as Array<{ id: LessonLanguage; label: string }>
            ).map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => onLanguageChange(lang.id)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap truncate ${
                  language === lang.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ptichka qo'yish (Checkboxes) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 tabular-nums">
              Kerakli materiallar ({selectedCount}/6)
            </span>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={onSelectAll}
                className="text-blue-700 hover:underline font-medium whitespace-nowrap"
              >
                Barchasi
              </button>
              <span className="text-slate-300" aria-hidden="true">
                /
              </span>
              <button
                type="button"
                onClick={onClearAll}
                className="text-slate-500 hover:text-slate-800 hover:underline whitespace-nowrap"
              >
                Tozalash
              </button>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {MATERIAL_OPTIONS.map((item) => {
              const checked = selected[item.key];
              return (
                <label
                  key={item.key}
                  className={`flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors select-none ${
                    checked ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleMaterial(item.key)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                      checked
                        ? 'bg-blue-700 border-blue-700 text-white'
                        : 'bg-white border-slate-300 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 leading-snug">
                      {item.label}
                    </div>
                    <div className="text-xs text-slate-500 leading-snug mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Generate CTA */}
        <button
          type="submit"
          disabled={isLoading || !topic.trim() || selectedCount === 0}
          className="w-full py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>Materiallar yaratilmoqda...</span>
            </>
          ) : (
            <span>Materiallarni yaratish</span>
          )}
        </button>
      </form>
    </aside>
  );
};
