import type { CrosswordWordInput } from '../types/lesson';

export type Direction = 'across' | 'down';

export interface PlacedWord {
  number: number;
  word: string;
  originalWord: string;
  clue: string;
  row: number;
  col: number;
  direction: Direction;
}

export interface CrosswordCell {
  row: number;
  col: number;
  letter: string | null;
  number: number | null;
  acrossNum: number | null;
  downNum: number | null;
}

export interface CrosswordGridData {
  rows: number;
  cols: number;
  cells: CrosswordCell[][];
  placedWords: PlacedWord[];
  unplacedWords: CrosswordWordInput[];
}

export function normalizeCrosswordWord(raw: string): string {
  // Replace Uzbek modifier apostrophes and strip spaces/hyphens so grid letters are single characters
  return raw
    .trim()
    .toUpperCase()
    .replace(/[‘’'`´ʻʼ\-_\s.,!?;:"]/g, '');
}

interface PlacementCandidate {
  row: number;
  col: number;
  direction: Direction;
  intersections: number;
}

export function buildCrosswordGrid(inputs: CrosswordWordInput[]): CrosswordGridData {
  const cleaned = inputs
    .map((item) => ({
      originalWord: item.word.trim().toUpperCase(),
      word: normalizeCrosswordWord(item.word),
      clue: item.clue.trim(),
    }))
    .filter((item) => item.word.length >= 2 && item.word.length <= 18);

  // Deduplicate normalized words
  const seen = new Set<string>();
  const uniqueWords = cleaned.filter((item) => {
    if (seen.has(item.word)) return false;
    seen.add(item.word);
    return true;
  });

  // Sort longest words first for denser intersections
  uniqueWords.sort((a, b) => b.word.length - a.word.length);

  if (uniqueWords.length === 0) {
    return {
      rows: 1,
      cols: 1,
      cells: [[{ row: 0, col: 0, letter: null, number: null, acrossNum: null, downNum: null }]],
      placedWords: [],
      unplacedWords: [],
    };
  }

  const BOARD_SIZE = 32;
  const board: (string | null)[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array<string | null>(BOARD_SIZE).fill(null)
  );
  // Track direction occupancy so parallel adjacent words don't accidentally merge
  const hasAcross: boolean[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array<boolean>(BOARD_SIZE).fill(false)
  );
  const hasDown: boolean[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array<boolean>(BOARD_SIZE).fill(false)
  );

  const placedRaw: Array<{
    word: string;
    originalWord: string;
    clue: string;
    row: number;
    col: number;
    direction: Direction;
  }> = [];
  const unplacedWords: CrosswordWordInput[] = [];

  const placeWordOnBoard = (
    item: (typeof uniqueWords)[number],
    row: number,
    col: number,
    direction: Direction
  ) => {
    for (let i = 0; i < item.word.length; i++) {
      const r = direction === 'across' ? row : row + i;
      const c = direction === 'across' ? col + i : col;
      board[r][c] = item.word[i];
      if (direction === 'across') hasAcross[r][c] = true;
      else hasDown[r][c] = true;
    }
    placedRaw.push({
      word: item.word,
      originalWord: item.originalWord,
      clue: item.clue,
      row,
      col,
      direction,
    });
  };

  const canPlace = (
    word: string,
    row: number,
    col: number,
    direction: Direction
  ): { ok: boolean; intersections: number } => {
    const dr = direction === 'down' ? 1 : 0;
    const dc = direction === 'across' ? 1 : 0;
    const endR = row + dr * (word.length - 1);
    const endC = col + dc * (word.length - 1);

    if (row < 1 || col < 1 || endR >= BOARD_SIZE - 1 || endC >= BOARD_SIZE - 1) {
      return { ok: false, intersections: 0 };
    }

    // Cell immediately before start and immediately after end must be empty
    if (board[row - dr][col - dc] !== null) return { ok: false, intersections: 0 };
    if (board[endR + dr][endC + dc] !== null) return { ok: false, intersections: 0 };

    let intersections = 0;

    for (let i = 0; i < word.length; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      const existing = board[r][c];

      if (existing !== null) {
        if (existing !== word[i]) {
          return { ok: false, intersections: 0 };
        }
        // Prevent overlapping same-direction words
        if (direction === 'across' && hasAcross[r][c]) return { ok: false, intersections: 0 };
        if (direction === 'down' && hasDown[r][c]) return { ok: false, intersections: 0 };
        intersections++;
      } else {
        // Perpendicular neighbors must be empty if this cell wasn't already occupied
        if (direction === 'across') {
          if (board[r - 1][c] !== null || board[r + 1][c] !== null) {
            return { ok: false, intersections: 0 };
          }
        } else {
          if (board[r][c - 1] !== null || board[r][c + 1] !== null) {
            return { ok: false, intersections: 0 };
          }
        }
      }
    }

    return { ok: true, intersections };
  };

  // Place the first word in the middle horizontally
  const first = uniqueWords[0];
  const startRow = Math.floor(BOARD_SIZE / 2);
  const startCol = Math.floor((BOARD_SIZE - first.word.length) / 2);
  placeWordOnBoard(first, startRow, startCol, 'across');

  // Attempt multi-pass placement so later words can intersect words placed later
  let remaining = uniqueWords.slice(1);
  let madeProgress = true;

  while (remaining.length > 0 && madeProgress) {
    madeProgress = false;
    const nextRemaining: typeof remaining = [];

    for (const item of remaining) {
      let best: PlacementCandidate | null = null;

      for (const existing of placedRaw) {
        const targetDir: Direction = existing.direction === 'across' ? 'down' : 'across';

        for (let ei = 0; ei < existing.word.length; ei++) {
          const er = existing.direction === 'across' ? existing.row : existing.row + ei;
          const ec = existing.direction === 'across' ? existing.col + ei : existing.col;
          const ch = existing.word[ei];

          for (let wi = 0; wi < item.word.length; wi++) {
            if (item.word[wi] !== ch) continue;

            const candRow = targetDir === 'across' ? er : er - wi;
            const candCol = targetDir === 'across' ? ec - wi : ec;
            const check = canPlace(item.word, candRow, candCol, targetDir);

            if (check.ok && check.intersections > 0) {
              if (!best || check.intersections > best.intersections) {
                best = {
                  row: candRow,
                  col: candCol,
                  direction: targetDir,
                  intersections: check.intersections,
                };
              }
            }
          }
        }
      }

      if (best) {
        placeWordOnBoard(item, best.row, best.col, best.direction);
        madeProgress = true;
      } else {
        nextRemaining.push(item);
      }
    }

    remaining = nextRemaining;
  }

  for (const leftover of remaining) {
    unplacedWords.push({ word: leftover.originalWord, clue: leftover.clue });
  }

  // Compute tight bounding box
  let minR = BOARD_SIZE;
  let maxR = 0;
  let minC = BOARD_SIZE;
  let maxC = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) {
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
  }

  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;

  // Rebase placed coordinates
  const rebased = placedRaw.map((p) => ({
    ...p,
    row: p.row - minR,
    col: p.col - minC,
  }));

  // Assign standard crossword numbers in reading order (top-to-bottom, left-to-right)
  const startPositions = new Map<string, number>();
  const coordsList: Array<{ r: number; c: number }> = [];

  for (const p of rebased) {
    const key = `${p.row},${p.col}`;
    if (!startPositions.has(key)) {
      startPositions.set(key, 0);
      coordsList.push({ r: p.row, c: p.col });
    }
  }

  coordsList.sort((a, b) => (a.r !== b.r ? a.r - b.r : a.c - b.c));
  coordsList.forEach((coord, idx) => {
    startPositions.set(`${coord.r},${coord.c}`, idx + 1);
  });

  const placedWords: PlacedWord[] = rebased
    .map((p) => ({
      ...p,
      number: startPositions.get(`${p.row},${p.col}`) ?? 1,
    }))
    .sort((a, b) => (a.number !== b.number ? a.number - b.number : a.direction.localeCompare(b.direction)));

  const cells: CrosswordCell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r,
      col: c,
      letter: board[r + minR][c + minC],
      number: startPositions.get(`${r},${c}`) ?? null,
      acrossNum: null,
      downNum: null,
    }))
  );

  for (const pw of placedWords) {
    for (let i = 0; i < pw.word.length; i++) {
      const r = pw.direction === 'across' ? pw.row : pw.row + i;
      const c = pw.direction === 'across' ? pw.col + i : pw.col;
      if (pw.direction === 'across') {
        cells[r][c].acrossNum = pw.number;
      } else {
        cells[r][c].downNum = pw.number;
      }
    }
  }

  return {
    rows,
    cols,
    cells,
    placedWords,
    unplacedWords,
  };
}
