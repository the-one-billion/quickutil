"use client";
/**
 * BMI Calculator Tool
 * Supports metric (kg/cm) and imperial (lb/ft in).
 * Displays WHO classification, color-coded gauge, and health tips.
 * Pure React state — zero dependencies beyond UI components.
 */
import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

// ── BMI classification ─────────────────────────────────────────────────────
interface BMIClass {
  label: string;
  range: string;
  color: string;
  bg:    string;
  tip:   string;
}

const classifications: BMIClass[] = [
  {
    label: "Severely Underweight",
    range: "< 16",
    color: "text-blue-600 dark:text-blue-400",
    bg:    "bg-blue-100 dark:bg-blue-900/30",
    tip:   "Consult a healthcare provider. Nutritional support may be needed.",
  },
  {
    label: "Underweight",
    range: "16–18.4",
    color: "text-sky-600 dark:text-sky-400",
    bg:    "bg-sky-100 dark:bg-sky-900/30",
    tip:   "Consider increasing caloric intake with nutrient-dense foods.",
  },
  {
    label: "Normal weight",
    range: "18.5–24.9",
    color: "text-green-600 dark:text-green-400",
    bg:    "bg-green-100 dark:bg-green-900/30",
    tip:   "Great! Maintain your healthy lifestyle with balanced diet and regular activity.",
  },
  {
    label: "Overweight",
    range: "25–29.9",
    color: "text-amber-600 dark:text-amber-400",
    bg:    "bg-amber-100 dark:bg-amber-900/30",
    tip:   "A moderate reduction in calories and increased activity can help.",
  },
  {
    label: "Obese (Class I)",
    range: "30–34.9",
    color: "text-orange-600 dark:text-orange-400",
    bg:    "bg-orange-100 dark:bg-orange-900/30",
    tip:   "Lifestyle changes and professional guidance are recommended.",
  },
  {
    label: "Obese (Class II)",
    range: "35–39.9",
    color: "text-red-600 dark:text-red-400",
    bg:    "bg-red-100 dark:bg-red-900/30",
    tip:   "Medical evaluation is advised. Consider structured weight management.",
  },
  {
    label: "Obese (Class III)",
    range: "≥ 40",
    color: "text-rose-700 dark:text-rose-400",
    bg:    "bg-rose-100 dark:bg-rose-900/30",
    tip:   "Please seek medical advice. Bariatric support may be beneficial.",
  },
];

function classify(bmi: number): BMIClass {
  if (bmi < 16)   return classifications[0];
  if (bmi < 18.5) return classifications[1];
  if (bmi < 25)   return classifications[2];
  if (bmi < 30)   return classifications[3];
  if (bmi < 35)   return classifications[4];
  if (bmi < 40)   return classifications[5];
  return classifications[6];
}

/** Gauge position: map BMI 10–50 → 0–100% */
function gaugePercent(bmi: number) {
  return Math.min(100, Math.max(0, ((bmi - 10) / 40) * 100));
}

