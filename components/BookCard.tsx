"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Book } from "@/lib/bookBanks";

interface Props {
  book: Book;
  isRead: boolean;
  onToggleRead: () => void;
}

export function BookCard({ book, isRead, onToggleRead }: Props) {
  const [imageError, setImageError] = useState(false);
  const coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg?default=false`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`relative rounded-2xl md:rounded-3xl overflow-hidden playful-shadow transition-all ${
        isRead ? "opacity-70" : "opacity-100"
      }`}
    >
      <div className={`bg-gradient-to-br ${book.gradient} p-3 md:p-4 flex gap-3 items-center`}>
        {/* Cover image or fallback */}
        <div className="relative shrink-0 w-20 h-28 md:w-24 md:h-32 rounded-lg md:rounded-xl overflow-hidden bg-white/20 flex items-center justify-center">
          {!imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={`${book.title} cover`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="text-4xl md:text-5xl">{book.emoji}</div>
          )}
          {isRead && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-3xl md:text-4xl animate-bounce-in">✅</div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-white">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide bg-white/25 rounded-full px-2 py-0.5">
              Level {book.level}
            </span>
            <span className="text-lg">{book.emoji}</span>
          </div>
          <h3 className="font-bold text-base md:text-lg leading-tight mb-0.5 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-xs md:text-sm opacity-90 mb-2">by {book.author}</p>
          <p className="text-xs md:text-sm opacity-95 line-clamp-3 mb-3">
            {book.synopsis}
          </p>
          <button
            onClick={onToggleRead}
            className={`text-xs md:text-sm font-bold px-3 py-1.5 rounded-full transition active:scale-95 ${
              isRead
                ? "bg-white/30 text-white hover:bg-white/40"
                : "bg-white text-purple-900 hover:brightness-110"
            }`}
          >
            {isRead ? "↩️ Unread" : "✅ Mark as read"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
