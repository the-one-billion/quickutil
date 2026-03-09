"use client";
/**
 * Investment Return Calculator
 * Two tabs: ROI Calculator and Annualised Return (CAGR).
 */
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseNum(s: string): number {
  const n = parseFloat(s.replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

function fmt(n: number, d = 2): string {
  if (!isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

function fmtCurrency(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  return `${sign}$${fmt(abs)}`;
}

function fmtPct(n: number, d = 2): string {
  if (!isFinite(n)) return "—";
  return `${fmt(n, d)}%`;
}

// ── Result row ────────────────────────────────────────────────────────────────

function ResultRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "positive" | "negative" | "neutral";
}) {
  const colorClass =
    accent === "positive"
      ? "text-green-600 dark:text-green-400"
      : accent === "negative"
      ? "text-red-500 dark:text-red-400"
      : "text-foreground";

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border last:border-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-base font-bold font-mono ${colorClass}`}>{value}</p>
    </div>
  );
}

// ── ROI Tab ───────────────────────────────────────────────────────────────────

function ROITab() {
  const [initialStr, setInitialStr] = useState("10000");
  const [mode, setMode] = useState<"finalValue" | "gainLoss">("finalValue");
  const [finalStr, setFinalStr] = useState("15000");
  const [gainStr, setGainStr] = useState("5000");
  const [yearsStr, setYearsStr] = useState("3");
  const [copied, setCopied] = useState(false);

  const initial = useMemo(() => parseNum(initialStr), [initialStr]);
  const finalValue = useMemo(
    () =>
      mode === "finalValue"
        ? parseNum(finalStr)
        : initial + parseNum(gainStr),
    [mode, finalStr, gainStr, initial]
  );

  const gain = finalValue - initial;
  const roi = initial > 0 ? (gain / initial) * 100 : NaN;
  const multiple = initial > 0 ? finalValue / initial : NaN;

  const years = useMemo(() => {
    const n = parseFloat(yearsStr);
    return isNaN(n) || n <= 0 ? null : n;
  }, [yearsStr]);

  const annualisedROI = useMemo(() => {
    if (!years || !isFinite(roi) || initial <= 0 || finalValue <= 0) return NaN;
    return (Math.pow(finalValue / initial, 1 / years) - 1) * 100;
  }, [years, roi, initial, finalValue]);

  function handleCopy() {
    const lines = [
      `Initial Investment: ${fmtCurrency(initial)}`,
      `Final Value: ${fmtCurrency(finalValue)}`,
      `Gain / Loss: ${fmtCurrency(gain)}`,
      `ROI: ${fmtPct(roi)}`,
      `Multiple: ${isFinite(multiple) ? `${fmt(multiple, 2)}x` : "—"}`,
      years
        ? `Annualised ROI (${years} yr): ${fmtPct(annualisedROI)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="roi-initial">Initial Investment</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="roi-initial"
              type="number"
              min="0"
              step="1000"
              placeholder="10000"
              value={initialStr}
              onChange={(e) => setInitialStr(e.target.value)}
              className="pl-7"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          {/* Mode toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor={mode === "finalValue" ? "roi-final" : "roi-gain"}>
              {mode === "finalValue" ? "Final Value" : "Gain / Loss"}
            </Label>
            <button
              type="button"
              onClick={() =>
                setMode((m) => (m === "finalValue" ? "gainLoss" : "finalValue"))
              }
              className="text-xs text-primary underline-offset-2 hover:underline"
            >
              Switch to {mode === "finalValue" ? "Gain/Loss" : "Final Value"}
            </button>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            {mode === "finalValue" ? (
              <Input
                id="roi-final"
                type="number"
                step="500"
                placeholder="15000"
                value={finalStr}
                onChange={(e) => setFinalStr(e.target.value)}
                className="pl-7"
              />
            ) : (
              <Input
                id="roi-gain"
                type="number"
                step="500"
                placeholder="5000"
                value={gainStr}
                onChange={(e) => setGainStr(e.target.value)}
                className="pl-7"
              />
            )}
          </div>
        </div>
      </div>

      {/* Holding period */}
      <div className="space-y-1.5">
        <Label htmlFor="roi-years">
          Holding Period{" "}
          <span className="text-muted-foreground font-normal">(years, for annualised ROI)</span>
        </Label>
        <div className="relative max-w-xs">
          <Input
            id="roi-years"
            type="number"
            min="0.1"
            step="0.5"
            placeholder="3"
            value={yearsStr}
            onChange={(e) => setYearsStr(e.target.value)}
            className="pr-12"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            yrs
          </span>
        </div>
      </div>

      {/* Results */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between bg-muted/50 px-5 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Results
          </span>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <ResultRow label="Initial Investment" value={fmtCurrency(initial)} />
        <ResultRow label="Final Value" value={fmtCurrency(finalValue)} />
        <ResultRow
          label="Gain / Loss"
          value={fmtCurrency(gain)}
          accent={gain >= 0 ? "positive" : "negative"}
        />
        <ResultRow
          label="ROI"
          value={fmtPct(roi)}
          accent={roi >= 0 ? "positive" : "negative"}
        />
        <ResultRow
          label="Multiple"
          value={isFinite(multiple) ? `${fmt(multiple, 2)}x` : "—"}
          accent="neutral"
        />
        {years && (
          <ResultRow
            label={`Annualised ROI (${years} yr)`}
            value={fmtPct(annualisedROI)}
            accent={annualisedROI >= 0 ? "positive" : "negative"}
          />
        )}
      </div>
    </div>
  );
}

// ── Annualised Return (CAGR) Tab ───────────────────────────────────────────────

const SP500_AVG = 10; // historical average

function AnnualisedTab() {
  const [startStr, setStartStr] = useState("10000");
  const [endStr, setEndStr] = useState("18000");
  const [yearsStr, setYearsStr] = useState("5");
  const [copied, setCopied] = useState(false);

  const startVal = useMemo(() => parseNum(startStr), [startStr]);
  const endVal = useMemo(() => parseNum(endStr), [endStr]);
  const years = useMemo(() => {
    const n = parseFloat(yearsStr);
    return isNaN(n) || n <= 0 ? 0 : n;
  }, [yearsStr]);

  const cagr = useMemo(() => {
    if (startVal <= 0 || endVal <= 0 || years <= 0) return NaN;
    return (Math.pow(endVal / startVal, 1 / years) - 1) * 100;
  }, [startVal, endVal, years]);

  const totalReturn = startVal > 0 ? ((endVal - startVal) / startVal) * 100 : NaN;
  const gain = endVal - startVal;
  const beatsSP500 = isFinite(cagr) && cagr > SP500_AVG;

  function handleCopy() {
    const lines = [
      `Start Value: ${fmtCurrency(startVal)}`,
      `End Value: ${fmtCurrency(endVal)}`,
      `Years: ${years}`,
      `CAGR: ${fmtPct(cagr)}`,
      `Total Return: ${fmtPct(totalReturn)}`,
      `Gain / Loss: ${fmtCurrency(gain)}`,
      `vs S&P 500 avg (${SP500_AVG}%): ${isFinite(cagr) ? (beatsSP500 ? "Better" : "Below") : "—"}`,
    ].join("\n");
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="cagr-start">Start Value</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="cagr-start"
              type="number"
              min="0"
              step="1000"
              placeholder="10000"
              value={startStr}
              onChange={(e) => setStartStr(e.target.value)}
              className="pl-7"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cagr-end">End Value</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="cagr-end"
              type="number"
              min="0"
              step="1000"
              placeholder="18000"
              value={endStr}
              onChange={(e) => setEndStr(e.target.value)}
              className="pl-7"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cagr-years">Number of Years</Label>
          <Input
            id="cagr-years"
            type="number"
            min="0.5"
            step="0.5"
            placeholder="5"
            value={yearsStr}
            onChange={(e) => setYearsStr(e.target.value)}
          />
        </div>
      </div>

      {/* Results */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between bg-muted/50 px-5 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Results
          </span>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>

        {/* CAGR — prominent */}
        <div className="flex items-center justify-between bg-primary/5 px-5 py-5 border-b border-border">
          <p className="text-base font-medium text-foreground">CAGR</p>
          <p className="text-3xl font-extrabold tracking-tight text-primary">
            {fmtPct(cagr)}
          </p>
        </div>

        <ResultRow
          label="Total Return"
          value={fmtPct(totalReturn)}
          accent={isFinite(totalReturn) ? (totalReturn >= 0 ? "positive" : "negative") : "neutral"}
        />
        <ResultRow
          label="Gain / Loss"
          value={fmtCurrency(gain)}
          accent={gain >= 0 ? "positive" : "negative"}
        />

        {/* S&P 500 comparison */}
        {isFinite(cagr) && (
          <div className="flex items-center justify-between px-5 py-3.5">
            <p className="text-sm text-muted-foreground">
              vs S&amp;P 500 avg ({SP500_AVG}%)
            </p>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                beatsSP500
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
              }`}
            >
              {beatsSP500 ? "▲" : "▼"}
              {beatsSP500 ? "Better" : "Below"} by{" "}
              {fmt(Math.abs(cagr - SP500_AVG), 1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function InvestmentReturn() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          Investment Return Calculator
        </h1>
        <p className="text-sm text-muted-foreground">
          Calculate ROI or Compound Annual Growth Rate (CAGR) for your
          investments.
        </p>
      </div>

      <Tabs defaultValue="roi">
        <TabsList className="w-full">
          <TabsTrigger value="roi" className="flex-1">
            ROI Calculator
          </TabsTrigger>
          <TabsTrigger value="cagr" className="flex-1">
            Annualised Return
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roi">
          <ROITab />
        </TabsContent>

        <TabsContent value="cagr">
          <AnnualisedTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
