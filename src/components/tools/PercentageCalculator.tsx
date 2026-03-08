"use client";
/**
 * Percentage Calculator
 * Three calculation modes in tabs, all live-updating:
 *  1. X% of Y
 *  2. X is what % of Y
 *  3. Percentage change from A to B
 */
import { useState, useMemo, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// ── Utility ─────────────────────────────────────────────────────────────────
function parseNum(s: string): number | null {
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function fmt(n: number, decimals = 4): string {
  // Trim trailing zeros up to `decimals` places
  return parseFloat(n.toFixed(decimals)).toString();
}

// ── Sub-components ───────────────────────────────────────────────────────────

/** Copy-to-clipboard button for a result string */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  return (
    <Button variant="outline" size="sm" onClick={copy} disabled={!value}>
      {copied ? "Copied!" : "Copy result"}
    </Button>
  );
}

/** Styled result display card */
function ResultCard({
  result,
  formula,
  colorClass,
}: {
  result: string;
  formula: string;
  colorClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <p className={`text-3xl font-extrabold tracking-tight ${colorClass ?? "text-foreground"}`}>
        {result}
      </p>
      <p className="text-sm text-muted-foreground font-mono">{formula}</p>
      <CopyButton value={result} />
    </div>
  );
}

// ── Tab 1: X% of Y ──────────────────────────────────────────────────────────
function PercentOfY() {
  const [pct,  setPct]  = useState("");
  const [base, setBase] = useState("");

  const computed = useMemo(() => {
    const p = parseNum(pct);
    const y = parseNum(base);
    if (p === null || y === null) return null;
    const result = (p / 100) * y;
    return {
      result:  fmt(result),
      formula: `${p} × ${y} ÷ 100 = ${fmt(result)}`,
    };
  }, [pct, base]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="pct-x">Percentage (%)</Label>
          <Input
            id="pct-x"
            type="number"
            placeholder="e.g. 20"
            value={pct}
            onChange={(e) => setPct(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pct-y">of Number</Label>
          <Input
            id="pct-y"
            type="number"
            placeholder="e.g. 500"
            value={base}
            onChange={(e) => setBase(e.target.value)}
          />
        </div>
      </div>

      {computed ? (
        <ResultCard result={computed.result} formula={computed.formula} />
      ) : (
        <p className="text-sm text-muted-foreground text-center py-3">
          Enter both values to see the result.
        </p>
      )}
    </div>
  );
}

// ── Tab 2: X is what % of Y ──────────────────────────────────────────────────
function WhatPercentOf() {
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  const computed = useMemo(() => {
    const xn = parseNum(x);
    const yn = parseNum(y);
    if (xn === null || yn === null || yn === 0) return null;
    const result = (xn / yn) * 100;
    return {
      result:  `${fmt(result)}%`,
      formula: `(${xn} ÷ ${yn}) × 100 = ${fmt(result)}%`,
    };
  }, [x, y]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="what-x">Number (X)</Label>
          <Input
            id="what-x"
            type="number"
            placeholder="e.g. 45"
            value={x}
            onChange={(e) => setX(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="what-y">of Total (Y)</Label>
          <Input
            id="what-y"
            type="number"
            placeholder="e.g. 200"
            value={y}
            onChange={(e) => setY(e.target.value)}
          />
        </div>
      </div>

      {computed ? (
        <ResultCard result={computed.result} formula={computed.formula} />
      ) : (
        <p className="text-sm text-muted-foreground text-center py-3">
          Enter both values to see the percentage.
        </p>
      )}
    </div>
  );
}

// ── Tab 3: % Change ───────────────────────────────────────────────────────────
function PercentChange() {
  const [from, setFrom] = useState("");
  const [to,   setTo]   = useState("");

  const computed = useMemo(() => {
    const f = parseNum(from);
    const t = parseNum(to);
    if (f === null || t === null || f === 0) return null;
    const change   = ((t - f) / Math.abs(f)) * 100;
    const increase = change >= 0;
    return {
      change,
      result:  `${increase ? "+" : ""}${fmt(change)}%`,
      formula: `((${t} − ${f}) ÷ |${f}|) × 100 = ${fmt(change)}%`,
      colorClass: increase
        ? "text-green-600 dark:text-green-400"
        : "text-red-600 dark:text-red-400",
      label: increase ? "Increase" : "Decrease",
    };
  }, [from, to]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="change-from">From</Label>
          <Input
            id="change-from"
            type="number"
            placeholder="e.g. 80"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="change-to">To</Label>
          <Input
            id="change-to"
            type="number"
            placeholder="e.g. 100"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>

      {computed ? (
        <div className="space-y-3">
          <ResultCard
            result={computed.result}
            formula={computed.formula}
            colorClass={computed.colorClass}
          />
          <p className={`text-sm font-semibold ${computed.colorClass}`}>
            {computed.label} of {fmt(Math.abs(computed.change))}%
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-3">
          Enter both values to calculate the percentage change.
        </p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PercentageCalculator() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Percentage Calculator</h1>
        <p className="text-sm text-muted-foreground">
          Three percentage tools in one — all calculate live as you type.
        </p>
      </div>

      <Tabs defaultValue="percent-of">
        <TabsList className="w-full">
          <TabsTrigger value="percent-of"  className="flex-1">X% of Y</TabsTrigger>
          <TabsTrigger value="what-pct"    className="flex-1">What % of Y?</TabsTrigger>
          <TabsTrigger value="pct-change"  className="flex-1">% Change</TabsTrigger>
        </TabsList>

        <TabsContent value="percent-of" className="mt-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Calculate what X percent of a number equals.
            </p>
            <PercentOfY />
          </div>
        </TabsContent>

        <TabsContent value="what-pct" className="mt-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Find what percentage one number is of another.
            </p>
            <WhatPercentOf />
          </div>
        </TabsContent>

        <TabsContent value="pct-change" className="mt-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Calculate the percentage increase or decrease between two values.
            </p>
            <PercentChange />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
