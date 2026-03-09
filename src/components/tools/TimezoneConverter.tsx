"use client";
/**
 * Timezone Converter
 * Main converter: date + time + from/to timezone selectors, up to 6 simultaneous zones.
 * World Clock tab: 8 default cities, live updates every second, customizable.
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Timezone data ──────────────────────────────────────────────────────────────
interface TzEntry {
  iana: string;
  display: string; // shown in dropdown
  city: string;    // short city name
}

const TIMEZONES: TzEntry[] = [
  { iana: "UTC",                      display: "UTC (UTC+0)",                    city: "UTC"          },
  { iana: "America/New_York",         display: "New York (EST/EDT)",             city: "New York"     },
  { iana: "America/Chicago",          display: "Chicago (CST/CDT)",              city: "Chicago"      },
  { iana: "America/Denver",           display: "Denver (MST/MDT)",               city: "Denver"       },
  { iana: "America/Los_Angeles",      display: "Los Angeles (PST/PDT)",          city: "Los Angeles"  },
  { iana: "America/Toronto",          display: "Toronto (EST/EDT)",              city: "Toronto"      },
  { iana: "America/Vancouver",        display: "Vancouver (PST/PDT)",            city: "Vancouver"    },
  { iana: "America/Mexico_City",      display: "Mexico City (CST/CDT)",          city: "Mexico City"  },
  { iana: "America/Sao_Paulo",        display: "São Paulo (BRT/BRST)",           city: "São Paulo"    },
  { iana: "America/Argentina/Buenos_Aires", display: "Buenos Aires (ART)",        city: "Buenos Aires" },
  { iana: "America/Bogota",           display: "Bogotá (COT)",                   city: "Bogotá"       },
  { iana: "America/Lima",             display: "Lima (PET)",                     city: "Lima"         },
  { iana: "America/Santiago",         display: "Santiago (CLT/CLST)",            city: "Santiago"     },
  { iana: "America/Caracas",          display: "Caracas (VET)",                  city: "Caracas"      },
  { iana: "Europe/London",            display: "London (GMT/BST)",               city: "London"       },
  { iana: "Europe/Paris",             display: "Paris (CET/CEST)",               city: "Paris"        },
  { iana: "Europe/Berlin",            display: "Berlin (CET/CEST)",              city: "Berlin"       },
  { iana: "Europe/Madrid",            display: "Madrid (CET/CEST)",              city: "Madrid"       },
  { iana: "Europe/Rome",              display: "Rome (CET/CEST)",                city: "Rome"         },
  { iana: "Europe/Amsterdam",         display: "Amsterdam (CET/CEST)",           city: "Amsterdam"    },
  { iana: "Europe/Stockholm",         display: "Stockholm (CET/CEST)",           city: "Stockholm"    },
  { iana: "Europe/Moscow",            display: "Moscow (MSK)",                   city: "Moscow"       },
  { iana: "Europe/Istanbul",          display: "Istanbul (TRT)",                 city: "Istanbul"     },
  { iana: "Europe/Lisbon",            display: "Lisbon (WET/WEST)",              city: "Lisbon"       },
  { iana: "Europe/Athens",            display: "Athens (EET/EEST)",              city: "Athens"       },
  { iana: "Africa/Cairo",             display: "Cairo (EET)",                    city: "Cairo"        },
  { iana: "Africa/Johannesburg",      display: "Johannesburg (SAST)",            city: "Johannesburg" },
  { iana: "Africa/Lagos",             display: "Lagos (WAT)",                    city: "Lagos"        },
  { iana: "Africa/Nairobi",           display: "Nairobi (EAT)",                  city: "Nairobi"      },
  { iana: "Asia/Dubai",               display: "Dubai (GST)",                    city: "Dubai"        },
  { iana: "Asia/Riyadh",              display: "Riyadh (AST)",                   city: "Riyadh"       },
  { iana: "Asia/Kolkata",             display: "Mumbai / Kolkata (IST)",         city: "Mumbai"       },
  { iana: "Asia/Karachi",             display: "Karachi (PKT)",                  city: "Karachi"      },
  { iana: "Asia/Dhaka",               display: "Dhaka (BST)",                    city: "Dhaka"        },
  { iana: "Asia/Bangkok",             display: "Bangkok (ICT)",                  city: "Bangkok"      },
  { iana: "Asia/Singapore",           display: "Singapore (SGT)",                city: "Singapore"    },
  { iana: "Asia/Shanghai",            display: "Shanghai (CST)",                 city: "Shanghai"     },
  { iana: "Asia/Tokyo",               display: "Tokyo (JST)",                    city: "Tokyo"        },
  { iana: "Asia/Seoul",               display: "Seoul (KST)",                    city: "Seoul"        },
  { iana: "Asia/Hong_Kong",           display: "Hong Kong (HKT)",                city: "Hong Kong"    },
  { iana: "Asia/Taipei",              display: "Taipei (CST)",                   city: "Taipei"       },
  { iana: "Asia/Jakarta",             display: "Jakarta (WIB)",                  city: "Jakarta"      },
  { iana: "Asia/Tehran",              display: "Tehran (IRST/IRDT)",             city: "Tehran"       },
  { iana: "Australia/Perth",          display: "Perth (AWST)",                   city: "Perth"        },
  { iana: "Australia/Sydney",         display: "Sydney (AEST/AEDT)",             city: "Sydney"       },
  { iana: "Australia/Melbourne",      display: "Melbourne (AEST/AEDT)",          city: "Melbourne"    },
  { iana: "Pacific/Auckland",         display: "Auckland (NZST/NZDT)",           city: "Auckland"     },
  { iana: "Pacific/Honolulu",         display: "Honolulu (HST)",                 city: "Honolulu"     },
  { iana: "Pacific/Fiji",             display: "Fiji (FJT)",                     city: "Fiji"         },
];

const TZ_MAP = new Map(TIMEZONES.map((t) => [t.iana, t]));

// ── UTC offset helper ──────────────────────────────────────────────────────────
function getUtcOffset(iana: string, date: Date = new Date()): string {
  try {
    const fmt = new Intl.DateTimeFormat("en", {
      timeZone: iana,
      timeZoneName: "shortOffset",
    });
    const parts = fmt.formatToParts(date);
    const offsetPart = parts.find((p) => p.type === "timeZoneName");
    return offsetPart?.value ?? "";
  } catch {
    return "";
  }
}

// ── Convert time ───────────────────────────────────────────────────────────────
function convertTime(
  dateStr: string,
  timeStr: string,
  toTz: string
): { date: string; time: string; weekday: string; offset: string } {
  try {
    const dt = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(dt.getTime())) return { date: "—", time: "—", weekday: "—", offset: "" };

    const dateFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: toTz,
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timeFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: toTz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const weekdayFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: toTz,
      weekday: "short",
    });

    return {
      date: dateFmt.format(dt),
      time: timeFmt.format(dt),
      weekday: weekdayFmt.format(dt),
      offset: getUtcOffset(toTz, dt),
    };
  } catch {
    return { date: "—", time: "—", weekday: "—", offset: "" };
  }
}

function liveTimeInTz(iana: string, now: Date): { date: string; time: string; weekday: string; offset: string } {
  try {
    const dateFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: iana,
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timeFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: iana,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const weekdayFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: iana,
      weekday: "long",
    });
    return {
      date: dateFmt.format(now),
      time: timeFmt.format(now),
      weekday: weekdayFmt.format(now),
      offset: getUtcOffset(iana, now),
    };
  } catch {
    return { date: "—", time: "—", weekday: "—", offset: "" };
  }
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function nowTimeStr(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ── TZ Select component ────────────────────────────────────────────────────────
function TzSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? TIMEZONES.filter((t) => t.display.toLowerCase().includes(q) || t.iana.toLowerCase().includes(q))
      : TIMEZONES;
  }, [search]);

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <div className="px-2 pb-1 pt-1 sticky top-0 bg-popover z-10">
            <Input
              placeholder="Search timezone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 text-xs"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {filtered.map((tz) => (
            <SelectItem key={tz.iana} value={tz.iana} className="text-sm">
              {tz.display}
            </SelectItem>
          ))}
          {filtered.length === 0 && (
            <div className="text-xs text-muted-foreground px-2 py-3 text-center">No match</div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

// ── World Clock Card ───────────────────────────────────────────────────────────
function WorldClockCard({ iana, now, onRemove }: { iana: string; now: Date; onRemove?: () => void }) {
  const entry = TZ_MAP.get(iana);
  const info = liveTimeInTz(iana, now);

  return (
    <div className="relative flex flex-col gap-0.5 rounded-xl border border-border bg-muted/30 px-4 py-3">
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 text-muted-foreground hover:text-destructive text-sm leading-none"
          aria-label="Remove"
        >
          ✕
        </button>
      )}
      <div className="flex items-center gap-1.5 flex-wrap pr-4">
        <span className="font-semibold text-sm">{entry?.city ?? iana}</span>
        <Badge variant="secondary" className="font-mono text-[10px]">{info.offset}</Badge>
      </div>
      <span className="text-xs text-muted-foreground">{entry?.iana}</span>
      <span className="font-mono text-3xl font-bold tabular-nums tracking-tight mt-1">{info.time}</span>
      <span className="text-xs text-muted-foreground">{info.weekday}, {info.date}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
const DEFAULT_WORLD_CLOCKS = [
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function TimezoneConverter() {
  // ── Converter state ─────────────────────────────────────────────────────────
  const [dateStr, setDateStr] = useState(todayStr);
  const [timeStr, setTimeStr] = useState(nowTimeStr);
  const [fromTz, setFromTz] = useState("America/New_York");
  const [toTz, setToTz] = useState("Europe/London");
  const [extraZones, setExtraZones] = useState<string[]>([]);

  // ── World clock state ───────────────────────────────────────────────────────
  const [now, setNow] = useState(() => new Date());
  const [worldClocks, setWorldClocks] = useState<string[]>(DEFAULT_WORLD_CLOCKS);
  const [addingClock, setAddingClock] = useState(false);
  const [clockSearch, setClockSearch] = useState("");

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Conversion logic ────────────────────────────────────────────────────────
  // First, interpret the input as being in `fromTz`
  // We need to construct the Date properly: treat dateStr+timeStr as local-to-fromTz
  const inputDt = useMemo(() => {
    // Build a UTC date that represents the given local time in fromTz
    try {
      // Format: use Intl to find the UTC offset for fromTz at roughly that time
      const approx = new Date(`${dateStr}T${timeStr}:00`);
      // Get offset minutes for fromTz at that approximate date
      const localStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: fromTz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(approx);
      // en-CA gives YYYY-MM-DD, HH:mm:ss — parse the fromTz local time
      // We'll use a different approach: create a date string and adjust
      // The simplest correct approach: use the fact that Date always parses as UTC when T...Z
      // So we parse without Z (local browser), then figure out offset difference.
      // Better: use Temporal-like trick via Intl
      const fromLocal = new Date(`${dateStr}T${timeStr}:00`);
      // Get what time the browser's Date thinks it is in fromTz
      const tzFormatted = new Intl.DateTimeFormat("en-CA", {
        timeZone: fromTz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(fromLocal);
      // Parse that back as UTC
      const tzAsUtc = new Date(tzFormatted.replace(", ", "T").replace(/\//g, "-") + "Z");
      if (isNaN(tzAsUtc.getTime())) return fromLocal;
      // Offset = fromLocal - tzAsUtc (browser interprets input as local/UTC naive)
      const offset = fromLocal.getTime() - tzAsUtc.getTime();
      return new Date(fromLocal.getTime() + offset);
    } catch {
      return new Date(`${dateStr}T${timeStr}:00`);
    }
  }, [dateStr, timeStr, fromTz]);

  const primaryResult = useMemo(() => {
    if (!dateStr || !timeStr) return null;
    return convertTime(dateStr, timeStr, toTz);
  }, [dateStr, timeStr, toTz]);

  const fromInfo = useMemo(() => getUtcOffset(fromTz, inputDt), [fromTz, inputDt]);
  const toInfo = useMemo(() => getUtcOffset(toTz, inputDt), [toTz, inputDt]);

  const extraResults = useMemo(
    () =>
      extraZones.map((tz) => ({
        tz,
        ...convertTime(dateStr, timeStr, tz),
      })),
    [extraZones, dateStr, timeStr]
  );

  const addExtraZone = useCallback(() => {
    if (extraZones.length >= 4) return;
    // Find a zone not already in use
    const used = new Set([fromTz, toTz, ...extraZones]);
    const next = TIMEZONES.find((t) => !used.has(t.iana));
    if (next) setExtraZones((prev) => [...prev, next.iana]);
  }, [extraZones, fromTz, toTz]);

  // ── World clock helpers ─────────────────────────────────────────────────────
  const filteredClockSearch = useMemo(() => {
    const q = clockSearch.toLowerCase();
    return TIMEZONES.filter(
      (t) =>
        !worldClocks.includes(t.iana) &&
        (t.display.toLowerCase().includes(q) || t.city.toLowerCase().includes(q))
    );
  }, [clockSearch, worldClocks]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <Tabs defaultValue="converter">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="converter" className="flex-1">Converter</TabsTrigger>
          <TabsTrigger value="worldclock" className="flex-1">World Clock</TabsTrigger>
        </TabsList>

        {/* ── Converter Tab ── */}
        <TabsContent value="converter" className="flex flex-col gap-6">
          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Date</Label>
              <Input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Time</Label>
              <Input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} step="60" />
            </div>
          </div>

          {/* From / To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <TzSelect value={fromTz} onChange={setFromTz} label="From Timezone" />
              <span className="text-xs text-muted-foreground font-mono pl-1">{fromInfo}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <TzSelect value={toTz} onChange={setToTz} label="To Timezone" />
              <span className="text-xs text-muted-foreground font-mono pl-1">{toInfo}</span>
            </div>
          </div>

          {/* Swap */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { const tmp = fromTz; setFromTz(toTz); setToTz(tmp); }}
              className="gap-2"
            >
              ⇄ Swap timezones
            </Button>
          </div>

          {/* Primary result */}
          {primaryResult && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 flex flex-col gap-1 items-center text-center">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-1">
                {TZ_MAP.get(toTz)?.display ?? toTz}
              </div>
              <span className="font-mono text-6xl sm:text-7xl font-bold tabular-nums tracking-tight">
                {primaryResult.time}
              </span>
              <span className="text-base font-medium text-muted-foreground">
                {primaryResult.weekday}, {primaryResult.date}
              </span>
              <Badge variant="secondary" className="font-mono text-xs mt-1">{primaryResult.offset}</Badge>
            </div>
          )}

          {/* Extra zones */}
          {extraZones.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Additional Timezones</h3>
              {extraResults.map((r, i) => (
                <div
                  key={r.tz}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
                >
                  <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    <TzSelect
                      value={r.tz}
                      onChange={(v) =>
                        setExtraZones((prev) => prev.map((z, j) => (j === i ? v : z)))
                      }
                      label=""
                    />
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="font-mono font-bold text-xl tabular-nums">{r.time}</span>
                    <span className="text-xs text-muted-foreground">{r.weekday}, {r.date}</span>
                    <Badge variant="outline" className="font-mono text-[10px]">{r.offset}</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => setExtraZones((prev) => prev.filter((_, j) => j !== i))}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          )}

          {extraZones.length < 4 && (
            <Button variant="outline" className="w-full border-dashed border-2" onClick={addExtraZone}>
              + Add another timezone
            </Button>
          )}
        </TabsContent>

        {/* ── World Clock Tab ── */}
        <TabsContent value="worldclock" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Live time in {worldClocks.length} cities — updates every second.
            </p>
            {worldClocks.length < 12 && (
              <Button size="sm" variant="outline" onClick={() => setAddingClock(true)}>
                + Add city
              </Button>
            )}
          </div>

          {addingClock && (
            <div className="rounded-xl border border-border bg-muted/30 p-3 flex flex-col gap-2">
              <Label className="text-sm">Search & add a city</Label>
              <Input
                placeholder="Search timezone..."
                value={clockSearch}
                onChange={(e) => setClockSearch(e.target.value)}
                autoFocus
              />
              <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
                {filteredClockSearch.slice(0, 15).map((tz) => (
                  <button
                    key={tz.iana}
                    className="text-left text-sm px-2 py-1.5 rounded hover:bg-muted/60 transition-colors"
                    onClick={() => {
                      setWorldClocks((prev) => [...prev, tz.iana]);
                      setAddingClock(false);
                      setClockSearch("");
                    }}
                  >
                    {tz.display}
                  </button>
                ))}
                {filteredClockSearch.length === 0 && (
                  <p className="text-xs text-muted-foreground px-2 py-2">
                    {clockSearch ? "No matching timezone." : "All timezones already added."}
                  </p>
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={() => setAddingClock(false)}>
                Cancel
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {worldClocks.map((iana) => (
              <WorldClockCard
                key={iana}
                iana={iana}
                now={now}
                onRemove={
                  worldClocks.length > 1
                    ? () => setWorldClocks((prev) => prev.filter((z) => z !== iana))
                    : undefined
                }
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground self-start"
            onClick={() => setWorldClocks(DEFAULT_WORLD_CLOCKS)}
          >
            Reset to defaults
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
