"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// ---------------------------------------------------------------------------
// Validation patterns per base
// ---------------------------------------------------------------------------

const BASE_PATTERN: Record<number, RegExp> = {
  2:  /^-?[01]+$/,
  8:  /^-?[0-7]+$/,
  10: /^-?\d+$/,
  16: /^-?[0-9a-fA-F]+$/,
};

const BASE_NAMES: Record<number, string> = {
  2:  "Binary",
  8:  "Octal",
  10: "Decimal",
  16: "Hexadecimal",
};

const BASE_LABELS: Record<number, string> = {
  2:  "Base 2",
  8:  "Base 8",
  10: "Base 10",
  16: "Base 16",
};

const QUICK_VALUES = [0, 1, 127, 255, 65535];

// ---------------------------------------------------------------------------
// Conversion helpers
// ---------------------------------------------------------------------------

function toAllBases(rawValue: string, signed: boolean): Record<number, string> | null {
  const trimmed = rawValue.trim();
  if (trimmed === "" || trimmed === "-") return null;

  const isNeg = trimmed.startsWith("-");
  if (isNeg && !signed) return null;

  // Determine source base from the raw value format — caller always passes decimal
  const n = parseInt(trimmed, 10);
  if (isNaN(n)) return null;

  return {
    2:  n.toString(2),
    8:  n.toString(8),
    10: trimmed,
    16: n.toString(16).toUpperCase(),
  };
}

function parseFromBase(val: string, base: number, signed: boolean): number | null {
  const trimmed = val.trim();
  if (trimmed === "" || trimmed === "-") return null;

  const isNeg = trimmed.startsWith("-");
  if (isNeg && !signed) return null;

  if (!BASE_PATTERN[base].test(trimmed)) return null;

  const n = parseInt(trimmed, base);
  if (isNaN(n)) return null;
  return n;
}

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface FieldState {
  raw: string;
  error: string;
  copied: boolean;
}

const emptyField = (raw = ""): FieldState => ({ raw, error: "", copied: false });

interface AllFields {
  2:  FieldState;
  8:  FieldState;
  10: FieldState;
  16: FieldState;
}

const BASES = [2, 8, 10, 16] as const;
type Base = (typeof BASES)[number];

