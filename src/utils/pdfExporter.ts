import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';
import type { GeneratedLessonPack, MaterialKey } from '../types/lesson';
import type { CrosswordGridData } from './crosswordLayout';

let fontsInitialized = false;

type MarginTuple = [number, number, number, number];
const m = (l: number, t: number, r: number, b: number): MarginTuple => [l, t, r, b];

function ensurePdfFonts() {
  if (fontsInitialized) return;
  const raw = pdfFonts as any;
  const vfs =
    raw?.default && typeof raw.default === 'object' && raw.default['Roboto-Regular.ttf']
      ? raw.default
      : raw?.vfs && typeof raw.vfs === 'object'
      ? raw.vfs
      : raw;

  if (typeof (pdfMake as any).addVirtualFileSystem === 'function') {
    (pdfMake as any).addVirtualFileSystem(vfs);
  } else {
    (pdfMake as any).vfs = vfs;
  }

  (pdfMake as any).fonts = {
    Roboto: {
      normal: 'Roboto-Regular.ttf',
      bold: 'Roboto-Medium.ttf',
      italics: 'Roboto-Italic.ttf',
      bolditalics: 'Roboto-MediumItalic.ttf',
    },
  };

  fontsInitialized = true;
}

function slugifyFilename(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\u0400-\u04FF]+/gi, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 48) || 'dars_materiali'
  );
}

function buildSectionHeader(title: string, subtitle?: string): Content {
  const stack: Content[] = [
    {
      text: title,
      style: 'sectionTitle',
      margin: m(0, 8, 0, subtitle ? 2 : 8),
    },
  ];
  if (subtitle) {
    stack.push({
      text: subtitle,
      style: 'sectionSubtitle',
      margin: m(0, 0, 0, 8),
    });
  }
  stack.push({
    canvas: [
      {
        type: 'line',
        x1: 0,
        y1: 0,
        x2: 515,
        y2: 0,
        lineWidth: 1,
        lineColor: '#CBD5E1',
      },
    ],
    margin: m(0, 0, 0, 10),
  });
  return { stack };
}

function buildSlidesContent(lesson: GeneratedLessonPack): Content[] {
  const slides = lesson.slides || [];
  if (slides.length === 0) return [];

  const blocks: Content[] = [
    buildSectionHeader('Taqdimot slaydlari', `${slides.length} ta slayd · Dars taqdimoti va o‘qituvchi izohlari`),
  ];

  slides.forEach((slide) => {
    blocks.push({
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                {
                  columns: [
                    {
                      text: `Slayd ${slide.slideNumber}`,
                      fontSize: 9,
                      bold: true,
                      color: '#1D4ED8',
                      width: 'auto',
                    },
                    {
                      text: slide.subtitle || '',
                      fontSize: 9,
                      color: '#64748B',
                      alignment: 'right',
                    },
                  ],
                  margin: m(0, 0, 0, 4),
                },
                {
                  text: slide.title,
                  fontSize: 13,
                  bold: true,
                  color: '#0F172A',
                  margin: m(0, 0, 0, 6),
                },
                {
                  ul: slide.bulletPoints.map((bp): Content => ({
                    text: bp,
                    fontSize: 10,
                    color: '#334155',
                    margin: m(0, 0, 0, 3),
                  })),
                  margin: m(0, 0, 0, 6),
                },
                {
                  text: [
                    { text: 'Vizual tavsiya: ', bold: true, color: '#475569' },
                    { text: slide.visualIdea, color: '#475569' },
                  ],
                  fontSize: 9,
                  margin: m(0, 0, 0, 3),
                },
                {
                  text: [
                    { text: 'O‘qituvchi nutqi: ', bold: true, color: '#334155' },
                    { text: slide.speakerNotes, color: '#475569', italics: true },
                  ],
                  fontSize: 9,
                },
              ],
              fillColor: '#F8FAFC',
              margin: m(10, 8, 10, 8),
            },
          ],
        ],
      },
      layout: {
        hLineColor: () => '#E2E8F0',
        vLineColor: () => '#E2E8F0',
      },
      unbreakable: true,
      margin: m(0, 0, 0, 10),
    });
  });

  return blocks;
}

