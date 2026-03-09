"use client";
/**
 * Cron Expression Parser
 * Parses 5-field (standard) and 6-field (Quartz/Spring) cron expressions,
 * explains each field in plain English, and computes the next 10 run times.
 */
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTH_NAMES: Record<string, number> = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
};
const MONTH_LABELS = ["", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const DOW_NAMES: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};
const DOW_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const QUICK_EXAMPLES = [
  { label: "Weekdays 9am", expr: "0 9 * * 1-5" },
  { label: "First of month midnight", expr: "0 0 1 * *" },
  { label: "Every 15 min", expr: "*/15 * * * *" },
  { label: "Sundays midnight", expr: "0 0 * * 0" },
  { label: "Hourly 9–5 weekdays", expr: "0 9-17 * * 1-5" },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface ParsedCron {
  isQuartz: boolean;
  fields: {
    second?: string;
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
  };
}

interface CronResult {
  parsed: ParsedCron;
  summary: string;
  fieldRows: { field: string; value: string; description: string }[];
  nextRuns: Date[];
  error: null;
}

interface CronError {
  error: string;
}

// ── Parser helpers ─────────────────────────────────────────────────────────────

/** Replace named month/day aliases with numbers */
function normalizeField(value: string, map: Record<string, number>): string {
  return value.toUpperCase().replace(/[A-Z]+/g, (m) => (map[m] !== undefined ? String(map[m]) : m));
}

/** Parse a single cron value field into a sorted set of matching integers */
function expandField(
  raw: string,
  min: number,
  max: number,
  nameMap?: Record<string, number>
): number[] | null {
  const normalized = nameMap ? normalizeField(raw, nameMap) : raw.toUpperCase();
  if (normalized === "*" || normalized === "?") {
    const result: number[] = [];
    for (let i = min; i <= max; i++) result.push(i);
    return result;
  }

  const values = new Set<number>();

  for (const part of normalized.split(",")) {
    if (part.includes("/")) {
      const [range, stepStr] = part.split("/");
      const step = parseInt(stepStr, 10);
      if (isNaN(step) || step <= 0) return null;
      let start = min;
      let end = max;
      if (range !== "*") {
        if (range.includes("-")) {
          const [a, b] = range.split("-").map(Number);
          if (isNaN(a) || isNaN(b)) return null;
          start = a;
          end = b;
        } else {
          start = parseInt(range, 10);
          if (isNaN(start)) return null;
        }
      }
      for (let i = start; i <= end; i += step) values.add(i);
    } else if (part.includes("-")) {
      const [a, b] = part.split("-").map(Number);
      if (isNaN(a) || isNaN(b)) return null;
      for (let i = a; i <= b; i++) values.add(i);
    } else {
      // Handle L (last) as max
      const cleaned = part.replace(/L$/, "");
      if (cleaned === "" || cleaned === "*") {
        values.add(max);
      } else {
        const n = parseInt(cleaned, 10);
        if (isNaN(n)) return null;
        values.add(n);
      }
    }
  }

  const arr = Array.from(values).filter((v) => v >= min && v <= max).sort((a, b) => a - b);
  return arr.length > 0 ? arr : null;
}

/** Convert a cron field to a human-readable English description */
function describeField(
  raw: string,
  fieldName: string,
  min: number,
  max: number,
  nameMap?: Record<string, number>,
  labelMap?: string[]
): string {
  const norm = nameMap ? normalizeField(raw, nameMap) : raw.toUpperCase();
  if (norm === "*" || norm === "?") return `Every ${fieldName}`;

  if (norm === "L") {
    if (fieldName === "day-of-month") return "Last day of the month";
    if (fieldName === "day-of-week") return "Last day of the week (Saturday)";
  }

  // Handle step
  if (norm.startsWith("*/")) {
    const step = norm.slice(2);
    return `Every ${step} ${fieldName}${step === "1" ? "" : "s"}`;
  }
  if (norm.includes("/")) {
    const [range, step] = norm.split("/");
    const stepNum = parseInt(step, 10);
    const rangeDesc = range === "*" ? `${fieldName} 0` : `${fieldName} ${range}`;
    return `Every ${stepNum} ${fieldName}s starting at ${rangeDesc}`;
  }

  // Handle Nth weekday (#)
  if (norm.includes("#")) {
    const [dow, nth] = norm.split("#");
    const dayName = labelMap ? labelMap[parseInt(dow, 10)] || dow : dow;
    const nthLabels: Record<string, string> = { "1": "1st", "2": "2nd", "3": "3rd", "4": "4th", "5": "5th" };
    return `${nthLabels[nth] || nth} ${dayName} of the month`;
  }

  // Handle LW (last weekday)
  if (norm === "LW") return "Last weekday of the month";

  // Handle W (nearest weekday)
  if (norm.endsWith("W")) {
    const day = norm.slice(0, -1);
    return `Nearest weekday to the ${day}th`;
  }

  // Handle L suffix on dow
  if (norm.endsWith("L") && fieldName === "day-of-week") {
    const dow = parseInt(norm, 10);
    const dayName = labelMap ? labelMap[dow] || String(dow) : String(dow);
    return `Last ${dayName} of the month`;
  }

  // Range
  if (norm.includes("-") && !norm.includes(",")) {
    const [a, b] = norm.split("-").map(Number);
    const aLabel = labelMap ? labelMap[a] || String(a) : String(a);
    const bLabel = labelMap ? labelMap[b] || String(b) : String(b);
    return `${fieldName} ${aLabel} through ${bLabel}`;
  }

  // List
  if (norm.includes(",")) {
    const parts = norm.split(",").map((p) => {
      if (p.includes("-")) {
        const [a, b] = p.split("-").map(Number);
        const aL = labelMap ? labelMap[a] || String(a) : String(a);
        const bL = labelMap ? labelMap[b] || String(b) : String(b);
        return `${aL}–${bL}`;
      }
      const n = parseInt(p, 10);
      return labelMap ? labelMap[n] || p : p;
    });
    return parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];
  }

  // Single value
  const n = parseInt(norm, 10);
  if (!isNaN(n) && labelMap) return labelMap[n] || norm;

  return norm;

  void min; void max;
}

