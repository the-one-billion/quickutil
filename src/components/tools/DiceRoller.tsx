"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100;

interface DieInPool {
  sides: number;
  count: number;
}

interface RollResult {
  pool: DieInPool[];
  modifier: number;
  results: { sides: number; roll: number }[];
  total: number;
  label?: string;
  special?: string;
  timestamp: number;
}

const DIE_TYPES: DieType[] = [4, 6, 8, 10, 12, 20, 100];

const PRESETS: {
  label: string;
  pool: DieInPool[];
  modifier: number;
  special?: "advantage" | "disadvantage";
}[] = [
  { label: "D&D Attack", pool: [{ sides: 20, count: 1 }], modifier: 0 },
  { label: "D&D Damage 1d6", pool: [{ sides: 6, count: 1 }], modifier: 0 },
  { label: "2d6 Catan", pool: [{ sides: 6, count: 2 }], modifier: 0 },
  {
    label: "Advantage (2d20)",
    pool: [{ sides: 20, count: 2 }],
    modifier: 0,
    special: "advantage",
  },
  {
    label: "Disadvantage (2d20)",
    pool: [{ sides: 20, count: 2 }],
    modifier: 0,
    special: "disadvantage",
  },
];

function secureRoll(sides: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return (arr[0] % sides) + 1;
}

const DIE_SVG: Record<number, React.ReactNode> = {
  4: (
    <svg viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor">
      <polygon points="16,2 30,28 2,28" />
    </svg>
  ),
  6: (
    <svg viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor">
      <rect x="3" y="3" width="26" height="26" rx="4" />
    </svg>
  ),
  8: (
    <svg viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor">
      <polygon points="16,1 31,12 26,29 6,29 1,12" />
    </svg>
  ),
  10: (
    <svg viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor">
      <polygon points="16,1 30,10 28,27 4,27 2,10" />
    </svg>
  ),
  12: (
    <svg viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor">
      <polygon points="16,1 28,7 31,20 22,30 10,30 1,20 4,7" />
    </svg>
  ),
  20: (
    <svg viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor">
      <polygon points="16,1 31,11 26,29 6,29 1,11" />
    </svg>
  ),
  100: (
    <svg viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor">
      <circle cx="16" cy="16" r="14" />
    </svg>
  ),
};

