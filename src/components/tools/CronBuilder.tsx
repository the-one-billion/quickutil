"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";

type FieldMode = "every" | "specific" | "range" | "step";

interface FieldState {
  mode: FieldMode;
  specific: number[];
  rangeFrom: number;
  rangeTo: number;
  step: number;
}

const FIELDS = [
  { key: "minute",  label: "Minute",     min: 0, max: 59 },
  { key: "hour",    label: "Hour",        min: 0, max: 23 },
  { key: "dom",     label: "Day (month)", min: 1, max: 31 },
  { key: "month",   label: "Month",       min: 1, max: 12 },
  { key: "dow",     label: "Weekday",     min: 0, max: 6  },
] as const;

type FieldKey = typeof FIELDS[number]["key"];

const MONTH_NAMES = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DOW_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function fieldToExpr(fs: FieldState, min: number, max: number): string {
  if (fs.mode === "every") return "*";
  if (fs.mode === "step") return `*/${fs.step}`;
  if (fs.mode === "range") return `${fs.rangeFrom}-${fs.rangeTo}`;
  return fs.specific.length === 0 ? "*" : fs.specific.sort((a,b)=>a-b).join(",");
}

function describe(expr: string, key: FieldKey): string {
  if (expr === "*") return `every ${key}`;
  if (expr.startsWith("*/")) return `every ${expr.slice(2)} ${key}s`;
  return `at ${key} ${expr}`;
}

function humanReadable(exprs: string[], keys: FieldKey[]): string {
  const [min, hr, dom, mo, dow] = exprs;
  const parts = [];
  if (min === "*" && hr === "*") parts.push("every minute");
  else if (min !== "*" && hr === "*") parts.push(`at minute ${min} of every hour`);
  else parts.push(`at ${hr}:${min.padStart ? min.padStart(2,"0") : min}`);
  if (dom !== "*") parts.push(`on day ${dom}`);
  if (mo !== "*") parts.push(`in month ${mo}`);
  if (dow !== "*") parts.push(`on weekday ${dow}`);
  return parts.join(", ");
}

const defaultField = (): FieldState => ({ mode: "every", specific: [], rangeFrom: 0, rangeTo: 1, step: 2 });

export default function CronBuilder() {
  const [fields, setFields] = useState<Record<FieldKey, FieldState>>({
    minute: defaultField(), hour: defaultField(), dom: defaultField(),
    month: defaultField(), dow: defaultField(),
  });
  const [copied, setCopied] = useState(false);

  const exprs = FIELDS.map(f => fieldToExpr(fields[f.key], f.min, f.max));
  const cronExpr = exprs.join(" ");

  const update = (key: FieldKey, patch: Partial<FieldState>) =>
    setFields(p => ({ ...p, [key]: { ...p[key], ...patch } }));

  const toggleSpecific = (key: FieldKey, val: number) => {
    const cur = fields[key].specific;
    const next = cur.includes(val) ? cur.filter(v=>v!==val) : [...cur, val];
    update(key, { specific: next });
  };

  const copy = async () => {
    await navigator.clipboard.writeText(cronExpr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = [
    { label: "Every minute",    expr: "* * * * *" },
    { label: "Every hour",      expr: "0 * * * *" },
    { label: "Daily midnight",  expr: "0 0 * * *" },
    { label: "Every Sunday",    expr: "0 0 * * 0" },
    { label: "Monthly 1st",     expr: "0 0 1 * *" },
    { label: "Weekdays 9am",    expr: "0 9 * * 1-5" },
  ];

  const setPreset = (expr: string) => {
    const parts = expr.split(" ");
    FIELDS.forEach((f, i) => {
      const e = parts[i];
      if (e === "*") update(f.key, { mode: "every" });
      else if (e.startsWith("*/")) update(f.key, { mode: "step", step: parseInt(e.slice(2)) });
      else if (e.includes("-")) {
        const [a,b] = e.split("-").map(Number);
        update(f.key, { mode: "range", rangeFrom: a, rangeTo: b });
      } else {
        update(f.key, { mode: "specific", specific: e.split(",").map(Number) });
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map(p => (
          <button key={p.label} onClick={() => setPreset(p.expr)}
            className="rounded-full border px-3 py-1 text-xs font-medium hover:bg-accent transition-colors">
            {p.label}
          </button>
        ))}
      </div>

      {/* Fields */}
      {FIELDS.map((f, fi) => (
        <div key={f.key} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Label className="font-semibold w-24">{f.label}</Label>
            <div className="flex gap-1.5 flex-wrap">
              {(["every","specific","step","range"] as FieldMode[]).map(m => (
                <button key={m} onClick={() => update(f.key, { mode: m })}
                  className={`rounded border px-2 py-0.5 text-xs capitalize transition-colors ${fields[f.key].mode === m ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}>
                  {m}
                </button>
              ))}
            </div>
            <code className="ml-auto text-sm font-mono text-primary">{exprs[fi]}</code>
          </div>

          {fields[f.key].mode === "specific" && (
            <div className="flex flex-wrap gap-1">
              {Array.from({length: f.max - f.min + 1}, (_,i) => i + f.min).map(v => {
                const label = f.key === "month" ? MONTH_NAMES[v] : f.key === "dow" ? DOW_NAMES[v] : String(v);
                const sel = fields[f.key].specific.includes(v);
                return (
                  <button key={v} onClick={() => toggleSpecific(f.key, v)}
                    className={`rounded px-2 py-0.5 text-xs border transition-colors ${sel ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}>
                    {label}
                  </button>
                );
              })}
            </div>
          )}
          {fields[f.key].mode === "step" && (
            <div className="flex items-center gap-2">
              <Label className="text-sm">Every</Label>
              <Input type="number" min={2} max={f.max} value={fields[f.key].step}
                onChange={e => update(f.key, { step: Number(e.target.value) })} className="w-20" />
              <span className="text-sm">{f.label.toLowerCase()}s</span>
            </div>
          )}
          {fields[f.key].mode === "range" && (
            <div className="flex items-center gap-2">
              <Input type="number" min={f.min} max={f.max} value={fields[f.key].rangeFrom}
                onChange={e => update(f.key, { rangeFrom: Number(e.target.value) })} className="w-20" />
              <span className="text-sm">to</span>
              <Input type="number" min={f.min} max={f.max} value={fields[f.key].rangeTo}
                onChange={e => update(f.key, { rangeTo: Number(e.target.value) })} className="w-20" />
            </div>
          )}
        </div>
      ))}

      {/* Result */}
      <div className="rounded-lg border bg-muted/30 px-4 py-3 flex items-center justify-between gap-3">
        <code className="text-lg font-mono font-bold tracking-widest">{cronExpr}</code>
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Runs: {humanReadable(exprs, FIELDS.map(f => f.key) as FieldKey[])}
      </p>
    </div>
  );
}