/** Produce a plain English summary of the full cron expression */
function buildSummary(fields: ParsedCron["fields"]): string {
  const { minute, hour, dayOfMonth, month, dayOfWeek, second } = fields;

  const minNorm = normalizeField(minute, {});
  const hrNorm = normalizeField(hour, {});
  const domNorm = dayOfMonth.toUpperCase();
  const monNorm = normalizeField(month, MONTH_NAMES).toUpperCase();
  const dowNorm = normalizeField(dayOfWeek, DOW_NAMES).toUpperCase();

  // Build time string
  let timeStr = "";
  if (minNorm === "*" && hrNorm === "*") {
    timeStr = "every minute";
  } else if (minNorm.startsWith("*/")) {
    const step = minNorm.slice(2);
    timeStr = `every ${step} minutes`;
  } else if (hrNorm === "*") {
    timeStr = `at minute ${minNorm} of every hour`;
  } else if (minNorm === "0" && hrNorm.match(/^\d+$/)) {
    const h = parseInt(hrNorm, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    timeStr = `at ${h12}:00 ${ampm}`;
  } else if (minNorm.match(/^\d+$/) && hrNorm.match(/^\d+$/)) {
    const h = parseInt(hrNorm, 10);
    const m = parseInt(minNorm, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    timeStr = `at ${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  } else if (hrNorm.includes("-")) {
    const [a, b] = hrNorm.split("-").map(Number);
    const toAmpm = (h: number) => {
      const ap = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return `${h12} ${ap}`;
    };
    timeStr = `hourly from ${toAmpm(a)} to ${toAmpm(b)}`;
  } else {
    timeStr = `at ${hour} hours, ${minute} minutes`;
  }

  if (second && second !== "0" && second !== "*") {
    timeStr += `, second ${second}`;
  }

  // Day/period string
  const everyStar = domNorm === "*" || domNorm === "?";
  const everyDow = dowNorm === "*" || dowNorm === "?";
  const everyMonth = monNorm === "*";

  let dayStr = "";
  if (everyStar && everyDow) {
    dayStr = "every day";
  } else if (!everyDow && everyDow === false && dowNorm !== "*" && dowNorm !== "?") {
    if (dowNorm === "1-5") dayStr = "Monday through Friday";
    else if (dowNorm === "0") dayStr = "every Sunday";
    else if (dowNorm === "6") dayStr = "every Saturday";
    else dayStr = `on ${describeField(dayOfWeek, "day-of-week", 0, 6, DOW_NAMES, DOW_LABELS)}`;
  } else if (!everyStar) {
    if (domNorm === "L") dayStr = "on the last day of the month";
    else dayStr = `on day ${domNorm} of the month`;
  }

  if (!everyMonth) {
    const expanded = expandField(month, 1, 12, MONTH_NAMES);
    if (expanded && expanded.length === 1) {
      dayStr += ` in ${MONTH_LABELS[expanded[0]]}`;
    } else if (expanded) {
      dayStr += ` in selected months`;
    }
  }

  // Build readable summary
  if (!dayStr || dayStr === "every day") {
    return `Runs ${timeStr} every day`;
  }
  return `Runs ${timeStr} ${dayStr}`;
}

// ── Next-run computation ───────────────────────────────────────────────────────

function matchesCronField(value: number, raw: string, min: number, max: number, nameMap?: Record<string, number>): boolean {
  const norm = nameMap ? normalizeField(raw, nameMap) : raw.toUpperCase();
  if (norm === "*" || norm === "?") return true;
  const allowed = expandField(raw, min, max, nameMap);
  return allowed ? allowed.includes(value) : false;
}

function computeNextRuns(fields: ParsedCron["fields"], count: number): Date[] {
  const results: Date[] = [];
  const now = new Date();
  // Start from next minute
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0);

  let current = new Date(start);
  let iterations = 0;
  const MAX_ITER = 60 * 24 * 366 * 2; // 2 years of minutes

  while (results.length < count && iterations < MAX_ITER) {
    iterations++;
    const min = current.getMinutes();
    const hr = current.getHours();
    const dom = current.getDate();
    const mon = current.getMonth() + 1; // 1-based
    const dow = current.getDay(); // 0=Sun

    const domRaw = fields.dayOfMonth.toUpperCase();
    const dowRaw = normalizeField(fields.dayOfWeek, DOW_NAMES).toUpperCase();
    const domStar = domRaw === "*" || domRaw === "?";
    const dowStar = dowRaw === "*" || dowRaw === "?";

    // Standard cron: if both dom and dow are restricted, either can match (OR)
    let dayMatch: boolean;
    if (!domStar && !dowStar) {
      dayMatch = matchesCronField(dom, fields.dayOfMonth, 1, 31) || matchesCronField(dow, fields.dayOfWeek, 0, 6, DOW_NAMES);
    } else {
      dayMatch = matchesCronField(dom, fields.dayOfMonth, 1, 31) && matchesCronField(dow, fields.dayOfWeek, 0, 6, DOW_NAMES);
    }

    if (
      matchesCronField(mon, fields.month, 1, 12, MONTH_NAMES) &&
      dayMatch &&
      matchesCronField(hr, fields.hour, 0, 23) &&
      matchesCronField(min, fields.minute, 0, 59)
    ) {
      results.push(new Date(current));
    }

    // Advance by 1 minute
    current = new Date(current.getTime() + 60_000);
  }

  return results;
}

// ── Main parse function ────────────────────────────────────────────────────────

function parseCron(expr: string): CronResult | CronError {
  const trimmed = expr.trim();
  if (!trimmed) return { error: "Enter a cron expression" };

  const parts = trimmed.split(/\s+/);
  if (parts.length < 5 || parts.length > 6) {
    return { error: `Expected 5 or 6 fields, got ${parts.length}. Format: minute hour dom month dow` };
  }

  const isQuartz = parts.length === 6;
  let second = "0";
  let minute: string, hour: string, dayOfMonth: string, month: string, dayOfWeek: string;

  if (isQuartz) {
    [second, minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  } else {
    [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  }

  // Validate each field can be expanded
  const validations: [string, string, number, number, Record<string, number> | undefined][] = [
    [minute, "minute", 0, 59, undefined],
    [hour, "hour", 0, 23, undefined],
    [dayOfMonth, "day-of-month", 1, 31, undefined],
    [month, "month", 1, 12, MONTH_NAMES],
    [dayOfWeek, "day-of-week", 0, 6, DOW_NAMES],
  ];
  if (isQuartz) {
    validations.unshift([second, "second", 0, 59, undefined]);
  }

  for (const [val, name] of validations) {
    const norm = name === "month" ? normalizeField(val, MONTH_NAMES) : name === "day-of-week" ? normalizeField(val, DOW_NAMES) : val;
    // Allow *, ?, L, W, # and numeric expressions
    const allowedChars = /^[\d*,\-/?LW#]+$/i;
    if (!allowedChars.test(norm.toUpperCase())) {
      return { error: `Invalid characters in ${name} field: "${val}"` };
    }
  }

  const fields: ParsedCron["fields"] = { second, minute, hour, dayOfMonth, month, dayOfWeek };
  const parsed: ParsedCron = { isQuartz, fields };

  const fieldRows = [
    ...(isQuartz ? [{ field: "Second", value: second, description: describeField(second, "second", 0, 59) }] : []),
    { field: "Minute", value: minute, description: describeField(minute, "minute", 0, 59) },
    { field: "Hour", value: hour, description: describeField(hour, "hour", 0, 23) },
    { field: "Day of Month", value: dayOfMonth, description: describeField(dayOfMonth, "day-of-month", 1, 31) },
    { field: "Month", value: month, description: describeField(month, "month", 1, 12, MONTH_NAMES, MONTH_LABELS) },
    { field: "Day of Week", value: dayOfWeek, description: describeField(dayOfWeek, "day-of-week", 0, 6, DOW_NAMES, DOW_LABELS) },
  ];

  const summary = buildSummary(fields);
  const nextRuns = computeNextRuns(fields, 10);

  return { parsed, summary, fieldRows, nextRuns, error: null };
}

// ── Date formatter ─────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function CronParser() {
  const [expr, setExpr] = useState("0 9 * * 1-5");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => parseCron(expr), [expr]);

  function copyExpr() {
    navigator.clipboard.writeText(expr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Cron Expression Parser</h1>
        <p className="text-sm text-muted-foreground">
          Parse and explain 5-field (standard) or 6-field (Quartz/Spring) cron expressions in plain English.
        </p>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <Label htmlFor="cron-input">Cron Expression</Label>
        <div className="flex gap-2">
          <Input
            id="cron-input"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder="0 9 * * 1-5"
            className={`font-mono text-base ${
              result.error && expr.trim()
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
            spellCheck={false}
          />
          <Button variant="outline" size="sm" onClick={copyExpr} className="shrink-0">
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Fields: <span className="font-mono">minute hour day-of-month month day-of-week</span>
          {" "}(or prepend <span className="font-mono">second</span> for 6-field Quartz format)
        </p>
      </div>

      {/* Quick Examples */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Quick Examples</Label>
        <div className="flex flex-wrap gap-2">
          {QUICK_EXAMPLES.map((ex) => (
            <button
              key={ex.expr}
              onClick={() => setExpr(ex.expr)}
              className={`rounded-full border px-3 py-1 text-xs font-mono transition-colors ${
                expr === ex.expr
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              {ex.expr}
              <span className="ml-1.5 font-sans text-[10px] opacity-70">{ex.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {result.error && expr.trim() && (
        <div className="rounded-lg border border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          <span className="font-semibold">Invalid expression: </span>{result.error}
        </div>
      )}

      {/* Results */}
      {'parsed' in result && (
        <>
          {/* Summary card */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md bg-primary/10 px-2 py-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  {result.parsed.isQuartz ? "Quartz" : "Standard"}
                </span>
              </div>
              <p className="text-base font-medium text-foreground leading-relaxed">{result.summary}</p>
            </div>
          </div>

          {/* Field breakdown */}
          <div className="space-y-2">
            <Label>Field Breakdown</Label>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Field</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Value</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {result.fieldRows.map((row, i) => (
                    <tr
                      key={row.field}
                      className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}
                    >
                      <td className="px-4 py-2.5 font-medium text-foreground">{row.field}</td>
                      <td className="px-4 py-2.5">
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{row.value}</code>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Next 10 run times */}
          <div className="space-y-2">
            <Label>Next 10 Run Times</Label>
            {result.nextRuns.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Could not compute run times within the next 2 years for this expression.
              </p>
            ) : (
              <div className="grid gap-1.5">
                {result.nextRuns.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 text-sm"
                  >
                    <Badge
                      variant="secondary"
                      className="shrink-0 tabular-nums w-6 h-6 flex items-center justify-center rounded-full text-xs"
                    >
                      {i + 1}
                    </Badge>
                    <span className="font-mono text-foreground">{formatDate(d)}</span>
                    {i === 0 && (
                      <span className="ml-auto text-xs text-primary font-medium">Next</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <p className="border-t border-border pt-4 text-xs text-muted-foreground">
        Supports <span className="font-mono">*</span>, <span className="font-mono">,</span>, <span className="font-mono">-</span>, <span className="font-mono">/</span>, <span className="font-mono">L</span>, <span className="font-mono">W</span>, <span className="font-mono">#</span>, <span className="font-mono">?</span> operators and named months/days.
        Next-run times are computed locally from the current date.
      </p>
    </div>
  );
}