export default function DiceRoller() {
  const [pool, setPool] = useState<DieInPool[]>([]);
  const [modifier, setModifier] = useState(0);
  const [customSides, setCustomSides] = useState(6);
  const [rolling, setRolling] = useState(false);
  const [currentRoll, setCurrentRoll] = useState<RollResult | null>(null);
  const [cyclingValues, setCyclingValues] = useState<number[]>([]);
  const [history, setHistory] = useState<RollResult[]>([]);
  const [specialMode, setSpecialMode] = useState<
    "advantage" | "disadvantage" | null
  >(null);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addDie = useCallback(
    (sides: number) => {
      setPool((prev) => {
        const existing = prev.find((d) => d.sides === sides);
        if (existing) {
          return prev.map((d) =>
            d.sides === sides ? { ...d, count: d.count + 1 } : d
          );
        }
        return [...prev, { sides, count: 1 }];
      });
      setSpecialMode(null);
    },
    []
  );

  const removeDie = useCallback((sides: number) => {
    setPool((prev) => {
      const existing = prev.find((d) => d.sides === sides);
      if (!existing) return prev;
      if (existing.count <= 1) return prev.filter((d) => d.sides !== sides);
      return prev.map((d) =>
        d.sides === sides ? { ...d, count: d.count - 1 } : d
      );
    });
  }, []);

  const rollPool = useCallback(
    (
      targetPool: DieInPool[],
      mod: number,
      label?: string,
      special?: "advantage" | "disadvantage"
    ) => {
      if (targetPool.length === 0 || rolling) return;

      const rawResults: { sides: number; roll: number }[] = [];
      for (const die of targetPool) {
        for (let i = 0; i < die.count; i++) {
          rawResults.push({ sides: die.sides, roll: secureRoll(die.sides) });
        }
      }

      // Setup cycling animation
      const totalDice = rawResults.length;
      const cycling = new Array(totalDice).fill(0).map((_, i) =>
        secureRoll(rawResults[i].sides)
      );
      setCyclingValues(cycling);
      setRolling(true);

      let cycleCount = 0;
      cycleRef.current = setInterval(() => {
        setCyclingValues(
          rawResults.map((r) => secureRoll(r.sides))
        );
        cycleCount++;
        if (cycleCount >= 6) {
          clearInterval(cycleRef.current!);
          setCyclingValues([]);
          setRolling(false);

          let total = rawResults.reduce((sum, r) => sum + r.roll, 0) + mod;
          let specialNote: string | undefined;

          if (special === "advantage" && rawResults.length === 2) {
            const best = Math.max(rawResults[0].roll, rawResults[1].roll);
            total = best + mod;
            specialNote = `Take higher: ${best}`;
          } else if (special === "disadvantage" && rawResults.length === 2) {
            const worst = Math.min(rawResults[0].roll, rawResults[1].roll);
            total = worst + mod;
            specialNote = `Take lower: ${worst}`;
          }

          const result: RollResult = {
            pool: targetPool,
            modifier: mod,
            results: rawResults,
            total,
            label,
            special: specialNote,
            timestamp: Date.now(),
          };
          setCurrentRoll(result);
          setHistory((prev) => [result, ...prev].slice(0, 10));
        }
      }, 80);
    },
    [rolling]
  );

  useEffect(() => {
    return () => {
      if (cycleRef.current) clearInterval(cycleRef.current);
    };
  }, []);

  const poolDescription = pool
    .map((d) => `${d.count}d${d.sides}`)
    .join(" + ");

  const totalDiceInPool = pool.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Die Type Buttons */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Choose Dice
        </p>
        <div className="flex flex-wrap gap-2">
          {DIE_TYPES.map((sides) => (
            <button
              key={sides}
              onClick={() => addDie(sides)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg border bg-muted hover:bg-accent hover:text-accent-foreground transition-colors min-w-[52px]"
            >
              {DIE_SVG[sides]}
              <span className="text-xs font-bold">D{sides}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm shrink-0">Custom die (sides):</Label>
          <Input
            type="number"
            min={3}
            max={1000}
            value={customSides}
            onChange={(e) =>
              setCustomSides(
                Math.min(1000, Math.max(3, parseInt(e.target.value) || 6))
              )
            }
            className="w-24"
          />
          <Button variant="outline" size="sm" onClick={() => addDie(customSides)}>
            + D{customSides}
          </Button>
        </div>
      </div>

      {/* Roll Pool */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Roll Pool
        </p>
        {pool.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Click dice above to add to pool
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {pool.map((d) => (
              <div
                key={d.sides}
                className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-medium"
              >
                <span>
                  {d.count}×D{d.sides}
                </span>
                <button
                  onClick={() => removeDie(d.sides)}
                  className="text-muted-foreground hover:text-destructive transition-colors text-xs leading-none"
                  aria-label={`Remove D${d.sides}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Label className="text-sm shrink-0">Modifier:</Label>
          <Input
            type="number"
            value={modifier}
            onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
            className="w-24"
          />
          {modifier !== 0 && (
            <span className="text-sm text-muted-foreground">
              {modifier > 0 ? "+" : ""}
              {modifier}
            </span>
          )}
        </div>

        {pool.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Rolling:{" "}
            <span className="font-medium text-foreground">
              {poolDescription}
              {modifier !== 0
                ? ` ${modifier > 0 ? "+" : ""}${modifier}`
                : ""}
            </span>
          </div>
        )}

        <Button
          size="lg"
          onClick={() => rollPool(pool, modifier, undefined, specialMode ?? undefined)}
          disabled={pool.length === 0 || rolling}
          className="w-full"
        >
          {rolling ? "Rolling..." : "Roll!"}
        </Button>
      </div>

      {/* Presets */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => {
                setPool(preset.pool);
                setModifier(preset.modifier);
                setSpecialMode(preset.special ?? null);
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Current Roll Result */}
      {(rolling || currentRoll) && (
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Result
          </p>

          {rolling && cyclingValues.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pool.flatMap((d) =>
                Array.from({ length: d.count }, (_, i) => (
                  <div
                    key={`${d.sides}-${i}`}
                    className="w-12 h-12 rounded-lg border-2 border-primary bg-primary/10 flex items-center justify-center font-bold text-lg animate-pulse"
                  >
                    {cyclingValues[
                      pool
                        .slice(0, pool.indexOf(d))
                        .reduce((s, dd) => s + dd.count, 0) + i
                    ] ?? "?"}
                  </div>
                ))
              )}
            </div>
          )}

          {!rolling && currentRoll && (
            <>
              {currentRoll.label && (
                <p className="text-xs text-muted-foreground font-medium">
                  {currentRoll.label}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {currentRoll.results.map((r, i) => (
                  <div
                    key={i}
                    className={`w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center ${
                      r.roll === r.sides
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300"
                        : r.roll === 1
                        ? "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300"
                        : "border-border bg-muted"
                    }`}
                  >
                    <span className="font-bold text-base leading-tight">
                      {r.roll}
                    </span>
                    <span className="text-[9px] text-muted-foreground leading-tight">
                      d{r.sides}
                    </span>
                  </div>
                ))}
                {currentRoll.modifier !== 0 && (
                  <div className="w-12 h-12 rounded-lg border-2 border-dashed border-muted-foreground/50 flex flex-col items-center justify-center text-muted-foreground">
                    <span className="font-bold text-sm">
                      {currentRoll.modifier > 0 ? "+" : ""}
                      {currentRoll.modifier}
                    </span>
                    <span className="text-[9px] leading-tight">mod</span>
                  </div>
                )}
              </div>

              {currentRoll.special && (
                <p className="text-sm text-muted-foreground italic">
                  {currentRoll.special}
                </p>
              )}

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{currentRoll.total}</span>
                <span className="text-muted-foreground text-sm">total</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            History (last {history.length})
          </p>
          <div className="space-y-2">
            {history.map((roll, i) => (
              <div
                key={roll.timestamp}
                className="flex items-center justify-between text-sm rounded-md bg-muted px-3 py-2"
              >
                <span className="text-muted-foreground">
                  {roll.label ??
                    roll.pool.map((d) => `${d.count}d${d.sides}`).join("+")}
                  {roll.modifier !== 0
                    ? ` ${roll.modifier > 0 ? "+" : ""}${roll.modifier}`
                    : ""}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    [{roll.results.map((r) => r.roll).join(", ")}]
                  </span>
                  <Badge variant="secondary" className="font-bold">
                    {roll.total}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