function buildHomeworkContent(lesson: GeneratedLessonPack, includeAnswers: boolean): Content[] {
  const hw = lesson.homework;
  if (!hw) return [];

  const blocks: Content[] = [
    buildSectionHeader('Uyga vazifalar', hw.overview),
  ];

  hw.tiers.forEach((tier) => {
    const tierStack: Content[] = [
      {
        columns: [
          {
            text: `${tier.level} — ${tier.title}`,
            fontSize: 11.5,
            bold: true,
            color: '#0F172A',
          },
          {
            text: `Taxminiy vaqt: ${tier.estimatedMinutes} daqiqa`,
            fontSize: 9,
            color: '#64748B',
            alignment: 'right',
            width: 'auto',
          },
        ],
        margin: m(0, 0, 0, 4),
      },
      {
        text: tier.taskDescription,
        fontSize: 10,
        color: '#334155',
        margin: m(0, 0, 0, 6),
      },
      {
        ol: tier.steps.map((step): Content => ({
          text: step,
          fontSize: 9.5,
          color: '#334155',
          margin: m(0, 0, 0, 2),
        })),
      },
    ];

    if (includeAnswers && tier.answerHint) {
      tierStack.push({
        text: [
          { text: 'O‘qituvchi uchun yechim/yo‘riqnoma: ', bold: true, color: '#059669' },
          { text: tier.answerHint, color: '#334155' },
        ],
        fontSize: 9,
        margin: m(0, 6, 0, 0),
      });
    }

    blocks.push({
      table: {
        widths: ['*'],
        body: [[{ stack: tierStack, fillColor: '#FFFFFF', margin: m(10, 8, 10, 8) }]],
      },
      layout: {
        hLineColor: () => '#CBD5E1',
        vLineColor: () => '#CBD5E1',
      },
      unbreakable: true,
      margin: m(0, 0, 0, 10),
    });
  });

  if (hw.rubric && hw.rubric.length > 0) {
    blocks.push({
      text: 'Baholash mezoni',
      fontSize: 11,
      bold: true,
      color: '#0F172A',
      margin: m(0, 4, 0, 6),
    });

    const rubricBody: TableCell[][] = [
      [
        { text: 'Mezon', bold: true, fontSize: 9.5, fillColor: '#F1F5F9', color: '#0F172A', margin: m(6, 5, 6, 5) },
        { text: 'Ball', bold: true, fontSize: 9.5, fillColor: '#F1F5F9', color: '#0F172A', margin: m(6, 5, 6, 5), alignment: 'center' },
        { text: 'Tavsif', bold: true, fontSize: 9.5, fillColor: '#F1F5F9', color: '#0F172A', margin: m(6, 5, 6, 5) },
      ],
      ...hw.rubric.map((r): TableCell[] => [
        { text: r.criterion, fontSize: 9.5, color: '#0F172A', bold: true, margin: m(6, 5, 6, 5) },
        { text: `${r.maxPoints}`, fontSize: 9.5, color: '#1D4ED8', bold: true, alignment: 'center', margin: m(6, 5, 6, 5) },
        { text: r.description, fontSize: 9.5, color: '#334155', margin: m(6, 5, 6, 5) },
      ]),
    ];

    blocks.push({
      table: {
        headerRows: 1,
        widths: [140, 60, '*'],
        body: rubricBody,
      },
      layout: {
        hLineColor: () => '#CBD5E1',
        vLineColor: () => '#CBD5E1',
      },
      margin: m(0, 0, 0, 12),
    });
  }

  return blocks;
}

