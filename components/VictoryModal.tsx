"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface Props {
  open: boolean;
  score: number;
  seconds: number;
  timerWasOn: boolean;
  wordsSolved: number;
  onPlayAgain: () => void;
  onChangeTopic: () => void;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VictoryModal({
  open,
  score,
  seconds,
  timerWasOn,
  wordsSolved,
  onPlayAgain,
  onChangeTopic,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ["#a855f7", "#ec4899", "#f97316", "#eab308", "#22c55e"];
    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-purple-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-8 max-w-md w-full text-center playful-shadow"
          >
            <div className="text-7xl mb-3 animate-float">🏆</div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-2">
              You did it!
            </h2>
            <p className="text-purple-700 text-lg mb-6">
              You solved all {wordsSolved} words! 🎉
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl p-4">
                <div className="text-sm font-medium opacity-90">Score</div>
                <div className="text-3xl font-bold">⭐ {score}</div>
              </div>
              <div className="bg-gradient-to-br from-sky-400 to-blue-500 text-white rounded-2xl p-4">
                <div className="text-sm font-medium opacity-90">Time</div>
                <div className="text-3xl font-bold">
                  {timerWasOn ? `⏱️ ${formatTime(seconds)}` : "⏸️ OFF"}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onPlayAgain}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl playful-shadow hover:brightness-110 active:scale-95 transition"
              >
                🔄 Play Again
              </button>
              <button
                onClick={onChangeTopic}
                className="flex-1 bg-white text-purple-700 border-2 border-purple-200 font-bold py-3 rounded-xl hover:bg-purple-50 active:scale-95 transition"
              >
                🎯 New Topic
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
