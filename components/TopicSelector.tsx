"use client";

import { motion } from "framer-motion";
import { TOPICS } from "@/lib/topics";
import type { TopicId } from "@/lib/types";

interface Props {
  onSelect: (topic: TopicId) => void;
}

export function TopicSelector({ onSelect }: Props) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 md:mb-10"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
          Word Quest 🎯
        </h1>
        <p className="text-xl md:text-2xl text-purple-900/80 font-medium">
          Pick a topic for your crossword adventure!
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {TOPICS.map((topic, i) => (
          <motion.button
            key={topic.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(topic.id)}
            className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${topic.gradient} text-white playful-shadow cursor-pointer group`}
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <div className="relative">
              <div className="text-6xl md:text-7xl mb-2 group-hover:animate-wiggle">
                {topic.emoji}
              </div>
              <div className="text-xl md:text-2xl font-bold">{topic.name}</div>
              <div className="text-sm md:text-base opacity-90 mt-1">
                {topic.description}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
