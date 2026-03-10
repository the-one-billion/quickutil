"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Gender = "male" | "female";
type Unit = "metric" | "imperial";

function navyBF(gender: Gender, heightIn: number, waistIn: number, neckIn: number, hipIn?: number): number {
  if (gender === "male") {
    return 495 / (1.0324 - 0.19077 * Math.log10(waistIn - neckIn) + 0.15456 * Math.log10(heightIn)) - 450;
  }
  return 495 / (1.29579 - 0.35004 * Math.log10(waistIn + (hipIn ?? 0) - neckIn) + 0.22100 * Math.log10(heightIn)) - 450;
}

function category(bf: number, gender: Gender): { label: string; variant: "default" | "secondary" | "destructive" } {
  const thresholds = gender === "male"
    ? [{ max: 6, label: "Essential Fat" }, { max: 14, label: "Athletic" }, { max: 18, label: "Fitness" }, { max: 25, label: "Average" }]
    : [{ max: 14, label: "Essential Fat" }, { max: 21, label: "Athletic" }, { max: 25, label: "Fitness" }, { max: 32, label: "Average" }];
  for (const t of thresholds) if (bf < t.max) return { label: t.label, variant: bf < (gender === "male" ? 6 : 14) ? "secondary" : "default" };
  return { label: "Obese", variant: "destructive" };
}

export default function BodyFatCalculator() {
  const [gender, setGender] = useState<Gender>("male");
  const [unit, setUnit] = useState<Unit>("metric");
  const [height, setHeight] = useState("");
  const [waist, setWaist] = useState("");
  const [neck, setNeck] = useState("");
  const [hip, setHip] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const toIn = (v: number) => unit === "imperial" ? v : v / 2.54;

  const calculate = () => {
    const h = toIn(Number(height));
    const w = toIn(Number(waist));
    const n = toIn(Number(neck));
    const hp = toIn(Number(hip));
    if (!h || !w || !n) return;
    const bf = navyBF(gender, h, w, n, gender === "female" ? hp : undefined);
    setResult(Math.max(0, Math.min(60, bf)));
  };

  const u = unit === "metric" ? "cm" : "in";

  return (
    <div className="space-y-5 max-w-sm">
      <div className="flex gap-2 flex-wrap">
        {(["male", "female"] as Gender[]).map((g) => (
          <Button key={g} variant={gender === g ? "default" : "outline"} size="sm" onClick={() => setGender(g)} className="capitalize">{g}</Button>
        ))}
        <div className="ml-auto flex gap-2">
          {(["metric", "imperial"] as Unit[]).map((u) => (
            <Button key={u} variant={unit === u ? "default" : "outline"} size="sm" onClick={() => setUnit(u)} className="capitalize">{u}</Button>
          ))}
        </div>
      </div>

      {[
        { label: `Height (${u})`, val: height, set: setHeight },
        { label: `Waist (${u})`, val: waist, set: setWaist },
        { label: `Neck (${u})`, val: neck, set: setNeck },
        ...(gender === "female" ? [{ label: `Hip (${u})`, val: hip, set: setHip }] : []),
      ].map(({ label, val, set }) => (
        <div key={label}>
          <Label className="mb-1 block">{label}</Label>
          <Input type="number" value={val} onChange={(e) => set(e.target.value)} placeholder="0" />
        </div>
      ))}

      <Button onClick={calculate} className="w-full">Calculate Body Fat %</Button>

      {result !== null && (() => {
        const cat = category(result, gender);
        return (
          <div className="rounded-lg border p-4 text-center space-y-2">
            <p className="text-4xl font-bold">{result.toFixed(1)}%</p>
            <Badge variant={cat.variant}>{cat.label}</Badge>
            <p className="text-xs text-muted-foreground">US Navy method · Measure at navel (waist) and narrowest point (neck)</p>
          </div>
        );
      })()}
    </div>
  );
}