function buildPuzzleContent(lesson: GeneratedLessonPack, includeAnswers: boolean): Content[] {
  const puzzle = lesson.puzzle;
  if (!puzzle) return [];

  const blocks: Content[] = [
    buildSectionHeader(`Interaktiv pazl o‘yini: ${puzzle.gameTitle}`, puzzle.instructions),
    {
      text: '1-topshiriq. Tushuncha va mos ta‘rifni birlashtiring (o‘ng ustunga mos raqamni yozing):',
      fontSize: 10.5,
      bold: true,
      color: '#0F172A',
      margin: m(0, 0, 0, 6),
    },
  ];

  const pairs = puzzle.pairs || [];
  const shuffledRight = [...pairs].sort((a, b) => a.match.localeCompare(b.match));

  const pairBody: TableCell[][] = [
    [
      { text: '#', bold: true, fontSize: 9.5, fillColor: '#F1F5F9', alignment: 'center', margin: m(4, 5, 4, 5) },
      { text: 'Tushuncha (Chap bo‘lak)', bold: true, fontSize: 9.5, fillColor: '#F1F5F9', margin: m(6, 5, 6, 5) },
      { text: 'Mos #', bold: true, fontSize: 9.5, fillColor: '#F1F5F9', alignment: 'center', margin: m(4, 5, 4, 5) },
      { text: 'Ta‘rif / Javob (O‘ng bo‘lak)', bold: true, fontSize: 9.5, fillColor: '#F1F5F9', margin: m(6, 5, 6, 5) },
    ],
    ...pairs.map((p, idx): TableCell[] => [
      { text: `${idx + 1}`, fontSize: 9.5, bold: true, alignment: 'center', margin: m(4, 6, 4, 6) },
      { text: p.concept, fontSize: 9.5, color: '#0F172A', margin: m(6, 6, 6, 6) },
      { text: '[    ]', fontSize: 9.5, alignment: 'center', color: '#64748B', margin: m(4, 6, 4, 6) },
      { text: shuffledRight[idx]?.match || '', fontSize: 9.5, color: '#334155', margin: m(6, 6, 6, 6) },
    ]),
  ];

  blocks.push({
    table: {
      headerRows: 1,
      widths: [24, '*', 34, '*'],
      body: pairBody,
    },
    layout: {
      hLineColor: () => '#CBD5E1',
      vLineColor: () => '#CBD5E1',
    },
    margin: m(0, 0, 0, 12),
  });

  if (puzzle.sequenceItems && puzzle.sequenceItems.length > 0) {
    blocks.push({
      text: `2-topshiriq. ${puzzle.sequenceTitle} — to‘g‘ri ketma-ketlikni (1–${puzzle.sequenceItems.length}) belgilang:`,
      fontSize: 10.5,
      bold: true,
      color: '#0F172A',
      margin: m(0, 4, 0, 6),
    });

    const scrambledSeq = [...puzzle.sequenceItems].sort((a, b) => a.title.localeCompare(b.title));

    const seqBody: TableCell[][] = scrambledSeq.map((item): TableCell[] => [
      { text: '[    ]', alignment: 'center', fontSize: 10, color: '#64748B', margin: m(4, 6, 4, 6) },
      {
        stack: [
          { text: item.title, bold: true, fontSize: 10, color: '#0F172A' },
          { text: item.detail, fontSize: 9, color: '#475569', margin: m(0, 2, 0, 0) },
        ],
        margin: m(6, 6, 6, 6),
      },
    ]);

    blocks.push({
      table: {
        widths: [36, '*'],
        body: seqBody,
      },
      layout: {
        hLineColor: () => '#CBD5E1',
        vLineColor: () => '#CBD5E1',
      },
      margin: m(0, 0, 0, 10),
    });
  }

  if (includeAnswers) {
    blocks.push({
      text: 'Pazl javoblar kaliti:',
      fontSize: 10,
      bold: true,
      color: '#059669',
      margin: m(0, 4, 0, 4),
    });
    blocks.push({
      ul: pairs.map((p, i) => `${i + 1}. ${p.concept} — ${p.match}`),
      fontSize: 9,
      color: '#334155',
      margin: m(0, 0, 0, 6),
    });
    if (puzzle.sequenceItems && puzzle.sequenceItems.length > 0) {
      const ordered = [...puzzle.sequenceItems].sort((a, b) => a.order - b.order);
      blocks.push({
        text: `To‘g‘ri ketma-ketlik: ${ordered.map((s) => `${s.order}) ${s.title}`).join(' → ')}`,
        fontSize: 9,
        color: '#059669',
        margin: m(0, 0, 0, 10),
      });
    }
  }

  return blocks;
}

