"use client";
/**
 * Countdown Timer
 * HH:MM:SS input, presets, Web Audio API beep, visual flash, named multi-timers tab,
 * completion history.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// ── Web Audio beep ─────────────────────────────────────────────────────────────
function playAlertBeep(): void {
  try {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    const play = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      osc.connect(gain);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.5, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + start + dur
      );
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    };

    play(440, 0, 0.5);
    play(880, 0.6, 0.3);
  } catch {
    // silently ignore if audio context not available
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function pad2(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

function totalSeconds(h: number, m: number, s: number): number {
  return h * 3600 + m * 60 + s;
}

function secsToHMS(secs: number): { h: number; m: number; s: number } {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return { h, m, s };
}

function formatHMS(secs: number): string {
  const { h, m, s } = secsToHMS(Math.max(0, secs));
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

function nowLabel(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface HistoryEntry {
  id: number;
  label: string;
  duration: number; // seconds
  finishedAt: string;
}

interface MultiTimer {
  id: number;
  name: string;
  inputH: string;
  inputM: string;
  inputS: string;
  remaining: number; // seconds
  totalSecs: number;
  running: boolean;
  finished: boolean;
  flashing: boolean;
}

// ── PRESETS ────────────────────────────────────────────────────────────────────
const PRESETS: { label: string; secs: number }[] = [
  { label: "1 min", secs: 60 },
  { label: "5 min", secs: 300 },
  { label: "10 min", secs: 600 },
  { label: "15 min", secs: 900 },
  { label: "25 min", secs: 1500 },
  { label: "30 min", secs: 1800 },
  { label: "45 min", secs: 2700 },
  { label: "1 hr", secs: 3600 },
];

// ── Single Timer Display ───────────────────────────────────────────────────────
function displayColor(remaining: number, finished: boolean, flashing: boolean): string {
  if (finished) return flashing ? "text-red-500" : "text-red-400 dark:text-red-500";
  if (remaining <= 10) return "text-red-500 dark:text-red-400";
  if (remaining <= 60) return "text-amber-500 dark:text-amber-400";
  return "text-green-600 dark:text-green-400";
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CountdownTimer() {
  // ── Single timer state ─────────────────────────────────────────────────────
  const [inputH, setInputH] = useState("0");
  const [inputM, setInputM] = useState("5");
  const [inputS, setInputS] = useState("0");
  const [remaining, setRemaining] = useState(300); // seconds
  const [totalSecs, setTotalSecs] = useState(300);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const histIdRef = useRef(0);

  // ── Multi-timer state ──────────────────────────────────────────────────────
  const [multiTimers, setMultiTimers] = useState<MultiTimer[]>([
    { id: 1, name: "Timer 1", inputH: "0", inputM: "5", inputS: "0", remaining: 300, totalSecs: 300, running: false, finished: false, flashing: false },
  ]);
  const multiIntervalsRef = useRef<Map<number, ReturnType<typeof setInterval>>>(new Map());

  // ── Single timer logic ─────────────────────────────────────────────────────
  const stopInterval = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const stopFlash = useCallback(() => {
    if (flashRef.current) { clearInterval(flashRef.current); flashRef.current = null; }
    setFlashing(false);
  }, []);

  const triggerFinish = useCallback((label: string, dur: number) => {
    playAlertBeep();
    setFinished(true);
    setRunning(false);
    let f = false;
    flashRef.current = setInterval(() => {
      f = !f;
      setFlashing(f);
    }, 400);
    setTimeout(() => {
      if (flashRef.current) { clearInterval(flashRef.current); flashRef.current = null; }
      setFlashing(false);
    }, 5000);
    setHistory((prev) => [
      { id: ++histIdRef.current, label, duration: dur, finishedAt: nowLabel() },
      ...prev.slice(0, 4),
    ]);
  }, []);

  const startTimer = useCallback(() => {
    if (remaining <= 0) return;
    setFinished(false);
    setDismissed(false);
    stopFlash();
    setRunning(true);
    const started = Date.now();
    const startRemaining = remaining;
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      const next = startRemaining - elapsed;
      if (next <= 0) {
        stopInterval();
        setRemaining(0);
        triggerFinish(`${pad2(Math.floor(totalSecs / 3600))}:${pad2(Math.floor((totalSecs % 3600) / 60))}:${pad2(totalSecs % 60)}`, totalSecs);
      } else {
        setRemaining(next);
      }
    }, 250);
  }, [remaining, totalSecs, stopInterval, stopFlash, triggerFinish]);

  const pauseTimer = useCallback(() => {
    stopInterval();
    setRunning(false);
  }, [stopInterval]);

  const resetTimer = useCallback(() => {
    stopInterval();
    stopFlash();
    setRunning(false);
    setFinished(false);
    setDismissed(false);
    const secs = totalSeconds(Number(inputH), Number(inputM), Number(inputS));
    setRemaining(secs > 0 ? secs : 0);
    setTotalSecs(secs);
  }, [stopInterval, stopFlash, inputH, inputM, inputS]);

  const applyPreset = useCallback((secs: number) => {
    stopInterval();
    stopFlash();
    setRunning(false);
    setFinished(false);
    setDismissed(false);
    const { h, m, s } = secsToHMS(secs);
    setInputH(String(h));
    setInputM(String(m));
    setInputS(String(s));
    setRemaining(secs);
    setTotalSecs(secs);
  }, [stopInterval, stopFlash]);

  useEffect(() => {
    return () => { stopInterval(); stopFlash(); };
  }, [stopInterval, stopFlash]);

  // Input helpers with wrapping
  const adjustField = (
    val: string,
    setter: (v: string) => void,
    max: number,
    delta: number
  ) => {
    const n = ((Number(val) + delta) % (max + 1) + (max + 1)) % (max + 1);
    setter(String(n));
  };

  // ── Multi-timer logic ──────────────────────────────────────────────────────
  const addMultiTimer = useCallback(() => {
    if (multiTimers.length >= 4) return;
    const id = Date.now();
    setMultiTimers((prev) => [
      ...prev,
      { id, name: `Timer ${prev.length + 1}`, inputH: "0", inputM: "5", inputS: "0", remaining: 300, totalSecs: 300, running: false, finished: false, flashing: false },
    ]);
  }, [multiTimers.length]);

  const removeMultiTimer = useCallback((id: number) => {
    const int = multiIntervalsRef.current.get(id);
    if (int) { clearInterval(int); multiIntervalsRef.current.delete(id); }
    setMultiTimers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const startMultiTimer = useCallback((id: number) => {
    setMultiTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id || t.remaining <= 0) return t;
        return { ...t, running: true, finished: false };
      })
    );
    const timer = multiTimers.find((t) => t.id === id);
    if (!timer || timer.remaining <= 0) return;
    const started = Date.now();
    const startRemaining = timer.remaining;
    const int = setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      const next = startRemaining - elapsed;
      setMultiTimers((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          if (next <= 0) {
            clearInterval(multiIntervalsRef.current.get(id)!);
            multiIntervalsRef.current.delete(id);
            playAlertBeep();
            let f = false;
            const fi = setInterval(() => { f = !f; setMultiTimers((p2) => p2.map((t2) => t2.id === id ? { ...t2, flashing: f } : t2)); }, 400);
            setTimeout(() => { clearInterval(fi); setMultiTimers((p2) => p2.map((t2) => t2.id === id ? { ...t2, flashing: false } : t2)); }, 5000);
            return { ...t, remaining: 0, running: false, finished: true };
          }
          return { ...t, remaining: next };
        })
      );
    }, 250);
    multiIntervalsRef.current.set(id, int);
  }, [multiTimers]);

  const pauseMultiTimer = useCallback((id: number) => {
    const int = multiIntervalsRef.current.get(id);
    if (int) { clearInterval(int); multiIntervalsRef.current.delete(id); }
    setMultiTimers((prev) => prev.map((t) => t.id === id ? { ...t, running: false } : t));
  }, []);

  const resetMultiTimer = useCallback((id: number) => {
    const int = multiIntervalsRef.current.get(id);
    if (int) { clearInterval(int); multiIntervalsRef.current.delete(id); }
    setMultiTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const secs = totalSeconds(Number(t.inputH), Number(t.inputM), Number(t.inputS));
        return { ...t, remaining: secs, totalSecs: secs, running: false, finished: false, flashing: false };
      })
    );
  }, []);

  useEffect(() => {
    const intervals = multiIntervalsRef.current;
    return () => { intervals.forEach((int) => clearInterval(int)); intervals.clear(); };
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Tabs defaultValue="single">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="single" className="flex-1">Single Timer</TabsTrigger>
          <TabsTrigger value="multi" className="flex-1">Multiple Timers</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
        </TabsList>

        {/* ── Single Timer Tab ── */}
        <TabsContent value="single" className="flex flex-col items-center gap-6">
          {/* Finished banner */}
          {finished && !dismissed && (
            <div className="w-full flex items-center justify-between rounded-xl bg-red-500/15 border border-red-500/40 px-4 py-3">
              <span className="font-semibold text-red-600 dark:text-red-400">
                Timer finished!
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setDismissed(true); stopFlash(); }}
              >
                Dismiss
              </Button>
            </div>
          )}

          {/* Large display */}
          <div
            className={`w-full flex justify-center items-center rounded-2xl py-10 px-4 border transition-colors duration-150 ${
              finished && flashing
                ? "bg-red-500/30 border-red-500"
                : "bg-muted/40 border-border"
            }`}
          >
            <span
              className={`font-mono text-8xl sm:text-9xl tracking-tight tabular-nums font-bold transition-colors ${displayColor(remaining, finished, flashing)}`}
            >
              {formatHMS(remaining)}
            </span>
          </div>

          {/* Time input */}
          {!running && (
            <div className="flex items-end gap-3 flex-wrap justify-center">
              {(
                [
                  { label: "Hours",   val: inputH, setter: setInputH, max: 23 },
                  { label: "Minutes", val: inputM, setter: setInputM, max: 59 },
                  { label: "Seconds", val: inputS, setter: setInputS, max: 59 },
                ] as Array<{ label: string; val: string; setter: (v: string) => void; max: number }>
              ).map(({ label, val, setter, max }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-14 h-7 text-lg"
                      onClick={() => adjustField(val, setter, max, 1)}
                    >
                      ▲
                    </Button>
                    <Input
                      className="w-14 text-center font-mono text-xl h-10"
                      value={val}
                      onChange={(e) => {
                        const n = Math.min(max, Math.max(0, Number(e.target.value) || 0));
                        setter(String(n));
                      }}
                      type="number"
                      min={0}
                      max={max}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-14 h-7 text-lg"
                      onClick={() => adjustField(val, setter, max, -1)}
                    >
                      ▼
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Set button when not running */}
          {!running && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const secs = totalSeconds(Number(inputH), Number(inputM), Number(inputS));
                if (secs > 0) { setRemaining(secs); setTotalSecs(secs); setFinished(false); setDismissed(false); }
              }}
            >
              Set Time
            </Button>
          )}

          {/* Presets */}
          <div className="flex flex-wrap gap-2 justify-center">
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                size="sm"
                variant="outline"
                onClick={() => applyPreset(p.secs)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <Button
              size="lg"
              variant={running ? "secondary" : "default"}
              onClick={running ? pauseTimer : startTimer}
              disabled={remaining <= 0 && !running}
              className="min-w-[120px]"
            >
              {running ? "Pause" : finished ? "Restart" : "Start"}
            </Button>
            <Button size="lg" variant="outline" onClick={resetTimer}>
              Reset
            </Button>
          </div>
        </TabsContent>

        {/* ── Multiple Timers Tab ── */}
        <TabsContent value="multi" className="flex flex-col gap-4">
          {multiTimers.map((t) => (
            <div
              key={t.id}
              className={`rounded-xl border p-4 flex flex-col gap-3 transition-colors ${
                t.finished && t.flashing
                  ? "bg-red-500/20 border-red-500"
                  : "bg-muted/30 border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <Input
                  value={t.name}
                  onChange={(e) =>
                    setMultiTimers((prev) =>
                      prev.map((x) => x.id === t.id ? { ...x, name: e.target.value } : x)
                    )
                  }
                  className="h-8 w-36 text-sm font-medium"
                  disabled={t.running}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeMultiTimer(t.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  ✕
                </Button>
              </div>

              {/* Display */}
              <div className="flex justify-center">
                <span
                  className={`font-mono text-5xl tabular-nums font-bold transition-colors ${displayColor(t.remaining, t.finished, t.flashing)}`}
                >
                  {formatHMS(t.remaining)}
                </span>
              </div>

              {/* Inputs */}
              {!t.running && (
                <div className="flex gap-2 items-center justify-center flex-wrap">
                  {(["inputH", "inputM", "inputS"] as const).map((field, fi) => {
                    const maxes = [23, 59, 59];
                    const labels = ["H", "M", "S"];
                    return (
                      <div key={field} className="flex flex-col items-center gap-0.5">
                        <Label className="text-[10px] text-muted-foreground">{labels[fi]}</Label>
                        <Input
                          className="w-12 text-center font-mono h-8 text-sm"
                          value={t[field]}
                          type="number"
                          min={0}
                          max={maxes[fi]}
                          onChange={(e) => {
                            const v = Math.min(maxes[fi], Math.max(0, Number(e.target.value) || 0));
                            setMultiTimers((prev) =>
                              prev.map((x) => x.id === t.id ? { ...x, [field]: String(v) } : x)
                            );
                          }}
                        />
                      </div>
                    );
                  })}
                  <Button
                    size="sm"
                    variant="outline"
                    className="self-end"
                    onClick={() => {
                      const secs = totalSeconds(Number(t.inputH), Number(t.inputM), Number(t.inputS));
                      setMultiTimers((prev) =>
                        prev.map((x) => x.id === t.id ? { ...x, remaining: secs, totalSecs: secs, finished: false, flashing: false } : x)
                      );
                    }}
                  >
                    Set
                  </Button>
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-2 justify-center">
                <Button
                  size="sm"
                  variant={t.running ? "secondary" : "default"}
                  onClick={() => t.running ? pauseMultiTimer(t.id) : startMultiTimer(t.id)}
                  disabled={t.remaining <= 0 && !t.running}
                >
                  {t.running ? "Pause" : "Start"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => resetMultiTimer(t.id)}>
                  Reset
                </Button>
                {t.finished && (
                  <Badge variant="destructive" className="self-center">Done!</Badge>
                )}
              </div>
            </div>
          ))}

          {multiTimers.length < 4 && (
            <Button variant="outline" onClick={addMultiTimer} className="w-full border-dashed border-2 border-border bg-transparent hover:bg-muted/30">
              + Add Timer
            </Button>
          )}
        </TabsContent>

        {/* ── History Tab ── */}
        <TabsContent value="history">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <span className="text-4xl">⏳</span>
              <p className="text-sm">No completed timers yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{formatHMS(h.duration)} timer</span>
                    <span className="text-xs text-muted-foreground">{h.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs font-mono">
                    {h.finishedAt}
                  </Badge>
                </div>
              ))}
            </div>
          )}
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-muted-foreground"
              onClick={() => setHistory([])}
            >
              Clear history
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
