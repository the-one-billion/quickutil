"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function DividendCalculator() {
  const [sharePrice, setSharePrice]   = useState("50");
  const [dps, setDps]                 = useState("2.00");
  const [shares, setShares]           = useState("100");
  const [growth, setGrowth]           = useState("5");
  const [result, setResult]           = useState<{
    yield: number; annual: number; monthly: number; drip: { year: number; shares: number; income: number; value: number }[];
  } | null>(null);

  const calculate = () => {
    const sp = Number(sharePrice), d = Number(dps), sh = Number(shares), g = Number(growth)/100;
    if (!sp || !d || !sh) return;
    const yld = (d / sp) * 100;
    const annual = d * sh;
    const drip: { year: number; shares: number; income: number; value: number }[] = [];
    let curShares = sh, curDps = d, curPrice = sp;
    for (let yr = 1; yr <= 10; yr++) {
      curDps *= (1 + g);
      curPrice *= (1 + g);
      const income = curDps * curShares;
      const newShares = income / curPrice;
      curShares += newShares;
      drip.push({ year: yr, shares: Math.round(curShares * 100)/100, income: Math.round(income * 100)/100, value: Math.round(curShares * curPrice) });
    }
    setResult({ yield: yld, annual, monthly: annual/12, drip });
  };

  const fmt = (n: number, d=2) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  return (
    <div className="space-y-4 max-w-sm">
      {[
        { label: "Share Price ($)", val: sharePrice, set: setSharePrice },
        { label: "Annual Dividend Per Share ($)", val: dps, set: setDps },
        { label: "Number of Shares", val: shares, set: setShares },
        { label: "Annual Dividend Growth Rate (%)", val: growth, set: setGrowth },
      ].map(({ label, val, set }) => (
        <div key={label}>
          <Label className="mb-1 block">{label}</Label>
          <Input type="number" step="0.01" value={val} onChange={e => set(e.target.value)} />
        </div>
      ))}
      <Button onClick={calculate} className="w-full">Calculate</Button>
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Dividend Yield", value: `${result.yield.toFixed(2)}%` },
              { label: "Annual Income", value: fmt(result.annual) },
              { label: "Monthly Income", value: fmt(result.monthly) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-bold text-sm mt-0.5">{value}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">10-Year DRIP Projection</p>
            <div className="rounded-lg border divide-y text-xs max-h-52 overflow-y-auto">
              <div className="grid grid-cols-4 px-3 py-2 font-semibold text-muted-foreground">
                <span>Year</span><span>Shares</span><span>Income</span><span>Value</span>
              </div>
              {result.drip.map(({ year, shares, income, value }) => (
                <div key={year} className="grid grid-cols-4 px-3 py-2 font-mono">
                  <span>{year}</span>
                  <span>{shares.toFixed(1)}</span>
                  <span>{fmt(income,0)}</span>
                  <span>{fmt(value,0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
