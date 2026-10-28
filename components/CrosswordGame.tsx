"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TopicSelector } from "./TopicSelector";
import { DifficultySelector } from "./DifficultySelector";
import { GameBoard } from "./GameBoard";
import { ClueList } from "./ClueList";
import { HintPanel } from "./HintPanel";
import { HUD } from "./HUD";
import { VictoryModal } from "./VictoryModal";
import { BookShelf } from "./BookShelf";
import { TOPICS } from "@/lib/topics";
import { generateCrossword } from "@/lib/crosswordGenerator";
import type { Difficulty, PlacedWord, Puzzle, TopicId } from "@/lib/types";

type Screen = "topic" | "difficulty" | "game" | "books";

const HINT_COSTS = [5, 10, 15];
const REVEAL_COST = 25;

export function CrosswordGame() {
  const [screen, setScreen] = useState<Screen>("topic");
  const [topicId, setTopicId] = useState<TopicId | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [activeWordIdx, setActiveWordIdx] = useState<number | null>(null);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [hintsByWord, setHintsByWord] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [wrongPulse, setWrongPulse] = useState<Set<string>>(new Set());

  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [victory, setVictory] = useState(false);
  const [solvedWords, setSolvedWords] = useState<Set<number>>(new Set());

  const scoredWordsRef = useRef<Set<number>>(new Set());

  const topic = topicId ? TOPICS.find((t) => t.id === topicId)! : null;
  const activeWord = puzzle && activeWordIdx !== null ? puzzle.words[activeWordIdx] : null;
  const hintLevel = activeWordIdx !== null ? hintsByWord[activeWordIdx] || 0 : 0;

  // Timer tick
  useEffect(() => {
    if (!timerEnabled || screen !== "game" || victory) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerEnabled, screen, victory]);

  const startGame = useCallback((tId: TopicId, diff: Difficulty) => {
    const p = generateCrossword(tId, diff);
    setPuzzle(p);
    setEntries({});
    setActiveWordIdx(0);
    setActiveCell({ row: p.words[0].row, col: p.words[0].col });
    setHintsByWord({});
    setRevealed(new Set());
    setSolvedWords(new Set());
    scoredWordsRef.current = new Set();
    setScore(0);
    setSeconds(0);
    setVictory(false);
    setScreen("game");
  }, []);

  const handleTopicSelect = (t: TopicId) => {
    setTopicId(t);
    setScreen("difficulty");
  };

  const handleDifficultySelect = (d: Difficulty) => {
    if (!topicId) return;
    setDifficulty(d);
    startGame(topicId, d);
  };

  const getWordsAtCell = useCallback(
    (row: number, col: number): number[] => {
      if (!puzzle) return [];
      const cell = puzzle.grid[row][col];
      return cell?.wordIds ?? [];
    },
    [puzzle],
  );

  const getCellCoord = (word: PlacedWord, idx: number) => {
    const r = word.direction === "across" ? word.row : word.row + idx;
    const c = word.direction === "across" ? word.col + idx : word.col;
    return { r, c };
  };

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!puzzle) return;
      const ids = getWordsAtCell(row, col);
      if (ids.length === 0) return;
      let nextIdx = ids[0];
      if (activeWordIdx !== null && ids.includes(activeWordIdx)) {
        if (activeCell?.row === row && activeCell?.col === col && ids.length > 1) {
          nextIdx = ids.find((id) => id !== activeWordIdx) ?? activeWordIdx;
        } else {
          nextIdx = activeWordIdx;
        }
      }
      setActiveWordIdx(nextIdx);
      setActiveCell({ row, col });
    },
    [puzzle, activeWordIdx, activeCell, getWordsAtCell],
  );

  const checkWordComplete = useCallback(
    (wordIdx: number, nextEntries: Record<string, string>) => {
      if (!puzzle) return false;
      const w = puzzle.words[wordIdx];
      for (let i = 0; i < w.word.length; i++) {
        const { r, c } = getCellCoord(w, i);
        if (nextEntries[`${r}-${c}`] !== w.word[i]) return false;
      }
      return true;
    },
    [puzzle],
  );

  const advanceCell = useCallback(
    (row: number, col: number, forward: boolean) => {
      if (!puzzle || activeWordIdx === null) return;
      const w = puzzle.words[activeWordIdx];
      for (let i = 0; i < w.word.length; i++) {
        const { r, c } = getCellCoord(w, i);
        if (r === row && c === col) {
          const nextI = forward ? i + 1 : i - 1;
          if (nextI < 0 || nextI >= w.word.length) return;
          const { r: nr, c: nc } = getCellCoord(w, nextI);
          setActiveCell({ row: nr, col: nc });
          return;
        }
      }
    },
    [puzzle, activeWordIdx],
  );

  const handleCellInput = useCallback(
    (row: number, col: number, raw: string) => {
      if (!puzzle) return;
      const key = `${row}-${col}`;
      if (revealed.has(key)) return;
      const char = raw.slice(-1).toUpperCase();
      if (char && !/[A-Z]/.test(char)) return;

      const cell = puzzle.grid[row][col];
      if (!cell) return;

      const nextEntries = { ...entries, [key]: char };
      setEntries(nextEntries);

      if (char && char !== cell.letter) {
        setWrongPulse((prev) => new Set(prev).add(key));
        setTimeout(() => {
          setWrongPulse((prev) => {
            const n = new Set(prev);
            n.delete(key);
            return n;
          });
        }, 350);
      }

      if (char) advanceCell(row, col, true);

      // Scoring per solved word
      const idsAt = cell.wordIds;
      let bonus = 0;
      const newSolved = new Set(solvedWords);
      idsAt.forEach((idx) => {
        if (checkWordComplete(idx, nextEntries) && !scoredWordsRef.current.has(idx)) {
          const used = hintsByWord[idx] || 0;
          const base = puzzle.words[idx].word.length * 10;
          const hintPenalty = HINT_COSTS.slice(0, used).reduce((a, b) => a + b, 0);
          bonus += Math.max(base - hintPenalty, 5);
          scoredWordsRef.current.add(idx);
          newSolved.add(idx);
        }
      });
      if (bonus > 0) {
        setScore((s) => s + bonus);
        setSolvedWords(newSolved);
      }

      // Win detection: every cell matches target
      let allMatch = true;
      for (let r = 0; r < puzzle.rows && allMatch; r++) {
        for (let c = 0; c < puzzle.cols && allMatch; c++) {
          const g = puzzle.grid[r][c];
          if (g && nextEntries[`${r}-${c}`] !== g.letter) allMatch = false;
        }
      }
      if (allMatch) {
        const timeBonus = timerEnabled ? Math.max(0, 300 - seconds) : 0;
        if (timeBonus > 0) setScore((s) => s + timeBonus);
        setTimeout(() => setVictory(true), 300);
      }
    },
    [puzzle, entries, revealed, solvedWords, hintsByWord, checkWordComplete, advanceCell, timerEnabled, seconds],
  );

  const handleCellKey = useCallback(
    (row: number, col: number, key: string) => {
      if (!puzzle) return;
      if (key === "Backspace") {
        const k = `${row}-${col}`;
        if (entries[k]) {
          setEntries((e) => ({ ...e, [k]: "" }));
        } else {
          advanceCell(row, col, false);
          setTimeout(() => {
            setEntries((e) => {
              if (!activeWord) return e;
              for (let i = 0; i < activeWord.word.length; i++) {
                const { r, c } = getCellCoord(activeWord, i);
                if (r === row && c === col && i > 0) {
                  const { r: pr, c: pc } = getCellCoord(activeWord, i - 1);
                  return { ...e, [`${pr}-${pc}`]: "" };
                }
              }
              return e;
            });
          }, 0);
        }
      } else if (key === "ArrowRight" || key === "ArrowDown") {
        advanceCell(row, col, true);
      } else if (key === "ArrowLeft" || key === "ArrowUp") {
        advanceCell(row, col, false);
      } else if (key === " " || key === "Tab") {
        // Switch between across/down at this cell
        const ids = getWordsAtCell(row, col);
        if (ids.length > 1 && activeWordIdx !== null) {
          const next = ids.find((id) => id !== activeWordIdx) ?? activeWordIdx;
          setActiveWordIdx(next);
        }
      }
    },
    [puzzle, entries, activeWord, getWordsAtCell, activeWordIdx, advanceCell],
  );

  const handleSelectWord = useCallback(
    (w: PlacedWord) => {
      if (!puzzle) return;
      const idx = puzzle.words.indexOf(w);
      setActiveWordIdx(idx);
      setActiveCell({ row: w.row, col: w.col });
    },
    [puzzle],
  );

  const handleHint = useCallback(() => {
    if (activeWordIdx === null) return;
    const level = hintsByWord[activeWordIdx] || 0;
    if (level >= 3) return;
    const cost = HINT_COSTS[level];
    setScore((s) => Math.max(0, s - cost));
    setHintsByWord((h) => ({ ...h, [activeWordIdx]: level + 1 }));
  }, [activeWordIdx, hintsByWord]);

  const handleReveal = useCallback(() => {
    if (!puzzle || activeWordIdx === null) return;
    if (scoredWordsRef.current.has(activeWordIdx)) return;
    setScore((s) => Math.max(0, s - REVEAL_COST));
    const w = puzzle.words[activeWordIdx];
    const nextEntries = { ...entries };
    const nextRevealed = new Set(revealed);
    for (let i = 0; i < w.word.length; i++) {
      const { r, c } = getCellCoord(w, i);
      const key = `${r}-${c}`;
      nextEntries[key] = w.word[i];
      nextRevealed.add(key);
    }
    setEntries(nextEntries);
    setRevealed(nextRevealed);
    scoredWordsRef.current.add(activeWordIdx);
    setSolvedWords((prev) => new Set(prev).add(activeWordIdx));

    let allMatch = true;
    for (let r = 0; r < puzzle.rows && allMatch; r++) {
      for (let c = 0; c < puzzle.cols && allMatch; c++) {
        const g = puzzle.grid[r][c];
        if (g && nextEntries[`${r}-${c}`] !== g.letter) allMatch = false;
      }
    }
    if (allMatch) setTimeout(() => setVictory(true), 300);
  }, [puzzle, activeWordIdx, entries, revealed]);

  const handleNewPuzzle = () => {
    if (topicId && difficulty) startGame(topicId, difficulty);
  };

  const handleExit = () => {
    setScreen("topic");
    setPuzzle(null);
    setVictory(false);
  };

  const bgGradient = useMemo(() => {
    if (!topic) return "from-purple-100 via-pink-50 to-amber-50";
    return topic.gradient.replaceAll("500", "100").replaceAll("400", "50");
  }, [topic]);

  return (
    <main className={`min-h-screen bg-gradient-to-br ${bgGradient} flex flex-col`}>
      <AnimatePresence mode="wait">
        {screen === "topic" && (
          <motion.div
            key="topic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center"
          >
            <TopicSelector
              onSelect={handleTopicSelect}
              onOpenBooks={() => setScreen("books")}
            />
          </motion.div>
        )}

        {screen === "books" && (
          <motion.div
            key="books"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            <BookShelf onBack={() => setScreen("topic")} />
          </motion.div>
        )}

        {screen === "difficulty" && topicId && (
          <motion.div
            key="difficulty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center"
          >
            <DifficultySelector
              topicId={topicId}
              onSelect={handleDifficultySelect}
              onBack={() => setScreen("topic")}
            />
          </motion.div>
        )}

        {screen === "game" && puzzle && topic && difficulty && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 w-full max-w-7xl mx-auto px-2 md:px-6 py-2 md:py-4 space-y-2 md:space-y-4"
          >
            <div className="sticky top-0 z-20 -mx-2 md:mx-0 px-2 md:px-0 py-1 md:py-0 bg-gradient-to-br from-transparent to-transparent">
              <HUD
                score={score}
                seconds={seconds}
                timerEnabled={timerEnabled}
                onToggleTimer={() => setTimerEnabled((v) => !v)}
                onNewPuzzle={handleNewPuzzle}
                onExit={handleExit}
                topicName={topic.name}
                topicEmoji={topic.emoji}
                difficulty={difficulty}
              />
            </div>

            {/* Mobile: hint panel above grid for visibility while typing */}
            <div className="lg:hidden">
              <HintPanel
                activeWord={activeWord}
                hintLevel={hintLevel}
                onHint={handleHint}
                onReveal={handleReveal}
                disabled={
                  activeWordIdx !== null &&
                  scoredWordsRef.current.has(activeWordIdx)
                }
              />
            </div>

            <div className="grid lg:grid-cols-[auto_1fr] gap-2 md:gap-4 items-start">
              <div className="flex justify-center">
                <GameBoard
                  puzzle={puzzle}
                  entries={entries}
                  activeWord={activeWord}
                  activeCell={activeCell}
                  revealed={revealed}
                  wrongPulse={wrongPulse}
                  onCellClick={handleCellClick}
                  onCellInput={handleCellInput}
                  onCellKey={handleCellKey}
                />
              </div>

              <div className="space-y-4 w-full">
                {/* Desktop hint panel */}
                <div className="hidden lg:block">
                  <HintPanel
                    activeWord={activeWord}
                    hintLevel={hintLevel}
                    onHint={handleHint}
                    onReveal={handleReveal}
                    disabled={
                      activeWordIdx !== null &&
                      scoredWordsRef.current.has(activeWordIdx)
                    }
                  />
                </div>
                <ClueList
                  words={puzzle.words}
                  activeWord={activeWord}
                  solved={solvedWords}
                  onSelectWord={handleSelectWord}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <VictoryModal
        open={victory}
        score={score}
        seconds={seconds}
        timerWasOn={timerEnabled}
        wordsSolved={puzzle?.words.length ?? 0}
        onPlayAgain={handleNewPuzzle}
        onChangeTopic={handleExit}
      />
    </main>
  );
}
