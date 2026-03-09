"use client";
/**
 * Calorie Calculator
 * BMR via Mifflin-St Jeor, TDEE, goal-based calorie targets, and macro splits.
 */
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Types ─────────────────────────────────────────────────────────────────────
type Gender = "male" | "female";
type ActivityLevel = "sedentary" | "light" | "moderate" | "very" | "extreme";
type Goal = "lose" | "maintain" | "gain";
type HeightUnit = "cm" | "ftin";
type WeightUnit = "kg" | "lbs";

interface MacroSplit {
  protein: number; // percentage
  carbs: number;
  fat: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extreme: 1.9,
};

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (little/no exercise)",
  light: "Lightly Active (1-3 days/week)",
  moderate: "Moderately Active (3-5 days/week)",
  very: "Very Active (6-7 days/week)",
  extreme: "Extremely Active (athlete/physical job)",
};

const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

const GOAL_MACROS: Record<Goal, MacroSplit> = {
  lose: { protein: 30, carbs: 40, fat: 30 },
  maintain: { protein: 30, carbs: 45, fat: 25 },
  gain: { protein: 35, carbs: 40, fat: 25 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function round(n: number): number {
  return Math.round(n);
}

function calcBMR(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number
): number {
  // Mifflin-St Jeor
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CalorieCalculator() {
  const [age, setAge] = useState("25");
  const [gender, setGender] = useState<Gender>("male");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [heightCm, setHeightCm] = useState("175");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("9");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [weight, setWeight] = useState("70");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const ageNum = parseInt(age, 10);
    const weightNum = parseFloat(weight);

    if (isNaN(ageNum) || isNaN(weightNum) || ageNum <= 0 || weightNum <= 0) {
      return null;
    }

    const weightKg =
      weightUnit === "kg" ? weightNum : lbsToKg(weightNum);

    let heightCmNum: number;
    if (heightUnit === "cm") {
      heightCmNum = parseFloat(heightCm);
      if (isNaN(heightCmNum) || heightCmNum <= 0) return null;
    } else {
      const ft = parseFloat(heightFt);
      const inches = parseFloat(heightIn);
      if (isNaN(ft) || isNaN(inches)) return null;
      heightCmNum = feetInchesToCm(ft, inches);
    }

    const bmr = calcBMR(gender, weightKg, heightCmNum, ageNum);
    const tdee = bmr * ACTIVITY_MULTIPLIERS[activity];
    const targetCalories = tdee + GOAL_ADJUSTMENTS[goal];
    const macros = GOAL_MACROS[goal];

    // Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
    const proteinG = round((targetCalories * (macros.protein / 100)) / 4);
    const carbsG = round((targetCalories * (macros.carbs / 100)) / 4);
    const fatG = round((targetCalories * (macros.fat / 100)) / 9);

    return {
      bmr: round(bmr),
      tdee: round(tdee),
      targetCalories: round(targetCalories),
      proteinG,
      carbsG,
      fatG,
      macros,
    };
  }, [age, gender, heightUnit, heightCm, heightFt, heightIn, weightUnit, weight, activity, goal]);

  const copyResults = useCallback(async () => {
    if (!results) return;
    const text = [
      `BMR: ${results.bmr} kcal/day`,
      `TDEE: ${results.tdee} kcal/day`,
      `Target Calories: ${results.targetCalories} kcal/day`,
      `Protein: ${results.proteinG}g | Carbs: ${results.carbsG}g | Fat: ${results.fatG}g`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [results]);

  const goalLabel: Record<Goal, string> = {
    lose: "Lose Weight (−500 kcal deficit)",
    maintain: "Maintain Weight",
    gain: "Gain Muscle (+300 kcal surplus)",
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Calorie Calculator</h1>
        <p className="text-sm text-muted-foreground">
          Estimate your daily calorie needs using the Mifflin-St Jeor formula. Results update live.
        </p>
      </div>

      {/* Inputs grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Age */}
        <div className="space-y-1.5">
          <Label htmlFor="cc-age">Age</Label>
          <Input
            id="cc-age"
            type="number"
            min="10"
            max="120"
            placeholder="25"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <Label>Gender</Label>
          <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Height */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>Height</Label>
            <div className="flex rounded-md border border-border overflow-hidden text-xs">
              <button
                className={`px-2.5 py-1 transition-colors ${
                  heightUnit === "cm"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setHeightUnit("cm")}
              >
                cm
              </button>
              <button
                className={`px-2.5 py-1 transition-colors ${
                  heightUnit === "ftin"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setHeightUnit("ftin")}
              >
                ft/in
              </button>
            </div>
          </div>
          {heightUnit === "cm" ? (
            <div className="relative flex items-center">
              <Input
                type="number"
                min="50"
                max="280"
                placeholder="175"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="pr-10"
              />
              <span className="pointer-events-none absolute right-3 text-sm text-muted-foreground">
                cm
              </span>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="number"
                  min="0"
                  max="9"
                  placeholder="5"
                  value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value)}
                  className="pr-7"
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ft
                </span>
              </div>
              <div className="relative flex-1">
                <Input
                  type="number"
                  min="0"
                  max="11"
                  placeholder="9"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                  className="pr-7"
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  in
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Weight */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>Weight</Label>
            <div className="flex rounded-md border border-border overflow-hidden text-xs">
              <button
                className={`px-2.5 py-1 transition-colors ${
                  weightUnit === "kg"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setWeightUnit("kg")}
              >
                kg
              </button>
              <button
                className={`px-2.5 py-1 transition-colors ${
                  weightUnit === "lbs"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setWeightUnit("lbs")}
              >
                lbs
              </button>
            </div>
          </div>
          <div className="relative flex items-center">
            <Input
              type="number"
              min="10"
              max="500"
              placeholder={weightUnit === "kg" ? "70" : "154"}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="pr-12"
            />
            <span className="pointer-events-none absolute right-3 text-sm text-muted-foreground">
              {weightUnit}
            </span>
          </div>
        </div>

        {/* Activity level */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Activity Level</Label>
          <Select
            value={activity}
            onValueChange={(v) => setActivity(v as ActivityLevel)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {ACTIVITY_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Goal */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Goal</Label>
          <Select value={goal} onValueChange={(v) => setGoal(v as Goal)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lose">{goalLabel.lose}</SelectItem>
              <SelectItem value="maintain">{goalLabel.maintain}</SelectItem>
              <SelectItem value="gain">{goalLabel.gain}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {results ? (
        <div className="space-y-4">
          {/* Main calorie results */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="bg-muted/50 px-5 py-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Results
              </span>
              <Button variant="outline" size="sm" onClick={copyResults}>
                {copied ? "Copied!" : "Copy Results"}
              </Button>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">BMR</p>
                  <p className="text-xs text-muted-foreground">Basal Metabolic Rate</p>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {results.bmr.toLocaleString()}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">kcal/day</span>
                </p>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">TDEE</p>
                  <p className="text-xs text-muted-foreground">Total Daily Energy Expenditure</p>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {results.tdee.toLocaleString()}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">kcal/day</span>
                </p>
              </div>
              <div className="flex items-center justify-between px-5 py-4 bg-primary/5">
                <div>
                  <p className="text-base font-semibold text-foreground">Target Calories</p>
                  <p className="text-xs text-muted-foreground">{goalLabel[goal]}</p>
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-primary">
                  {results.targetCalories.toLocaleString()}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">kcal/day</span>
                </p>
              </div>
            </div>
          </div>

          {/* Macro split card */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="bg-muted/50 px-5 py-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Daily Macro Split ({results.macros.protein}/{results.macros.carbs}/{results.macros.fat}%)
              </span>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border">
              <div className="flex flex-col items-center gap-1 px-4 py-5">
                <span className="text-2xl font-extrabold text-blue-500 dark:text-blue-400">
                  {results.proteinG}g
                </span>
                <span className="text-xs font-semibold text-foreground">Protein</span>
                <span className="text-xs text-muted-foreground">{results.macros.protein}%</span>
              </div>
              <div className="flex flex-col items-center gap-1 px-4 py-5">
                <span className="text-2xl font-extrabold text-amber-500 dark:text-amber-400">
                  {results.carbsG}g
                </span>
                <span className="text-xs font-semibold text-foreground">Carbs</span>
                <span className="text-xs text-muted-foreground">{results.macros.carbs}%</span>
              </div>
              <div className="flex flex-col items-center gap-1 px-4 py-5">
                <span className="text-2xl font-extrabold text-rose-500 dark:text-rose-400">
                  {results.fatG}g
                </span>
                <span className="text-xs font-semibold text-foreground">Fat</span>
                <span className="text-xs text-muted-foreground">{results.macros.fat}%</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-muted/30 px-5 py-8 text-center text-sm text-muted-foreground">
          Fill in all fields above to see your results.
        </div>
      )}

      <p className="border-t border-border pt-4 text-xs text-muted-foreground">
        Results use the Mifflin-St Jeor equation, widely considered the most accurate BMR formula
        for the general population. Consult a healthcare professional before making significant
        dietary changes.
      </p>
    </div>
  );
}
