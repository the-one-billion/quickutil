"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export default function InflationCalculator() {
  const [amount, setAmount] = useState("");
  const [fromYear, setFromYear] = useState("2000");
  const [toYear, setToYear] = useState(new Date().getFullYear().toString());
  const [rate, setRate] = useState("3.0");
  const [result, setResult] = useState<{
    adjusted: number;
    pctChange: number;
    years: number;
  } | null>(null);

  const calculate = () => {
    const a = Number(amount);
    const fy = Number(fromYear);
    const ty = Number(toYear);
    const r = Number(rate) / 100;
    if (!a || !fy || !ty) return;
    const years = ty - fy;
    const adjusted = a * Math.pow(1 + r, years);
    setResult({ adjusted, pctChange: ((adjusted - a) / a) * 100, years });
  };

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  return (
    <div className="space-y-4 max-w-sm">
      <div>
        <Label className="mb-1 block">Amount ($)</Label>
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1 block">From Year</Label>
          <Input type="number" value={fromYear} onChange={(e) => setFromYear(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1 block">To Year</Label>
          <Input type="number" value={toYear} onChange={(e) => setToYear(e.target.value)} />
        </div>
      </div>
      <div>
        <Label className="mb-1 block">Annual Inflation Rate (%)</Label>
        <Input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
        <p className="text-xs text-muted-foreground mt-1">US historical avg ≈ 3%</p>
      </div>
      <Button onClick={calculate} className="w-full">
        <TrendingUp className="h-4 w-4 mr-2" />Calculate
      </Button>
      {result && amount && (
        <div className="rounded-lg border p-4 space-y-3 text-sm">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">
              {fmt(Number(amount))} in {fromYear} is equivalent to
            </p>
            <p className="text-3xl font-bold">{fmt(result.adjusted)}</p>
            <p className="text-xs text-muted-foreground">in {toYear} ({result.years} years)</p>
          </div>
          <div className="flex justify-between items-center border-t pt-3">
            <span className="text-muted-foreground">Purchasing power change</span>
            <Badge variant={result.pctChange > 0 ? "destructive" : "default"}>
              {result.pctChange > 0 ? "+" : ""}{result.pctChange.toFixed(1)}%
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
