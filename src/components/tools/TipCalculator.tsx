"use client";
/**
 * Tip Calculator
 * Bill amount, quick-select tip buttons (with custom slider),
 * party-size slider, round-up toggle.
 * All results update live.
 */
import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// ── Types ────────────────────────────────────────────────────────────────
type TipPreset = 10 | 15 | 18 | 20 | 25 | "custom";

const PRESETS: TipPreset[] = [10, 15, 18, 20, 25, "custom"];

function fmt(n: number): string {
  return n.toFixed(2);
}

// ── Main component ────────────────────────────────────────────────────────
export default function TipCalculator() {
  const [billStr,    setBillStr]    = useState("");
  const [tipPreset,  setTipPreset]  = useState<TipPreset>(18);
  const [customTip,  setCustomTip]  = useState(18);
  const [people,     setPeople]     = useState(1);
  const [roundUp,    setRoundUp]    = useState(false);

  const tipPct = tipPreset === "custom" ? customTip : tipPreset;

  const bill = useMemo(() => {
    const n = parseFloat(billStr);
    return isNaN(n) || n < 0 ? 0 : n;
  }, [billStr]);

  const results = useMemo(() => {
    const tipAmount   = bill * (tipPct / 100);
    const total       = bill + tipAmount;
    const perPersonRaw = total / people;
    const perPerson   = roundUp ? Math.ceil(perPersonRaw) : perPersonRaw;
    const tipPerPerson = tipAmount / people;
    return { tipAmount, total, perPerson, tipPerPerson };
  }, [bill, tipPct, people, roundUp]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Tip Calculator</h1>
        <p className="text-sm text-muted-foreground">
          Split the bill fairly — choose a tip percentage and divide by the number of people.
        </p>
      </div>

      {/* ── Bill amount ──────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="bill">Bill Amount</Label>
        <div className="relative flex items-center">
          <span className="absolute left-3 select-none text-muted-foreground text-sm font-medium pointer-events-none">
            $
          </span>
          <Input
            id="bill"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={billStr}
            onChange={(e) => setBillStr(e.target.value)}
            className="pl-7"
          />
        </div>
      </div>

      {/* ── Tip percentage buttons ───────────────────────────────────────── */}
      <div className="space-y-3">
        <Label>Tip Percentage</Label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset}
              variant={tipPreset === preset ? "default" : "outline"}
              size="sm"
              onClick={() => setTipPreset(preset)}
              className="min-w-[60px]"
            >
              {preset === "custom" ? "Custom" : `${preset}%`}
            </Button>
          ))}
        </div>

        {tipPreset === "custom" && (
          <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex items-center justify-between">
              <Label>Custom Tip</Label>
              <span className="text-lg font-bold text-foreground">{customTip}%</span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[customTip]}
              onValueChange={([v]) => setCustomTip(v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Number of people ────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Number of People</Label>
          <span className="text-lg font-bold text-foreground">
            {people} {people === 1 ? "person" : "people"}
          </span>
        </div>
        <Slider
          min={1}
          max={20}
          step={1}
          value={[people]}
          onValueChange={([v]) => setPeople(v)}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1</span>
          <span>20</span>
        </div>
      </div>

      {/* ── Round up toggle ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Round Up Per Person</p>
          <p className="text-xs text-muted-foreground">Rounds each person&apos;s share up to the nearest dollar</p>
        </div>
        <button
          role="switch"
          aria-checked={roundUp}
          onClick={() => setRoundUp((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
            roundUp ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
              roundUp ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* ── Results card ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="bg-muted/50 px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Results
          </span>
          <span className="text-xs text-muted-foreground">
            {tipPct}% tip · {people} {people === 1 ? "person" : "people"}
          </span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          <ResultRow
            label="Tip Amount"
            value={`$${fmt(results.tipAmount)}`}
            sub={people > 1 ? `$${fmt(results.tipPerPerson)} per person` : undefined}
          />
          <ResultRow
            label="Total Bill"
            value={`$${fmt(results.total)}`}
          />
          <ResultRow
            label={people > 1 ? "Per Person" : "Total Due"}
            value={`$${fmt(results.perPerson)}`}
            large
            highlight
            sub={roundUp && people > 1 ? "Rounded up to nearest dollar" : undefined}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground border-t border-border pt-4">
        Standard tipping: 15–20% for sit-down restaurants, 10–15% for counter service.
        You can always tip more for exceptional service.
      </p>
    </div>
  );
}

// ── Result row component ─────────────────────────────────────────────────
interface ResultRowProps {
  label:     string;
  value:     string;
  sub?:      string;
  large?:    boolean;
  highlight?: boolean;
}

function ResultRow({ label, value, sub, large, highlight }: ResultRowProps) {
  return (
    <div className={`flex items-center justify-between px-5 py-4 ${highlight ? "bg-primary/5" : ""}`}>
      <div>
        <p className={`font-medium text-foreground ${large ? "text-base" : "text-sm"}`}>
          {label}
        </p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <p
        className={`font-extrabold tracking-tight ${
          large
            ? "text-3xl text-primary"
            : "text-xl text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
