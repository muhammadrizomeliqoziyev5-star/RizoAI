import React from 'react';

interface GuideViewProps {
  onBackToStudio: () => void;
}

const GUIDE_ITEMS = [
  {
    index: '01.',
    title: 'Mavzu va sinfni aniq kiriting',
    body: 'Dars mavzusini qisqa va aniq yozing (masalan: "Fotosintez jarayoni" yoki "Kvadrat tenglamalar"). Sinf darajasini tanlash topshiriqlar va testlarning murakkabligini o‘quvchilar yoshiga moslashtiradi.',
  },
  {
    index: '02.',
    title: 'Faqat kerakli materiallarga ptichka qo‘ying',
    body: 'Chap panelda 6 xil material turidan darsingizga zarur bo‘lganlarini belgilang. Faqat tanlangan bo‘limlar yaratiladi va studiya oynasida alohida tab sifatida ochiladi.',
  },
  {
    index: '03.',
    title: 'Interaktiv o‘yinlar va krasvorddan darsda foydalaning',
    body: 'Taqdimotni "Dars rejimi" tugmasi orqali to‘liq ekranda ko‘rsating. Pazl va Krasvord bo‘limlarini esa elektron doskada o‘quvchilar bilan birga jonli tarzda yechishingiz mumkin.',
  },
  {
    index: '04.',
    title: 'PDF shaklida chop etish uchun yuklab oling',
    body: 'Har bir bo‘limning o‘z "PDF yuklash" tugmasi va umumiy "To‘liq to‘plamni PDF yuklash" tugmasi mavjud. "O‘quvchilar uchun (javoblarsiz)" rejimida chop etib tarqatma material tayyorlang, "Javoblar bilan" rejimida esa o‘zingiz uchun kalitni yuklang.',
  },
];

export const GuideView: React.FC<GuideViewProps> = ({ onBackToStudio }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            UstozAI dan foydalanish yo‘riqnomasi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Bir necha soniya ichida to‘liq dars paketi va chop etishga tayyor PDF materiallar oling.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToStudio}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white whitespace-nowrap"
        >
          Studiyaga o‘tish
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GUIDE_ITEMS.map((item) => (
          <div
            key={item.index}
            className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col gap-2"
          >
            <h2 className="text-base font-semibold text-slate-900 font-display">
              <span className="font-mono text-blue-700 mr-2 tabular-nums">{item.index}</span>
              {item.title}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
