import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  MessageSquareText,
  Image as ImageIcon,
} from 'lucide-react';
import type { SlideItem } from '../types/lesson';

interface SlidesViewerProps {
  slides: SlideItem[];
  topic: string;
  grade: string;
  onDownloadPdf: () => void;
}

export const SlidesViewer: React.FC<SlidesViewerProps> = ({
  slides,
  topic,
  grade,
  onDownloadPdf,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
  }, [slides]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [slides.length, isFullscreen]);

  if (!slides || slides.length === 0) return null;

  const slide = slides[currentIndex] || slides[0];

  const slideStage = (
    <div
      className={`flex flex-col justify-between bg-slate-900 text-white rounded-xl border border-slate-800 overflow-hidden ${
        isFullscreen ? 'w-full h-full p-8 sm:p-14' : 'aspect-video p-6 sm:p-10'
      }`}
    >
      {/* Top slide metadata */}
      <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <span className="font-medium text-blue-300">{topic}</span>
          <span aria-hidden="true">·</span>
          <span>{grade}</span>
        </div>
        <span className="font-mono tabular-nums shrink-0 text-slate-300">
          {String(slide.slideNumber).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </span>
      </div>

      {/* Main Slide Body */}
      <div className="my-auto py-4 flex flex-col gap-4 max-w-3xl">
        <div>
          {slide.subtitle && (
            <p className="text-xs sm:text-sm font-medium text-blue-300 mb-1.5">
              {slide.subtitle}
            </p>
          )}
          <h3
            className={`font-display font-bold text-white leading-tight text-balance ${
              isFullscreen ? 'text-3xl sm:text-5xl' : 'text-xl sm:text-3xl'
            }`}
          >
            {slide.title}
          </h3>
        </div>

        <ul className="flex flex-col gap-2.5 mt-1">
          {slide.bulletPoints.map((point, idx) => (
            <li
              key={idx}
              className={`flex items-start gap-3 text-slate-200 leading-relaxed ${
                isFullscreen ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
              }`}
            >
              <span className="font-mono text-blue-400 text-xs mt-1.5 shrink-0 tabular-nums">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Slide Visual Idea Hint & Controls */}
      <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <ImageIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">Vizual g‘oya: {slide.visualIdea}</span>
        </div>

        {isFullscreen && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
              disabled={currentIndex === 0}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white"
            >
              Oldingi
            </button>
            <button
              type="button"
              onClick={() => setCurrentIndex((p) => Math.min(slides.length - 1, p + 1))}
              disabled={currentIndex === slides.length - 1}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white"
            >
              Keyingi
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Chiqish</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Sub-header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 font-display">
            Taqdimot slaydlari
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            Jami {slides.length} ta slayd · Klaviatura o‘qlari (← / →) bilan boshqarish mumkin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotes((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              showNotes
                ? 'bg-slate-100 border-slate-300 text-slate-900'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            <span>O‘qituvchi nutqi</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Dars rejimi</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Slaydlarni PDF yuklash</span>
          </button>
        </div>
      </div>

      {/* Stage */}
      {slideStage}

      {/* Navigation bar & thumbnails */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Oldingi slayd</span>
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {slides.map((s, idx) => (
            <button
              key={s.slideNumber}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              title={s.title}
              className={`w-8 h-8 rounded-md text-xs font-mono font-medium tabular-nums transition-colors shrink-0 ${
                idx === currentIndex
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.slideNumber}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setCurrentIndex((p) => Math.min(slides.length - 1, p + 1))}
          disabled={currentIndex === slides.length - 1}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
        >
          <span>Keyingi slayd</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Speaker Notes */}
      {showNotes && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-semibold text-slate-700 mb-1">
            Slayd {slide.slideNumber} uchun o‘qituvchi nutqi va izohlar
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{slide.speakerNotes}</p>
        </div>
      )}

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950 p-4 sm:p-8 flex items-center justify-center">
          {slideStage}
        </div>
      )}
    </div>
  );
};
