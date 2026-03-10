"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Gender = "male" | "female";
type Activity = "sedentary" | "light" | "moderate" | "active" | "very_active";
type Goal = "lose" | "maintain" | "gain";
type Unit = "metric" | "imperial";

const ACTIVITY_MUL: Record<Activity, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
};
const GOAL_ADJUST: Record<Goal, number> = { lose: -500, maintain: 0, gain: 300 };

export default function MacroCalculator() {
  const [gender, setGender]     = useState<Gender>("male");
  const [unit, setUnit]         = useState<Unit>("metric");
  const [age, setAge]           = useState("30");
  const [weight, setWeight]     = useState("80");
  const [height, setHeight]     = useState("175");
  const [activity, setActivity] = useState<Activity>("moderate");
  const [goal, setGoal]         = useState<Goal>("maintain");
  const [result, setResult]     = useState<{
    tdee: number; calories: number; protein: number; carbs: number; fat: number;
  } | null>(null);

  const calculate = () => {
    const wKg = unit === "metric" ? Number(weight) : Number(weight) * 0.453592;
    const hCm = unit === "metric" ? Number(height) : Number(height) * 2.54;
    const a = Number(age);
    // Mifflin-St Jeor
    const bmr = gender === "male"
      ? 10*wKg + 6.25*hCm - 5*a + 5
      : 10*wKg + 6.25*hCm - 5*a - 161;
    const tdee = bmr * ACTIVITY_MUL[activity];
    const calories = tdee + GOAL_ADJUST[goal];
    // Macros: protein 30%, carbs 40%, fat 30%
    const protein = Math.round((calories * 0.30) / 4);
    const carbs   = Math.round((calories * 0.40) / 4);
    const fat     = Math.round((calories * 0.30) / 9);
    setResult({ tdee: Math.round(tdee), calories: Math.round(calories), protein, carbs, fat });
  };

  return (
    <div className="space-y-4 max-w-sm">
      <div className="flex gap-2 flex-wrap">
        {(["male","female"] as Gender[]).map(g => (
          <Button key={g} variant={gender===g?"default":"outline"} size="sm" onClick={() => setGender(g)} className="capitalize">{g}</Button>
        ))}
        <div className="ml-auto flex gap-2">
          {(["metric","imperial"] as Unit[]).map(u => (
            <Button key={u} variant={unit===u?"default":"outline"} size="sm" onClick={() => setUnit(u)} className="capitalize">{u}</Button>
          ))}
        </div>
      </div>
      {[
        { label: "Age", val: age, set: setAge },
        { label: `Weight (${unit==="metric"?"kg":"lbs"})`, val: weight, set: setWeight },
        { label: `Height (${unit==="metric"?"cm":"inches"})`, val: height, set: setHeight },
      ].map(({ label, val, set }) => (
        <div key={label}>
          <Label className="mb-1 block">{label}</Label>
          <Input type="number" value={val} onChange={e => set(e.target.value)} />
        </div>
      ))}
      <div>
        <Label className="mb-2 block">Activity Level</Label>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(ACTIVITY_MUL) as Activity[]).map(a => (
            <button key={a} onClick={() => setActivity(a)}
              className={`rounded-full border px-2.5 py-1 text-xs capitalize transition-colors ${activity===a ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}>
              {a.replace("_"," ")}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="mb-2 block">Goal</Label>
        <div className="flex gap-2">
          {(["lose","maintain","gain"] as Goal[]).map(g => (
            <Button key={g} variant={goal===g?"default":"outline"} size="sm" onClick={() => setGoal(g)} className="capitalize flex-1">{g === "lose" ? "Lose Fat" : g === "gain" ? "Build Muscle" : "Maintain"}</Button>
          ))}
        </div>
      </div>
      <Button onClick={calculate} className="w-full">Calculate Macros</Button>
      {result && (
        <div className="space-y-3">
          <div className="flex justify-between rounded-lg border px-4 py-3">
            <span className="text-muted-foreground">TDEE (maintenance)</span>
            <span className="font-semibold">{result.tdee} kcal</span>
          </div>
          <div className="flex justify-between rounded-lg border border-primary px-4 py-3 bg-primary/5">
            <span className="font-semibold">Target Calories</span>
            <span className="font-bold text-lg">{result.calories} kcal</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Protein", g: result.protein, color: "text-blue-600 dark:text-blue-400" },
              { label: "Carbs",   g: result.carbs,   color: "text-amber-600 dark:text-amber-400" },
              { label: "Fat",     g: result.fat,     color: "text-red-500 dark:text-red-400" },
            ].map(({ label, g, color }) => (
              <div key={label} className="rounded-lg border p-3">
                <p className={`text-2xl font-bold ${color}`}>{g}g</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
