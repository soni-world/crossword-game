import type { Difficulty, GridCell, PlacedWord, Puzzle, TopicId, WordEntry } from "./types";
import { WORD_BANKS } from "./wordBanks";

const GRID_SIZES: Record<Difficulty, number> = {
  easy: 9,
  medium: 12,
  hard: 15,
};

const TARGET_WORDS: Record<Difficulty, number> = {
  easy: 6,
  medium: 9,
  hard: 12,
};

interface Candidate {
  row: number;
  col: number;
  direction: "across" | "down";
  score: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWordsForDifficulty(topicId: TopicId, difficulty: Difficulty, needed: number): WordEntry[] {
  const bank = WORD_BANKS[topicId];
  const filtered = bank.filter((w) => w.difficulty === difficulty);
  const pool = filtered.length >= needed ? filtered : bank;
  return shuffle(pool).slice(0, Math.min(needed * 2, pool.length));
}

function createEmptyGrid(size: number): (string | null)[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function canPlace(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  dir: "across" | "down",
): { ok: boolean; intersections: number } {
  const size = grid.length;
  let intersections = 0;

  for (let i = 0; i < word.length; i++) {
    const r = dir === "across" ? row : row + i;
    const c = dir === "across" ? col + i : col;

    if (r < 0 || r >= size || c < 0 || c >= size) return { ok: false, intersections: 0 };

    const cell = grid[r][c];
    if (cell === null) {
      // check neighbors (no adjacent letters allowed except at intersections)
      if (dir === "across") {
        if (r > 0 && grid[r - 1][c] !== null) return { ok: false, intersections: 0 };
        if (r < size - 1 && grid[r + 1][c] !== null) return { ok: false, intersections: 0 };
      } else {
        if (c > 0 && grid[r][c - 1] !== null) return { ok: false, intersections: 0 };
        if (c < size - 1 && grid[r][c + 1] !== null) return { ok: false, intersections: 0 };
      }
    } else if (cell === word[i]) {
      intersections++;
    } else {
      return { ok: false, intersections: 0 };
    }
  }

  // check cells immediately before/after the word are empty
  if (dir === "across") {
    if (col > 0 && grid[row][col - 1] !== null) return { ok: false, intersections: 0 };
    if (col + word.length < size && grid[row][col + word.length] !== null) return { ok: false, intersections: 0 };
  } else {
    if (row > 0 && grid[row - 1][col] !== null) return { ok: false, intersections: 0 };
    if (row + word.length < size && grid[row + word.length][col] !== null) return { ok: false, intersections: 0 };
  }

  return { ok: true, intersections };
}

function placeWord(
  grid: (string | null)[][],
  word: string,
  row: number,
  col: number,
  dir: "across" | "down",
) {
  for (let i = 0; i < word.length; i++) {
    const r = dir === "across" ? row : row + i;
    const c = dir === "across" ? col + i : col;
    grid[r][c] = word[i];
  }
}

function findCandidates(
  grid: (string | null)[][],
  placed: PlacedWord[],
  word: string,
): Candidate[] {
  const size = grid.length;
  const candidates: Candidate[] = [];

  for (const pw of placed) {
    for (let i = 0; i < pw.word.length; i++) {
      for (let j = 0; j < word.length; j++) {
        if (pw.word[i] !== word[j]) continue;

        const letterRow = pw.direction === "across" ? pw.row : pw.row + i;
        const letterCol = pw.direction === "across" ? pw.col + i : pw.col;

        const newDir = pw.direction === "across" ? "down" : "across";
        const row = newDir === "across" ? letterRow : letterRow - j;
        const col = newDir === "across" ? letterCol - j : letterCol;

        if (row < 0 || col < 0) continue;
        if (newDir === "across" && col + word.length > size) continue;
        if (newDir === "down" && row + word.length > size) continue;

        const check = canPlace(grid, word, row, col, newDir);
        if (check.ok && check.intersections > 0) {
          candidates.push({ row, col, direction: newDir, score: check.intersections });
        }
      }
    }
  }

  return candidates;
}

function pickBestCandidate(candidates: Candidate[]): Candidate | null {
  if (candidates.length === 0) return null;
  const maxScore = Math.max(...candidates.map((c) => c.score));
  const best = candidates.filter((c) => c.score === maxScore);
  return best[Math.floor(Math.random() * best.length)];
}

function trimGrid(
  grid: (string | null)[][],
  placed: PlacedWord[],
): { grid: (string | null)[][]; placed: PlacedWord[] } {
  const size = grid.length;
  let minRow = size, maxRow = -1, minCol = size, maxCol = -1;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== null) {
        if (r < minRow) minRow = r;
        if (r > maxRow) maxRow = r;
        if (c < minCol) minCol = c;
        if (c > maxCol) maxCol = c;
      }
    }
  }

  if (maxRow === -1) return { grid, placed };

  const newRows = maxRow - minRow + 1;
  const newCols = maxCol - minCol + 1;
  const newGrid: (string | null)[][] = Array.from({ length: newRows }, () => Array(newCols).fill(null));
  for (let r = 0; r < newRows; r++) {
    for (let c = 0; c < newCols; c++) {
      newGrid[r][c] = grid[r + minRow][c + minCol];
    }
  }

  const newPlaced = placed.map((p) => ({ ...p, row: p.row - minRow, col: p.col - minCol }));
  return { grid: newGrid, placed: newPlaced };
}

