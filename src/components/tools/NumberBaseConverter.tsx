"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const COMMON_BASES = [
  { label: "Binary",      base: 2  },
  { label: "Octal",       base: 8  },
  { label: "Decimal",     base: 10 },
  { label: "Hexadecimal", base: 16 },
  { label: "Base 32",     base: 32 },
  { label: "Base 36",     base: 36 },
];

export default function NumberBaseConverter() {
  const [value, setValue]    = useState("255");
  const [fromBase, setFrom]  = useState(10);
  const [copied, setCopied]  = useState<number | null>(null);

  const decimal = parseInt(value.trim(), fromBase);
  const valid   = !isNaN(decimal) && decimal >= 0;

  const copy = async (text: string, base: number) => {
    await navigator.clipboard.writeText(text);
    setCopied(base);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-5 max-w-sm">
      <div className="flex gap-3">
        <div className="flex-1">
          <Label className="mb-1 block">Input Value</Label>
          <Input value={value} onChange={e => setValue(e.target.value)} className="font-mono" placeholder="Enter a number" />
        </div>
        <div className="w-32">
          <Label className="mb-1 block">From Base</Label>
          <Input type="number" min={2} max={36} value={fromBase}
            onChange={e => setFrom(Math.max(2, Math.min(36, Number(e.target.value))))} />
        </div>
      </div>

      {!valid && value.trim() && (
        <p className="text-sm text-destructive">Invalid number for base {fromBase}</p>
      )}

      <div className="space-y-2">
        {COMMON_BASES.map(({ label, base }) => {
          const result = valid ? decimal.toString(base).toUpperCase() : "—";
          return (
            <div key={base} className={`flex items-center justify-between rounded-lg border px-4 py-3 ${base === fromBase ? "border-primary/50 bg-primary/5" : ""}`}>
              <div>
                <span className="text-xs text-muted-foreground">Base {base} · {label}</span>
                <p className="font-mono font-semibold mt-0.5">{result}</p>
              </div>
              {valid && (
                <Button size="sm" variant="ghost" onClick={() => copy(result, base)}>
                  {copied === base ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {valid && (
        <div>
          <Label className="mb-2 block">Custom Base (2–36)</Label>
          <div className="flex gap-2 flex-wrap">
            {[3,4,5,6,7,9,11,12,13,14,15,17,18,19,20].map(b => (
              <button key={b} onClick={() => setFrom(b)}
                className={`rounded border px-2 py-0.5 text-xs transition-colors ${fromBase === b ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}>
                Base {b}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
