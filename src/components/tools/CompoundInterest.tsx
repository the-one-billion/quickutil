"use client";
/**
 * Compound Interest Calculator
 * Supports principal, rate, compounding frequency, time, and optional monthly
 * contributions. Renders a year-by-year table and a pure-SVG growth chart.
 */
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Types ─────────────────────────────────────────────────────────────────────

type Frequency = "daily" | "monthly" | "quarterly" | "annually";

interface YearRow {
  year: number;
  balance: number;
  interestEarned: number;
  totalContributions: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const FREQ_N: Record<Frequency, number> = {
  daily: 365,
  monthly: 12,
  quarterly: 4,
  annually: 1,
};

function fmt(n: number, d = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}
function fmtCurrency(n: number): string {
  return `$${fmt(n)}`;
}
function fmtPct(n: number): string {
  return `${fmt(n, 1)}%`;
}

function computeSchedule(
  principal: number,
  annualRate: number,
  frequency: Frequency,
  years: number,
  monthlyContrib: number
): YearRow[] {
  if (principal < 0 || annualRate < 0 || years <= 0) return [];

  const n = FREQ_N[frequency];
  const r = annualRate / 100 / n;
  const rows: YearRow[] = [];

  let balance = principal;
  let totalContributions = principal;

  for (let yr = 1; yr <= years; yr++) {
    // Simulate n compounding periods in this year
    for (let p = 0; p < n; p++) {
      balance = balance * (1 + r) + monthlyContrib * (12 / n);
      totalContributions += monthlyContrib * (12 / n);
    }
    rows.push({
      year: yr,
      balance,
      interestEarned: balance - totalContributions,
      totalContributions,
    });
  }

  return rows;
}

// ── SVG Line Chart ────────────────────────────────────────────────────────────

interface ChartProps {
  rows: YearRow[];
  principal: number;
}

function GrowthChart({ rows, principal }: ChartProps) {
  const W = 560;
  const H = 180;
  const PAD = { top: 10, right: 16, bottom: 30, left: 64 };

  if (rows.length === 0) return null;

  const minVal = Math.min(principal, rows[rows.length - 1].balance);
  const maxVal = rows[rows.length - 1].balance;
  const valRange = maxVal - minVal || 1;

  function xOf(i: number): number {
    return PAD.left + (i / (rows.length - 1 || 1)) * (W - PAD.left - PAD.right);
  }
  function yOf(val: number): number {
    return PAD.top + (1 - (val - minVal) / valRange) * (H - PAD.top - PAD.bottom);
  }

  // Balance polyline points
  const balancePts = rows
    .map((r, i) => `${xOf(i)},${yOf(r.balance)}`)
    .join(" ");

  // Contributions polyline points
  const contribPts = rows
    .map((r, i) => `${xOf(i)},${yOf(r.totalContributions)}`)
    .join(" ");

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    val: minVal + pct * valRange,
    y: PAD.top + (1 - pct) * (H - PAD.top - PAD.bottom),
  }));

  // X-axis tick labels (up to 6)
  const step = Math.ceil(rows.length / 6);
  const xTicks = rows
    .filter((_, i) => i === 0 || (i + 1) % step === 0 || i === rows.length - 1)
    .map((r, _, arr) => ({
      year: r.year,
      x: xOf(rows.indexOf(r)),
      // deduplicate
      key: r.year,
    }))
    .filter((t, i, arr) => arr.findIndex((a) => a.key === t.key) === i);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Growth Over Time
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        aria-hidden="true"
      >
        {/* Grid lines */}
        {yTicks.map((t) => (
          <line
            key={t.val}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={t.y}
            y2={t.y}
            className="stroke-border"
            strokeWidth={0.5}
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((t) => (
          <text
            key={t.val}
            x={PAD.left - 6}
            y={t.y + 4}
            textAnchor="end"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {t.val >= 1_000_000
              ? `$${fmt(t.val / 1_000_000, 1)}M`
              : t.val >= 1_000
              ? `$${fmt(t.val / 1_000, 0)}k`
              : `$${fmt(t.val, 0)}`}
          </text>
        ))}

        {/* X-axis labels */}
        {xTicks.map((t) => (
          <text
            key={t.key}
            x={t.x}
            y={H - 4}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            yr {t.year}
          </text>
        ))}

        {/* Contribution area fill */}
        <polyline
          points={contribPts}
          fill="none"
          className="stroke-blue-400/50 dark:stroke-blue-500/50"
          strokeWidth={1.5}
          strokeDasharray="4 2"
        />

        {/* Balance line */}
        <polyline
          points={balancePts}
          fill="none"
          className="stroke-primary"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Final dot */}
        <circle
          cx={xOf(rows.length - 1)}
          cy={yOf(rows[rows.length - 1].balance)}
          r={3}
          className="fill-primary"
        />
      </svg>

      {/* Legend */}
      <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 bg-primary rounded" />
          Balance
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 bg-blue-400/70 dark:bg-blue-500/70 rounded" style={{ borderTop: "1.5px dashed" }} />
          Contributions
        </span>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CompoundInterest() {
  const [principalStr, setPrincipalStr] = useState("10000");
  const [rateStr, setRateStr] = useState("7");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [years, setYears] = useState(20);
  const [monthlyStr, setMonthlyStr] = useState("200");
  const [showAll, setShowAll] = useState(false);

  const principal = useMemo(() => {
    const n = parseFloat(principalStr.replace(/,/g, ""));
    return isNaN(n) || n < 0 ? 0 : n;
  }, [principalStr]);

  const rate = useMemo(() => {
    const n = parseFloat(rateStr);
    return isNaN(n) || n < 0 ? 0 : n;
  }, [rateStr]);

  const monthlyContrib = useMemo(() => {
    const n = parseFloat(monthlyStr.replace(/,/g, ""));
    return isNaN(n) || n < 0 ? 0 : n;
  }, [monthlyStr]);

  const schedule = useMemo(
    () => computeSchedule(principal, rate, frequency, years, monthlyContrib),
    [principal, rate, frequency, years, monthlyContrib]
  );

  const finalRow = schedule[schedule.length - 1];
  const finalBalance = finalRow?.balance ?? 0;
  const totalContribs = finalRow?.totalContributions ?? principal;
  const totalInterest = finalBalance - totalContribs;
  const interestPct =
    finalBalance > 0 ? (totalInterest / finalBalance) * 100 : 0;

  const MAX_VISIBLE = 20;
  const displayedRows = showAll ? schedule : schedule.slice(0, MAX_VISIBLE);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          Compound Interest Calculator
        </h1>
        <p className="text-sm text-muted-foreground">
          Calculate how your investment grows over time with compounding and
          regular contributions.
        </p>
      </div>

      {/* Inputs grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ci-principal">Principal</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="ci-principal"
              type="number"
              min="0"
              step="1000"
              placeholder="10000"
              value={principalStr}
              onChange={(e) => setPrincipalStr(e.target.value)}
              className="pl-7"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ci-rate">Annual Interest Rate</Label>
          <div className="relative">
            <Input
              id="ci-rate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="7"
              value={rateStr}
              onChange={(e) => setRateStr(e.target.value)}
              className="pr-7"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              %
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ci-freq">Compounding Frequency</Label>
          <Select
            value={frequency}
            onValueChange={(v) => setFrequency(v as Frequency)}
          >
            <SelectTrigger id="ci-freq">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ci-monthly">Monthly Contribution</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="ci-monthly"
              type="number"
              min="0"
              step="50"
              placeholder="200"
              value={monthlyStr}
              onChange={(e) => setMonthlyStr(e.target.value)}
              className="pl-7"
            />
          </div>
        </div>
      </div>

      {/* Time slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Time Period</Label>
          <span className="text-lg font-bold text-foreground">
            {years} {years === 1 ? "year" : "years"}
          </span>
        </div>
        <Slider
          min={1}
          max={50}
          step={1}
          value={[years]}
          onValueChange={([v]) => setYears(v)}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 yr</span>
          <span>50 yrs</span>
        </div>
      </div>

      {/* Results card */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="bg-muted/50 px-5 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Results
          </span>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between bg-primary/5 px-5 py-5">
            <p className="text-base font-medium text-foreground">
              Final Balance
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-primary">
              {fmtCurrency(finalBalance)}
            </p>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-sm font-medium text-foreground">
              Total Contributions
            </p>
            <p className="text-xl font-bold text-foreground">
              {fmtCurrency(totalContribs)}
            </p>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-sm font-medium text-foreground">
              Total Interest Earned
            </p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {fmtCurrency(totalInterest)}
            </p>
          </div>
          {/* Breakdown bar */}
          <div className="px-5 py-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Contributions {fmtPct(100 - interestPct)}</span>
              <span>Interest {fmtPct(interestPct)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, interestPct))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <GrowthChart rows={schedule} principal={principal} />

      {/* Year-by-year table */}
      {schedule.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Year-by-Year Breakdown
          </h2>
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-muted/80 text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur">
                    <th className="px-4 py-3 text-left">Year</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                    <th className="px-4 py-3 text-right">Interest Earned</th>
                    <th className="px-4 py-3 text-right">Contributions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayedRows.map((row) => (
                    <tr
                      key={row.year}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {row.year}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {fmtCurrency(row.balance)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">
                        {fmtCurrency(row.interestEarned)}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {fmtCurrency(row.totalContributions)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {schedule.length > MAX_VISIBLE && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll
                ? "Show less"
                : `Show all ${schedule.length} years`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
