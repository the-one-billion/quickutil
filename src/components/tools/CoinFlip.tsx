"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type CoinSide = "H" | "T";

interface FlipStats {
  total: number;
  heads: number;
  tails: number;
  currentStreak: number;
  currentStreakSide: CoinSide | null;
  longestStreak: number;
  longestStreakSide: CoinSide | null;
}

function secureRandom(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / (0xffffffff + 1);
}

function flipCoin(): CoinSide {
  return secureRandom() < 0.5 ? "H" : "T";
}

const initialStats: FlipStats = {
  total: 0,
  heads: 0,
  tails: 0,
  currentStreak: 0,
  currentStreakSide: null,
  longestStreak: 0,
  longestStreakSide: null,
};

function updateStats(stats: FlipStats, result: CoinSide): FlipStats {
  const newTotal = stats.total + 1;
  const newHeads = stats.heads + (result === "H" ? 1 : 0);
  const newTails = stats.tails + (result === "T" ? 1 : 0);

  let newCurrentStreak: number;
  let newCurrentStreakSide: CoinSide;

  if (stats.currentStreakSide === result) {
    newCurrentStreak = stats.currentStreak + 1;
    newCurrentStreakSide = result;
  } else {
    newCurrentStreak = 1;
    newCurrentStreakSide = result;
  }

  const newLongestStreak =
    newCurrentStreak > stats.longestStreak
      ? newCurrentStreak
      : stats.longestStreak;
  const newLongestStreakSide =
    newCurrentStreak > stats.longestStreak
      ? result
      : stats.longestStreakSide;

  return {
    total: newTotal,
    heads: newHeads,
    tails: newTails,
    currentStreak: newCurrentStreak,
    currentStreakSide: newCurrentStreakSide,
    longestStreak: newLongestStreak,
    longestStreakSide: newLongestStreakSide,
  };
}

