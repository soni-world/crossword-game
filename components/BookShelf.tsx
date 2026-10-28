"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookCard } from "./BookCard";
import { BOOKS, type Book, type ReadingLevel } from "@/lib/bookBanks";

interface Props {
  onBack: () => void;
}

const STORAGE_KEY = "word-quest-read-books";
const VISIBLE_COUNT = 6;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function BookShelf({ onBack }: Props) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [levelFilter, setLevelFilter] = useState<ReadingLevel | "all">("all");
  const [seed, setSeed] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setReadIds(new Set(JSON.parse(stored)));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(readIds)));
    } catch {
      // ignore
    }
  }, [readIds, hydrated]);

  const toggleRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filteredBooks = useMemo(() => {
    const base = levelFilter === "all" ? BOOKS : BOOKS.filter((b) => b.level === levelFilter);
    const unread = base.filter((b) => !readIds.has(b.id));
    const read = base.filter((b) => readIds.has(b.id));
    // Shuffle unread first (prefer new books), then show read ones at the end
    void seed; // seed is captured here via the useMemo dependency to re-shuffle on refresh
    return [...shuffle(unread), ...shuffle(read)];
  }, [levelFilter, readIds, seed]);

  const visibleBooks: Book[] = filteredBooks.slice(0, VISIBLE_COUNT);

  const totalForLevel = levelFilter === "all" ? BOOKS.length : BOOKS.filter((b) => b.level === levelFilter).length;
  const readCountForLevel = Array.from(readIds).filter((id) => {
    const b = BOOKS.find((x) => x.id === id);
    return b && (levelFilter === "all" || b.level === levelFilter);
  }).length;

  const unreadRemaining = totalForLevel - readCountForLevel;

  return (
    <div className="w-full max-w-5xl mx-auto px-3 md:px-6 py-4 md:py-8 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-2xl bg-white/80 rounded-full w-10 h-10 flex items-center justify-center playful-shadow hover:scale-110 active:scale-95 transition"
          aria-label="Back to home"
        >
          🏠
        </button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            📚 Book Nook
          </h1>
          <p className="text-sm md:text-base text-purple-700">
            Famous British children's stories to grow his imagination
          </p>
        </div>
      </div>

      {/* Filter + refresh row */}
      <div className="bg-white/80 backdrop-blur rounded-2xl md:rounded-3xl p-3 md:p-4 playful-shadow space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all" as const, label: "All", emoji: "📖" },
            { id: 2 as const, label: "Level 2", emoji: "🌱" },
            { id: 3 as const, label: "Level 3", emoji: "⚡" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setLevelFilter(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition active:scale-95 ${
                levelFilter === opt.id
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
            >
              <span>{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => setSeed((s) => s + 1)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold px-3 py-1.5 rounded-full hover:brightness-110 active:scale-95 transition text-sm"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
        <div className="text-xs md:text-sm text-purple-700 font-medium">
          ✅ Read: <span className="font-bold">{readCountForLevel}</span> of {totalForLevel}
          {unreadRemaining > 0 && (
            <span className="ml-2 text-purple-500">· {unreadRemaining} new to discover</span>
          )}
        </div>
      </div>

      {/* Books list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <AnimatePresence mode="popLayout">
          {visibleBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isRead={readIds.has(book.id)}
              onToggleRead={() => toggleRead(book.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {visibleBooks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10"
        >
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-purple-900 mb-2">
            All read! What a book worm!
          </h2>
          <p className="text-purple-700">Tap refresh to shuffle them again.</p>
        </motion.div>
      )}

      {unreadRemaining === 0 && filteredBooks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-yellow-300 to-orange-400 text-white rounded-2xl p-4 text-center font-bold playful-shadow"
        >
          🏆 You've read every book here! Super reader!
        </motion.div>
      )}

      <div className="text-xs text-purple-700/70 text-center pt-2 leading-relaxed">
        <p>
          📖 <span className="font-semibold">Read free</span> links go to Project Gutenberg — only
          shown for books whose text is in the public domain.
        </p>
        <p>
          🏛️ <span className="font-semibold">Find a copy</span> opens Open Library, where you can
          borrow (free library loan) or see where to buy. We don't host copyrighted PDFs.
        </p>
      </div>
    </div>
  );
}
