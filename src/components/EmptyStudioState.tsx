import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface EmptyStudioStateProps {
  onPickSample: (topic: string, grade: string, subject: string) => void;
}

const STARTER_CARDS = [
  {
    topic: 'Fotosintez jarayoni',
    meta: '6-sinf · Biologiya',
    grade: '6-sinf',
    subject: 'Biologiya',
    desc: 'Xlorofill, yorug‘lik fazasi, krasvord va jarayon bosqichlari pazli.',
  },
  {
    topic: 'Kvadrat tenglamalar',
    meta: '8-sinf · Algebra',
    grade: '8-sinf',
    subject: 'Algebra',
    desc: 'Diskriminant formulasi, 3 darajali uyga vazifa va 10 ta test.',
  },
  {
    topic: 'Amir Temur davlati',
    meta: '7-sinf · Tarix',
    grade: '7-sinf',
    subject: 'Tarix',
    desc: 'Klaster, Sinkveyn, xronologik pazl va dars taqdimoti slaydlari.',
  },
];

export const EmptyStudioState: React.FC<EmptyStudioStateProps> = ({ onPickSample }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
        {/* Left editorial copy */}
        <div className="p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="text-xs font-medium text-blue-700">
              O‘qituvchilar uchun AI dars studiyasi
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display leading-tight text-balance">
              Mavzuni kiriting — tayyor dars to‘plami va PDF materiallarni oling
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
              Chap panelda dars mavzusini yozing va kerakli materiallarga ptichka qo‘ying: taqdimot slaydlari, uyga vazifalar, interaktiv pazl o‘yini, krasvord, metodikalar va testlar bir zumda tayyorlanadi.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <div className="font-mono font-semibold text-slate-900 tabular-nums">01. Mavzu</div>
              <div className="text-slate-500 mt-0.5">Sinf va tilni tanlang</div>
            </div>
            <div>
              <div className="font-mono font-semibold text-slate-900 tabular-nums">02. Ptichka</div>
              <div className="text-slate-500 mt-0.5">6 xil material turi</div>
            </div>
            <div>
              <div className="font-mono font-semibold text-slate-900 tabular-nums">03. PDF</div>
              <div className="text-slate-500 mt-0.5">Chop etishga tayyor</div>
            </div>
          </div>
        </div>

        {/* Right generated workspace image */}
        <div className="relative min-h-[240px] lg:min-h-[320px] bg-slate-100 border-t lg:border-t-0 lg:border-l border-slate-200">
          {!imgError ? (
            <img
              src="/src/assets/images/teacher_studio_desk_1795410909127.jpg"
              alt="O'qituvchi ish stoli va dars materiallari"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover lg:h-full"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-slate-500 gap-2 bg-gradient-to-br from-slate-100 to-slate-200">
              <BookOpen className="w-10 h-10 text-slate-400" />
              <span className="text-xs font-medium">Dars materiallari studiyasi</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Start Sample Topics */}
      <div className="border-t border-slate-200 bg-slate-50/70 p-5 sm:p-6">
        <div className="text-xs font-semibold text-slate-700 mb-3">
          Tezkor sinab ko‘rish uchun tayyor mavzular:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {STARTER_CARDS.map((card) => (
            <button
              key={card.topic}
              type="button"
              onClick={() => onPickSample(card.topic, card.grade, card.subject)}
              className="text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/20 transition-colors flex flex-col gap-1.5"
            >
              <div className="text-xs text-slate-500">{card.meta}</div>
              <div className="text-sm font-semibold text-slate-900 font-display">{card.topic}</div>
              <div className="text-xs text-slate-600 leading-relaxed">{card.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
