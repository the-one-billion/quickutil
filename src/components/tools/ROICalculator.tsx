"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function ROICalculator() {
  const [initial, setInitial]     = useState("10000");
  const [finalVal, setFinalVal]   = useState("15000");
  const [years, setYears]         = useState("3");
  const [result, setResult]       = useState<{
    roi: number; netProfit: number; annualized: number;
  } | null>(null);

  const calculate = () => {
    const i = Number(initial), f = Number(finalVal), y = Number(years);
    if (!i || !f) return;
    const roi = ((f - i) / i) * 100;
    const annualized = y > 0 ? (Math.pow(f/i, 1/y) - 1) * 100 : 0;
    setResult({ roi, netProfit: f - i, annualized });
  };

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  return (
    <div className="space-y-4 max-w-sm">
      {[
        { label: "Initial Investment ($)", val: initial, set: setInitial },
        { label: "Final Value ($)",        val: finalVal, set: setFinalVal },
        { label: "Time Period (years)",    val: years,    set: setYears },
      ].map(({ label, val, set }) => (
        <div key={label}>
          <Label className="mb-1 block">{label}</Label>
          <Input type="number" value={val} onChange={e => set(e.target.value)} />
        </div>
      ))}
      <Button onClick={calculate} className="w-full">Calculate ROI</Button>
      {result && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              {result.roi >= 0
                ? <TrendingUp className="h-6 w-6 text-green-600" />
                : <TrendingDown className="h-6 w-6 text-destructive" />}
              <p className={`text-4xl font-bold ${result.roi >= 0 ? "text-green-600" : "text-destructive"}`}>
                {result.roi >= 0 ? "+" : ""}{result.roi.toFixed(2)}%
              </p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Return on Investment</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Net Profit</span>
              <Badge variant={result.netProfit >= 0 ? "default" : "destructive"}>
                {result.netProfit >= 0 ? "+" : ""}{fmt(result.netProfit)}
              </Badge>
            </div>
            {Number(years) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Annualized Return (CAGR)</span>
                <span className="font-medium">{result.annualized.toFixed(2)}%/yr</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Multiple</span>
              <span className="font-medium">{(Number(finalVal)/Number(initial)).toFixed(2)}×</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