function buildCrosswordTable(grid: CrosswordGridData, filled: boolean): Content {
  const maxWidth = 490;
  const cellSize = Math.max(14, Math.min(24, Math.floor(maxWidth / Math.max(1, grid.cols)) - 2));

  const body: TableCell[][] = grid.cells.map((row) =>
    row.map((cell): TableCell => {
      if (!cell.letter) {
        return {
          text: '',
          fillColor: '#1E293B',
          margin: m(0, 0, 0, 0),
        };
      }
      return {
        stack: [
          {
            text: cell.number ? `${cell.number}` : ' ',
            fontSize: Math.max(6, Math.floor(cellSize * 0.34)),
            color: '#64748B',
            margin: m(1, 0, 0, 0),
          },
          {
            text: filled ? cell.letter : ' ',
            fontSize: Math.max(8, Math.floor(cellSize * 0.52)),
            bold: true,
            color: filled ? '#1D4ED8' : '#0F172A',
            alignment: 'center',
            margin: m(0, -2, 0, 1),
          },
        ],
        fillColor: '#FFFFFF',
        margin: m(0, 0, 0, 0),
      };
    })
  );

  return {
    table: {
      widths: Array(grid.cols).fill(cellSize),
      heights: Array(grid.rows).fill(cellSize),
      body,
    },
    layout: {
      hLineWidth: () => 0.75,
      vLineWidth: () => 0.75,
      hLineColor: () => '#334155',
      vLineColor: () => '#334155',
      paddingLeft: () => 1,
      paddingRight: () => 1,
      paddingTop: () => 1,
      paddingBottom: () => 1,
    },
    margin: m(0, 4, 0, 10),
  };
}

function buildCrosswordContent(
  lesson: GeneratedLessonPack,
  grid: CrosswordGridData | null,
  includeAnswers: boolean
): Content[] {
  if (!lesson.crossword || !grid) return [];

  const acrossWords = grid.placedWords.filter((w) => w.direction === 'across');
  const downWords = grid.placedWords.filter((w) => w.direction === 'down');

  const blocks: Content[] = [
    buildSectionHeader(`Krasvord: ${lesson.crossword.title}`, 'Kataklarga mos harflarni joylashtiring'),
    buildCrosswordTable(grid, false),
    {
      columns: [
        {
          width: '*',
          stack: [
            { text: 'Gorizontal (Bo‘yiga):', bold: true, fontSize: 10.5, color: '#0F172A', margin: m(0, 0, 0, 4) },
            ...acrossWords.map((w): Content => ({
              text: `${w.number}. ${w.clue} (${w.word.length} harf)`,
              fontSize: 9.5,
              color: '#334155',
              margin: m(0, 0, 0, 3),
            })),
          ],
        },
        {
          width: 16,
          text: '',
        },
        {
          width: '*',
          stack: [
            { text: 'Vertikal (Tik):', bold: true, fontSize: 10.5, color: '#0F172A', margin: m(0, 0, 0, 4) },
            ...downWords.map((w): Content => ({
              text: `${w.number}. ${w.clue} (${w.word.length} harf)`,
              fontSize: 9.5,
              color: '#334155',
              margin: m(0, 0, 0, 3),
            })),
          ],
        },
      ],
      margin: m(0, 0, 0, 12),
    },
  ];

  if (includeAnswers) {
    blocks.push({
      text: 'Krasvord javoblari:',
      fontSize: 10.5,
      bold: true,
      color: '#059669',
      margin: m(0, 4, 0, 4),
    });
    blocks.push(buildCrosswordTable(grid, true));
  }

  return blocks;
}

