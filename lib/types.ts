export type Difficulty = "easy" | "medium" | "hard";

export type TopicId =
  | "animals"
  | "space"
  | "food"
  | "sports"
  | "colors"
  | "heroes"
  | "world"
  | "trendy";

export interface Topic {
  id: TopicId;
  name: string;
  emoji: string;
  gradient: string;
  description: string;
}

export interface WordEntry {
  word: string;
  clue: string;
  explanation: string;
  difficulty: Difficulty;
}

export type Direction = "across" | "down";

export interface PlacedWord {
  word: string;
  clue: string;
  explanation: string;
  row: number;
  col: number;
  direction: Direction;
  number: number;
}

export interface GridCell {
  letter: string;
  row: number;
  col: number;
  number?: number;
  wordIds: number[];
  isBlock: boolean;
}

export interface Puzzle {
  grid: (GridCell | null)[][];
  words: PlacedWord[];
  rows: number;
  cols: number;
}
