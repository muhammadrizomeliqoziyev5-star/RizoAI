import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import type { GenerateLessonRequest, LessonLanguage } from './src/types/lesson';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const LANGUAGE_LABELS: Record<LessonLanguage, string> = {
  uz_latin: "O'zbek tili (Lotin alifbosida, to'g'ri imlo va o', g', sh, ch bilan)",
  uz_cyrillic: "Ўзбек тили (Кирилл алифбосида)",
  en: 'English language',
  ru: 'Русский язык',
};

function buildResponseSchema(selected: GenerateLessonRequest['selected']) {
  const properties: Record<string, any> = {
    summary: {
      type: Type.STRING,
      description: 'Dars mavzusi bo‘yicha 2-3 jumlalik qisqa pedagogik tavsif.',
    },
    inferredSubject: {
      type: Type.STRING,
      description: 'Mavzuga mos fan nomi (masalan: Biologiya, Matematika, Tarix).',
    },
  };

  const required = ['summary', 'inferredSubject'];

  if (selected.slides) {
    required.push('slides');
    properties.slides = {
      type: Type.ARRAY,
      description: '8 ta mantiqiy ketma-ketlikdagi taqdimot slaydi.',
      items: {
        type: Type.OBJECT,
        properties: {
          slideNumber: { type: Type.INTEGER },
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          bulletPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Slayddagi 3-5 ta qisqa, tushunarli fikr.',
          },
          visualIdea: {
            type: Type.STRING,
            description: 'Slayd uchun rasm, sxema yoki grafik tavsiyasi.',
          },
          speakerNotes: {
            type: Type.STRING,
            description: 'O‘qituvchi slayd davomida aytadigan nutq va izohlar.',
          },
        },
        required: ['slideNumber', 'title', 'subtitle', 'bulletPoints', 'visualIdea', 'speakerNotes'],
      },
    };
  }

  if (selected.homework) {
    required.push('homework');
    properties.homework = {
      type: Type.OBJECT,
      properties: {
        overview: { type: Type.STRING },
        tiers: {
          type: Type.ARRAY,
          description: '3 ta darajali uyga vazifa: A (Tayanch), B (Amaliy), C (Ijodiy).',
          items: {
            type: Type.OBJECT,
            properties: {
              level: { type: Type.STRING },
              title: { type: Type.STRING },
              taskDescription: { type: Type.STRING },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              estimatedMinutes: { type: Type.INTEGER },
              answerHint: { type: Type.STRING },
            },
            required: ['level', 'title', 'taskDescription', 'steps', 'estimatedMinutes', 'answerHint'],
          },
        },
        rubric: {
          type: Type.ARRAY,
          description: '3-4 ta baholash mezoni.',
          items: {
            type: Type.OBJECT,
            properties: {
              criterion: { type: Type.STRING },
              maxPoints: { type: Type.INTEGER },
              description: { type: Type.STRING },
            },
            required: ['criterion', 'maxPoints', 'description'],
          },
        },
      },
      required: ['overview', 'tiers', 'rubric'],
    };
  }

  if (selected.puzzle) {
    required.push('puzzle');
    properties.puzzle = {
      type: Type.OBJECT,
      properties: {
        gameTitle: { type: Type.STRING },
        instructions: { type: Type.STRING },
        pairs: {
          type: Type.ARRAY,
          description: '6 ta juftlik: tushuncha/savol va uning qisqa mos javobi/ta‘rifi.',
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              concept: { type: Type.STRING },
              match: { type: Type.STRING },
            },
            required: ['id', 'concept', 'match'],
          },
        },
        sequenceTitle: {
          type: Type.STRING,
          description: 'Ketma-ketlik pazli sarlavhasi (masalan: Jarayon bosqichlari).',
        },
        sequenceItems: {
          type: Type.ARRAY,
          description: '5 ta mantiqiy ketma-ketlikdagi bosqich (order 1 dan 5 gacha).',
          items: {
            type: Type.OBJECT,
            properties: {
              order: { type: Type.INTEGER },
              title: { type: Type.STRING },
              detail: { type: Type.STRING },
            },
            required: ['order', 'title', 'detail'],
          },
        },
      },
      required: ['gameTitle', 'instructions', 'pairs', 'sequenceTitle', 'sequenceItems'],
    };
  }

  if (selected.crossword) {
    required.push('crossword');
    properties.crossword = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        words: {
          type: Type.ARRAY,
          description:
            "10-12 ta mavzuga oid BITTADAN iborat (bo'sh joy va chiziqsiz) so'z va ularning savol-ta'rifi. So'zlar o'zaro harflar bilan kesishishi uchun unli va undoshlarga boy kalit so'zlar bo'lsin.",
          items: {
            type: Type.OBJECT,
            properties: {
              word: {
                type: Type.STRING,
                description: "Faqat bitta so'z (bo'sh joysiz, tutuq belgisisiz toza harflar, 4-12 harf).",
              },
              clue: { type: Type.STRING },
            },
            required: ['word', 'clue'],
          },
        },
      },
      required: ['title', 'words'],
    };
  }

  if (selected.methodologies) {
    required.push('methodologies');
    properties.methodologies = {
      type: Type.OBJECT,
      properties: {
        klaster: {
          type: Type.OBJECT,
          properties: {
            centerTopic: { type: Type.STRING },
            branches: {
              type: Type.ARRAY,
              description: '4 ta asosiy tarmoq va har birida 2-3 ta qisqa sub-tushuncha.',
              items: {
                type: Type.OBJECT,
                properties: {
                  branchTitle: { type: Type.STRING },
                  subItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['branchTitle', 'subItems'],
              },
            },
          },
          required: ['centerTopic', 'branches'],
        },
        sinkveyn: {
          type: Type.OBJECT,
          description: '5 qatorli Sinkveyn metodikasi.',
          properties: {
            noun: { type: Type.STRING, description: '1-qator: Mavzuga oid 1 ta ot.' },
            adjectives: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-qator: 2 ta sifat.',
            },
            verbs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-qator: 3 ta fe‘l.',
            },
            phrase: { type: Type.STRING, description: '4-qator: 4 so‘zli asosiy fikr/gap.' },
            synonym: { type: Type.STRING, description: '5-qator: 1 ta umumlashtiruvchi sinonim/kalit so‘z.' },
          },
          required: ['noun', 'adjectives', 'verbs', 'phrase', 'synonym'],
        },
        bbb: {
          type: Type.OBJECT,
          description: 'BBB (Bilaman / Bilishni xohlayman / Bildim) jadvali.',
          properties: {
            bilaman: { type: Type.ARRAY, items: { type: Type.STRING } },
            bilishniXohlayman: { type: Type.ARRAY, items: { type: Type.STRING } },
            bildim: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['bilaman', 'bilishniXohlayman', 'bildim'],
        },
        baliqSkeleti: {
          type: Type.OBJECT,
          description: 'Baliq skeleti (Fishbone) tahlil metodikasi.',
          properties: {
            problem: { type: Type.STRING },
            causes: { type: Type.ARRAY, items: { type: Type.STRING } },
            facts: { type: Type.ARRAY, items: { type: Type.STRING } },
            conclusion: { type: Type.STRING },
          },
          required: ['problem', 'causes', 'facts', 'conclusion'],
        },
      },
      required: ['klaster', 'sinkveyn', 'bbb', 'baliqSkeleti'],
    };
  }

  if (selected.tests) {
    required.push('tests');
    properties.tests = {
      type: Type.ARRAY,
      description: '10 ta ko‘p variantli (4 ta javobli) test savoli.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Aniq 4 ta javob varianti (A, B, C, D prefikslarisiz matn).',
          },
          correctIndex: {
            type: Type.INTEGER,
            description: '0 dan 3 gacha to‘g‘ri javob indeksi.',
          },
          explanation: {
            type: Type.STRING,
            description: 'Nima uchun bu javob to‘g‘ri ekanligi haqida qisqa izoh.',
          },
        },
        required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
      },
    };
  }

  return {
    type: Type.OBJECT,
    properties,
    required,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.post('/api/generate-lesson', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error:
            "GEMINI_API_KEY topilmadi. Iltimos, Settings > Secrets bo'limida API kalitni tekshiring.",
        });
      }

      const body = req.body as GenerateLessonRequest;
      const topic = (body.topic || '').trim();
      if (!topic) {
        return res.status(400).json({ error: 'Iltimos, dars mavzusini kiriting.' });
      }

      const selected = body.selected || {
        slides: true,
        homework: true,
        puzzle: true,
        crossword: true,
        methodologies: true,
        tests: true,
      };

      const anySelected = Object.values(selected).some(Boolean);
      if (!anySelected) {
        return res
          .status(400)
          .json({ error: 'Kamida bitta material turini (ptichka) tanlang.' });
      }

      const languageLabel = LANGUAGE_LABELS[body.language || 'uz_latin'];
      const grade = (body.grade || '7-8-sinf').trim();
      const subject = (body.subject || '').trim();

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = [
        `Dars mavzusi: "${topic}"`,
        `Sinf / auditoriya darajasi: ${grade}`,
        subject ? `Fan: ${subject}` : `Fan: mavzudan kelib chiqib aniqlang`,
        `Chiqish tili va yozuvi: ${languageLabel}`,
        '',
        'Siz tajribali metodist va pedagog-ekspertsiz. O‘qituvchi darsga tayyorlanishi uchun so‘ralgan barcha o‘quv materiallarini aniq, ilmiy asoslangan, yosh xususiyatiga mos va amaliy tarzda yarating.',
        selected.crossword
          ? "Krasvord uchun barcha so'zlar BITTADAN iborat, bo'sh joysiz, tutuq/apostrofsiz (masalan o'simlik o'rniga OSIMLIK, g'oya o'rniga GOYA emas, iloji boricha o', g', tutuq belgisiz tabiiy atamalarni tanlang yoki toza harflar yozing) va 4–11 harf oralig'ida bo'lsin."
          : '',
        selected.tests
          ? 'Test savollari turli qiyinchilik darajasida (bilish, tushunish, qo‘llash) bo‘lsin va har birida aniq 4 ta variant (options) bo‘lsin. correctIndex 0..3 oralig‘ida bo‘lsin.'
          : '',
        selected.puzzle
          ? 'Pazl o‘yinida 6 ta tushuncha-ta‘rif juftligi va 5 ta mantiqiy ketma-ketlik bosqichi yarating.'
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Siz O‘zbekiston va xalqaro pedagogik standartlarga mos professional o‘qituvchi yordamchisisiz. Har bir javob faqat so‘ralgan JSON sxemasida, aniq, tushunarli va darsda darhol ishlatishga tayyor sifatda bo‘lsin.',
          responseMimeType: 'application/json',
          responseSchema: buildResponseSchema(selected),
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const rawText = (response.text || '').trim();
      if (!rawText) {
        return res.status(502).json({
          error: "AI modelidan bo'sh javob qaytdi. Qayta urinib ko'ring.",
        });
      }

      const parsed = JSON.parse(rawText);

      const lessonPack = {
        id: `lesson_${Date.now()}`,
        createdAt: new Date().toISOString(),
        topic,
        grade,
        subject: subject || parsed.inferredSubject || 'Umumiy fan',
        language: body.language || 'uz_latin',
        summary: parsed.summary || '',
        selected,
        slides: parsed.slides,
        homework: parsed.homework,
        puzzle: parsed.puzzle,
        crossword: parsed.crossword,
        methodologies: parsed.methodologies,
        tests: parsed.tests,
      };

      return res.json(lessonPack);
    } catch (err: any) {
      console.error('Gemini lesson generation error:', err);
      const status = err?.status || err?.code || 500;
      const message =
        err?.message ||
        "Materiallarni yaratishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.";
      return res.status(typeof status === 'number' && status >= 400 && status < 600 ? status : 500).json({
        error: message,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UstozAI server running on http://localhost:${PORT}`);
  });
}

startServer();