function buildMethodologiesContent(lesson: GeneratedLessonPack): Content[] {
  const mData = lesson.methodologies;
  if (!mData) return [];

  const blocks: Content[] = [
    buildSectionHeader('Pedagogik metodikalar to‘plami', 'Klaster · Sinkveyn · BBB jadvali · Baliq skeleti'),
  ];

  // 1. Klaster
  blocks.push({
    text: `1. Klaster usuli — Markaziy tushuncha: ${mData.klaster.centerTopic}`,
    fontSize: 11,
    bold: true,
    color: '#0F172A',
    margin: m(0, 2, 0, 6),
  });

  const klasterBody: TableCell[][] = [
    [
      { text: 'Asosiy tarmoq', bold: true, fontSize: 9.5, fillColor: '#F1F5F9', margin: m(6, 5, 6, 5) },
      { text: 'Bog‘liq tushunchalar', bold: true, fontSize: 9.5, fillColor: '#F1F5F9', margin: m(6, 5, 6, 5) },
    ],
    ...mData.klaster.branches.map((b): TableCell[] => [
      { text: b.branchTitle, bold: true, fontSize: 9.5, color: '#1D4ED8', margin: m(6, 5, 6, 5) },
      { text: b.subItems.join(' · '), fontSize: 9.5, color: '#334155', margin: m(6, 5, 6, 5) },
    ]),
  ];

  blocks.push({
    table: {
      headerRows: 1,
      widths: [160, '*'],
      body: klasterBody,
    },
    layout: { hLineColor: () => '#CBD5E1', vLineColor: () => '#CBD5E1' },
    margin: m(0, 0, 0, 12),
  });

  // 2. Sinkveyn
  blocks.push({
    text: '2. Sinkveyn (5 qatorli tahlil)',
    fontSize: 11,
    bold: true,
    color: '#0F172A',
    margin: m(0, 2, 0, 6),
  });
  blocks.push({
    table: {
      widths: [130, '*'],
      body: [
        [{ text: '1. Ot (Mavzu)', bold: true, fontSize: 9.5, fillColor: '#F8FAFC', margin: m(6, 4, 6, 4) }, { text: mData.sinkveyn.noun, fontSize: 9.5, margin: m(6, 4, 6, 4) }],
        [{ text: '2. Sifat (2 ta)', bold: true, fontSize: 9.5, fillColor: '#F8FAFC', margin: m(6, 4, 6, 4) }, { text: mData.sinkveyn.adjectives.join(', '), fontSize: 9.5, margin: m(6, 4, 6, 4) }],
        [{ text: '3. Fe‘l (3 ta)', bold: true, fontSize: 9.5, fillColor: '#F8FAFC', margin: m(6, 4, 6, 4) }, { text: mData.sinkveyn.verbs.join(', '), fontSize: 9.5, margin: m(6, 4, 6, 4) }],
        [{ text: '4. Asosiy fikr (4 so‘z)', bold: true, fontSize: 9.5, fillColor: '#F8FAFC', margin: m(6, 4, 6, 4) }, { text: mData.sinkveyn.phrase, fontSize: 9.5, margin: m(6, 4, 6, 4) }],
        [{ text: '5. Sinonim / Xulosa', bold: true, fontSize: 9.5, fillColor: '#F8FAFC', margin: m(6, 4, 6, 4) }, { text: mData.sinkveyn.synonym, bold: true, color: '#1D4ED8', fontSize: 9.5, margin: m(6, 4, 6, 4) }],
      ],
    },
    layout: { hLineColor: () => '#CBD5E1', vLineColor: () => '#CBD5E1' },
    unbreakable: true,
    margin: m(0, 0, 0, 12),
  });

  // 3. BBB
  blocks.push({
    text: '3. BBB Jadvali (Bilaman · Bilishni xohlayman · Bildim)',
    fontSize: 11,
    bold: true,
    color: '#0F172A',
    margin: m(0, 2, 0, 6),
  });
  blocks.push({
    table: {
      headerRows: 1,
      widths: ['*', '*', '*'],
      body: [
        [
          { text: 'Bilaman', bold: true, fontSize: 9.5, fillColor: '#F1F5F9', margin: m(6, 5, 6, 5) },
          { text: 'Bilishni xohlayman', bold: true, fontSize: 9.5, fillColor: '#F1F5F9', margin: m(6, 5, 6, 5) },
          { text: 'Bildim', bold: true, fontSize: 9.5, fillColor: '#F1F5F9', margin: m(6, 5, 6, 5) },
        ],
        [
          { ul: mData.bbb.bilaman, fontSize: 9, color: '#334155', margin: m(6, 5, 6, 5) },
          { ul: mData.bbb.bilishniXohlayman, fontSize: 9, color: '#334155', margin: m(6, 5, 6, 5) },
          { ul: mData.bbb.bildim, fontSize: 9, color: '#334155', margin: m(6, 5, 6, 5) },
        ],
      ],
    },
    layout: { hLineColor: () => '#CBD5E1', vLineColor: () => '#CBD5E1' },
    margin: m(0, 0, 0, 12),
  });

  // 4. Baliq skeleti
  blocks.push({
    text: '4. Baliq skeleti (Fishbone) tahlil sxemasi',
    fontSize: 11,
    bold: true,
    color: '#0F172A',
    margin: m(0, 2, 0, 6),
  });
  blocks.push({
    table: {
      widths: ['*', '*'],
      body: [
        [
          {
            colSpan: 2,
            text: [
              { text: 'Asosiy muammo / savol: ', bold: true, color: '#1D4ED8' },
              { text: mData.baliqSkeleti.problem, color: '#0F172A' },
            ],
            fillColor: '#F8FAFC',
            fontSize: 9.5,
            margin: m(6, 5, 6, 5),
          },
          {},
        ],
        [
          {
            stack: [
              { text: 'Sabablar:', bold: true, fontSize: 9.5, margin: m(0, 0, 0, 3) },
              { ul: mData.baliqSkeleti.causes, fontSize: 9, color: '#334155' },
            ],
            margin: m(6, 5, 6, 5),
          },
          {
            stack: [
              { text: 'Dalillar va faktlar:', bold: true, fontSize: 9.5, margin: m(0, 0, 0, 3) },
              { ul: mData.baliqSkeleti.facts, fontSize: 9, color: '#334155' },
            ],
            margin: m(6, 5, 6, 5),
          },
        ],
        [
          {
            colSpan: 2,
            text: [
              { text: 'Umumiy xulosa: ', bold: true, color: '#059669' },
              { text: mData.baliqSkeleti.conclusion, color: '#0F172A' },
            ],
            fillColor: '#F8FAFC',
            fontSize: 9.5,
            margin: m(6, 5, 6, 5),
          },
          {},
        ],
      ],
    },
    layout: { hLineColor: () => '#CBD5E1', vLineColor: () => '#CBD5E1' },
    unbreakable: true,
    margin: m(0, 0, 0, 12),
  });

  return blocks;
}

