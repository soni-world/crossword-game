"use client";

import { motion } from "framer-motion";

interface Props {
  score: number;
  seconds: number;
  timerEnabled: boolean;
  onToggleTimer: () => void;
  onNewPuzzle: () => void;
  onExit: () => void;
  topicName: string;
  topicEmoji: string;
  difficulty: string;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function HUD({
  score,
  seconds,
  timerEnabled,
  onToggleTimer,
  onNewPuzzle,
  onExit,
  topicName,
  topicEmoji,
  difficulty,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-white/80 backdrop-blur rounded-3xl px-4 py-3 playful-shadow">
      <button
        onClick={onExit}
        className="text-2xl hover:scale-110 active:scale-95 transition"
        aria-label="Back to menu"
      >
        🏠
      </button>

      <div className="flex items-center gap-1 text-purple-900 font-bold">
        <span className="text-2xl">{topicEmoji}</span>
        <span className="hidden sm:inline">{topicName}</span>
        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs uppercase tracking-wide">
          {difficulty}
        </span>
      </div>

      <div className="flex-1" />

      <motion.div
        key={score}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-3 py-1.5 rounded-full"
      >
        <span>⭐</span>
        <span className="tabular-nums">{score}</span>
      </motion.div>

      <button
        onClick={onToggleTimer}
        className={`flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-full transition ${
          timerEnabled
            ? "bg-gradient-to-r from-sky-400 to-blue-500 text-white"
            : "bg-gray-200 text-gray-500"
        }`}
      >
        <span>{timerEnabled ? "⏱️" : "⏸️"}</span>
        <span className="tabular-nums">{timerEnabled ? formatTime(seconds) : "OFF"}</span>
      </button>

      <button
        onClick={onNewPuzzle}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-3 py-1.5 rounded-full hover:brightness-110 active:scale-95 transition"
      >
        🔄 New
      </button>
    </div>
  );
}
