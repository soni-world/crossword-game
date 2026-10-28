"use client";

import type { PlacedWord } from "@/lib/types";

interface Props {
  words: PlacedWord[];
  activeWord: PlacedWord | null;
  solved: Set<number>;
  onSelectWord: (w: PlacedWord) => void;
}

export function ClueList({ words, activeWord, solved, onSelectWord }: Props) {
  const across = words.filter((w) => w.direction === "across");
  const down = words.filter((w) => w.direction === "down");

  const renderGroup = (title: string, items: PlacedWord[], emoji: string) => (
    <div>
      <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-2">
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
    <div className="w-full bg-white/80 backdrop-blur rounded-3xl p-4 playful-shadow space-y-5 max-h-[70vh] overflow-y-auto">
      {across.length > 0 && renderGroup("Across", across, "➡️")}
      {down.length > 0 && renderGroup("Down", down, "⬇️")}
    </div>
  );
}
