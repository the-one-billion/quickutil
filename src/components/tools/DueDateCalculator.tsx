"use client";
/**
 * Due Date Calculator
 * Pregnancy due date from LMP (Naegele's rule, +280 days) or conception date (+266 days).
 * Shows current week, trimester, days remaining, and key milestone table.
 */
import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Helpers ───────────────────────────────────────────────────────────────────
function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Default dates ─────────────────────────────────────────────────────────────
const today = new Date();
today.setHours(0, 0, 0, 0);
// Default LMP: 8 weeks ago → already shows a pregnancy in progress
const defaultLMP = addDays(today, -56);
const defaultConception = addDays(today, -42);

// ── Milestone definitions ─────────────────────────────────────────────────────
const MILESTONES: { week: number; label: string }[] = [
  { week: 8, label: "First ultrasound" },
  { week: 12, label: "End of 1st trimester" },
  { week: 20, label: "Anatomy scan" },
  { week: 24, label: "Viability milestone" },
  { week: 28, label: "Third trimester begins" },
  { week: 37, label: "Full term" },
  { week: 40, label: "Due date" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function DueDateCalculator() {
  const [lmpDate, setLmpDate] = useState(toDateInputValue(defaultLMP));
  const [conceptionDate, setConceptionDate] = useState(
    toDateInputValue(defaultConception)
  );

  const lmpResults = useMemo(() => {
    if (!lmpDate) return null;
    const lmp = new Date(lmpDate + "T00:00:00");
    if (isNaN(lmp.getTime())) return null;
    const dueDate = addDays(lmp, 280);
    const daysSinceLMP = Math.floor(
      (today.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24)
    );
    const currentWeek = Math.max(0, Math.min(40, Math.floor(daysSinceLMP / 7) + 1));
    const daysRemaining = Math.max(0, Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    return { dueDate, currentWeek, daysRemaining, lmp };
  }, [lmpDate]);

  const conceptionResults = useMemo(() => {
    if (!conceptionDate) return null;
    const conception = new Date(conceptionDate + "T00:00:00");
    if (isNaN(conception.getTime())) return null;
    const dueDate = addDays(conception, 266);
    // Conception ≈ 2 weeks after LMP, so total pregnancy from conception POV
    const daysSinceConception = Math.floor(
      (today.getTime() - conception.getTime()) / (1000 * 60 * 60 * 24)
    );
    // Convert to gestational weeks (add 2 weeks for the LMP-to-conception offset)
    const currentWeek = Math.max(0, Math.min(40, Math.floor(daysSinceConception / 7) + 2 + 1));
    const daysRemaining = Math.max(0, Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    return { dueDate, currentWeek, daysRemaining };
  }, [conceptionDate]);

  function getTrimester(week: number): { label: string; color: string } {
    if (week <= 12) return { label: "1st Trimester", color: "text-violet-500 dark:text-violet-400" };
    if (week <= 26) return { label: "2nd Trimester", color: "text-blue-500 dark:text-blue-400" };
    return { label: "3rd Trimester", color: "text-amber-500 dark:text-amber-400" };
  }

  function getMilestoneDate(dueDate: Date, week: number): Date {
    // Due date is week 40; each week is 7 days before
    return addDays(dueDate, -(40 - week) * 7);
  }

  function isMilestonePast(milestoneDate: Date): boolean {
    return milestoneDate < today;
  }

  function renderResults(
    res: { dueDate: Date; currentWeek: number; daysRemaining: number } | null
  ) {
    if (!res) {
      return (
        <div className="rounded-xl border border-border bg-muted/30 px-5 py-8 text-center text-sm text-muted-foreground">
          Enter a date above to see results.
        </div>
      );
    }

    const { dueDate, currentWeek, daysRemaining } = res;
    const trimester = getTrimester(currentWeek);
    const progressPct = Math.min(100, Math.round((currentWeek / 40) * 100));

    return (
      <div className="space-y-4">
        {/* Due date hero */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="bg-primary/10 px-5 py-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Estimated Due Date
            </p>
            <p className="text-2xl font-extrabold text-foreground">
              {formatDate(dueDate)}
            </p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
            <div className="flex flex-col items-center gap-0.5 px-3 py-4">
              <span className="text-2xl font-extrabold text-foreground">
                {currentWeek}
              </span>
              <span className="text-xs text-muted-foreground">Week</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 px-3 py-4">
              <span className={`text-sm font-bold ${trimester.color}`}>
                {trimester.label}
              </span>
              <span className="text-xs text-muted-foreground">Trimester</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 px-3 py-4">
              <span className="text-2xl font-extrabold text-foreground">
                {daysRemaining}
              </span>
              <span className="text-xs text-muted-foreground">Days left</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Week 1</span>
            <span className="font-medium text-foreground">
              {progressPct}% complete
            </span>
            <span>Week 40</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Milestones table */}
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="bg-muted/50 px-5 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Key Milestones
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 text-left">Week</th>
                <th className="px-4 py-3 text-left">Milestone</th>
                <th className="px-4 py-3 text-right">Date</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MILESTONES.map(({ week, label }) => {
                const milestoneDate =
                  week === 40 ? dueDate : getMilestoneDate(dueDate, week);
                const past = isMilestonePast(milestoneDate);
                const nextMilestone = MILESTONES[MILESTONES.findIndex((m) => m.week === week) + 1];
                const isCurrent =
                  currentWeek >= week &&
                  (week === 40
                    ? true
                    : currentWeek < (nextMilestone?.week ?? 40));

                return (
                  <tr
                    key={week}
                    className={`transition-colors ${
                      past ? "bg-muted/20" : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {week === 40 ? "Due" : `Wk ${week}`}
                    </td>
                    <td className="px-4 py-3 text-foreground">{label}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {formatDateShort(milestoneDate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {past ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          ✓ Past
                        </span>
                      ) : isCurrent && currentWeek < 40 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Now
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Upcoming
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Due Date Calculator</h1>
        <p className="text-sm text-muted-foreground">
          Calculate your estimated due date from your last period or conception date.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="lmp">
        <TabsList className="w-full">
          <TabsTrigger value="lmp" className="flex-1">
            Last Menstrual Period
          </TabsTrigger>
          <TabsTrigger value="conception" className="flex-1">
            Conception Date
          </TabsTrigger>
        </TabsList>

        {/* LMP tab */}
        <TabsContent value="lmp" className="mt-5 space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="lmp-date">First Day of Last Menstrual Period</Label>
            <Input
              id="lmp-date"
              type="date"
              value={lmpDate}
              onChange={(e) => setLmpDate(e.target.value)}
              max={toDateInputValue(today)}
            />
            <p className="text-xs text-muted-foreground">
              Due date calculated using Naegele&apos;s rule: LMP + 280 days (40 weeks).
            </p>
          </div>
          {renderResults(lmpResults)}
        </TabsContent>

        {/* Conception tab */}
        <TabsContent value="conception" className="mt-5 space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="conception-date">Known Conception Date</Label>
            <Input
              id="conception-date"
              type="date"
              value={conceptionDate}
              onChange={(e) => setConceptionDate(e.target.value)}
              max={toDateInputValue(today)}
            />
            <p className="text-xs text-muted-foreground">
              Due date calculated as conception date + 266 days (38 weeks).
            </p>
          </div>
          {renderResults(conceptionResults)}
        </TabsContent>
      </Tabs>

      <p className="border-t border-border pt-4 text-xs text-muted-foreground">
        Due dates are estimates. Only about 5% of babies are born on their exact due date.
        Always consult your healthcare provider for personalized guidance.
      </p>
    </div>
  );
}
