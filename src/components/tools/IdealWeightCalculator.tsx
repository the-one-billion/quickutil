"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Gender = "male" | "female";
type Unit = "metric" | "imperial";

// All formulas take height in cm and return kg
const FORMULAS: Record<string, (h: number, gender: Gender) => number> = {
  "Hamwi":   (h, g) => g === "male" ? 48.0 + 2.7 * (h/2.54 - 60) : 45.5 + 2.2 * (h/2.54 - 60),
  "Devine":  (h, g) => g === "male" ? 50.0 + 2.3 * (h/2.54 - 60) : 45.5 + 2.3 * (h/2.54 - 60),
  "Robinson":(h, g) => g === "male" ? 52.0 + 1.9 * (h/2.54 - 60) : 49.0 + 1.7 * (h/2.54 - 60),
  "Miller":  (h, g) => g === "male" ? 56.2 + 1.41 * (h/2.54 - 60) : 53.1 + 1.36 * (h/2.54 - 60),
  "BMI 22":  (h, _) => 22 * Math.pow(h/100, 2),
};

export default function IdealWeightCalculator() {
  const [gender, setGender] = useState<Gender>("male");
  const [unit, setUnit]     = useState<Unit>("metric");
  const [height, setHeight] = useState("");
  const [results, setResults] = useState<Record<string,number> | null>(null);

  const calculate = () => {
    const h = unit === "metric" ? Number(height) : Number(height) * 2.54;
    if (!h || h < 100 || h > 250) return;
    const r: Record<string,number> = {};
    for (const [name, fn] of Object.entries(FORMULAS)) {
      r[name] = Math.max(0, fn(h, gender));
    }
    setResults(r);
  };

  const fmtKg = (n: number) => `${n.toFixed(1)} kg`;
  const fmtLbs = (n: number) => `${(n * 2.20462).toFixed(1)} lbs`;

  return (
    <div className="space-y-5 max-w-sm">
      <div className="flex gap-2 flex-wrap">
        {(["male","female"] as Gender[]).map(g => (
          <Button key={g} variant={gender===g ? "default" : "outline"} size="sm" onClick={() => setGender(g)} className="capitalize">{g}</Button>
        ))}
        <div className="ml-auto flex gap-2">
          {(["metric","imperial"] as Unit[]).map(u => (
            <Button key={u} variant={unit===u ? "default" : "outline"} size="sm" onClick={() => setUnit(u)} className="capitalize">{u}</Button>
          ))}
        </div>
      </div>
      <div>
        <Label className="mb-1 block">Height ({unit === "metric" ? "cm" : "inches"})</Label>
        <Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder={unit === "metric" ? "175" : "69"} />
      </div>
      <Button onClick={calculate} className="w-full">Calculate</Button>
      {results && (
        <div className="rounded-lg border divide-y text-sm">
          {Object.entries(results).map(([name, kg]) => (
            <div key={name} className="flex justify-between items-center px-4 py-3">
              <span className="text-muted-foreground">{name} formula</span>
              <div className="text-right">
                <span className="font-semibold">{fmtKg(kg)}</span>
                <span className="text-xs text-muted-foreground ml-2">/ {fmtLbs(kg)}</span>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center px-4 py-3 bg-primary/5">
            <span className="font-semibold">Average</span>
            <Badge>{fmtKg(Object.values(results).reduce((a,b)=>a+b,0)/Object.values(results).length)}</Badge>
          </div>
        </div>
      )}
    </div>
  );
}
