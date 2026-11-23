import React, { useState, useEffect, useMemo } from 'react';
import { Check, Download, RotateCcw, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
import type { PuzzleData, PuzzleSequenceItem } from '../types/lesson';

interface PuzzleGameProps {
  puzzle: PuzzleData;
  onDownloadPdf: () => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const PuzzleGame: React.FC<PuzzleGameProps> = ({ puzzle, onDownloadPdf }) => {
  const [mode, setMode] = useState<'pairs' | 'sequence'>('pairs');

  // Mode 1: Interlocking pair puzzle state
  const [rightOptions, setRightOptions] = useState<typeof puzzle.pairs>([]);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [mismatchNotice, setMismatchNotice] = useState<string | null>(null);

  // Mode 2: Sequence puzzle state
  const [seqList, setSeqList] = useState<PuzzleSequenceItem[]>([]);
  const [seqChecked, setSeqChecked] = useState(false);

  const resetPairs = () => {
    setRightOptions(shuffleArray(puzzle.pairs || []));
    setSelectedLeftId(null);
    setMatchedIds([]);
    setMismatchNotice(null);
  };

  const resetSequence = () => {
    const items = [...(puzzle.sequenceItems || [])];
    let scrambled = shuffleArray(items);
    // Avoid accidentally starting in already-sorted order if length > 1
    if (
      items.length > 1 &&
      scrambled.every((it, i) => it.order === items[i].order)
    ) {
      scrambled = [...items.slice(1), items[0]];
    }
    setSeqList(scrambled);
    setSeqChecked(false);
  };

  useEffect(() => {
    resetPairs();
    resetSequence();
  }, [puzzle]);

  const handleSelectRight = (rightId: string) => {
    if (!selectedLeftId) return;
    if (matchedIds.includes(rightId)) return;

    if (selectedLeftId === rightId) {
      setMatchedIds((prev) => [...prev, rightId]);
      setSelectedLeftId(null);
      setMismatchNotice(null);
    } else {
      setMismatchNotice('Mos kelmadi — boshqa pazl bo‘lagini tanlab ko‘ring.');
      setSelectedLeftId(null);
    }
  };

  const moveSeqItem = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= seqList.length) return;
    const next = [...seqList];
    [next[index], next[target]] = [next[target], next[index]];
    setSeqList(next);
    setSeqChecked(false);
  };

  const matchedPairs = useMemo(() => {
    return (puzzle.pairs || []).filter((p) => matchedIds.includes(p.id));
  }, [puzzle.pairs, matchedIds]);

  const remainingLeft = useMemo(() => {
    return (puzzle.pairs || []).filter((p) => !matchedIds.includes(p.id));
  }, [puzzle.pairs, matchedIds]);

  const remainingRight = useMemo(() => {
    return rightOptions.filter((p) => !matchedIds.includes(p.id));
  }, [rightOptions, matchedIds]);

  const totalPairs = puzzle.pairs?.length || 0;
  const allPairsSolved = totalPairs > 0 && matchedIds.length === totalPairs;
  const seqCorrectCount = seqList.filter((item, idx) => item.order === idx + 1).length;
  const allSeqSolved = seqList.length > 0 && seqCorrectCount === seqList.length;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="max-w-xl">
          <h3 className="text-lg font-semibold text-slate-900 font-display">
            Interaktiv pazl: {puzzle.gameTitle}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{puzzle.instructions}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('pairs')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                mode === 'pairs'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Juftlik pazli
            </button>
            <button
              type="button"
              onClick={() => setMode('sequence')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                mode === 'sequence'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ketma-ketlik pazli
            </button>
          </div>

          <button
            type="button"
            onClick={onDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pazlni PDF yuklash</span>
          </button>
        </div>
      </div>

      {mode === 'pairs' ? (
        <div className="flex flex-col gap-5">
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-slate-900 tabular-nums">
                Topilgan juftliklar: {matchedIds.length} / {totalPairs}
              </span>
              {mismatchNotice && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {mismatchNotice}
                </span>
              )}
              {allPairsSolved && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <Check className="w-4 h-4 shrink-0" />
                  Barcha pazl bo‘laklari muvaffaqiyatli birlashtirildi!
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={resetPairs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Qayta aralashtirish</span>
            </button>
          </div>

          {/* Interactive Matching Area */}
          {!allPairsSolved && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left puzzle pieces (Concepts) */}
              <div className="flex flex-col gap-2.5">
                <div className="text-xs font-semibold text-slate-600">
                  1-qadam: Chap bo‘lakni (tushunchani) tanlang
                </div>
                {remainingLeft.map((item) => {
                  const isSelected = selectedLeftId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedLeftId(isSelected ? null : item.id);
                        setMismatchNotice(null);
                      }}
                      className={`group relative flex items-center justify-between gap-3 text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-white text-slate-900 border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'
                      }`}
                    >
                      <span className="text-sm font-medium leading-snug">{item.concept}</span>
                      {/* Interlocking jigsaw tab indicator */}
                      <span
                        aria-hidden="true"
                        className={`w-4 h-4 rounded-full border-2 shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-white border-white'
                            : 'bg-slate-100 border-slate-300 group-hover:border-blue-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Right puzzle pieces (Definitions) */}
              <div className="flex flex-col gap-2.5">
                <div className="text-xs font-semibold text-slate-600">
                  2-qadam: Mos keladigan o‘ng bo‘lakni bosing
                </div>
                {remainingRight.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!selectedLeftId}
                    onClick={() => handleSelectRight(item.id)}
                    className={`flex items-center gap-3 text-left p-4 rounded-xl border transition-all ${
                      selectedLeftId
                        ? 'bg-white border-slate-300 hover:border-blue-600 hover:bg-blue-50/40 cursor-pointer'
                        : 'bg-slate-50 border-slate-200 text-slate-600 cursor-default'
                    }`}
                  >
                    {/* Interlocking jigsaw socket indicator */}
                    <span
                      aria-hidden="true"
                      className={`w-4 h-4 rounded-full border-2 border-dashed shrink-0 ${
                        selectedLeftId ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'
                      }`}
                    />
                    <span className="text-sm leading-snug">{item.match}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Completed interlocked pairs */}
          {matchedPairs.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <div className="text-xs font-semibold text-emerald-800">
                Birlashtirilgan pazl juftliklari
              </div>
              <div className="grid grid-cols-1 gap-2">
                {matchedPairs.map((pair) => (
                  <div
                    key={pair.id}
                    className="grid grid-cols-1 md:grid-cols-2 rounded-xl border border-emerald-200 bg-emerald-50/60 overflow-hidden"
                  >
                    <div className="p-3.5 flex items-center justify-between gap-2 border-b md:border-b-0 md:border-r border-emerald-200">
                      <span className="text-sm font-semibold text-slate-900">{pair.concept}</span>
                      <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    </div>
                    <div className="p-3.5 text-sm text-slate-700 flex items-center">
                      {pair.match}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {puzzle.sequenceTitle}
              </div>
              <div className="text-xs text-slate-500">
                Bo‘laklarni yuqori/past tugmalari orqali to‘g‘ri mantiqiy ketma-ketlikka keltiring
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetSequence}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Aralashtirish</span>
              </button>
              <button
                type="button"
                onClick={() => setSeqChecked(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-blue-700 hover:bg-blue-800 text-white whitespace-nowrap"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Tekshirish</span>
              </button>
            </div>
          </div>

          {seqChecked && (
            <div
              className={`px-4 py-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${
                allSeqSolved
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {allSeqSolved ? (
                <>
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Ajoyib! Barcha {seqList.length} ta bosqich to‘g‘ri tartibda joylashtirildi.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="tabular-nums">
                    {seqCorrectCount} / {seqList.length} ta bosqich o‘z o‘rnida. Qolganlarini qayta tartiblang.
                  </span>
                </>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            {seqList.map((item, idx) => {
              const isCorrectPos = seqChecked && item.order === idx + 1;
              const isWrongPos = seqChecked && item.order !== idx + 1;
              return (
                <div
                  key={item.order}
                  className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${
                    isCorrectPos
                      ? 'bg-emerald-50/60 border-emerald-300'
                      : isWrongPos
                      ? 'bg-amber-50/50 border-amber-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-700 flex items-center justify-center shrink-0 tabular-nums">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                      <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {item.detail}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSeqItem(idx, -1)}
                      aria-label="Yuqoriga surish"
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === seqList.length - 1}
                      onClick={() => moveSeqItem(idx, 1)}
                      aria-label="Pastga surish"
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
