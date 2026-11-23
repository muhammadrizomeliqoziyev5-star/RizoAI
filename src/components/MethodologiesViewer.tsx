import React, { useState } from 'react';
import { Download } from 'lucide-react';
import type { MethodologiesData } from '../types/lesson';

interface MethodologiesViewerProps {
  methodologies: MethodologiesData;
  onDownloadPdf: () => void;
}

type MethodTab = 'klaster' | 'sinkveyn' | 'bbb' | 'fishbone';

export const MethodologiesViewer: React.FC<MethodologiesViewerProps> = ({
  methodologies,
  onDownloadPdf,
}) => {
  const [activeMethod, setActiveMethod] = useState<MethodTab>('klaster');

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 font-display">
            Pedagogik metodikalar to‘plami
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Darsda qo‘llash uchun 4 xil interaktiv metodika: Klaster, Sinkveyn, BBB va Baliq skeleti
          </p>
        </div>

        <button
          type="button"
          onClick={onDownloadPdf}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Metodikalarni PDF yuklash</span>
        </button>
      </div>

      {/* Methodology Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
        {(
          [
            { id: 'klaster', label: '01. Klaster (Tarmoq)' },
            { id: 'sinkveyn', label: '02. Sinkveyn (5 qator)' },
            { id: 'bbb', label: '03. BBB jadvali' },
            { id: 'fishbone', label: '04. Baliq skeleti' },
          ] as Array<{ id: MethodTab; label: string }>
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveMethod(tab.id)}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeMethod === tab.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Method Content */}
      {activeMethod === 'klaster' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col gap-6">
          <div className="text-center">
            <div className="text-xs font-medium text-slate-500 mb-1.5">Markaziy tushuncha</div>
            <div className="inline-block px-6 py-3 rounded-xl bg-blue-700 text-white font-display font-bold text-lg">
              {methodologies.klaster.centerTopic}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {methodologies.klaster.branches.map((branch, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 text-xs font-mono font-semibold flex items-center justify-center tabular-nums shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-900">{branch.branchTitle}</h4>
                </div>
                <ul className="flex flex-col gap-1.5 pl-8">
                  {branch.subItems.map((sub, sIdx) => (
                    <li
                      key={sIdx}
                      className="text-sm text-slate-700 leading-snug list-disc marker:text-blue-500"
                    >
                      {sub}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeMethod === 'sinkveyn' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col gap-3">
          <div className="text-xs text-slate-500 mb-1">
            Sinkveyn — o‘quvchilarning mavzuni qisqa va obrazli umumlashtirish texnologiyasi
          </div>
          {[
            { step: '1-qator · 1 ta ot (Mavzu)', value: methodologies.sinkveyn.noun, emphasis: true },
            {
              step: '2-qator · 2 ta sifat (Belgisi)',
              value: methodologies.sinkveyn.adjectives.join(' · '),
            },
            {
              step: '3-qator · 3 ta fe‘l (Harakati)',
              value: methodologies.sinkveyn.verbs.join(' · '),
            },
            {
              step: '4-qator · Asosiy fikr (4 so‘zli gap)',
              value: methodologies.sinkveyn.phrase,
            },
            {
              step: '5-qator · Umumlashtiruvchi sinonim',
              value: methodologies.sinkveyn.synonym,
              emphasis: true,
            },
          ].map((row, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-[230px_1fr] gap-2 sm:gap-4 p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 items-center"
            >
              <span className="text-xs font-medium text-slate-500">{row.step}</span>
              <span
                className={`text-sm ${
                  row.emphasis ? 'font-bold text-blue-800 font-display text-base' : 'font-medium text-slate-900'
                }`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeMethod === 'bbb' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900">
                <th className="py-3 px-4 w-1/3 border-r border-slate-200">Bilaman (B)</th>
                <th className="py-3 px-4 w-1/3 border-r border-slate-200">
                  Bilishni xohlayman (B)
                </th>
                <th className="py-3 px-4 w-1/3">Bildim (B)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="align-top text-sm text-slate-700">
                <td className="p-4 border-r border-slate-200">
                  <ul className="flex flex-col gap-2 list-disc pl-4 marker:text-slate-400">
                    {methodologies.bbb.bilaman.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-4 border-r border-slate-200">
                  <ul className="flex flex-col gap-2 list-disc pl-4 marker:text-blue-500">
                    {methodologies.bbb.bilishniXohlayman.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-4">
                  <ul className="flex flex-col gap-2 list-disc pl-4 marker:text-emerald-600">
                    {methodologies.bbb.bildim.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeMethod === 'fishbone' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col gap-5">
          <div className="p-4 rounded-xl bg-slate-900 text-white">
            <div className="text-xs font-medium text-blue-300 mb-1">
              Asosiy muammo / Tadqiqot savoli (Baliq boshi)
            </div>
            <div className="text-base font-display font-semibold">
              {methodologies.baliqSkeleti.problem}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <h4 className="text-xs font-semibold text-slate-900 mb-2.5">
                Yuqori qanot · Sabablar va omillar
              </h4>
              <ul className="flex flex-col gap-2 list-disc pl-4 marker:text-blue-600 text-sm text-slate-700">
                {methodologies.baliqSkeleti.causes.map((c, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <h4 className="text-xs font-semibold text-slate-900 mb-2.5">
                Pastki qanot · Dalillar va misollar
              </h4>
              <ul className="flex flex-col gap-2 list-disc pl-4 marker:text-slate-500 text-sm text-slate-700">
                {methodologies.baliqSkeleti.facts.map((f, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60">
            <div className="text-xs font-semibold text-emerald-800 mb-1">
              Umumiy xulosa (Baliq dumi)
            </div>
            <p className="text-sm text-slate-800 leading-relaxed">
              {methodologies.baliqSkeleti.conclusion}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
