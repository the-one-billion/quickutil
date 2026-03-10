"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState("30");
  const [retirementAge, setRetirementAge] = useState("65");
  const [currentSavings, setCurrentSavings] = useState("10000");
  const [monthlyContrib, setMonthlyContrib] = useState("500");
  const [annualReturn, setAnnualReturn] = useState("7");
  const [monthlyExpenses, setMonthlyExpenses] = useState("3000");
  const [result, setResult] = useState<{
    total: number;
    needed: number;
    yearsLast: number;
    onTrack: boolean;
  } | null>(null);

  const calculate = () => {
    const years = Number(retirementAge) - Number(currentAge);
    if (years <= 0) return;
    const r = Number(annualReturn) / 100 / 12;
    const n = years * 12;
    const fvSavings = Number(currentSavings) * Math.pow(1 + r, n);
    const fvContribs = r > 0 ? Number(monthlyContrib) * ((Math.pow(1 + r, n) - 1) / r) : Number(monthlyContrib) * n;
    const total = fvSavings + fvContribs;
    const needed = Number(monthlyExpenses) * 12 * 25; // 4% rule
    const yearsLast = needed > 0 ? Math.round(total / (Number(monthlyExpenses) * 12)) : 0;
    setResult({ total, needed, yearsLast, onTrack: total >= needed });
  };

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const fields = [
    { label: "Current Age", val: currentAge, set: setCurrentAge },
    { label: "Retirement Age", val: retirementAge, set: setRetirementAge },
    { label: "Current Savings ($)", val: currentSavings, set: setCurrentSavings },
    { label: "Monthly Contribution ($)", val: monthlyContrib, set: setMonthlyContrib },
    { label: "Expected Annual Return (%)", val: annualReturn, set: setAnnualReturn },
    { label: "Monthly Expenses in Retirement ($)", val: monthlyExpenses, set: setMonthlyExpenses },
  ];

  return (
    <div className="space-y-4 max-w-sm">
      {fields.map(({ label, val, set }) => (
        <div key={label}>
          <Label className="mb-1 block">{label}</Label>
          <Input type="number" value={val} onChange={(e) => set(e.target.value)} />
        </div>
      ))}
      <Button onClick={calculate} className="w-full">Calculate Retirement</Button>
      {result && (
        <div className="rounded-lg border p-4 space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Projected at retirement</span>
            <span className="font-bold text-lg">{fmt(result.total)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Needed (4% rule)</span>
            <span className="font-semibold">{fmt(result.needed)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Savings will last</span>
            <span className="font-semibold">{result.yearsLast} years</span>
          </div>
          <Badge variant={result.onTrack ? "default" : "destructive"} className="w-full justify-center py-1">
            {result.onTrack ? "✓ On Track" : "⚠ Need to save more"}
          </Badge>
          <p className="text-xs text-muted-foreground">Assumes constant return rate. For planning purposes only.</p>
        </div>
      )}
    </div>
  );
}
