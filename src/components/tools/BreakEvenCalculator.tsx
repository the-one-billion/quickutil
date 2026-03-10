"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function BreakEvenCalculator() {
  const [fixedCosts, setFixed]       = useState("10000");
  const [variableCost, setVariable]  = useState("15");
  const [sellingPrice, setSelling]   = useState("25");
  const [result, setResult]          = useState<{
    units: number; revenue: number; margin: number; marginPct: number;
  } | null>(null);

  const calculate = () => {
    const fc = Number(fixedCosts), vc = Number(variableCost), sp = Number(sellingPrice);
    if (!fc || !vc || !sp || sp <= vc) return;
    const cm = sp - vc;
    const units = Math.ceil(fc / cm);
    const revenue = units * sp;
    setResult({ units, revenue, margin: cm, marginPct: (cm / sp) * 100 });
  };

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  const fmtN = (n: number) => n.toLocaleString();

  return (
    <div className="space-y-4 max-w-sm">
      {[
        { label: "Fixed Costs ($)", val: fixedCosts, set: setFixed, hint: "Rent, salaries, insurance…" },
        { label: "Variable Cost per Unit ($)", val: variableCost, set: setVariable, hint: "Materials, labour per item…" },
        { label: "Selling Price per Unit ($)", val: sellingPrice, set: setSelling, hint: "" },
      ].map(({ label, val, set, hint }) => (
        <div key={label}>
          <Label className="mb-1 block">{label}</Label>
          <Input type="number" value={val} onChange={e => set(e.target.value)} />
          {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
        </div>
      ))}
      {Number(sellingPrice) <= Number(variableCost) && Number(sellingPrice) > 0 && (
        <p className="text-sm text-destructive">Selling price must be higher than variable cost</p>
      )}
      <Button onClick={calculate} className="w-full">Calculate Break-Even</Button>
      {result && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-primary/10 p-3">
              <p className="text-xs text-muted-foreground">Break-even Units</p>
              <p className="text-2xl font-bold">{fmtN(result.units)}</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-3">
              <p className="text-xs text-muted-foreground">Break-even Revenue</p>
              <p className="text-2xl font-bold">{fmt(result.revenue)}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contribution Margin</span>
              <span className="font-medium">{fmt(result.margin)}/unit</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross Margin</span>
              <Badge variant="secondary">{result.marginPct.toFixed(1)}%</Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
