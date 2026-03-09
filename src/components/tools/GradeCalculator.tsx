"use client";
/**
 * Grade Calculator
 * Tab 1 – GPA Calculator: courses with letter grades and credit hours → weighted GPA.
 * Tab 2 – Final Grade: current grade + final weight → needed score for A/B/C/D targets.
 */
import { useState, useMemo, useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ── GPA scale ─────────────────────────────────────────────────────────────────

const GPA_MAP: Record<string, number> = {
  "A+": 4.0,
  "A":  4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B":  3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C":  2.0,
  "C-": 1.7,
  "D+": 1.3,
  "D":  1.0,
  "D-": 0.7,
  "F":  0.0,
};

const LETTER_GRADES = [
  "A+", "A", "A-",
  "B+", "B", "B-",
  "C+", "C", "C-",
  "D+", "D", "D-",
  "F",
] as const;

// ── Unique ID helper ───────────────────────────────────────────────────────────

let _uid = 0;
function nextId(): string {
  return String(++_uid);
}

// ── GPA Calculator Tab ────────────────────────────────────────────────────────

interface GPARow {
  id: string;
  course: string;
  grade: string;
  credits: string;
}

function defaultGPARows(): GPARow[] {
  return [
    { id: nextId(), course: "Calculus",      grade: "A",  credits: "4" },
    { id: nextId(), course: "English Comp",  grade: "B+", credits: "3" },
    { id: nextId(), course: "Physics",       grade: "A-", credits: "4" },
    { id: nextId(), course: "History",       grade: "B",  credits: "3" },
  ];
}

function GPATab() {
  const [rows, setRows] = useState<GPARow[]>(defaultGPARows);

  function addRow() {
    setRows((prev) => [
      ...prev,
      { id: nextId(), course: "", grade: "A", credits: "3" },
    ]);
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function updateRow(id: string, field: keyof GPARow, value: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  const result = useMemo(() => {
    let qualityPoints = 0;
    let totalCredits = 0;

    for (const row of rows) {
      const credits = parseFloat(row.credits);
      const gpa = GPA_MAP[row.grade] ?? 0;
      if (!isNaN(credits) && credits > 0) {
        qualityPoints += gpa * credits;
        totalCredits += credits;
      }
    }

    if (totalCredits === 0) return null;
    return { gpa: qualityPoints / totalCredits, totalCredits };
  }, [rows]);

  const gpaColorClass = (gpa: number) => {
    if (gpa >= 3.5) return "text-green-600 dark:text-green-400";
    if (gpa >= 2.5) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-500 dark:text-red-400";
  };

  const gpaBadgeClass = (gpa: number) => {
    if (gpa >= 3.5)
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
    if (gpa >= 2.5)
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
    return "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400";
  };

  const gpaBadgeLabel = (gpa: number) => {
    if (gpa >= 3.5) return "Excellent";
    if (gpa >= 2.5) return "Satisfactory";
    return "At Risk";
  };

  return (
    <div className="space-y-5">
      {/* Course table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 text-left">Course Name</th>
              <th className="px-4 py-3 text-center w-36">Letter Grade</th>
              <th className="px-4 py-3 text-right w-28">Credit Hours</th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="group">
                <td className="px-4 py-2">
                  <Input
                    aria-label="Course name"
                    value={row.course}
                    onChange={(e) => updateRow(row.id, "course", e.target.value)}
                    placeholder="e.g. Calculus"
                    className="h-8 border-transparent bg-transparent px-0 shadow-none focus:border-input focus:bg-background focus:px-3"
                  />
                </td>
                <td className="px-4 py-2">
                  <Select
                    value={row.grade}
                    onValueChange={(v) => updateRow(row.id, "grade", v)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LETTER_GRADES.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                          <span className="ml-2 text-muted-foreground text-xs">
                            ({GPA_MAP[g].toFixed(1)})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-2">
                  <Input
                    aria-label="Credit hours"
                    type="number"
                    min="1"
                    max="4"
                    step="1"
                    value={row.credits}
                    onChange={(e) => updateRow(row.id, "credits", e.target.value)}
                    className="h-8 text-right"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    type="button"
                    aria-label="Remove course"
                    onClick={() => removeRow(row.id)}
                    className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addRow} className="flex-1">
          + Add Course
        </Button>
        {rows.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRows([])}
            className="text-muted-foreground hover:text-destructive"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Result */}
      {result ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="bg-muted/50 px-5 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              GPA Summary
            </span>
          </div>
          <div className="flex items-center gap-6 px-5 py-5 flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Weighted GPA</p>
              <p className={`text-4xl font-extrabold ${gpaColorClass(result.gpa)}`}>
                {result.gpa.toFixed(2)}
                <span className="text-lg text-muted-foreground ml-1">/ 4.0</span>
              </p>
            </div>
            <div className="h-14 w-px bg-border" />
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Total Credits</p>
              <p className="text-4xl font-extrabold text-foreground">
                {result.totalCredits}
              </p>
            </div>
            <div className="ml-auto">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${gpaBadgeClass(result.gpa)}`}
              >
                {gpaBadgeLabel(result.gpa)}
              </span>
            </div>
          </div>
          <div className="border-t border-border px-5 py-3 flex flex-wrap gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
              ≥ 3.5 — Excellent
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-yellow-500 inline-block" />
              ≥ 2.5 — Satisfactory
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
              &lt; 2.5 — At Risk
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Add courses with letter grades and credit hours to calculate your GPA.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Final Grade Tab ───────────────────────────────────────────────────────────

const FINAL_TARGETS = [
  { label: "A", target: 90 },
  { label: "B", target: 80 },
  { label: "C", target: 70 },
  { label: "D", target: 60 },
];

function FinalGradeTab() {
  const uid = useId();
  const [currentGrade, setCurrentGrade] = useState("82");
  const [finalWeight, setFinalWeight] = useState("25");

  const results = useMemo(() => {
    const current = parseFloat(currentGrade);
    const weight = parseFloat(finalWeight);

    if (isNaN(current) || isNaN(weight) || weight <= 0 || weight >= 100) {
      return null;
    }

    // Formula: needed = (target - current * (1 - weight/100)) / (weight/100)
    const nonFinalWeight = 1 - weight / 100;

    return FINAL_TARGETS.map(({ label, target }) => {
      const needed = (target - current * nonFinalWeight) / (weight / 100);
      return { label, target, needed };
    });
  }, [currentGrade, finalWeight]);

  const neededColorClass = (score: number) => {
    if (score <= 0) return "text-green-600 dark:text-green-400";
    if (score <= 70) return "text-green-600 dark:text-green-400";
    if (score <= 90) return "text-yellow-600 dark:text-yellow-400";
    if (score <= 100) return "text-orange-500 dark:text-orange-400";
    return "text-red-500 dark:text-red-400";
  };

  const neededLabel = (score: number) => {
    if (score <= 0) return "Already achieved";
    if (score > 100) return `${score.toFixed(1)}% (not achievable)`;
    return `${score.toFixed(1)}%`;
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Current Standing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${uid}-current`}>Current Grade (%)</Label>
            <Input
              id={`${uid}-current`}
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="e.g. 82"
              value={currentGrade}
              onChange={(e) => setCurrentGrade(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your grade before the final exam
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${uid}-weight`}>Final Exam Weight (%)</Label>
            <Input
              id={`${uid}-weight`}
              type="number"
              min="1"
              max="99"
              step="1"
              placeholder="e.g. 25"
              value={finalWeight}
              onChange={(e) => setFinalWeight(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              How much the final counts toward your grade
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Results table */}
      {results ? (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 text-left">Target Grade</th>
                <th className="px-4 py-3 text-center">Minimum %</th>
                <th className="px-4 py-3 text-right">Score Needed on Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.map(({ label, target, needed }) => (
                <tr key={label} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-base font-bold text-foreground">{label}</span>
                      <span className="text-muted-foreground">({target}%+)</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {target}%
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${neededColorClass(needed)}`}>
                    {neededLabel(needed)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Enter your current grade and the final exam weight to see what you need.
          </p>
        </div>
      )}

      {/* Formula */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground font-medium">
              Formula Used
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-mono text-sm bg-muted/50 rounded-lg px-4 py-3 text-foreground">
              needed = (target − current × (1 − w)) ÷ w
            </p>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p><span className="font-medium text-foreground">target</span> — desired final course grade (%)</p>
              <p><span className="font-medium text-foreground">current</span> — your current grade before the final (%)</p>
              <p><span className="font-medium text-foreground">w</span> — final exam weight as a decimal (e.g. 25% → 0.25)</p>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              With your inputs: current = <strong>{currentGrade}%</strong>, final weight = <strong>{finalWeight}%</strong>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Root component ─────────────────────────────────────────────────────────────

export default function GradeCalculator() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Grade Calculator</h1>
        <p className="text-sm text-muted-foreground">
          Calculate your weighted GPA or find out what score you need on your final exam.
        </p>
      </div>

      <Tabs defaultValue="gpa">
        <TabsList className="w-full">
          <TabsTrigger value="gpa" className="flex-1">
            GPA Calculator
          </TabsTrigger>
          <TabsTrigger value="final" className="flex-1">
            Final Grade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gpa" className="mt-5">
          <GPATab />
        </TabsContent>

        <TabsContent value="final" className="mt-5">
          <FinalGradeTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
