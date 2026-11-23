import React from 'react';
import { Download } from 'lucide-react';

interface HeaderProps {
  activeSection: 'studio' | 'history' | 'guide';
  onNavigate: (section: 'studio' | 'history' | 'guide') => void;
  hasLesson: boolean;
  onDownloadAllPdf: () => void;
  onFocusTopic: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onNavigate,
  hasLesson,
  onDownloadAllPdf,
  onFocusTopic,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('studio')}
          className="text-xl font-bold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
        >
          UstozAI
        </button>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => {
              onNavigate('studio');
              onFocusTopic();
            }}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
              activeSection === 'studio'
                ? 'text-slate-900 border-blue-700'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Dars yaratish
          </button>
          <button
            type="button"
            onClick={() => onNavigate('studio')}
            className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 transition-colors"
          >
            Materiallar
          </button>
          <button
            type="button"
            onClick={() => onNavigate('history')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors tabular-nums ${
              activeSection === 'history'
                ? 'text-slate-900 border-blue-700'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Tarix ({historyCount})
          </button>
          <button
            type="button"
            onClick={() => onNavigate('guide')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
              activeSection === 'guide'
                ? 'text-slate-900 border-blue-700'
                : 'border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            Yo‘riqnoma
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          {hasLesson ? (
            <button
              type="button"
              onClick={onDownloadAllPdf}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Barchasini PDF yuklash</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onNavigate('studio');
                onFocusTopic();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              <span>Mavzu kiritish</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
