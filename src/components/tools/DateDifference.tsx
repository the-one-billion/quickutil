"use client";
/**
 * Date Difference Calculator
 * Computes the difference between two dates in multiple units.
 * Quick presets, swap button, and countdown mode.
 */
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ── Helpers ───────────────────────────────────────────────────────────────────
function toInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseInput(val: string): Date | null {
  if (!val) return null;
  const d = new Date(val + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

function dayName(date: Date): string {
  return DAY_NAMES[date.getDay()];
}

/** Count working days (Mon–Fri) between two dates, inclusive of start, exclusive of end */
function countWorkingDays(start: Date, end: Date): number {
  const from = start < end ? start : end;
  const to = start < end ? end : start;
  let count = 0;
  const cur = new Date(from);
  while (cur < to) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

/** Calculate years/months/days between two dates correctly */
function calcYMD(
  from: Date,
  to: Date
): { years: number; months: number; days: number } {
  const earlier = from <= to ? from : to;
  const later = from <= to ? to : from;

  let years = later.getFullYear() - earlier.getFullYear();
  let months = later.getMonth() - earlier.getMonth();
  let days = later.getDate() - earlier.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(later.getFullYear(), later.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

// ── Defaults ──────────────────────────────────────────────────────────────────
const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);
const thirtyDaysLater = new Date(todayDate);
thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

// ── Component ─────────────────────────────────────────────────────────────────
export default function DateDifference() {
  const [startVal, setStartVal] = useState(toInputValue(todayDate));
  const [endVal, setEndVal] = useState(toInputValue(thirtyDaysLater));

  const startDate = useMemo(() => parseInput(startVal), [startVal]);
  const endDate = useMemo(() => parseInput(endVal), [endVal]);

  const results = useMemo(() => {
    if (!startDate || !endDate) return null;

    const totalMs = Math.abs(endDate.getTime() - startDate.getTime());
    const totalDays = Math.round(totalMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const workingDays = countWorkingDays(startDate, endDate);
    const { years, months, days } = calcYMD(startDate, endDate);

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const daysFromNow =
      endDate > now
        ? Math.round((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

    return {
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes,
      workingDays,
      years,
      months,
      days,
      isForward: endDate >= startDate,
      daysFromNow,
      startDayName: dayName(startDate),
      endDayName: dayName(endDate),
    };
  }, [startDate, endDate]);

  const swap = useCallback(() => {
    setStartVal((s) => {
      setEndVal(s);
      return endVal;
    });
  }, [endVal]);

  // ── Presets ───────────────────────────────────────────────────────────────
  const applyPreset = useCallback((preset: "endofyear" | "nextmonth" | "startofyear") => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (preset === "endofyear") {
      setStartVal(toInputValue(today));
      const endOfYear = new Date(today.getFullYear(), 11, 31);
      setEndVal(toInputValue(endOfYear));
    } else if (preset === "nextmonth") {
      setStartVal(toInputValue(today));
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setEndVal(toInputValue(nextMonth));
    } else if (preset === "startofyear") {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      setStartVal(toInputValue(startOfYear));
      setEndVal(toInputValue(today));
    }
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Date Difference</h1>
        <p className="text-sm text-muted-foreground">
          Calculate the exact difference between two dates in days, weeks, months, and more.
        </p>
      </div>

      {/* Date inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="dd-start">Start Date</Label>
          <Input
            id="dd-start"
            type="date"
            value={startVal}
            onChange={(e) => setStartVal(e.target.value)}
          />
          {startDate && (
            <p className="text-xs text-muted-foreground">{dayName(startDate)}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dd-end">End Date</Label>
          <Input
            id="dd-end"
            type="date"
            value={endVal}
            onChange={(e) => setEndVal(e.target.value)}
          />
          {endDate && (
            <p className="text-xs text-muted-foreground">{dayName(endDate)}</p>
          )}
        </div>
      </div>

      {/* Actions row */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={swap}>
          ⇄ Swap Dates
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => applyPreset("endofyear")}
        >
          Today → End of Year
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => applyPreset("nextmonth")}
        >
          Today → Next Month
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => applyPreset("startofyear")}
        >
          Start of Year → Today
        </Button>
      </div>

      {/* Results */}
      {results ? (
        <div className="space-y-4">
          {/* Countdown banner */}
          {results.daysFromNow !== null && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 px-5 py-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">Countdown</p>
              <p className="text-2xl font-extrabold text-primary">
                {results.daysFromNow} days from today
              </p>
            </div>
          )}

          {/* Total days — hero */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="bg-primary/10 px-5 py-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Total Difference
              </p>
              <p className="text-5xl font-extrabold tracking-tight text-foreground">
                {results.totalDays.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">days</p>
            </div>

            {/* Broken-down YMD */}
            <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
              <div className="flex flex-col items-center gap-0.5 px-3 py-4">
                <span className="text-2xl font-bold text-foreground">
                  {results.years}
                </span>
                <span className="text-xs text-muted-foreground">
                  {results.years === 1 ? "year" : "years"}
                </span>
              </div>
              <div className="flex flex-col items-center gap-0.5 px-3 py-4">
                <span className="text-2xl font-bold text-foreground">
                  {results.months}
                </span>
                <span className="text-xs text-muted-foreground">
                  {results.months === 1 ? "month" : "months"}
                </span>
              </div>
              <div className="flex flex-col items-center gap-0.5 px-3 py-4">
                <span className="text-2xl font-bold text-foreground">
                  {results.days}
                </span>
                <span className="text-xs text-muted-foreground">
                  {results.days === 1 ? "day" : "days"}
                </span>
              </div>
            </div>
          </div>

          {/* More units */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="bg-muted/50 px-5 py-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Also expressed as
              </span>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-foreground">Total Weeks</span>
                <span className="text-sm font-semibold text-foreground">
                  {results.totalWeeks.toLocaleString()} weeks
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-foreground">Total Hours</span>
                <span className="text-sm font-semibold text-foreground">
                  {results.totalHours.toLocaleString()} hours
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-foreground">Total Minutes</span>
                <span className="text-sm font-semibold text-foreground">
                  {results.totalMinutes.toLocaleString()} minutes
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-foreground">Working Days</span>
                <span className="text-sm font-semibold text-foreground">
                  {results.workingDays.toLocaleString()} working days
                </span>
              </div>
            </div>
          </div>

          {/* Day names */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="bg-muted/50 px-5 py-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Day of the Week
              </span>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-muted-foreground">Start date falls on</span>
                <span className="text-sm font-semibold text-foreground">
                  {results.startDayName}
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-muted-foreground">End date falls on</span>
                <span className="text-sm font-semibold text-foreground">
                  {results.endDayName}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-muted/30 px-5 py-8 text-center text-sm text-muted-foreground">
          Select both dates above to see the difference.
        </div>
      )}

      <p className="border-t border-border pt-4 text-xs text-muted-foreground">
        Working days exclude Saturdays and Sundays. Public holidays are not accounted for.
      </p>
    </div>
  );
}
