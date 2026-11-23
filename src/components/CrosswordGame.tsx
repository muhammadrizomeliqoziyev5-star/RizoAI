import React, { useState, useEffect, useRef } from 'react';
import { Check, Download, Eye, EyeOff, Lightbulb, RotateCcw } from 'lucide-react';
import type { CrosswordGridData, Direction, PlacedWord } from '../utils/crosswordLayout';

interface CrosswordGameProps {
  title: string;
  grid: CrosswordGridData;
  onDownloadPdf: () => void;
}

export const CrosswordGame: React.FC<CrosswordGameProps> = ({
  title,
  grid,
  onDownloadPdf,
}) => {
  const [userLetters, setUserLetters] = useState<Record<string, string>>({});
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [direction, setDirection] = useState<Direction>('across');
  const [checked, setChecked] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    setUserLetters({});
    setChecked(false);
    setShowSolution(false);
    const firstWord = grid.placedWords[0];
    if (firstWord) {
      setActiveCell({ row: firstWord.row, col: firstWord.col });
      setDirection(firstWord.direction);
    } else {
      setActiveCell(null);
    }
  }, [grid]);

  const keyOf = (r: number, c: number) => `${r},${c}`;

  const activeWord: PlacedWord | null = (() => {
    if (!activeCell) return null;
    const cell = grid.cells[activeCell.row]?.[activeCell.col];
    if (!cell) return null;
    const targetNum = direction === 'across' ? cell.acrossNum : cell.downNum;
    if (targetNum !== null) {
      return (
        grid.placedWords.find((w) => w.number === targetNum && w.direction === direction) || null
      );
    }
    // Fallback to the other direction if current direction has no word at this cell
    const altDir: Direction = direction === 'across' ? 'down' : 'across';
    const altNum = altDir === 'across' ? cell.acrossNum : cell.downNum;
    if (altNum !== null) {
      return grid.placedWords.find((w) => w.number === altNum && w.direction === altDir) || null;
    }
    return null;
  })();

  const isCellInActiveWord = (r: number, c: number) => {
    if (!activeWord) return false;
    if (activeWord.direction === 'across') {
      return r === activeWord.row && c >= activeWord.col && c < activeWord.col + activeWord.word.length;
    }
    return c === activeWord.col && r >= activeWord.row && r < activeWord.row + activeWord.word.length;
  };

  const focusCell = (r: number, c: number) => {
    setActiveCell({ row: r, col: c });
    inputRefs.current[keyOf(r, c)]?.focus();
  };

  const handleCellClick = (r: number, c: number) => {
    const cell = grid.cells[r]?.[c];
    if (!cell || !cell.letter) return;

    if (activeCell && activeCell.row === r && activeCell.col === c) {
      // Toggle direction if intersection
      if (cell.acrossNum !== null && cell.downNum !== null) {
        setDirection((d) => (d === 'across' ? 'down' : 'across'));
      }
    } else {
      if (direction === 'across' && cell.acrossNum === null && cell.downNum !== null) {
        setDirection('down');
      } else if (direction === 'down' && cell.downNum === null && cell.acrossNum !== null) {
        setDirection('across');
      }
    }
    focusCell(r, c);
  };

  const handleInputChange = (r: number, c: number, rawVal: string) => {
    const cleaned = rawVal
      .toUpperCase()
      .replace(/[^A-Z\u0400-\u04FF]/g, '')
      .slice(-1);
    setChecked(false);
    setUserLetters((prev) => ({
      ...prev,
      [keyOf(r, c)]: cleaned,
    }));

    if (cleaned) {
      const nextR = direction === 'down' ? r + 1 : r;
      const nextC = direction === 'across' ? c + 1 : c;
      if (grid.cells[nextR]?.[nextC]?.letter) {
        focusCell(nextR, nextC);
      }
    }
  };

  const handleKeyDown = (r: number, c: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !userLetters[keyOf(r, c)]) {
      e.preventDefault();
      const prevR = direction === 'down' ? r - 1 : r;
      const prevC = direction === 'across' ? c - 1 : c;
      if (grid.cells[prevR]?.[prevC]?.letter) {
        focusCell(prevR, prevC);
      }
    } else if (e.key === 'ArrowRight' && grid.cells[r]?.[c + 1]?.letter) {
      e.preventDefault();
      focusCell(r, c + 1);
    } else if (e.key === 'ArrowLeft' && grid.cells[r]?.[c - 1]?.letter) {
      e.preventDefault();
      focusCell(r, c - 1);
    } else if (e.key === 'ArrowDown' && grid.cells[r + 1]?.[c]?.letter) {
      e.preventDefault();
      focusCell(r + 1, c);
    } else if (e.key === 'ArrowUp' && grid.cells[r - 1]?.[c]?.letter) {
      e.preventDefault();
      focusCell(r - 1, c);
    }
  };

  const handleHint = () => {
    if (!activeCell) return;
    const cell = grid.cells[activeCell.row]?.[activeCell.col];
    if (!cell || !cell.letter) return;
    setUserLetters((prev) => ({
      ...prev,
      [keyOf(activeCell.row, activeCell.col)]: cell.letter!,
    }));
    setChecked(false);
  };

  const handleClueClick = (pw: PlacedWord) => {
    setDirection(pw.direction);
    focusCell(pw.row, pw.col);
  };

  // Compute progress stats
  let totalLetterCells = 0;
  let correctCount = 0;
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const letter = grid.cells[r][c].letter;
      if (letter) {
        totalLetterCells++;
        if (userLetters[keyOf(r, c)] === letter) {
          correctCount++;
        }
      }
    }
  }

  const acrossWords = grid.placedWords.filter((w) => w.direction === 'across');
  const downWords = grid.placedWords.filter((w) => w.direction === 'down');

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 font-display">
            Krasvord: {title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {grid.placedWords.length} ta so‘z to‘rga joylashtirildi · Katakni bosib harf kiriting
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleHint}
            disabled={!activeCell}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap shrink-0"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Harf ochish</span>
          </button>

          <button
            type="button"
            onClick={() => setChecked(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Tekshirish</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSolution((s) => !s)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            {showSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showSolution ? 'Yechimni yopish' : 'Javoblar'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setUserLetters({});
              setChecked(false);
              setShowSolution(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tozalash</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Krasvordni PDF yuklash</span>
          </button>
        </div>
      </div>

      {/* Active Clue Banner */}
      {activeWord && (
        <div className="px-4 py-2.5 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono font-semibold text-blue-800 shrink-0 tabular-nums">
              {activeWord.number}-{activeWord.direction === 'across' ? 'Gorizontal' : 'Vertikal'}:
            </span>
            <span className="text-slate-800 truncate">{activeWord.clue}</span>
          </div>
          <span className="text-xs font-mono text-blue-700 shrink-0 tabular-nums">
            ({activeWord.word.length} harf)
          </span>
        </div>
      )}

      {checked && (
        <div
          className={`px-4 py-2.5 rounded-lg border text-xs font-medium flex items-center justify-between ${
            correctCount === totalLetterCells
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <span className="tabular-nums">
            To‘g‘ri topilgan harflar: {correctCount} / {totalLetterCells}
          </span>
          {correctCount === totalLetterCells && (
            <span className="font-semibold">Krasvord to‘liq va to‘g‘ri yechildi!</span>
          )}
        </div>
      )}

      {/* Grid + Clues */}
      <div className="grid grid-cols-1 xl:grid-cols-[auto_1fr] gap-6 items-start">
        {/* 2D Grid */}
        <div className="overflow-x-auto pb-2">
          <div
            className="inline-grid gap-[2px] p-2 bg-slate-800 rounded-xl border border-slate-700"
            style={{
              gridTemplateColumns: `repeat(${grid.cols}, minmax(28px, 36px))`,
            }}
          >
            {grid.cells.map((row, r) =>
              row.map((cell, c) => {
                if (!cell.letter) {
                  return (
                    <div
                      key={`${r}-${c}`}
                      className="aspect-square bg-slate-800 rounded-[3px]"
                      aria-hidden="true"
                    />
                  );
                }

                const k = keyOf(r, c);
                const val = showSolution ? cell.letter : userLetters[k] || '';
                const isActive = activeCell?.row === r && activeCell?.col === c;
                const inWord = isCellInActiveWord(r, c);
                const isCorrect = checked && !showSolution && val === cell.letter;
                const isWrong = checked && !showSolution && val !== '' && val !== cell.letter;

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`relative aspect-square rounded-[3px] flex items-center justify-center cursor-pointer select-none transition-colors ${
                      isActive
                        ? 'bg-blue-100 ring-2 ring-blue-600 z-10'
                        : isCorrect
                        ? 'bg-emerald-50'
                        : isWrong
                        ? 'bg-rose-50'
                        : inWord
                        ? 'bg-blue-50/70'
                        : 'bg-white'
                    }`}
                  >
                    {cell.number && (
                      <span className="absolute top-[1px] left-[3px] text-[9px] leading-none font-mono font-semibold text-slate-500 tabular-nums pointer-events-none">
                        {cell.number}
                      </span>
                    )}
                    <input
                      ref={(el) => {
                        inputRefs.current[k] = el;
                      }}
                      type="text"
                      maxLength={2}
                      value={val}
                      readOnly={showSolution}
                      onChange={(e) => handleInputChange(r, c, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(r, c, e)}
                      aria-label={`Katak ${r + 1}-${c + 1}`}
                      className={`w-full h-full bg-transparent text-center font-mono font-bold text-sm sm:text-base uppercase focus:outline-none pt-1 ${
                        showSolution
                          ? 'text-blue-700'
                          : isCorrect
                          ? 'text-emerald-700'
                          : isWrong
                          ? 'text-rose-700'
                          : 'text-slate-900'
                      }`}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Clues Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="text-xs font-semibold text-slate-900 mb-2.5">
              Gorizontal (Bo‘yiga)
            </h4>
            <ul className="flex flex-col gap-1.5">
              {acrossWords.map((pw) => {
                const isSelected =
                  activeWord?.number === pw.number && activeWord?.direction === 'across';
                return (
                  <li key={`a-${pw.number}`}>
                    <button
                      type="button"
                      onClick={() => handleClueClick(pw)}
                      className={`w-full text-left text-xs px-2.5 py-2 rounded-lg transition-colors flex items-start gap-2 ${
                        isSelected
                          ? 'bg-blue-50 text-blue-900 font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-mono font-semibold text-slate-500 tabular-nums shrink-0">
                        {pw.number}.
                      </span>
                      <span className="leading-relaxed">
                        {pw.clue}{' '}
                        <span className="text-slate-400 font-mono tabular-nums">
                          ({pw.word.length})
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="text-xs font-semibold text-slate-900 mb-2.5">
              Vertikal (Tik)
            </h4>
            <ul className="flex flex-col gap-1.5">
              {downWords.map((pw) => {
                const isSelected =
                  activeWord?.number === pw.number && activeWord?.direction === 'down';
                return (
                  <li key={`d-${pw.number}`}>
                    <button
                      type="button"
                      onClick={() => handleClueClick(pw)}
                      className={`w-full text-left text-xs px-2.5 py-2 rounded-lg transition-colors flex items-start gap-2 ${
                        isSelected
                          ? 'bg-blue-50 text-blue-900 font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-mono font-semibold text-slate-500 tabular-nums shrink-0">
                        {pw.number}.
                      </span>
                      <span className="leading-relaxed">
                        {pw.clue}{' '}
                        <span className="text-slate-400 font-mono tabular-nums">
                          ({pw.word.length})
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
