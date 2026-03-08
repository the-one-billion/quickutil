"use client";
/**
 * Scientific Calculator
 * Full button layout: basic + scientific functions.
 * DEG/RAD toggle. Expression + result display.
 * Last-10 history. Keyboard input via useEffect.
 * Expression evaluation via a simple sanitized approach using new Function().
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";

// ── Types ────────────────────────────────────────────────────────────────────
interface HistoryEntry {
  expr: string;
  result: string;
}

// ── Math helpers ─────────────────────────────────────────────────────────────
function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

/**
 * Sanitize and evaluate an expression string safely.
 * Replaces display tokens with JS equivalents, then uses new Function().
 */
function safeEval(expr: string, angleMode: "DEG" | "RAD"): string {
  // Validation: only allow safe characters
  const sanitized = expr
    .replace(/\s+/g, "")
    // Display tokens → JS Math
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, String(Math.PI))
    .replace(/e(?![0-9])/g, String(Math.E))       // Euler's e (not exponent notation)
    .replace(/\^/g, "**");

  // Trig wrappers for DEG mode
  const toRad = (x: number) => angleMode === "DEG" ? x * Math.PI / 180 : x;
  const fromRad = (x: number) => angleMode === "DEG" ? x * 180 / Math.PI : x;

  // Replace function names with namespaced equivalents
  let js = sanitized
    .replace(/asin\(/g, "__asin(")
    .replace(/acos\(/g, "__acos(")
    .replace(/atan\(/g, "__atan(")
    .replace(/sin\(/g, "__sin(")
    .replace(/cos\(/g, "__cos(")
    .replace(/tan\(/g, "__tan(")
    .replace(/log\(/g, "__log(")
    .replace(/ln\(/g, "__ln(")
    .replace(/sqrt\(/g, "__sqrt(")
    .replace(/abs\(/g, "__abs(");

  // Validate: only safe chars remain after replacement
  if (!/^[0-9+\-*/().%!_a-zA-Z\s]+$/.test(js)) {
    return "Error";
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(
      "__sin", "__cos", "__tan",
      "__asin", "__acos", "__atan",
      "__log", "__ln", "__sqrt", "__abs",
      `"use strict"; return (${js});`
    );
    const result: unknown = fn(
      (x: number) => Math.sin(toRad(x)),
      (x: number) => Math.cos(toRad(x)),
      (x: number) => Math.tan(toRad(x)),
      (x: number) => fromRad(Math.asin(x)),
      (x: number) => fromRad(Math.acos(x)),
      (x: number) => fromRad(Math.atan(x)),
      (x: number) => Math.log10(x),
      (x: number) => Math.log(x),
      (x: number) => Math.sqrt(x),
      (x: number) => Math.abs(x),
    );

    if (typeof result !== "number") return "Error";
    if (!isFinite(result)) return result > 0 ? "Infinity" : result < 0 ? "-Infinity" : "NaN";

    // Format: avoid excessive decimals
    const s = result.toPrecision(12);
    const n = parseFloat(s);
    if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-10 && n !== 0)) {
      return n.toExponential(6);
    }
    return String(n);
  } catch {
    return "Error";
  }
}

// ── Button grid definition ───────────────────────────────────────────────────
interface CalcButton {
  label: string;
  /** What gets appended to the expression. If absent, uses label. */
  insert?: string;
  /** If true, this button triggers a special action. */
  action?: "clear" | "backspace" | "equals" | "negate" | "factorial" | "reciprocal" | "square" | "power";
  wide?: boolean;
  variant?: "primary" | "operator" | "fn" | "number" | "equals";
}

const BUTTON_ROWS: CalcButton[][] = [
  [
    { label: "sin",  insert: "sin(",   variant: "fn" },
    { label: "cos",  insert: "cos(",   variant: "fn" },
    { label: "tan",  insert: "tan(",   variant: "fn" },
    { label: "(",    insert: "(",      variant: "fn" },
    { label: ")",    insert: ")",      variant: "fn" },
  ],
  [
    { label: "asin", insert: "asin(",  variant: "fn" },
    { label: "acos", insert: "acos(",  variant: "fn" },
    { label: "atan", insert: "atan(",  variant: "fn" },
    { label: "log",  insert: "log(",   variant: "fn" },
    { label: "ln",   insert: "ln(",    variant: "fn" },
  ],
  [
    { label: "√",    insert: "sqrt(",  variant: "fn" },
    { label: "x²",   action: "square",   variant: "fn" },
    { label: "xʸ",   insert: "^(",    variant: "fn" },
    { label: "1/x",  action: "reciprocal", variant: "fn" },
    { label: "n!",   action: "factorial",  variant: "fn" },
  ],
  [
    { label: "π",    insert: "π",      variant: "fn" },
    { label: "e",    insert: "e",      variant: "fn" },
    { label: "AC",   action: "clear",  variant: "operator" },
    { label: "⌫",   action: "backspace", variant: "operator" },
    { label: "%",    insert: "%",      variant: "operator" },
  ],
  [
    { label: "7",    variant: "number" },
    { label: "8",    variant: "number" },
    { label: "9",    variant: "number" },
    { label: "÷",    insert: "÷",      variant: "operator" },
    { label: "±",    action: "negate", variant: "operator" },
  ],
  [
    { label: "4",    variant: "number" },
    { label: "5",    variant: "number" },
    { label: "6",    variant: "number" },
    { label: "×",    insert: "×",      variant: "operator" },
    { label: "abs",  insert: "abs(",   variant: "fn" },
  ],
  [
    { label: "1",    variant: "number" },
    { label: "2",    variant: "number" },
    { label: "3",    variant: "number" },
    { label: "-",    insert: "-",      variant: "operator" },
    { label: "=",    action: "equals", variant: "equals" },
  ],
  [
    { label: "0",    variant: "number", wide: false },
    { label: ".",    variant: "number" },
    { label: "EXP", insert: "e",      variant: "fn" },
    { label: "+",    insert: "+",      variant: "operator" },
  ],
];

// ── Variant styles ────────────────────────────────────────────────────────────
const variantClass: Record<string, string> = {
  number:   "bg-card text-foreground border border-border hover:bg-muted",
  operator: "bg-muted text-foreground border border-border hover:bg-muted/80",
  fn:       "bg-muted/50 text-primary border border-border hover:bg-muted text-xs",
  primary:  "bg-primary text-primary-foreground hover:bg-primary/90",
  equals:   "bg-primary text-primary-foreground hover:bg-primary/90 row-span-2",
};

// ── Component ────────────────────────────────────────────────────────────────
export default function ScientificCalculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [angleMode, setAngleMode] = useState<"DEG" | "RAD">("DEG");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [justEvaled, setJustEvaled] = useState(false);

  const expressionRef = useRef(expression);
  const angleModeRef = useRef(angleMode);
  useEffect(() => { expressionRef.current = expression; }, [expression]);
  useEffect(() => { angleModeRef.current = angleMode; }, [angleMode]);

  // ── Live preview ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!expression) { setResult(""); return; }
    const r = safeEval(expression, angleMode);
    if (r !== "Error") setResult(r);
    else setResult("");
  }, [expression, angleMode]);

  // ── Core actions ────────────────────────────────────────────────────────
  const evaluate = useCallback(() => {
    const expr = expressionRef.current;
    if (!expr) return;
    const r = safeEval(expr, angleModeRef.current);
    setResult(r);
    if (r !== "Error") {
      setHistory((prev) => [{ expr, result: r }, ...prev].slice(0, 10));
      setExpression(r);
      setJustEvaled(true);
    }
  }, []);

  const append = useCallback((text: string) => {
    setExpression((prev) => {
      if (justEvaled && /^[0-9(πe√]/.test(text)) {
        setJustEvaled(false);
        return text;
      }
      setJustEvaled(false);
      return prev + text;
    });
  }, [justEvaled]);

  const handleButton = useCallback((btn: CalcButton) => {
    if (btn.action === "clear") {
      setExpression("");
      setResult("");
      setJustEvaled(false);
      return;
    }
    if (btn.action === "backspace") {
      setExpression((prev) => prev.slice(0, -1));
      setJustEvaled(false);
      return;
    }
    if (btn.action === "equals") {
      evaluate();
      return;
    }
    if (btn.action === "negate") {
      setExpression((prev) => {
        if (prev.startsWith("-")) return prev.slice(1);
        return "-" + prev;
      });
      return;
    }
    if (btn.action === "square") {
      setExpression((prev) => `(${prev})^2`);
      return;
    }
    if (btn.action === "reciprocal") {
      setExpression((prev) => `1÷(${prev})`);
      return;
    }
    if (btn.action === "factorial") {
      // Evaluate current expression, compute factorial
      const r = safeEval(expressionRef.current, angleModeRef.current);
      const n = parseFloat(r);
      const f = factorial(n);
      const fStr = isFinite(f) ? String(f) : f > 0 ? "Infinity" : "NaN";
      const expr = expressionRef.current;
      setHistory((prev) => [{ expr: `(${expr})!`, result: fStr }, ...prev].slice(0, 10));
      setExpression(fStr);
      setResult(fStr);
      setJustEvaled(true);
      return;
    }

    append(btn.insert ?? btn.label);
  }, [evaluate, append]);

  // ── Keyboard input ──────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't intercept if user is typing in another input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Enter" || e.key === "=") { evaluate(); return; }
      if (e.key === "Backspace") { setExpression((p) => p.slice(0, -1)); return; }
      if (e.key === "Escape") { setExpression(""); setResult(""); return; }

      const allowed = "0123456789.+-*/()%^";
      if (allowed.includes(e.key)) {
        const mapped: Record<string, string> = { "*": "×", "/": "÷" };
        append(mapped[e.key] ?? e.key);
        return;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [evaluate, append]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Scientific Calculator</h1>
        <p className="text-sm text-muted-foreground">
          Full scientific calculator with trigonometry, logarithms, and more. Supports keyboard input and keeps a history of your last 10 calculations.
        </p>
      </div>

      {/* Display */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* DEG/RAD toggle in display header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2">
          <span className="text-xs text-muted-foreground">Angle mode</span>
          <button
            onClick={() => setAngleMode((m) => m === "DEG" ? "RAD" : "DEG")}
            className="rounded border border-border bg-background px-2 py-0.5 text-xs font-bold text-foreground hover:bg-muted"
          >
            {angleMode}
          </button>
        </div>
        <div className="px-4 py-3 space-y-1 text-right min-h-[88px] flex flex-col justify-end">
          <p className="font-mono text-sm text-muted-foreground truncate min-h-[1.2em]">
            {expression || "0"}
          </p>
          <p className="font-mono text-3xl font-bold text-foreground truncate">
            {result || (expression ? "" : "0")}
          </p>
        </div>
      </div>

      {/* Button grid */}
      <div className="space-y-1.5">
        {BUTTON_ROWS.map((row, ri) => (
          <div key={ri} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}>
            {row.map((btn, bi) => (
              <button
                key={bi}
                onClick={() => handleButton(btn)}
                className={`h-12 rounded-lg text-sm font-semibold transition-colors active:scale-95 ${
                  variantClass[btn.variant ?? "number"]
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">History</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setHistory([])}
            >
              Clear
            </Button>
          </div>
          <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
            {history.map((entry, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm cursor-pointer hover:bg-muted/50"
                onClick={() => { setExpression(entry.result); setResult(entry.result); setJustEvaled(true); }}
              >
                <span className="text-muted-foreground font-mono truncate mr-2">{entry.expr}</span>
                <span className="font-mono font-semibold text-foreground shrink-0">= {entry.result}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="border-t border-border pt-4 text-xs text-muted-foreground">
        Expressions are evaluated via <code>new Function()</code> with strict sanitization. Keyboard shortcuts: digits, operators, Enter (=), Backspace, Escape (clear).
      </p>
    </div>
  );
}