// ── Gauge SVG component ────────────────────────────────────────────────────
function BMIGauge({ bmi }: { bmi: number }) {
  const pct = gaugePercent(bmi);
  // Gauge: 180° arc, needle rotates -90° → +90°
  const angle = -90 + (pct / 100) * 180;
  const rad   = (angle * Math.PI) / 180;
  const cx    = 100;
  const cy    = 100;
  const r     = 80;
  const nx    = cx + r * Math.cos(rad);
  const ny    = cy + r * Math.sin(rad);

  const segments = [
    { pct: 0,    color: "#3b82f6" },  // Severely underweight
    { pct: 15,   color: "#0ea5e9" },  // Underweight
    { pct: 31,   color: "#22c55e" },  // Normal
    { pct: 63,   color: "#f59e0b" },  // Overweight
    { pct: 78,   color: "#f97316" },  // Obese I
    { pct: 90,   color: "#ef4444" },  // Obese II
    { pct: 97,   color: "#e11d48" },  // Obese III
    { pct: 100,  color: "transparent" },
  ];

  function arcPath(startPct: number, endPct: number) {
    const toRad = (p: number) => ((-90 + (p / 100) * 180) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startPct));
    const y1 = cy + r * Math.sin(toRad(startPct));
    const x2 = cx + r * Math.cos(toRad(endPct));
    const y2 = cy + r * Math.sin(toRad(endPct));
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  }

  return (
    <svg viewBox="0 0 200 110" className="w-full max-w-xs mx-auto" aria-hidden="true">
      {/* Background track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="hsl(var(--muted))" strokeWidth="14" strokeLinecap="round"
      />
      {/* Colored segments */}
      {segments.slice(0, -1).map((seg, i) =>
        segments[i + 1].color !== "transparent" ? (
          <path
            key={i}
            d={arcPath(seg.pct, segments[i + 1].pct)}
            fill="none"
            stroke={seg.color}
            strokeWidth="14"
            strokeLinecap="butt"
            opacity="0.85"
          />
        ) : null
      )}
      {/* Needle */}
      <line
        x1={cx} y1={cy}
        x2={nx} y2={ny}
        stroke="hsl(var(--foreground))"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="5" fill="hsl(var(--foreground))" />
      {/* Center label */}
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize="18" fontWeight="bold" fill="hsl(var(--foreground))">
        {bmi.toFixed(1)}
      </text>
      <text x={cx} y={cy + 34} textAnchor="middle" fontSize="6" fill="hsl(var(--muted-foreground))">
        BMI
      </text>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function BMICalculator() {
  // Metric
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");

  // Imperial
  const [weightLb, setWeightLb] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");

  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const bmi = useMemo<number | null>(() => {
    if (unit === "metric") {
      const w = parseFloat(weightKg);
      const h = parseFloat(heightCm) / 100;
      if (!w || !h || h <= 0) return null;
      return w / (h * h);
    } else {
      const lb = parseFloat(weightLb);
      const ft = parseFloat(heightFt) || 0;
      const inc = parseFloat(heightIn) || 0;
      const totalIn = ft * 12 + inc;
      if (!lb || !totalIn) return null;
      return (lb / (totalIn * totalIn)) * 703;
    }
  }, [unit, weightKg, heightCm, weightLb, heightFt, heightIn]);

  const cls = bmi ? classify(bmi) : null;

  const reset = () => {
    setWeightKg(""); setHeightCm("");
    setWeightLb(""); setHeightFt(""); setHeightIn("");
  };

  return (
    <div className="space-y-6">
      {/* ── Unit toggle ─────────────────────────────────────────────────── */}
      <Tabs
        value={unit}
        onValueChange={(v) => { setUnit(v as "metric" | "imperial"); reset(); }}
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="metric"   className="flex-1 sm:flex-none">Metric (kg / cm)</TabsTrigger>
          <TabsTrigger value="imperial" className="flex-1 sm:flex-none">Imperial (lb / ft)</TabsTrigger>
        </TabsList>

        {/* ── Metric inputs ─────────────────────────────────────────────── */}
        <TabsContent value="metric" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="weight-kg">Weight (kg)</Label>
              <Input
                id="weight-kg"
                type="number"
                min="1" max="500"
                placeholder="e.g. 70"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="height-cm">Height (cm)</Label>
              <Input
                id="height-cm"
                type="number"
                min="50" max="300"
                placeholder="e.g. 175"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        {/* ── Imperial inputs ───────────────────────────────────────────── */}
        <TabsContent value="imperial" className="mt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="weight-lb">Weight (lb)</Label>
              <Input
                id="weight-lb"
                type="number"
                min="1" max="1200"
                placeholder="e.g. 154"
                value={weightLb}
                onChange={(e) => setWeightLb(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="height-ft">Height (ft)</Label>
              <Input
                id="height-ft"
                type="number"
                min="1" max="9"
                placeholder="e.g. 5"
                value={heightFt}
                onChange={(e) => setHeightFt(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="height-in">Inches</Label>
              <Input
                id="height-in"
                type="number"
                min="0" max="11"
                placeholder="e.g. 9"
                value={heightIn}
                onChange={(e) => setHeightIn(e.target.value)}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Result ──────────────────────────────────────────────────────── */}
      {bmi && cls && (
        <div className="animate-slide-up space-y-5">
          {/* Gauge */}
          <BMIGauge bmi={bmi} />

          {/* Classification card */}
          <div className={cn("rounded-xl p-5 flex flex-col gap-1", cls.bg)}>
            <div className="flex items-center justify-between">
              <span className={cn("text-xl font-extrabold", cls.color)}>
                {bmi.toFixed(1)}
              </span>
              <span className={cn("text-sm font-semibold px-2.5 py-0.5 rounded-full border", cls.color, "border-current/30")}>
                {cls.label}
              </span>
            </div>
            <p className={cn("text-sm mt-1", cls.color.replace("600", "700").replace("400", "300"))}>
              {cls.tip}
            </p>
          </div>

          {/* Reference table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-3 py-2 font-semibold">Classification</th>
                  <th className="text-right px-3 py-2 font-semibold">BMI Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {classifications.map((c) => (
                  <tr
                    key={c.label}
                    className={cn(
                      "transition-colors",
                      c.label === cls.label ? cn(c.bg, "font-semibold") : "hover:bg-muted/30"
                    )}
                  >
                    <td className={cn("px-3 py-2", c.color)}>{c.label}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{c.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button variant="outline" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      )}

      {!bmi && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Enter your weight and height above to calculate your BMI.
        </p>
      )}

      <p className="text-xs text-muted-foreground border-t border-border pt-4">
        ⚕️ BMI is a screening tool, not a diagnostic measure. Consult a healthcare
        professional for personalized advice.
      </p>
    </div>
  );
}
