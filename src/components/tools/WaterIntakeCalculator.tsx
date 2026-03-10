"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Droplets } from "lucide-react";

type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
type Climate = "normal" | "hot" | "humid";
type Unit = "metric" | "imperial";

const ACTIVITY: Record<ActivityLevel, { label: string; factor: number }> = {
  sedentary:   { label: "Sedentary (office job)", factor: 1.0 },
  light:       { label: "Light exercise (1-3×/week)", factor: 1.1 },
  moderate:    { label: "Moderate exercise (3-5×/week)", factor: 1.2 },
  active:      { label: "Active (daily exercise)", factor: 1.35 },
  very_active: { label: "Very active (2× daily)", factor: 1.5 },
};

const CLIMATE: Record<Climate, { label: string; addMl: number }> = {
  normal: { label: "Normal", addMl: 0 },
  hot:    { label: "Hot/Dry", addMl: 500 },
  humid:  { label: "Hot/Humid", addMl: 750 },
};

export default function WaterIntakeCalculator() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [climate, setClimate] = useState<Climate>("normal");
  const [result, setResult] = useState<{ ml: number; cups: number; oz: number } | null>(null);

  const calculate = () => {
    const w = Number(weight);
    if (!w) return;
    const kg = unit === "metric" ? w : w * 0.453592;
    const ml = Math.round(kg * 35 * ACTIVITY[activity].factor + CLIMATE[climate].addMl);
    setResult({ ml, cups: Math.round(ml / 236.6), oz: Math.round(ml / 29.574) });
  };

  return (
    <div className="space-y-5 max-w-sm">
      <div className="flex gap-2">
        {(["metric", "imperial"] as Unit[]).map((u) => (
          <Button key={u} variant={unit === u ? "default" : "outline"} size="sm" onClick={() => setUnit(u)} className="capitalize">{u}</Button>
        ))}
      </div>

      <div>
        <Label className="mb-1 block">Weight ({unit === "metric" ? "kg" : "lbs"})</Label>
        <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
      </div>

      <div>
        <Label className="mb-2 block">Activity Level</Label>
        <div className="space-y-1">
          {(Object.entries(ACTIVITY) as [ActivityLevel, { label: string; factor: number }][]).map(([k, { label }]) => (
            <button
              key={k}
              onClick={() => setActivity(k)}
              className={`w-full text-left rounded-md border px-3 py-2 text-sm transition-colors ${activity === k ? "border-primary bg-primary/5 font-medium" : "hover:bg-accent border-border"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Climate</Label>
        <div className="flex gap-2">
          {(Object.entries(CLIMATE) as [Climate, { label: string; addMl: number }][]).map(([k, { label }]) => (
            <Button key={k} variant={climate === k ? "default" : "outline"} size="sm" onClick={() => setClimate(k)}>{label}</Button>
          ))}
        </div>
      </div>

      <Button onClick={calculate} className="w-full">
        <Droplets className="h-4 w-4 mr-2" />Calculate Daily Intake
      </Button>

      {result && (
        <div className="rounded-lg border p-4 space-y-3 text-center">
          <p className="text-4xl font-bold">{(result.ml / 1000).toFixed(1)} L</p>
          <div className="flex justify-center gap-3">
            <Badge variant="secondary">{result.ml} ml</Badge>
            <Badge variant="secondary">{result.cups} cups</Badge>
            <Badge variant="secondary">{result.oz} fl oz</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Based on 35ml/kg baseline adjusted for activity &amp; climate</p>
        </div>
      )}
    </div>
  );
}
