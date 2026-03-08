"use client";
/**
 * Age Calculator
 * Computes exact age breakdown, total days/weeks/hours/minutes,
 * next birthday countdown, day of week born, and zodiac sign.
 * All results update reactively — no submit button needed.
 */
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ── Zodiac helper ─────────────────────────────────────────────────────────
interface ZodiacSign {
  name:   string;
  symbol: string;
  emoji:  string;
}

function getZodiac(month: number, day: number): ZodiacSign {
  // month is 1-based
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19))
    return { name: "Aries",       symbol: "♈", emoji: "🐏" };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20))
    return { name: "Taurus",      symbol: "♉", emoji: "🐂" };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20))
    return { name: "Gemini",      symbol: "♊", emoji: "👯" };
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22))
    return { name: "Cancer",      symbol: "♋", emoji: "🦀" };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22))
    return { name: "Leo",         symbol: "♌", emoji: "🦁" };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22))
    return { name: "Virgo",       symbol: "♍", emoji: "👧" };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22))
    return { name: "Libra",       symbol: "♎", emoji: "⚖️" };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
    return { name: "Scorpio",     symbol: "♏", emoji: "🦂" };
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
    return { name: "Sagittarius", symbol: "♐", emoji: "🏹" };
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
    return { name: "Capricorn",   symbol: "♑", emoji: "🐐" };
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
    return { name: "Aquarius",    symbol: "♒", emoji: "🏺" };
  return { name: "Pisces",        symbol: "♓", emoji: "🐟" };
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function addCommas(n: number): string {
  return n.toLocaleString("en-US");
}

// ── Result ────────────────────────────────────────────────────────────────
interface AgeResult {
  years:         number;
  months:        number;
  days:          number;
  totalDays:     number;
  totalWeeks:    number;
  totalHours:    number;
  totalMinutes:  number;
  nextBirthday:  number; // days until
  dayBorn:       string;
  zodiac:        ZodiacSign;
  isBirthdayToday: boolean;
}

function computeAge(dob: Date, asOf: Date): AgeResult {
  // Exact years / months / days
  let years  = asOf.getFullYear() - dob.getFullYear();
  let months = asOf.getMonth()    - dob.getMonth();
  let days   = asOf.getDate()     - dob.getDate();

  if (days < 0) {
    months -= 1;
    // days in the previous month relative to asOf
    const prevMonth = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years  -= 1;
    months += 12;
  }

  // Total counts (from midnight to midnight)
  const msPerDay    = 1000 * 60 * 60 * 24;
  const dobMidnight = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate());
  const asOfMidnight = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate());
  const totalDays   = Math.floor((asOfMidnight.getTime() - dobMidnight.getTime()) / msPerDay);
  const totalWeeks  = Math.floor(totalDays / 7);
  const totalHours  = totalDays * 24;
  const totalMinutes = totalHours * 60;

  // Next birthday
  const thisYear = asOf.getFullYear();
  let nextBD     = new Date(thisYear, dob.getMonth(), dob.getDate());
  if (nextBD <= asOfMidnight) {
    nextBD = new Date(thisYear + 1, dob.getMonth(), dob.getDate());
  }
  const nextBirthday = Math.round((nextBD.getTime() - asOfMidnight.getTime()) / msPerDay);
  const isBirthdayToday =
    dob.getMonth() === asOf.getMonth() && dob.getDate() === asOf.getDate();

  const dayBorn = DAYS_OF_WEEK[dob.getDay()];
  const zodiac  = getZodiac(dob.getMonth() + 1, dob.getDate());

  return {
    years, months, days,
    totalDays, totalWeeks, totalHours, totalMinutes,
    nextBirthday: isBirthdayToday ? 0 : nextBirthday,
    dayBorn, zodiac, isBirthdayToday,
  };
}

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-0.5">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-extrabold text-foreground leading-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ── Helpers for today string ───────────────────────────────────────────────
function toDateInputValue(d: Date): string {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

// ── Main component ────────────────────────────────────────────────────────
export default function AgeCalculator() {
  const todayStr = toDateInputValue(new Date());

  const [dob,     setDob]     = useState("");
  const [asOfStr, setAsOfStr] = useState(todayStr);

  const result = useMemo<AgeResult | null>(() => {
    if (!dob) return null;
    const dobDate   = new Date(dob + "T00:00:00");
    const asOfDate  = new Date((asOfStr || todayStr) + "T00:00:00");
    if (isNaN(dobDate.getTime()) || isNaN(asOfDate.getTime())) return null;
    if (dobDate > asOfDate) return null;
    return computeAge(dobDate, asOfDate);
  }, [dob, asOfStr, todayStr]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Age Calculator</h1>
        <p className="text-sm text-muted-foreground">
          Enter a date of birth to see an exact age breakdown, totals, and more.
        </p>
      </div>

      {/* ── Inputs ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="dob">Date of Birth</Label>
          <input
            id="dob"
            type="date"
            value={dob}
            max={todayStr}
            onChange={(e) => setDob(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="as-of">Calculate Age As Of</Label>
          <input
            id="as-of"
            type="date"
            value={asOfStr}
            onChange={(e) => setAsOfStr(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* ── Placeholder ─────────────────────────────────────────────────── */}
      {!result && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Select a date of birth above to see your age details.
        </p>
      )}

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {result && (
        <div className="space-y-4">
          {/* Birthday banner */}
          {result.isBirthdayToday && (
            <div className="rounded-xl border border-yellow-400/40 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                Happy Birthday! 🎂
              </p>
            </div>
          )}

          {/* Exact age */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Exact Age
            </p>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Years"  value={String(result.years)}  />
              <StatCard label="Months" value={String(result.months)} />
              <StatCard label="Days"   value={String(result.days)}   />
            </div>
          </div>

          {/* Totals */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Age in Total
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Days"    value={addCommas(result.totalDays)}    />
              <StatCard label="Weeks"   value={addCommas(result.totalWeeks)}   />
              <StatCard label="Hours"   value={addCommas(result.totalHours)}   />
              <StatCard label="Minutes" value={addCommas(result.totalMinutes)} />
            </div>
          </div>

          {/* Fun facts */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              More Info
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard
                label="Next Birthday"
                value={result.isBirthdayToday ? "Today!" : `${result.nextBirthday} days`}
                sub={result.isBirthdayToday ? undefined : "days remaining"}
              />
              <StatCard
                label="Day Born"
                value={result.dayBorn}
              />
              <StatCard
                label="Zodiac Sign"
                value={`${result.zodiac.symbol} ${result.zodiac.name}`}
                sub={result.zodiac.emoji}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
