"use client";

import { motion } from "framer-motion";
import type { Difficulty, TopicId } from "@/lib/types";
import { TOPICS } from "@/lib/topics";

interface Props {
  topicId: TopicId;
  onSelect: (difficulty: Difficulty) => void;
  onBack: () => void;
}

const LEVELS: {
  id: Difficulty;
  name: string;
  emoji: string;
  description: string;
  gradient: string;
  stars: number;
}[] = [
  {
    id: "easy",
    name: "Easy",
    emoji: "🌱",
    description: "3–4 letter words · Small grid",
    gradient: "from-emerald-400 to-green-500",
    stars: 1,
  },
  {
    id: "medium",
    name: "Medium",
    emoji: "⚡",
    description: "4–6 letter words · Bigger grid",
    gradient: "from-amber-400 to-orange-500",
    stars: 2,
  },
  {
    id: "hard",
    name: "Hard",
    emoji: "🔥",
    description: "5–8 letter words · Challenge mode",
    gradient: "from-rose-500 to-red-600",
    stars: 3,
  },
];

export function DifficultySelector({ topicId, onSelect, onBack }: Props) {
  const topic = TOPICS.find((t) => t.id === topicId)!;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold transition-colors"
        >
          <span className="text-2xl">←</span> Change topic
        </button>
        <div className="text-7xl mb-2 animate-float">{topic.emoji}</div>
        <h2 className="text-4xl md:text-5xl font-bold mb-2 text-purple-900">
          {topic.name}
        </h2>
        <p className="text-xl text-purple-700 font-medium">
          How tough do you want it?
        </p>
      </motion.div>

      <div className="flex flex-col gap-4">
        {LEVELS.map((level, i) => (
          <motion.button
            key={level.id}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            whileHover={{ scale: 1.02, x: 8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(level.id)}
            className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r ${level.gradient} text-white playful-shadow flex items-center gap-5 cursor-pointer`}
          >
            <div className="text-6xl group-hover:animate-wiggle">{level.emoji}</div>
            <div className="flex-1 text-left">
              <div className="text-3xl font-bold">{level.name}</div>
              <div className="text-base opacity-90">{level.description}</div>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, idx) => (
                <span
                  key={idx}
                  className={`text-2xl ${idx < level.stars ? "opacity-100" : "opacity-30"}`}
                >
                  ⭐
                </span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
