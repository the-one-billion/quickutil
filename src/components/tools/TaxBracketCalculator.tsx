"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Filing = "single" | "married";

const BRACKETS: Record<Filing, { rate: number; min: number; max: number }[]> = {
  single: [
    { rate: 0.10, min: 0,      max: 11600 },
    { rate: 0.12, min: 11600,  max: 47150 },
    { rate: 0.22, min: 47150,  max: 100525 },
    { rate: 0.24, min: 100525, max: 191950 },
    { rate: 0.32, min: 191950, max: 243725 },
    { rate: 0.35, min: 243725, max: 609350 },
    { rate: 0.37, min: 609350, max: Infinity },
  ],
  married: [
    { rate: 0.10, min: 0,      max: 23200 },
    { rate: 0.12, min: 23200,  max: 94300 },
    { rate: 0.22, min: 94300,  max: 201050 },
    { rate: 0.24, min: 201050, max: 383900 },
    { rate: 0.32, min: 383900, max: 487450 },
    { rate: 0.35, min: 487450, max: 731200 },
    { rate: 0.37, min: 731200, max: Infinity },
  ],
};

const STD_DED: Record<Filing, number> = { single: 14600, married: 29200 };

export default function TaxBracketCalculator() {
  const [income, setIncome] = useState("");
  const [filing, setFiling] = useState<Filing>("single");
  const [result, setResult] = useState<{
    taxable: number;
    tax: number;
    effective: number;
    marginal: number;
    breakdown: { rate: number; amount: number; tax: number }[];
  } | null>(null);

  const calculate = () => {
    const gross = Number(income);
    if (!gross) return;
    const taxable = Math.max(0, gross - STD_DED[filing]);
    const brackets = BRACKETS[filing];
    let tax = 0;
    let marginal = 10;
    const breakdown: { rate: number; amount: number; tax: number }[] = [];
    for (const b of brackets) {
      if (taxable <= b.min) break;
      const amount = Math.min(taxable, b.max) - b.min;
      const t = amount * b.rate;
      breakdown.push({ rate: b.rate * 100, amount, tax: t });
      tax += t;
      marginal = b.rate * 100;
    }
    setResult({ taxable, tax, effective: (tax / gross) * 100, marginal, breakdown });
  };

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="space-y-4 max-w-sm">
      <div className="flex gap-2 flex-wrap">
        <Button variant={filing === "single" ? "default" : "outline"} size="sm" onClick={() => setFiling("single")}>Single</Button>
        <Button variant={filing === "married" ? "default" : "outline"} size="sm" onClick={() => setFiling("married")}>Married Filing Jointly</Button>
      </div>
      <div>
        <Label className="mb-1 block">Annual Gross Income ($)</Label>
        <Input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="75000" />
      </div>
      <Button onClick={calculate} className="w-full">Calculate Tax</Button>
      {result && (
        <div className="space-y-3">
          <div className="rounded-lg border p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Taxable Income</span><span>{fmt(result.taxable)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Standard Deduction</span><span>-{fmt(STD_DED[filing])}</span></div>
            <div className="flex justify-between border-t pt-2"><span className="text-muted-foreground">Total Federal Tax</span><span className="font-bold text-base">{fmt(result.tax)}</span></div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Effective Rate</span>
              <Badge variant="secondary">{result.effective.toFixed(2)}%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Marginal Rate</span>
              <Badge>{result.marginal}%</Badge>
            </div>
          </div>
          <div className="rounded-lg border divide-y text-xs">
            {result.breakdown.map((b) => (
              <div key={b.rate} className="flex justify-between px-3 py-2">
                <span className="text-muted-foreground">{b.rate}% bracket on {fmt(b.amount)}</span>
                <span className="font-medium">{fmt(b.tax)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">2024 US Federal only. State/local taxes not included.</p>
        </div>
      )}
    </div>
  );
}