export default function CoinFlip() {
  const [currentResult, setCurrentResult] = useState<CoinSide | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [stats, setStats] = useState<FlipStats>(initialStats);
  const [history, setHistory] = useState<CoinSide[]>([]);
  const [flipNCount, setFlipNCount] = useState(10);
  const [lastBatchBreakdown, setLastBatchBreakdown] = useState<{
    heads: number;
    tails: number;
    total: number;
  } | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const coinRef = useRef<HTMLDivElement>(null);

  const doFlip = useCallback(() => {
    if (isFlipping) return;

    const result = flipCoin();
    setIsFlipping(true);
    setAnimationKey((k) => k + 1);
    setLastBatchBreakdown(null);

    setTimeout(() => {
      setCurrentResult(result);
      setStats((prev) => updateStats(prev, result));
      setHistory((prev) => [result, ...prev].slice(0, 20));
      setIsFlipping(false);
    }, 650);
  }, [isFlipping]);

  const doFlipN = useCallback(() => {
    const n = Math.min(100, Math.max(1, flipNCount));
    const results: CoinSide[] = [];
    for (let i = 0; i < n; i++) {
      results.push(flipCoin());
    }

    const batchHeads = results.filter((r) => r === "H").length;
    const batchTails = results.filter((r) => r === "T").length;

    const lastResult = results[results.length - 1];
    setCurrentResult(lastResult);
    setAnimationKey((k) => k + 1);
    setLastBatchBreakdown({ heads: batchHeads, tails: batchTails, total: n });

    setStats((prev) => {
      let s = prev;
      for (const r of results) s = updateStats(s, r);
      return s;
    });

    setHistory((prev) => [...results.reverse(), ...prev].slice(0, 20));
  }, [flipNCount]);

  const resetStats = useCallback(() => {
    setStats(initialStats);
    setHistory([]);
    setCurrentResult(null);
    setLastBatchBreakdown(null);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        doFlip();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [doFlip]);

  const headsPercent =
    stats.total > 0 ? ((stats.heads / stats.total) * 100).toFixed(1) : "0.0";
  const tailsPercent =
    stats.total > 0 ? ((stats.tails / stats.total) * 100).toFixed(1) : "0.0";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Coin Display */}
      <div className="flex flex-col items-center gap-4">
        <div
          className="relative flex items-center justify-center"
          style={{ width: 160, height: 160, perspective: "600px" }}
        >
          <style>{`
            @keyframes coinFlipAnim {
              0%   { transform: rotateY(0deg); }
              100% { transform: rotateY(720deg); }
            }
            .coin-flip-active {
              animation: coinFlipAnim 0.65s cubic-bezier(0.4,0,0.2,1) forwards;
            }
          `}</style>
          <div
            key={animationKey}
            ref={coinRef}
            className={`w-36 h-36 rounded-full flex items-center justify-center text-5xl shadow-2xl border-4 select-none transition-all duration-150 ${
              isFlipping ? "coin-flip-active" : ""
            } ${
              currentResult === "H"
                ? "bg-yellow-400 dark:bg-yellow-500 border-yellow-600"
                : currentResult === "T"
                ? "bg-gray-300 dark:bg-gray-500 border-gray-500"
                : "bg-gradient-to-br from-yellow-300 to-gray-300 dark:from-yellow-600 dark:to-gray-600 border-yellow-500"
            }`}
            style={{ transformStyle: "preserve-3d" }}
          >
            {currentResult === null
              ? "🪙"
              : currentResult === "H"
              ? "🟡"
              : "⚪"}
          </div>
        </div>

        <div className="text-center">
          {currentResult && !isFlipping ? (
            <p className="text-2xl font-bold tracking-wide">
              {currentResult === "H" ? "Heads!" : "Tails!"}
            </p>
          ) : isFlipping ? (
            <p className="text-lg text-muted-foreground animate-pulse">
              Flipping...
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              Press Flip! or hit Space
            </p>
          )}
        </div>

        <Button
          size="lg"
          onClick={doFlip}
          disabled={isFlipping}
          className="px-10 text-lg font-semibold"
        >
          Flip!
        </Button>
      </div>

      {/* Batch flip */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Flip Multiple
        </p>
        <div className="flex items-center gap-3">
          <Label className="shrink-0 text-sm">Flip</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={flipNCount}
            onChange={(e) =>
              setFlipNCount(
                Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
              )
            }
            className="w-24"
          />
          <Label className="shrink-0 text-sm">times</Label>
          <Button variant="outline" onClick={doFlipN}>
            Flip {flipNCount}×
          </Button>
        </div>
        {lastBatchBreakdown && (
          <div className="flex gap-4 text-sm">
            <span className="text-yellow-600 dark:text-yellow-400 font-medium">
              Heads: {lastBatchBreakdown.heads} (
              {((lastBatchBreakdown.heads / lastBatchBreakdown.total) * 100).toFixed(1)}%)
            </span>
            <span className="text-muted-foreground">
              Tails: {lastBatchBreakdown.tails} (
              {((lastBatchBreakdown.tails / lastBatchBreakdown.total) * 100).toFixed(1)}%)
            </span>
          </div>
        )}
      </div>

      {/* Stats Panel */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Stats
          </p>
          <Button variant="ghost" size="sm" onClick={resetStats}>
            Reset
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-md bg-muted p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Flips</p>
          </div>
          <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/30 p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.heads}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Heads {stats.total > 0 ? `(${headsPercent}%)` : ""}
            </p>
          </div>
          <div className="rounded-md bg-muted/60 p-3 text-center">
            <p className="text-2xl font-bold text-muted-foreground">
              {stats.tails}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tails {stats.total > 0 ? `(${tailsPercent}%)` : ""}
            </p>
          </div>
          <div className="rounded-md bg-muted p-3 text-center">
            <p className="text-2xl font-bold">
              {stats.currentStreak > 0
                ? `${stats.currentStreak}${stats.currentStreakSide}`
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Current Streak
            </p>
          </div>
          <div className="rounded-md bg-muted p-3 text-center sm:col-span-2">
            <p className="text-2xl font-bold">
              {stats.longestStreak > 0
                ? `${stats.longestStreak}${stats.longestStreakSide}`
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Longest Streak
            </p>
          </div>
        </div>
      </div>

      {/* Flip History */}
      {history.length > 0 && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Last {history.length} Flips
          </p>
          <div className="flex flex-wrap gap-1.5">
            {history.map((result, i) => (
              <Badge
                key={i}
                className={
                  result === "H"
                    ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-400 border-yellow-500"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }
              >
                {result}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