function buildTestsContent(lesson: GeneratedLessonPack, includeAnswers: boolean): Content[] {
  const tests = lesson.tests || [];
  if (tests.length === 0) return [];

  const letters = ['A', 'B', 'C', 'D'];
  const blocks: Content[] = [
    buildSectionHeader('Nazorat testlari', `${tests.length} ta savol · To‘g‘ri javobni belgilang`),
  ];

  tests.forEach((q, idx) => {
    blocks.push({
      stack: [
        {
          text: `${idx + 1}. ${q.question}`,
          fontSize: 10,
          bold: true,
          color: '#0F172A',
          margin: m(0, 0, 0, 4),
        },
        ...q.options.map((opt, optIdx): Content => ({
          text: `   ${letters[optIdx] || optIdx + 1}) ${opt}`,
          fontSize: 9.5,
          color: '#334155',
          margin: m(0, 0, 0, 2),
        })),
      ],
      unbreakable: true,
      margin: m(0, 0, 0, 8),
    });
  });

  if (includeAnswers) {
    blocks.push({
      text: 'Test javoblar kaliti va izohlar',
      fontSize: 11.5,
      bold: true,
      color: '#059669',
      pageBreak: 'before',
      margin: m(0, 0, 0, 8),
    });

    const answerBody: TableCell[][] = [
      [
        { text: '#', bold: true, fontSize: 9, fillColor: '#F1F5F9', alignment: 'center', margin: m(4, 5, 4, 5) },
        { text: 'Javob', bold: true, fontSize: 9, fillColor: '#F1F5F9', alignment: 'center', margin: m(4, 5, 4, 5) },
        { text: 'Izoh', bold: true, fontSize: 9, fillColor: '#F1F5F9', margin: m(6, 5, 6, 5) },
      ],
      ...tests.map((q, idx): TableCell[] => [
        { text: `${idx + 1}`, fontSize: 9, alignment: 'center', margin: m(4, 4, 4, 4) },
        {
          text: letters[q.correctIndex] || 'A',
          fontSize: 9.5,
          bold: true,
          color: '#059669',
          alignment: 'center',
          margin: m(4, 4, 4, 4),
        },
        { text: q.explanation, fontSize: 9, color: '#334155', margin: m(6, 4, 6, 4) },
      ]),
    ];

    blocks.push({
      table: {
        headerRows: 1,
        widths: [30, 50, '*'],
        body: answerBody,
      },
      layout: { hLineColor: () => '#CBD5E1', vLineColor: () => '#CBD5E1' },
    });
  }

  return blocks;
}

function buildCoverHeader(lesson: GeneratedLessonPack, subtitleLabel: string): Content {
  return {
    stack: [
      {
        columns: [
          { text: 'UstozAI — Dars materiallari to‘plami', fontSize: 9.5, bold: true, color: '#1D4ED8' },
          {
            text: `${lesson.subject} · ${lesson.grade}`,
            fontSize: 9.5,
            color: '#64748B',
            alignment: 'right',
          },
        ],
        margin: m(0, 0, 0, 6),
      },
      {
        text: lesson.topic,
        fontSize: 19,
        bold: true,
        color: '#0F172A',
        margin: m(0, 0, 0, 4),
      },
      {
        text: subtitleLabel || lesson.summary,
        fontSize: 10,
        color: '#475569',
        margin: m(0, 0, 0, 10),
      },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, lineColor: '#1D4ED8' },
        ],
        margin: m(0, 0, 0, 14),
      },
    ],
  };
}

