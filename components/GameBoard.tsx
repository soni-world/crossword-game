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

  // Each cell uses CSS grid 1fr with aspect-square so cells auto-fit container.
  // The grid container is bounded by viewport width on mobile.
  // On mobile: fit width of container (which is bounded by viewport).
  // On desktop: cap cells at ~56px, so grid width = cols * 56.
  return (
    <div className="inline-block p-2 md:p-4 bg-gradient-to-br from-white to-purple-50 rounded-2xl md:rounded-3xl playful-shadow max-w-full">
      <div
        className="grid gap-0.5 md:gap-1 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))`,
          width: `min(calc(100vw - 1.5rem), ${puzzle.cols * 56}px)`,
        }}
      >
        {puzzle.grid.flatMap((row, r) =>
          row.map((cell, c) => {
            const key = `${r}-${c}`;
            if (!cell) {
              return <div key={key} className="aspect-square" />;
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
                className={`relative aspect-square rounded-md md:rounded-lg transition-all duration-150 ${
                  isActive
                    ? "bg-yellow-300 ring-2 md:ring-4 ring-yellow-500 scale-110 z-10"
                    : inActive
                    ? "bg-purple-100 ring-2 ring-purple-300"
                    : correct
                    ? "bg-green-100"
                    : "bg-white"
                } ${isWrong ? "animate-pop" : ""} border md:border-2 ${
                  correct ? "border-green-400" : "border-purple-200"
                }`}
              >
                {cell.number && (
                  <span className="absolute top-0 left-0.5 text-[7px] md:text-[10px] font-bold text-purple-700 leading-none pt-0.5 pointer-events-none">
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
                  onChange={(e) => onCellInput(r, c, e.target.value)}
                  onKeyDown={(e) => onCellKey(r, c, e.key)}
                  readOnly={isRevealed}
                  className={`cell-input w-full h-full text-center font-bold bg-transparent outline-none ${
                    correct ? "text-green-700" : isRevealed ? "text-blue-700" : "text-purple-900"
                  }`}
                  style={{ fontSize: "clamp(0.75rem, 3.5vw, 1.5rem)" }}
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
