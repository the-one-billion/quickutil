"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Conversion logic (no external libs)
// ---------------------------------------------------------------------------

const ROMAN_VALUES: [string, number][] = [
  ["M", 1000], ["CM", 900], ["D", 500], ["CD", 400],
  ["C", 100],  ["XC", 90],  ["L", 50],  ["XL", 40],
  ["X", 10],   ["IX", 9],   ["V", 5],   ["IV", 4],
  ["I", 1],
];

function arabicToRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return "";
  let result = "";
  let remaining = n;
  for (const [numeral, value] of ROMAN_VALUES) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }
  return result;
}

const ROMAN_DIGIT_VALUES: Record<string, number> = {
  I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
};

function romanToArabic(s: string): number {
  const upper = s.toUpperCase().trim();
  if (!/^[IVXLCDM]+$/.test(upper)) throw new Error("Invalid Roman numeral characters.");

  let total = 0;
  for (let i = 0; i < upper.length; i++) {
    const cur = ROMAN_DIGIT_VALUES[upper[i]];
    const next = ROMAN_DIGIT_VALUES[upper[i + 1]];
    if (next !== undefined && cur < next) {
      total -= cur;
    } else {
      total += cur;
    }
  }

  // Validate by round-tripping
  if (total < 1 || total > 3999 || arabicToRoman(total) !== upper) {
    throw new Error("Not a valid standard Roman numeral.");
  }
  return total;
}

// ---------------------------------------------------------------------------
// Table data
// ---------------------------------------------------------------------------

const TABLE_SYMBOLS: { symbol: string; value: number }[] = [
  { symbol: "I", value: 1 },
  { symbol: "V", value: 5 },
  { symbol: "X", value: 10 },
  { symbol: "L", value: 50 },
  { symbol: "C", value: 100 },
  { symbol: "D", value: 500 },
  { symbol: "M", value: 1000 },
];

const EXAMPLES: { arabic: number; label: string }[] = [
  { arabic: 2024, label: "Current year" },
  { arabic: 1776, label: "US Declaration" },
  { arabic: 1999, label: "MCMXCIX" },
  { arabic: 42,   label: "Answer to everything" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RomanNumeral() {
  const [arabicValue, setArabicValue] = useState("");
  const [romanValue, setRomanValue] = useState("");
  const [arabicError, setArabicError] = useState("");
  const [romanError, setRomanError] = useState("");

  function handleArabicChange(raw: string) {
    setArabicValue(raw);
    setArabicError("");
    if (raw.trim() === "") {
      setRomanValue("");
      return;
    }
    const n = parseInt(raw, 10);
    if (isNaN(n) || String(n) !== raw.trim()) {
      setArabicError("Enter a whole number.");
      setRomanValue("");
      return;
    }
    if (n < 1 || n > 3999) {
      setArabicError("Number must be between 1 and 3999.");
      setRomanValue("");
      return;
    }
    setRomanValue(arabicToRoman(n));
  }

  function handleRomanChange(raw: string) {
    setRomanValue(raw);
    setRomanError("");
    if (raw.trim() === "") {
      setArabicValue("");
      return;
    }
    try {
      const n = romanToArabic(raw);
      setArabicValue(String(n));
    } catch (e) {
      setArabicValue("");
      setRomanError(e instanceof Error ? e.message : "Invalid Roman numeral.");
    }
  }

  function loadExample(arabic: number) {
    const roman = arabicToRoman(arabic);
    setArabicValue(String(arabic));
    setRomanValue(roman);
    setArabicError("");
    setRomanError("");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Roman Numeral Converter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Convert between Arabic numbers (1–3999) and Roman numerals in real time.
        </p>
      </div>

      {/* Dual inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="arabic-input">Arabic Number</Label>
          <Input
            id="arabic-input"
            type="number"
            min={1}
            max={3999}
            value={arabicValue}
            onChange={(e) => handleArabicChange(e.target.value)}
            placeholder="e.g. 2024"
            className={arabicError ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {arabicError && (
            <p className="text-xs text-red-500">{arabicError}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="roman-input">Roman Numeral</Label>
          <Input
            id="roman-input"
            type="text"
            value={romanValue}
            onChange={(e) => handleRomanChange(e.target.value)}
            placeholder="e.g. MMXXIV"
            className={`font-mono uppercase ${romanError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          />
          {romanError && (
            <p className="text-xs text-red-500">{romanError}</p>
          )}
        </div>
      </div>

      {/* Quick examples */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Quick examples</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(({ arabic, label }) => (
            <Button
              key={arabic}
              variant="outline"
              size="sm"
              onClick={() => loadExample(arabic)}
              title={label}
            >
              {arabic} — {arabicToRoman(arabic)}
            </Button>
          ))}
        </div>
      </div>

      {/* Symbol table */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Symbol reference</p>
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Symbol</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Value</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Example usage</th>
              </tr>
            </thead>
            <tbody>
              {TABLE_SYMBOLS.map(({ symbol, value }, i) => (
                <tr
                  key={symbol}
                  className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  <td className="px-4 py-2 font-mono font-bold text-foreground">{symbol}</td>
                  <td className="px-4 py-2 text-foreground">{value.toLocaleString()}</td>
                  <td className="px-4 py-2 text-muted-foreground font-mono text-xs">
                    {symbol === "I" && "III = 3, IX = 9"}
                    {symbol === "V" && "VI = 6, IV = 4"}
                    {symbol === "X" && "XIII = 13, XL = 40"}
                    {symbol === "L" && "LX = 60, XC = 90"}
                    {symbol === "C" && "CCC = 300, CD = 400"}
                    {symbol === "D" && "DC = 600, CM = 900"}
                    {symbol === "M" && "MM = 2000, MCM = 1900"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subtractive notation note */}
      <p className="rounded-md border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Subtractive notation:</span> A smaller numeral placed before a larger one is subtracted.
        E.g. IV = 4 (5−1), IX = 9 (10−1), XL = 40, XC = 90, CD = 400, CM = 900.
      </p>
    </div>
  );
}