function createDocDefinition(lesson: GeneratedLessonPack, content: Content[], subtitleLabel?: string): TDocumentDefinitions {
  return {
    pageSize: 'A4',
    pageMargins: [40, 42, 40, 42],
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      lineHeight: 1.35,
      color: '#0F172A',
    },
    styles: {
      sectionTitle: {
        fontSize: 14,
        bold: true,
        color: '#0F172A',
      },
      sectionSubtitle: {
        fontSize: 9.5,
        color: '#64748B',
      },
    },
    footer: (currentPage: number, pageCount: number): Content => ({
      columns: [
        { text: `${lesson.topic} · ${lesson.grade}`, fontSize: 8, color: '#94A3B8', margin: m(40, 0, 0, 0) },
        {
          text: `${currentPage} / ${pageCount}`,
          fontSize: 8,
          color: '#64748B',
          alignment: 'right',
          margin: m(0, 0, 40, 0),
        },
      ],
    }),
    content: [buildCoverHeader(lesson, subtitleLabel || lesson.summary), ...content],
  };
}

export function downloadModulePdf(
  moduleKey: MaterialKey,
  lesson: GeneratedLessonPack,
  crosswordGrid: CrosswordGridData | null,
  includeAnswers: boolean
) {
  ensurePdfFonts();
  let content: Content[] = [];
  let label = '';

  switch (moduleKey) {
    case 'slides':
      content = buildSlidesContent(lesson);
      label = 'Taqdimot slaydlari';
      break;
    case 'homework':
      content = buildHomeworkContent(lesson, includeAnswers);
      label = 'Uyga vazifalar';
      break;
    case 'puzzle':
      content = buildPuzzleContent(lesson, includeAnswers);
      label = 'Interaktiv pazl mashqlari';
      break;
    case 'crossword':
      content = buildCrosswordContent(lesson, crosswordGrid, includeAnswers);
      label = 'Krasvord topshirig‘i';
      break;
    case 'methodologies':
      content = buildMethodologiesContent(lesson);
      label = 'Pedagogik metodikalar';
      break;
    case 'tests':
      content = buildTestsContent(lesson, includeAnswers);
      label = 'Nazorat testlari';
      break;
  }

  if (content.length === 0) return;

  const docDef = createDocDefinition(lesson, content, `${label} · ${lesson.summary}`);
  const suffix = includeAnswers ? 'javobli' : 'oquvchi';
  const fileName = `${slugifyFilename(lesson.topic)}_${moduleKey}_${suffix}.pdf`;
  pdfMake.createPdf(docDef).download(fileName);
}

export function downloadFullLessonPdf(
  lesson: GeneratedLessonPack,
  crosswordGrid: CrosswordGridData | null,
  includeAnswers: boolean
) {
  ensurePdfFonts();
  const sections: Content[][] = [];

  if (lesson.slides?.length) sections.push(buildSlidesContent(lesson));
  if (lesson.homework) sections.push(buildHomeworkContent(lesson, includeAnswers));
  if (lesson.puzzle) sections.push(buildPuzzleContent(lesson, includeAnswers));
  if (lesson.crossword && crosswordGrid) sections.push(buildCrosswordContent(lesson, crosswordGrid, includeAnswers));
  if (lesson.methodologies) sections.push(buildMethodologiesContent(lesson));
  if (lesson.tests?.length) sections.push(buildTestsContent(lesson, includeAnswers));

  const combined: Content[] = [];
  sections.forEach((sec, idx) => {
    if (idx > 0 && sec.length > 0) {
      combined.push({ text: '', pageBreak: 'before' });
    }
    combined.push(...sec);
  });

  if (combined.length === 0) return;

  const docDef = createDocDefinition(lesson, combined);
  const suffix = includeAnswers ? 'toliq_javobli' : 'toliq_oquvchi';
  const fileName = `${slugifyFilename(lesson.topic)}_${suffix}.pdf`;
  pdfMake.createPdf(docDef).download(fileName);
}