function initialFields(n: number | null): AllFields {
  if (n === null) {
    return { 2: emptyField(), 8: emptyField(), 10: emptyField(), 16: emptyField() };
  }
  return {
    2:  emptyField(n.toString(2)),
    8:  emptyField(n.toString(8)),
    10: emptyField(String(n)),
    16: emptyField(n.toString(16).toUpperCase()),
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BinaryHex() {
  const [fields, setFields] = useState<AllFields>(initialFields(null));
  const [signed, setSigned] = useState(false);

  function handleChange(sourceBase: Base, raw: string) {
    // Validate the source field first
    const trimmed = raw.trim();
    const isEmpty = trimmed === "" || trimmed === "-";

    if (!isEmpty && !BASE_PATTERN[sourceBase].test(trimmed)) {
      // Update only the source field with error, leave others unchanged
      setFields((prev) => ({
        ...prev,
        [sourceBase]: { raw, error: `Invalid character for base ${sourceBase}.`, copied: false },
      }));
      return;
    }

    if (isEmpty) {
      setFields({ 2: emptyField(), 8: emptyField(), 10: emptyField(), 16: emptyField(), [sourceBase]: emptyField(raw) });
      return;
    }

    const n = parseFromBase(trimmed, sourceBase, signed);
    if (n === null) {
      setFields((prev) => ({
        ...prev,
        [sourceBase]: { raw, error: signed ? "Invalid input." : "Use unsigned mode for negative numbers.", copied: false },
      }));
      return;
    }

    // Derive all other bases from n
    const isNeg = n < 0;
    const newFields: AllFields = {
      2:  emptyField(isNeg ? "-" + Math.abs(n).toString(2) : n.toString(2)),
      8:  emptyField(isNeg ? "-" + Math.abs(n).toString(8) : n.toString(8)),
      10: emptyField(String(n)),
      16: emptyField(isNeg ? "-" + Math.abs(n).toString(16).toUpperCase() : n.toString(16).toUpperCase()),
    };
    // Keep the source field as the user typed it (preserve case/formatting)
    newFields[sourceBase] = { raw, error: "", copied: false };

    setFields(newFields);
  }

  function handleQuickValue(val: number) {
    setFields(initialFields(val));
  }

  function handleSignedToggle(newSigned: boolean) {
    setSigned(newSigned);
    // Re-derive from decimal field
    const dec = fields[10].raw.trim();
    if (dec === "" || dec === "-") return;
    const n = parseInt(dec, 10);
    if (!isNaN(n)) {
      if (!newSigned && n < 0) {
        setFields(initialFields(null));
      } else {
        setFields(initialFields(n));
      }
    }
  }

  async function copyField(base: Base) {
    const val = fields[base].raw;
    if (!val) return;
    await navigator.clipboard.writeText(val);
    setFields((prev) => ({ ...prev, [base]: { ...prev[base], copied: true } }));
    setTimeout(() => {
      setFields((prev) => ({ ...prev, [base]: { ...prev[base], copied: false } }));
    }, 2000);
  }

  // Bit length indicator (from binary field)
  const binRaw = fields[2].raw.replace(/^-/, "");
  const bitLength = binRaw ? binRaw.length : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Binary / Hex Converter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Convert numbers between Binary, Octal, Decimal, and Hexadecimal. Edit any field to update all others.
        </p>
      </div>

      {/* Signed toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Mode:</span>
        <div className="flex rounded-md border border-border overflow-hidden text-sm">
          <button
            onClick={() => handleSignedToggle(false)}
            className={`px-3 py-1.5 transition-colors ${
              !signed
                ? "bg-primary text-primary-foreground font-medium"
                : "bg-background text-foreground hover:bg-muted"
            }`}
          >
            Unsigned
          </button>
          <button
            onClick={() => handleSignedToggle(true)}
            className={`px-3 py-1.5 border-l border-border transition-colors ${
              signed
                ? "bg-primary text-primary-foreground font-medium"
                : "bg-background text-foreground hover:bg-muted"
            }`}
          >
            Signed
          </button>
        </div>
        {bitLength > 0 && (
          <span className="ml-auto text-xs text-muted-foreground font-mono">
            {bitLength} bit{bitLength !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Four fields grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {BASES.map((base) => {
          const field = fields[base];
          return (
            <div key={base} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={`base-${base}`} className="flex flex-col gap-0.5">
                  <span>{BASE_NAMES[base]}</span>
                  <span className="text-xs font-normal text-muted-foreground">{BASE_LABELS[base]}</span>
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyField(base)}
                  disabled={!field.raw || !!field.error}
                  className="h-7 px-2 text-xs"
                >
                  {field.copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <input
                id={`base-${base}`}
                type="text"
                value={field.raw}
                onChange={(e) => handleChange(base, e.target.value)}
                placeholder={base === 16 ? "e.g. FF" : base === 2 ? "e.g. 1010" : base === 8 ? "e.g. 17" : "e.g. 255"}
                spellCheck={false}
                className={`w-full rounded-md border px-3 py-2 font-mono text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                  field.error
                    ? "border-red-500 focus:ring-red-500"
                    : "border-border"
                }`}
              />
              {field.error && (
                <p className="text-xs text-red-500">{field.error}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick value buttons */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Common values</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_VALUES.map((val) => (
            <Button
              key={val}
              variant="outline"
              size="sm"
              onClick={() => handleQuickValue(val)}
              className="font-mono"
            >
              {val}
            </Button>
          ))}
        </div>
      </div>

      {/* Reference table */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Quick reference</p>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Decimal</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Binary</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Octal</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Hex</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 8, 10, 15, 16, 127, 128, 255, 256, 1024, 65535].map((n, i) => (
                <tr
                  key={n}
                  className={`cursor-pointer transition-colors ${
                    i % 2 === 0 ? "bg-background" : "bg-muted/20"
                  } hover:bg-primary/10`}
                  onClick={() => handleQuickValue(n)}
                >
                  <td className="px-3 py-1.5 text-foreground">{n}</td>
                  <td className="px-3 py-1.5 text-muted-foreground">{n.toString(2)}</td>
                  <td className="px-3 py-1.5 text-muted-foreground">{n.toString(8)}</td>
                  <td className="px-3 py-1.5 text-muted-foreground">{n.toString(16).toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">Click any row to load that value.</p>
      </div>
    </div>
  );
}