function finalize(
  rawGrid: (string | null)[][],
  placedWords: PlacedWord[],
): { cells: (GridCell | null)[][]; words: PlacedWord[] } {
  const rows = rawGrid.length;
  const cols = rawGrid[0].length;
  const cells: (GridCell | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rawGrid[r][c] !== null) {
        cells[r][c] = {
          letter: rawGrid[r][c] as string,
          row: r,
          col: c,
          wordIds: [],
          isBlock: false,
        };
      }
    }
  }

  // Number cells in reading order (top-left to bottom-right) at word starts
  const startNumbers = new Map<string, number>();
  let number = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rawGrid[r][c] === null) continue;
      const startsAcross =
        (c === 0 || rawGrid[r][c - 1] === null) &&
        c + 1 < cols &&
        rawGrid[r][c + 1] !== null;
      const startsDown =
        (r === 0 || rawGrid[r - 1][c] === null) &&
        r + 1 < rows &&
        rawGrid[r + 1][c] !== null;
      if (startsAcross || startsDown) {
        startNumbers.set(`${r},${c}`, number);
        const cell = cells[r][c];
        if (cell) cell.number = number;
        number++;
      }
    }
  }

  // Assign reading-order numbers to each placed word
  for (const pw of placedWords) {
    pw.number = startNumbers.get(`${pw.row},${pw.col}`) ?? 0;
  }

  // Sort words by number, across before down at same number
  const sortedWords = [...placedWords].sort((a, b) => {
    if (a.number !== b.number) return a.number - b.number;
    if (a.direction === b.direction) return 0;
    return a.direction === "across" ? -1 : 1;
  });

  // Attach wordIds using the sorted indices (what the UI will see)
  sortedWords.forEach((pw, idx) => {
    for (let i = 0; i < pw.word.length; i++) {
      const r = pw.direction === "across" ? pw.row : pw.row + i;
      const c = pw.direction === "across" ? pw.col + i : pw.col;
      const cell = cells[r][c];
      if (cell) cell.wordIds.push(idx);
    }
  });

  return { cells, words: sortedWords };
}

export function generateCrossword(topicId: TopicId, difficulty: Difficulty): Puzzle {
  const size = GRID_SIZES[difficulty];
  const target = TARGET_WORDS[difficulty];

  let attempt = 0;
  while (attempt < 10) {
    attempt++;
    const wordPool = pickWordsForDifficulty(topicId, difficulty, target * 2)
      .sort((a, b) => b.word.length - a.word.length);

    const grid = createEmptyGrid(size);
    const placed: PlacedWord[] = [];

    // Place first word horizontally near center
    const first = wordPool[0];
    const startRow = Math.floor(size / 2);
    const startCol = Math.floor((size - first.word.length) / 2);
    placeWord(grid, first.word, startRow, startCol, "across");
    placed.push({
      word: first.word,
      clue: first.clue,
      explanation: first.explanation,
      row: startRow,
      col: startCol,
      direction: "across",
      number: 0,
    });

    const remaining = wordPool.slice(1);
    let placedCount = 1;
    let noProgressStreak = 0;

    while (placedCount < target && remaining.length > 0 && noProgressStreak < remaining.length) {
      let placedThisRound = false;
      for (let i = 0; i < remaining.length && placedCount < target; i++) {
        const entry = remaining[i];
        const candidates = findCandidates(grid, placed, entry.word);
        const best = pickBestCandidate(candidates);
        if (best) {
          placeWord(grid, entry.word, best.row, best.col, best.direction);
          placed.push({
            word: entry.word,
            clue: entry.clue,
            explanation: entry.explanation,
            row: best.row,
            col: best.col,
            direction: best.direction,
            number: 0,
          });
          remaining.splice(i, 1);
          i--;
          placedCount++;
          placedThisRound = true;
          noProgressStreak = 0;
        }
      }
      if (!placedThisRound) noProgressStreak++;
    }

    if (placed.length >= Math.max(4, Math.floor(target * 0.6))) {
      const trimmed = trimGrid(grid, placed);
      const { cells, words } = finalize(trimmed.grid, trimmed.placed);

      return {
        grid: cells,
        words,
        rows: cells.length,
        cols: cells[0].length,
      };
    }
  }

  throw new Error("Could not generate crossword");
}
