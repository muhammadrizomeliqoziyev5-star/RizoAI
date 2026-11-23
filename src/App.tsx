import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Download, AlertCircle, Check } from 'lucide-react';
import type {
  GeneratedLessonPack,
  LessonLanguage,
  MaterialKey,
  MaterialSelection,
} from './types/lesson';
import { buildCrosswordGrid } from './utils/crosswordLayout';
import { downloadFullLessonPdf, downloadModulePdf } from './utils/pdfExporter';
import { Header } from './components/Header';
import { ConfigSidebar } from './components/ConfigSidebar';
import { EmptyStudioState } from './components/EmptyStudioState';
import { SlidesViewer } from './components/SlidesViewer';
import { HomeworkViewer } from './components/HomeworkViewer';
import { PuzzleGame } from './components/PuzzleGame';
import { CrosswordGame } from './components/CrosswordGame';
import { MethodologiesViewer } from './components/MethodologiesViewer';
import { TestsViewer } from './components/TestsViewer';
import { HistoryView } from './components/HistoryView';
import { GuideView } from './components/GuideView';

const HISTORY_STORAGE_KEY = 'ustozai_lesson_history_v1';

const TAB_LABELS: Array<{ key: MaterialKey; label: string }> = [
  { key: 'slides', label: 'Taqdimot' },
  { key: 'homework', label: 'Uyga vazifa' },
  { key: 'puzzle', label: 'Pazl o‘yini' },
  { key: 'crossword', label: 'Krasvord' },
  { key: 'methodologies', label: 'Metodikalar' },
  { key: 'tests', label: 'Testlar' },
];

