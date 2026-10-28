"use client";

import { useState } from "react";
import type { PlacedWord } from "@/lib/types";

interface Props {
  words: PlacedWord[];
  activeWord: PlacedWord | null;
  solved: Set<number>;
  onSelectWord: (w: PlacedWord) => void;
}

export function ClueList({ words, activeWord, solved, onSelectWord }: Props) {
  const [expanded, setExpanded] = useState(false);
  const across = words.filter((w) => w.direction === "across");
  const down = words.filter((w) => w.direction === "down");
  const solvedCount = solved.size;
  const total = words.length;

  const renderGroup = (title: string, items: PlacedWord[], emoji: string) => (
    <div>
      <h3 className="text-base md:text-lg font-bold text-purple-900 mb-2 flex items-center gap-2">
        <span>{emoji}</span> {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((w) => {
          const isSolved = solved.has(words.indexOf(w));
          const isActive = activeWord === w;
          return (
            <li key={`${w.direction}-${w.number}`}>
              <button
                onClick={() => onSelectWord(w)}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-start gap-2 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                    : isSolved
                    ? "bg-green-50 text-green-800 line-through opacity-70"
                    : "bg-white hover:bg-purple-50 text-purple-900"
                }`}
              >
                <span className="font-bold min-w-6">{w.number}.</span>
                <span className="flex-1 text-sm md:text-base">
                  {w.clue}
                  {isSolved && <span className="ml-1">✓</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className="w-full bg-white/80 backdrop-blur rounded-2xl md:rounded-3xl p-3 md:p-4 playful-shadow">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="lg:hidden w-full flex items-center justify-between font-bold text-purple-900 py-1"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          <span>📋</span>
          <span>All Clues</span>
          <span className="text-sm font-medium text-purple-500">
            {solvedCount}/{total}
          </span>
        </span>
        <span className={`transition-transform ${expanded ? "rotate-180" : ""}`}>⌄</span>
      </button>
      <div
        className={`${expanded ? "block" : "hidden"} lg:block space-y-4 md:space-y-5 mt-3 lg:mt-0 lg:max-h-[70vh] lg:overflow-y-auto`}
      >
        {across.length > 0 && renderGroup("Across", across, "➡️")}
        {down.length > 0 && renderGroup("Down", down, "⬇️")}
      </div>
    </div>
  );
}
