"use client";
/**
 * Stopwatch
 * Precision stopwatch with lap tracking, keyboard shortcuts, fastest/slowest
 * lap highlighting, stats row, and copy-laps functionality.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ── Types ─────────────────────────────────────────────────────────────────────
type SwState = "idle" | "running" | "paused";

interface Lap {
  number: number;
  lapTime: number;   // ms since last lap
  splitTime: number; // total elapsed ms at this lap
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function pad2(n: number): string {
  return String(Math.floor(n)).padStart(2, "0");
}

function formatTime(ms: number): string {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const sec = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const min = totalMin % 60;
  const hr = Math.floor(totalMin / 60);
  return `${pad2(hr)}:${pad2(min)}:${pad2(sec)}.${pad2(cs)}`;
}

function formatTimeShort(ms: number): string {
  return formatTime(ms);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Stopwatch() {
  const [swState, setSwState] = useState<SwState>("idle");
  const [elapsed, setElapsed] = useState(0); // ms
  const [laps, setLaps] = useState<Lap[]>([]);

  // Refs so callbacks always see fresh values without re-registering effects
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0); // performance.now() when interval started
  const baseElapsedRef = useRef<number>(0); // ms accumulated before last resume
  const swStateRef = useRef<SwState>("idle");
  const lapsRef = useRef<Lap[]>([]);
  const elapsedRef = useRef<number>(0);

  swStateRef.current = swState;
  lapsRef.current = laps;
  elapsedRef.current = elapsed;

  // ── Core timer logic ────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const now = performance.now();
    const ms = baseElapsedRef.current + (now - startedAtRef.current);
    setElapsed(ms);
  }, []);

  const startTimer = useCallback(() => {
    startedAtRef.current = performance.now();
    intervalRef.current = setInterval(tick, 10);
    setSwState("running");
  }, [tick]);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    baseElapsedRef.current = elapsedRef.current;
    setSwState("paused");
  }, []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    baseElapsedRef.current = 0;
    setElapsed(0);
    setLaps([]);
    setSwState("idle");
  }, []);

  const toggleStartPause = useCallback(() => {
    if (swStateRef.current === "running") {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [startTimer, pauseTimer]);

  const recordLap = useCallback(() => {
    if (swStateRef.current !== "running") return;
    const currentElapsed = elapsedRef.current;
    setLaps((prev) => {
      if (prev.length >= 100) return prev;
      const lastSplit = prev.length > 0 ? prev[prev.length - 1].splitTime : 0;
      const lapTime = currentElapsed - lastSplit;
      return [
        ...prev,
        {
          number: prev.length + 1,
          lapTime,
          splitTime: currentElapsed,
        },
      ];
    });
  }, []);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.code === "Space") {
        e.preventDefault();
        toggleStartPause();
      } else if (e.code === "KeyL") {
        e.preventDefault();
        recordLap();
      } else if (e.code === "KeyR") {
        e.preventDefault();
        if (swStateRef.current !== "running") resetTimer();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleStartPause, recordLap, resetTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ── Lap stats ───────────────────────────────────────────────────────────────
  const fastestIdx =
    laps.length > 0
      ? laps.reduce(
          (best, lap, i) => (lap.lapTime < laps[best].lapTime ? i : best),
          0
        )
      : -1;
  const slowestIdx =
    laps.length > 1
      ? laps.reduce(
          (worst, lap, i) => (lap.lapTime > laps[worst].lapTime ? i : worst),
          0
        )
      : -1;

  const avgLap =
    laps.length > 0
      ? laps.reduce((sum, l) => sum + l.lapTime, 0) / laps.length
      : 0;

  // ── Copy laps ───────────────────────────────────────────────────────────────
  const copyLaps = useCallback(() => {
    if (laps.length === 0) return;
    const header = "Lap\tLap Time\tSplit Time";
    const rows = laps.map(
      (l) =>
        `${l.number}\t${formatTimeShort(l.lapTime)}\t${formatTimeShort(l.splitTime)}`
    );
    const stats = [
      ``,
      `Average: ${formatTimeShort(avgLap)}`,
      `Fastest: ${laps[fastestIdx] ? formatTimeShort(laps[fastestIdx].lapTime) : "-"} (Lap ${fastestIdx + 1})`,
      `Slowest: ${laps[slowestIdx] ? formatTimeShort(laps[slowestIdx].lapTime) : "-"} (Lap ${slowestIdx + 1})`,
    ];
    navigator.clipboard.writeText([header, ...rows, ...stats].join("\n"));
  }, [laps, avgLap, fastestIdx, slowestIdx]);

  // ── Render ──────────────────────────────────────────────────────────────────
  const isRunning = swState === "running";
  const isIdle = swState === "idle";

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto p-4">
      {/* ── Digital display ── */}
      <div className="w-full flex flex-col items-center gap-2 rounded-2xl bg-muted/40 py-8 px-4 border border-border">
        <span
          className="font-mono text-7xl sm:text-8xl tracking-tight tabular-nums select-none"
          aria-live="off"
        >
          {formatTime(elapsed)}
        </span>
        <Badge
          variant={
            isRunning ? "default" : isIdle ? "secondary" : "outline"
          }
          className="mt-1 text-xs uppercase tracking-widest"
        >
          {swState}
        </Badge>
      </div>

      {/* ── Controls ── */}
      <div className="flex gap-3 flex-wrap justify-center">
        <Button
          size="lg"
          variant={isRunning ? "secondary" : "default"}
          onClick={toggleStartPause}
          className="min-w-[120px]"
        >
          {isRunning ? "Pause" : isIdle ? "Start" : "Resume"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={recordLap}
          disabled={!isRunning || laps.length >= 100}
        >
          Lap
        </Button>
        <Button
          size="lg"
          variant="ghost"
          onClick={resetTimer}
          disabled={isRunning}
        >
          Reset
        </Button>
      </div>

      {/* ── Keyboard hint ── */}
      <p className="text-xs text-muted-foreground text-center">
        <kbd className="px-1.5 py-0.5 rounded border border-border font-mono text-xs">Space</kbd> Start/Pause
        {" · "}
        <kbd className="px-1.5 py-0.5 rounded border border-border font-mono text-xs">L</kbd> Lap
        {" · "}
        <kbd className="px-1.5 py-0.5 rounded border border-border font-mono text-xs">R</kbd> Reset
      </p>

      {/* ── Lap table ── */}
      {laps.length > 0 && (
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Laps ({laps.length}/100)
            </h2>
            <Button size="sm" variant="outline" onClick={copyLaps}>
              Copy laps
            </Button>
          </div>

          {/* Scrollable table */}
          <div className="w-full overflow-auto max-h-64 rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background border-b border-border">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground w-12">
                    #
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                    Lap Time
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                    Split
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...laps].reverse().map((lap, revIdx) => {
                  const origIdx = laps.length - 1 - revIdx;
                  const isFastest = origIdx === fastestIdx && laps.length > 1;
                  const isSlowest = origIdx === slowestIdx && laps.length > 1;
                  return (
                    <tr
                      key={lap.number}
                      className={
                        isFastest
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : isSlowest
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "hover:bg-muted/30"
                      }
                    >
                      <td className="px-3 py-1.5 font-mono font-medium">
                        {lap.number}
                        {isFastest && (
                          <span className="ml-1 text-[10px] font-semibold uppercase">
                            fastest
                          </span>
                        )}
                        {isSlowest && (
                          <span className="ml-1 text-[10px] font-semibold uppercase">
                            slowest
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 font-mono text-right tabular-nums">
                        {formatTimeShort(lap.lapTime)}
                      </td>
                      <td className="px-3 py-1.5 font-mono text-right tabular-nums text-muted-foreground">
                        {formatTimeShort(lap.splitTime)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs mt-1">
            <div className="rounded-lg border border-border p-2 bg-muted/30">
              <div className="text-muted-foreground mb-0.5">Average</div>
              <div className="font-mono font-semibold tabular-nums">
                {formatTimeShort(avgLap)}
              </div>
            </div>
            <div className="rounded-lg border border-green-500/40 p-2 bg-green-500/10">
              <div className="text-green-600 dark:text-green-400 mb-0.5">
                Fastest
              </div>
              <div className="font-mono font-semibold tabular-nums text-green-600 dark:text-green-400">
                {fastestIdx >= 0
                  ? formatTimeShort(laps[fastestIdx].lapTime)
                  : "-"}
              </div>
            </div>
            <div className="rounded-lg border border-red-500/40 p-2 bg-red-500/10">
              <div className="text-red-600 dark:text-red-400 mb-0.5">
                Slowest
              </div>
              <div className="font-mono font-semibold tabular-nums text-red-600 dark:text-red-400">
                {slowestIdx >= 0
                  ? formatTimeShort(laps[slowestIdx].lapTime)
                  : "-"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
