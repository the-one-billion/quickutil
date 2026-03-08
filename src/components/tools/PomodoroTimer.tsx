"use client";
/**
 * Pomodoro Timer
 * Work / Short Break / Long Break tabs, custom durations, progress ring (SVG),
 * session counter, auto-advance toggle, Web Audio API beep on completion.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Types ────────────────────────────────────────────────────────────────────
type Mode = "work" | "short" | "long";

interface ModeConfig {
  label: string;
  defaultMinutes: number;
}

const MODE_CONFIGS: Record<Mode, ModeConfig> = {
  work:  { label: "Work",        defaultMinutes: 25 },
  short: { label: "Short Break", defaultMinutes: 5  },
  long:  { label: "Long Break",  defaultMinutes: 15 },
};

const SESSIONS_BEFORE_LONG = 4;

// ── Web Audio beep ────────────────────────────────────────────────────────────
function playBeep(): void {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
    osc.onended = () => void ctx.close();
  } catch {
    // Web Audio not available (SSR / some browsers)
  }
}

// ── Progress ring ─────────────────────────────────────────────────────────────
const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface RingProps {
  progress: number; // 0 → 1
  mode: Mode;
}

function ProgressRing({ progress, mode }: RingProps) {
  const offset = CIRCUMFERENCE * (1 - progress);
  const colors: Record<Mode, string> = {
    work:  "stroke-primary",
    short: "stroke-green-500",
    long:  "stroke-blue-500",
  };
  return (
    <svg width="200" height="200" className="-rotate-90" aria-hidden>
      <circle
        cx="100" cy="100" r={RADIUS}
        strokeWidth="8"
        className="fill-none stroke-muted"
      />
      <circle
        cx="100" cy="100" r={RADIUS}
        strokeWidth="8"
        className={`fill-none transition-all duration-500 ${colors[mode]}`}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

// ── Format mm:ss ─────────────────────────────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function PomodoroTimer() {
  const [durations, setDurations] = useState<Record<Mode, number>>({
    work:  25,
    short: 5,
    long:  15,
  });
  const [mode, setMode] = useState<Mode>("work");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);
  const [autoAdvance, setAutoAdvance] = useState(false);

  // Refs to avoid stale closures inside interval
  const modeRef = useRef(mode);
  const durationsRef = useRef(durations);
  const sessionCountRef = useRef(sessionCount);
  const autoAdvanceRef = useRef(autoAdvance);
  const secondsLeftRef = useRef(secondsLeft);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { durationsRef.current = durations; }, [durations]);
  useEffect(() => { sessionCountRef.current = sessionCount; }, [sessionCount]);
  useEffect(() => { autoAdvanceRef.current = autoAdvance; }, [autoAdvance]);
  useEffect(() => { secondsLeftRef.current = secondsLeft; }, [secondsLeft]);

  const totalSeconds = durations[mode] * 60;
  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;

  // ── Advance to next mode ──────────────────────────────────────────────────
  const advance = useCallback(() => {
    playBeep();
    const currentMode = modeRef.current;
    const currentSession = sessionCountRef.current;

    let nextMode: Mode;
    let nextSession = currentSession;

    if (currentMode === "work") {
      if (currentSession % SESSIONS_BEFORE_LONG === 0) {
        nextMode = "long";
      } else {
        nextMode = "short";
      }
    } else {
      nextMode = "work";
      if (currentMode === "long") {
        nextSession = currentSession + 1;
        setSessionCount(nextSession);
      } else {
        nextSession = currentSession + 1;
        setSessionCount(nextSession);
      }
    }

    setMode(nextMode);
    modeRef.current = nextMode;
    const nextSecs = durationsRef.current[nextMode] * 60;
    setSecondsLeft(nextSecs);
    secondsLeftRef.current = nextSecs;

    if (autoAdvanceRef.current) {
      setRunning(true);
    } else {
      setRunning(false);
    }
  }, []);

  // ── Countdown interval ────────────────────────────────────────────────────
  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          advance();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [running, advance]);

  // ── Mode tab change ───────────────────────────────────────────────────────
  function handleModeChange(m: Mode) {
    setMode(m);
    setRunning(false);
    setSecondsLeft(durations[m] * 60);
  }

  // ── Duration input change ─────────────────────────────────────────────────
  function handleDurationChange(m: Mode, val: string) {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 1) return;
    const clamped = Math.min(99, n);
    setDurations((prev) => ({ ...prev, [m]: clamped }));
    if (m === mode) {
      setSecondsLeft(clamped * 60);
      setRunning(false);
    }
  }

  function handleReset() {
    setRunning(false);
    setSecondsLeft(durations[mode] * 60);
  }

  // ── Next session label ────────────────────────────────────────────────────
  const nextMode: Mode =
    mode === "work"
      ? sessionCount % SESSIONS_BEFORE_LONG === 0
        ? "long"
        : "short"
      : "work";
  const completedSessions = mode === "work" ? sessionCount - 1 : sessionCount;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Pomodoro Timer</h1>
        <p className="text-sm text-muted-foreground">
          Stay focused with timed work sessions and breaks. Enable auto-advance to keep the rhythm going automatically.
        </p>
      </div>

      {/* Mode tabs */}
      <Tabs value={mode} onValueChange={(v) => handleModeChange(v as Mode)}>
        <TabsList className="w-full">
          {(Object.keys(MODE_CONFIGS) as Mode[]).map((m) => (
            <TabsTrigger key={m} value={m} className="flex-1">
              {MODE_CONFIGS[m].label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Timer face — shared across tabs */}
        <TabsContent value={mode}>
          <div className="flex flex-col items-center gap-6 py-4">
            {/* Progress ring + time display */}
            <div className="relative flex items-center justify-center">
              <ProgressRing progress={progress} mode={mode} />
              <div className="absolute flex flex-col items-center">
                <span className="font-mono text-5xl font-extrabold tracking-tighter text-foreground tabular-nums">
                  {formatTime(secondsLeft)}
                </span>
                <span className="mt-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {MODE_CONFIGS[mode].label}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={() => setRunning((v) => !v)}
                className="min-w-[100px]"
              >
                {running ? "Pause" : secondsLeft === durations[mode] * 60 ? "Start" : "Resume"}
              </Button>
              <Button variant="outline" size="lg" onClick={handleReset}>
                Reset
              </Button>
            </div>

            {/* Session info */}
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">
                Session {completedSessions + 1} of {SESSIONS_BEFORE_LONG}
                {completedSessions > 0 && ` · ${completedSessions} completed`}
              </p>
              <p className="text-xs text-muted-foreground">
                Next: {MODE_CONFIGS[nextMode].label}
              </p>
            </div>

            {/* Auto-advance toggle */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 w-full max-w-xs">
              <button
                role="switch"
                aria-checked={autoAdvance}
                onClick={() => setAutoAdvance((v) => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  autoAdvance ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    autoAdvance ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <div>
                <p className="text-sm font-medium text-foreground">Auto-advance</p>
                <p className="text-xs text-muted-foreground">Automatically start next session</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Dummy content for other tab values (tabs won't render them since we key on mode) */}
        {(Object.keys(MODE_CONFIGS) as Mode[]).filter((m) => m !== mode).map((m) => (
          <TabsContent key={m} value={m} />
        ))}
      </Tabs>

      {/* Custom durations */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Custom Durations (minutes)</p>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(MODE_CONFIGS) as Mode[]).map((m) => (
            <div key={m} className="space-y-1.5">
              <Label htmlFor={`dur-${m}`} className="text-xs text-muted-foreground">
                {MODE_CONFIGS[m].label}
              </Label>
              <Input
                id={`dur-${m}`}
                type="number"
                min="1"
                max="99"
                value={durations[m]}
                onChange={(e) => handleDurationChange(m, e.target.value)}
                className="text-center"
              />
            </div>
          ))}
        </div>
      </div>

      <p className="border-t border-border pt-4 text-xs text-muted-foreground">
        Timer uses setInterval. Sound alert uses Web Audio API — no audio files required. A long break occurs every {SESSIONS_BEFORE_LONG} work sessions.
      </p>
    </div>
  );
}
