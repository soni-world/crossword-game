"use client";

import { useEffect, useRef } from "react";
import type { PlacedWord, Puzzle } from "@/lib/types";

interface Props {
  puzzle: Puzzle;
  entries: Record<string, string>;
  activeWord: PlacedWord | null;
  activeCell: { row: number; col: number } | null;
  revealed: Set<string>;
  wrongPulse: Set<string>;
  onCellClick: (row: number, col: number) => void;
  onCellInput: (row: number, col: number, value: string) => void;
  onCellKey: (row: number, col: number, key: string) => void;
}

export function GameBoard({
  puzzle,
  entries,
  activeWord,
  activeCell,
  revealed,
  wrongPulse,
  onCellClick,
  onCellInput,
  onCellKey,
}: Props) {
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    if (!activeCell) return;
    const key = `${activeCell.row}-${activeCell.col}`;
    const el = inputRefs.current.get(key);
    el?.focus();
    el?.select();
  }, [activeCell]);

  const isCellInActiveWord = (row: number, col: number): boolean => {
    if (!activeWord) return false;
    for (let i = 0; i < activeWord.word.length; i++) {
      const r = activeWord.direction === "across" ? activeWord.row : activeWord.row + i;
      const c = activeWord.direction === "across" ? activeWord.col + i : activeWord.col;
      if (r === row && c === col) return true;
    }
    return false;
  };

  const cellSizeClass = puzzle.cols <= 9 ? "w-11 h-11 md:w-14 md:h-14" :
                       puzzle.cols <= 12 ? "w-9 h-9 md:w-12 md:h-12" :
                       "w-7 h-7 md:w-10 md:h-10";

  const fontSizeClass = puzzle.cols <= 9 ? "text-xl md:text-3xl" :
                       puzzle.cols <= 12 ? "text-lg md:text-2xl" :
                       "text-sm md:text-xl";

  return (
    <div className="inline-block p-3 md:p-4 bg-gradient-to-br from-white to-purple-50 rounded-3xl playful-shadow">
      <div
        className="grid gap-0.5 md:gap-1"
        style={{ gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))` }}
      >
        {puzzle.grid.flatMap((row, r) =>
          row.map((cell, c) => {
            const key = `${r}-${c}`;
            if (!cell) {
              return <div key={key} className={cellSizeClass} />;
            }

            const inActive = isCellInActiveWord(r, c);
            const isActive = activeCell?.row === r && activeCell?.col === c;
            const value = entries[key] || "";
            const correct = value && value === cell.letter;
            const isRevealed = revealed.has(key);
            const isWrong = wrongPulse.has(key);

            return (
              <div
                key={key}
                className={`relative ${cellSizeClass} rounded-md md:rounded-lg transition-all duration-150 ${
                  isActive
                    ? "bg-yellow-300 ring-4 ring-yellow-500 scale-110 z-10"
                    : inActive
                    ? "bg-purple-100 ring-2 ring-purple-300"
                    : correct
                    ? "bg-green-100"
                    : "bg-white"
                } ${isWrong ? "animate-pop" : ""} border-2 ${
                  correct ? "border-green-400" : "border-purple-200"
                }`}
              >
                {cell.number && (
                  <span className="absolute top-0 left-0.5 text-[8px] md:text-[10px] font-bold text-purple-700 leading-none pt-0.5">
                    {cell.number}
                  </span>
                )}
                <input
                  ref={(el) => {
                    if (el) inputRefs.current.set(key, el);
                    else inputRefs.current.delete(key);
                  }}
                  type="text"
                  inputMode="text"
                  maxLength={1}
                  value={value}
                  onClick={() => onCellClick(r, c)}
                  onFocus={() => onCellClick(r, c)}
                  onChange={(e) => onCellInput(r, c, e.target.value)}
                  onKeyDown={(e) => onCellKey(r, c, e.key)}
                  readOnly={isRevealed}
                  className={`cell-input w-full h-full text-center font-bold ${fontSizeClass} bg-transparent outline-none ${
                    correct ? "text-green-700" : isRevealed ? "text-blue-700" : "text-purple-900"
                  }`}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
