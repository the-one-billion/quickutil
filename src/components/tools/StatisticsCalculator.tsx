"use client";
/**
 * Statistics Calculator
 * Computes descriptive statistics from a list of numbers entered by the user.
 * All calculations are performed inline — no external stat libraries.
 */
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// ── Math helpers ─────────────────────────────────────────────────────────────

function parseNumbers(raw: string): number[] {
  return raw
    .split(/[\s,;\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map(Number)
    .filter((n) => !isNaN(n));
}

function mean(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function modes(nums: number[]): number[] {
  const freq = new Map<number, number>();
  for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1);
  const maxFreq = Math.max(...freq.values());
  if (maxFreq === 1) return []; // no repeated value — no mode
  return [...freq.entries()]
    .filter(([, f]) => f === maxFreq)
    .map(([v]) => v)
    .sort((a, b) => a - b);
}

function variancePop(nums: number[], mu: number): number {
  return nums.reduce((acc, n) => acc + (n - mu) ** 2, 0) / nums.length;
}

function varianceSample(nums: number[], mu: number): number {
  if (nums.length < 2) return NaN;
  return nums.reduce((acc, n) => acc + (n - mu) ** 2, 0) / (nums.length - 1);
}

function quartile(sorted: number[], pct: number): number {
  const idx = pct * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/** Pearson's moment coefficient of skewness */
function skewness(nums: number[], mu: number, stdPop: number): number {
  if (stdPop === 0 || nums.length < 3) return NaN;
  const n = nums.length;
  const m3 = nums.reduce((acc, x) => acc + (x - mu) ** 3, 0) / n;
  return m3 / stdPop ** 3;
}

// ── Formatting ───────────────────────────────────────────────────────────────

function fmt(n: number, d = 4): string {
  if (!isFinite(n)) return "N/A";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: d,
  });
}

// ── Component ────────────────────────────────────────────────────────────────

interface StatResult {
  label: string;
  value: string;
}

export default function StatisticsCalculator() {
  const [raw, setRaw] = useState<string>(
    "4, 8, 15, 16, 23, 42, 8, 15, 4"
  );
  const [copied, setCopied] = useState(false);

  const nums = useMemo(() => parseNumbers(raw), [raw]);
  const sorted = useMemo(() => [...nums].sort((a, b) => a - b), [nums]);

  const stats = useMemo<StatResult[]>(() => {
    if (nums.length === 0) return [];

    const mu = mean(nums);
    const med = median(sorted);
    const modeList = modes(nums);
    const varPop = variancePop(nums, mu);
    const varSamp = varianceSample(nums, mu);
    const stdPop = Math.sqrt(varPop);
    const stdSamp = isNaN(varSamp) ? NaN : Math.sqrt(varSamp);
    const q1 = quartile(sorted, 0.25);
    const q3 = quartile(sorted, 0.75);
    const iqr = q3 - q1;
    const skew = skewness(nums, mu, stdPop);

    return [
      { label: "Count", value: String(nums.length) },
      { label: "Sum", value: fmt(nums.reduce((a, b) => a + b, 0)) },
      { label: "Min", value: fmt(sorted[0]) },
      { label: "Max", value: fmt(sorted[sorted.length - 1]) },
      { label: "Range", value: fmt(sorted[sorted.length - 1] - sorted[0]) },
      { label: "Mean (Average)", value: fmt(mu) },
      { label: "Median (Q2)", value: fmt(med) },
      {
        label: "Mode",
        value:
          modeList.length === 0
            ? "None"
            : modeList.map((v) => fmt(v)).join(", "),
      },
      { label: "Variance (Population)", value: fmt(varPop) },
      { label: "Variance (Sample)", value: fmt(varSamp) },
      { label: "Std Dev (Population)", value: fmt(stdPop) },
      { label: "Std Dev (Sample)", value: fmt(stdSamp) },
      { label: "Q1 (25th percentile)", value: fmt(q1) },
      { label: "Q3 (75th percentile)", value: fmt(q3) },
      { label: "IQR (Q3 − Q1)", value: fmt(iqr) },
      {
        label: "Skewness",
        value: isNaN(skew) ? "N/A" : fmt(skew),
      },
    ];
  }, [nums, sorted]);

  function handleCopy() {
    const text = stats.map((s) => `${s.label}: ${s.value}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          Statistics Calculator
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter numbers separated by commas, spaces, or newlines. All results
          update live.
        </p>
      </div>

      {/* Input */}
      <div className="space-y-1.5">
        <Label htmlFor="nums-input">Numbers</Label>
        <textarea
          id="nums-input"
          rows={4}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="e.g. 4, 8, 15, 16, 23, 42"
          className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background"
        />
      </div>

      {/* Results */}
      {stats.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Results</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy all"}
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 text-left">Statistic</th>
                  <th className="px-4 py-3 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.map((s) => (
                  <tr
                    key={s.label}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 text-muted-foreground">
                      {s.label}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-foreground">
                      {s.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sorted numbers */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sorted ({sorted.length} values)
            </p>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="break-all font-mono text-sm text-foreground">
                {sorted.map((n) => fmt(n, 6)).join(", ")}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Enter at least one number to see results.
          </p>
        </div>
      )}
    </div>
  );
}
