"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ---------------------------------------------------------------------------
// Number-to-words engine (no external libs, supports up to trillions)
// ---------------------------------------------------------------------------

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];

const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

const ORDINAL_SUFFIXES: Record<string, string> = {
  One: "First", Two: "Second", Three: "Third", Five: "Fifth",
  Eight: "Eighth", Nine: "Ninth", Twelve: "Twelfth",
};

function threeDigits(n: number): string {
  if (n === 0) return "";
  const h = Math.floor(n / 100);
  const rem = n % 100;
  const parts: string[] = [];
  if (h > 0) parts.push(`${ONES[h]} Hundred`);
  if (rem > 0) {
    if (rem < 20) {
      parts.push(ONES[rem]);
    } else {
      const t = Math.floor(rem / 10);
      const o = rem % 10;
      parts.push(o === 0 ? TENS[t] : `${TENS[t]}-${ONES[o]}`);
    }
  }
  return parts.join(" ");
}

const SCALE = ["", "Thousand", "Million", "Billion", "Trillion"];

function integerToWords(n: bigint): string {
  if (n === 0n) return "Zero";
  if (n < 0n) return "Negative " + integerToWords(-n);

  const parts: string[] = [];
  let remaining = n;
  let scaleIdx = 0;

  while (remaining > 0n) {
    const chunk = Number(remaining % 1000n);
    remaining = remaining / 1000n;
    if (chunk !== 0) {
      const words = threeDigits(chunk);
      parts.unshift(scaleIdx > 0 ? `${words} ${SCALE[scaleIdx]}` : words);
    }
    scaleIdx++;
  }

  return parts.join(" ");
}

function toOrdinal(words: string): string {
  // Replace last word with ordinal form
  const wordList = words.split(/[\s-]/);
  const last = wordList[wordList.length - 1];
  if (ORDINAL_SUFFIXES[last]) {
    return words.slice(0, words.length - last.length) + ORDINAL_SUFFIXES[last];
  }
  if (last.endsWith("y")) {
    return words.slice(0, words.length - 1) + "ieth";
  }
  if (last.endsWith("t") || last.endsWith("st") || last.endsWith("nd") || last.endsWith("rd")) {
    return words + "h";
  }
  return words + "th";
}

type Mode = "standard" | "cheque" | "ordinal";
type CurrencyMode = "none" | "usd" | "gbp";

interface ConversionResult {
  output: string;
  error: string;
}

function convert(raw: string, mode: Mode, currency: CurrencyMode): ConversionResult {
  const trimmed = raw.trim();
  if (trimmed === "") return { output: "", error: "" };

  // Validate: optional leading minus, digits, optional single decimal point + digits
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return { output: "", error: "Enter a valid number (e.g. 1234, -5, 3.14)." };
  }

  const isNegative = trimmed.startsWith("-");
  const abs = isNegative ? trimmed.slice(1) : trimmed;
  const [intPart, fracPart] = abs.split(".");

  let intBig: bigint;
  try {
    intBig = BigInt(intPart);
    if (intBig > 999_999_999_999_999n) {
      return { output: "", error: "Number too large — maximum is 999 trillion." };
    }
  } catch {
    return { output: "", error: "Number too large to process." };
  }

  const intWords = integerToWords(intBig);
  const prefix = isNegative ? "Negative " : "";

  // Decimal / cents handling
  if (fracPart !== undefined) {
    const centStr = fracPart.slice(0, 2).padEnd(2, "0");
    const cents = parseInt(centStr, 10);

    if (currency !== "none") {
      const currencyNames: Record<CurrencyMode, [string, string, string, string]> = {
        none:  ["", "", "", ""],
        usd:   ["Dollar", "Dollars", "Cent", "Cents"],
        gbp:   ["Pound", "Pounds", "Penny", "Pence"],
      };
      const [sing, plur, csing, cplur] = currencyNames[currency];
      const mainUnit = intBig === 1n ? sing : plur;
      const centUnit = cents === 1 ? csing : cplur;
      let result = `${prefix}${intWords} ${mainUnit}`;
      if (cents > 0) result += ` and ${integerToWords(BigInt(cents))} ${centUnit}`;
      if (mode === "cheque") result += " Only";
      return { output: result, error: "" };
    }

    // No currency — "and XX/100"
    let result = `${prefix}${intWords} and ${centStr}/100`;
    if (mode === "cheque") result += " Only";
    return { output: result, error: "" };
  }

  // Integer only
  let intResult = `${prefix}${intWords}`;
  if (mode === "ordinal") intResult = `${prefix}${toOrdinal(intWords)}`;
  if (mode === "cheque") intResult += " Only";

  if (currency !== "none") {
    const currencyNames: Record<CurrencyMode, [string, string]> = {
      none: ["", ""],
      usd:  ["Dollar", "Dollars"],
      gbp:  ["Pound", "Pounds"],
    };
    const [sing, plur] = currencyNames[currency];
    const unit = intBig === 1n ? sing : plur;
    intResult = `${prefix}${intWords} ${unit}`;
    if (mode === "cheque") intResult += " Only";
  }

  return { output: intResult, error: "" };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NumberToWords() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("standard");
  const [currency, setCurrency] = useState<CurrencyMode>("none");
  const [copied, setCopied] = useState(false);

  const { output, error } = convert(input, mode, currency);

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Number to Words</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Convert numbers into English words. Supports integers, decimals, currency, and cheque format.
        </p>
      </div>

      {/* Number input */}
      <div className="space-y-1.5">
        <Label htmlFor="number-input">Number</Label>
        <Input
          id="number-input"
          type="text"
          inputMode="decimal"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 1234567.89"
          className={`font-mono text-base ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
        />
        {error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>

      {/* Mode tabs */}
      <div className="space-y-1.5">
        <Label>Mode</Label>
        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList className="w-full">
            <TabsTrigger value="standard" className="flex-1">Standard</TabsTrigger>
            <TabsTrigger value="cheque" className="flex-1">Cheque / Legal</TabsTrigger>
            <TabsTrigger value="ordinal" className="flex-1">Ordinal</TabsTrigger>
          </TabsList>
          <TabsContent value="standard" className="mt-0" />
          <TabsContent value="cheque" className="mt-0" />
          <TabsContent value="ordinal" className="mt-0" />
        </Tabs>
      </div>

      {/* Currency option */}
      <div className="space-y-1.5">
        <Label>Currency</Label>
        <div className="flex flex-wrap gap-2">
          {(["none", "usd", "gbp"] as CurrencyMode[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                currency === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              {c === "none" ? "None" : c === "usd" ? "USD ($)" : "GBP (£)"}
            </button>
          ))}
        </div>
      </div>

      {/* Output */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Result</Label>
          <Button variant="outline" size="sm" onClick={copyOutput} disabled={!output}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <div
          className={`min-h-[80px] rounded-md border border-border bg-muted/40 px-4 py-3 text-base font-medium text-foreground leading-relaxed ${
            !output ? "text-muted-foreground" : ""
          }`}
        >
          {output || "Result will appear here..."}
        </div>
      </div>

      {/* Examples */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Try these</p>
        <div className="flex flex-wrap gap-2">
          {["1234.56", "1000000", "-42", "999999999999999", "100.00"].map((ex) => (
            <button
              key={ex}
              onClick={() => setInput(ex)}
              className="rounded border border-border bg-background px-2.5 py-1 text-xs font-mono text-foreground hover:bg-muted transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
