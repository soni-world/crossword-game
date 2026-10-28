"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { PlacedWord } from "@/lib/types";

interface Props {
  activeWord: PlacedWord | null;
  hintLevel: number;
  onHint: () => void;
  onReveal: () => void;
  disabled: boolean;
}

export function HintPanel({ activeWord, hintLevel, onHint, onReveal, disabled }: Props) {
  if (!activeWord) {
    return (
      <div className="bg-white/80 backdrop-blur rounded-3xl p-4 playful-shadow text-center text-purple-700 font-medium">
        👉 Tap a clue or a square to begin
      </div>
    );
  }

  const letterReveal = Math.min(hintLevel, 2);
  const previewLetters = activeWord.word.length;
  const shown = letterReveal === 0 ? 0 : letterReveal === 1 ? 1 : Math.ceil(previewLetters / 2);

  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl p-4 playful-shadow space-y-3">
      <div className="flex items-start gap-3">
        <div className="text-3xl">💡</div>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wide text-purple-500 font-bold">
            {activeWord.number} {activeWord.direction}
          </div>
          <div className="text-purple-900 font-semibold">{activeWord.clue}</div>
        </div>
      </div>

      <AnimatePresence>
        {hintLevel >= 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="font-mono text-2xl tracking-widest text-center text-purple-900 bg-purple-50 rounded-xl py-3"
          >
            {activeWord.word
              .split("")
              .map((ch, i) => (i < shown ? ch : "_"))
              .join(" ")}
          </motion.div>
        )}

        {hintLevel >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl p-3 text-sm text-purple-900"
          >
            <span className="font-bold">Fun fact:</span> {activeWord.explanation}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2">
        <button
          onClick={onHint}
          disabled={disabled || hintLevel >= 3}
          className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold px-4 py-2.5 rounded-xl playful-shadow hover:brightness-110 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {hintLevel === 0 ? "💡 Hint (−5)" :
           hintLevel === 1 ? "💡 More hint (−10)" :
           hintLevel === 2 ? "💡 Explain (−15)" :
           "✨ Max hint used"}
        </button>
        <button
          onClick={onReveal}
          disabled={disabled}
          className="bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl playful-shadow hover:brightness-110 active:scale-95 transition disabled:opacity-50"
        >
          🙈 Reveal
        </button>
      </div>
    </div>
  );
}