export default function App() {
  const [activeSection, setActiveSection] = useState<'studio' | 'history' | 'guide'>('studio');

  // Form state
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('7-sinf');
  const [subject, setSubject] = useState('');
  const [language, setLanguage] = useState<LessonLanguage>('uz_latin');
  const [selected, setSelected] = useState<MaterialSelection>({
    slides: true,
    homework: true,
    puzzle: true,
    crossword: true,
    methodologies: true,
    tests: true,
  });

  // Generation state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<GeneratedLessonPack | null>(null);
  const [activeTab, setActiveTab] = useState<MaterialKey>('slides');
  const [includeAnswersInPdf, setIncludeAnswersInPdf] = useState(true);

  // History persistence
  const [history, setHistory] = useState<GeneratedLessonPack[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as GeneratedLessonPack[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 15)));
    } catch {
      // Ignore storage quota errors
    }
  }, [history]);

  const topicInputRef = useRef<HTMLTextAreaElement | null>(null);

  const crosswordGrid = useMemo(() => {
    if (!currentLesson?.crossword?.words?.length) return null;
    return buildCrosswordGrid(currentLesson.crossword.words);
  }, [currentLesson?.crossword]);

  const availableTabs = useMemo(() => {
    if (!currentLesson) return [];
    return TAB_LABELS.filter((t) => {
      if (t.key === 'slides') return Boolean(currentLesson.slides?.length);
      if (t.key === 'homework') return Boolean(currentLesson.homework);
      if (t.key === 'puzzle') return Boolean(currentLesson.puzzle);
      if (t.key === 'crossword') return Boolean(currentLesson.crossword);
      if (t.key === 'methodologies') return Boolean(currentLesson.methodologies);
      if (t.key === 'tests') return Boolean(currentLesson.tests?.length);
      return false;
    });
  }, [currentLesson]);

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some((t) => t.key === activeTab)) {
      setActiveTab(availableTabs[0].key);
    }
  }, [availableTabs, activeTab]);

  const handleToggleMaterial = (key: MaterialKey) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = () => {
    setSelected({
      slides: true,
      homework: true,
      puzzle: true,
      crossword: true,
      methodologies: true,
      tests: true,
    });
  };

  const handleClearAll = () => {
    setSelected({
      slides: false,
      homework: false,
      puzzle: false,
      crossword: false,
      methodologies: false,
      tests: false,
    });
  };

  const generateLesson = async (
    overrideTopic?: string,
    overrideGrade?: string,
    overrideSubject?: string
  ) => {
    const finalTopic = (overrideTopic ?? topic).trim();
    const finalGrade = overrideGrade ?? grade;
    const finalSubject = overrideSubject ?? subject;

    if (!finalTopic) {
      setErrorMsg('Iltimos, dars mavzusini kiriting.');
      return;
    }

    if (!Object.values(selected).some(Boolean)) {
      setErrorMsg('Kamida bitta material turiga ptichka qo‘ying.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setActiveSection('studio');

    try {
      const res = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: finalTopic,
          grade: finalGrade,
          subject: finalSubject,
          language,
          selected,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Serverdan xatolik qaytdi.');
      }

      const pack = data as GeneratedLessonPack;
      setCurrentLesson(pack);
      setHistory((prev) => [pack, ...prev.filter((h) => h.id !== pack.id)].slice(0, 15));

      const firstEnabled = TAB_LABELS.find((t) => pack.selected[t.key]);
      if (firstEnabled) setActiveTab(firstEnabled.key);
    } catch (err: any) {
      setErrorMsg(
        err?.message || "Materiallarni yaratishda xatolik yuz berdi. Qayta urinib ko'ring."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickSample = (sampleTopic: string, sampleGrade: string, sampleSubject: string) => {
    setTopic(sampleTopic);
    setGrade(sampleGrade);
    setSubject(sampleSubject);
    generateLesson(sampleTopic, sampleGrade, sampleSubject);
  };

  const handleOpenFromHistory = (lesson: GeneratedLessonPack) => {
    setCurrentLesson(lesson);
    setTopic(lesson.topic);
    setGrade(lesson.grade);
    setSubject(lesson.subject);
    setLanguage(lesson.language);
    setSelected(lesson.selected);
    setActiveSection('studio');
  };

  const handleDeleteFromHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (currentLesson?.id === id) {
      setCurrentLesson(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Header
        activeSection={activeSection}
        onNavigate={setActiveSection}
        hasLesson={Boolean(currentLesson)}
        onDownloadAllPdf={() => {
          if (currentLesson) {
            downloadFullLessonPdf(currentLesson, crosswordGrid, includeAnswersInPdf);
          }
        }}
        onFocusTopic={() => {
          setTimeout(() => topicInputRef.current?.focus(), 50);
        }}
        historyCount={history.length}
      />

      <main className="flex-1 w-full">
        {activeSection === 'history' && (
          <HistoryView
            history={history}
            onOpenLesson={handleOpenFromHistory}
            onDeleteLesson={handleDeleteFromHistory}
            onBackToStudio={() => setActiveSection('studio')}
          />
        )}

        {activeSection === 'guide' && (
          <GuideView onBackToStudio={() => setActiveSection('studio')} />
        )}

        {activeSection === 'studio' && (
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
            {/* Left Zone: Topic & Material Checklist */}
            <ConfigSidebar
              topic={topic}
              onTopicChange={setTopic}
              grade={grade}
              onGradeChange={setGrade}
              subject={subject}
              onSubjectChange={setSubject}
              language={language}
              onLanguageChange={setLanguage}
              selected={selected}
              onToggleMaterial={handleToggleMaterial}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
              onGenerate={() => generateLesson()}
              isLoading={isLoading}
              topicInputRef={topicInputRef}
            />

            {/* Right Zone: Interactive Materials Studio */}
            <section className="flex flex-col gap-4 min-w-0">
              {errorMsg && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {isLoading ? (
                <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col gap-6 animate-pulse">
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-40 bg-slate-200 rounded" />
                    <div className="h-7 w-80 max-w-full bg-slate-200 rounded" />
                    <div className="h-4 w-full max-w-2xl bg-slate-100 rounded" />
                  </div>
                  <div className="h-10 w-full bg-slate-100 rounded-lg" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-44 bg-slate-100 rounded-xl" />
                    <div className="h-44 bg-slate-100 rounded-xl" />
                  </div>
                  <div className="text-xs text-slate-500">
                    Mavzu bo‘yicha tanlangan materiallar tayyorlanmoqda...
                  </div>
                </div>
              ) : !currentLesson ? (
                <EmptyStudioState onPickSample={handlePickSample} />
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col gap-6">
                  {/* Lesson Pack Studio Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-col gap-1.5 min-w-0 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{currentLesson.subject}</span>
                        <span aria-hidden="true">·</span>
                        <span>{currentLesson.grade}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {availableTabs.length} ta material tayyor
                        </span>
                      </div>
                      <h1 className="text-2xl font-bold text-slate-900 font-display leading-tight text-balance">
                        {currentLesson.topic}
                      </h1>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {currentLesson.summary}
                      </p>
                    </div>

                    {/* PDF Export Toolbar */}
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIncludeAnswersInPdf((v) => !v)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          includeAnswersInPdf
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            includeAnswersInPdf
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-slate-300'
                          }`}
                        >
                          {includeAnswersInPdf && <Check className="w-3 h-3 stroke-[2.5]" />}
                        </span>
                        <span>
                          {includeAnswersInPdf
                            ? 'PDF: Javoblar bilan'
                            : 'PDF: O‘quvchilar uchun'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          downloadFullLessonPdf(
                            currentLesson,
                            crosswordGrid,
                            includeAnswersInPdf
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors whitespace-nowrap shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>To‘liq to‘plamni PDF yuklash</span>
                      </button>
                    </div>
                  </div>

                  {/* Module Switcher Tabs */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
                    {availableTabs.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                          activeTab === tab.key
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Active Module Content */}
                  <div>
                    {activeTab === 'slides' && currentLesson.slides && (
                      <SlidesViewer
                        slides={currentLesson.slides}
                        topic={currentLesson.topic}
                        grade={currentLesson.grade}
                        onDownloadPdf={() =>
                          downloadModulePdf(
                            'slides',
                            currentLesson,
                            crosswordGrid,
                            includeAnswersInPdf
                          )
                        }
                      />
                    )}

                    {activeTab === 'homework' && currentLesson.homework && (
                      <HomeworkViewer
                        homework={currentLesson.homework}
                        onDownloadPdf={() =>
                          downloadModulePdf(
                            'homework',
                            currentLesson,
                            crosswordGrid,
                            includeAnswersInPdf
                          )
                        }
                      />
                    )}

                    {activeTab === 'puzzle' && currentLesson.puzzle && (
                      <PuzzleGame
                        puzzle={currentLesson.puzzle}
                        onDownloadPdf={() =>
                          downloadModulePdf(
                            'puzzle',
                            currentLesson,
                            crosswordGrid,
                            includeAnswersInPdf
                          )
                        }
                      />
                    )}

                    {activeTab === 'crossword' &&
                      currentLesson.crossword &&
                      crosswordGrid && (
                        <CrosswordGame
                          title={currentLesson.crossword.title}
                          grid={crosswordGrid}
                          onDownloadPdf={() =>
                            downloadModulePdf(
                              'crossword',
                              currentLesson,
                              crosswordGrid,
                              includeAnswersInPdf
                            )
                          }
                        />
                      )}

                    {activeTab === 'methodologies' && currentLesson.methodologies && (
                      <MethodologiesViewer
                        methodologies={currentLesson.methodologies}
                        onDownloadPdf={() =>
                          downloadModulePdf(
                            'methodologies',
                            currentLesson,
                            crosswordGrid,
                            includeAnswersInPdf
                          )
                        }
                      />
                    )}

                    {activeTab === 'tests' && currentLesson.tests && (
                      <TestsViewer
                        questions={currentLesson.tests}
                        onDownloadPdf={() =>
                          downloadModulePdf(
                            'tests',
                            currentLesson,
                            crosswordGrid,
                            includeAnswersInPdf
                          )
                        }
                      />
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
