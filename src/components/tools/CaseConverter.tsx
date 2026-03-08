"use client";
/**
 * Case Converter Tool
 * Transforms text between UPPERCASE, lowercase, Title Case, Sentence case,
 * camelCase, snake_case, and kebab-case. Includes clipboard copy with feedback.
 * Zero external dependencies.
 */
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

// ── Transformation functions ──────────────────────────────────────────────────

function toUpperCase(text: string): string {
  return text.toUpperCase();
}

function toLowerCase(text: string): string {
  return text.toLowerCase();
}

function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s+\w)/g, (char) => char.toUpperCase());
}

function toCamelCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, char: string) => char.toUpperCase());
}

function toSnakeCase(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function toKebabCase(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── Button config ─────────────────────────────────────────────────────────────

interface CaseOption {
  label: string;
  fn: (text: string) => string;
}

const CASE_OPTIONS: CaseOption[] = [
  { label: "UPPERCASE",      fn: toUpperCase    },
  { label: "lowercase",      fn: toLowerCase    },
  { label: "Title Case",     fn: toTitleCase    },
  { label: "Sentence case",  fn: toSentenceCase },
  { label: "camelCase",      fn: toCamelCase    },
  { label: "snake_case",     fn: toSnakeCase    },
  { label: "kebab-case",     fn: toKebabCase    },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function CaseConverter() {
  const [input, setInput]     = useState("");
  const [result, setResult]   = useState("");
  const [activeCase, setActiveCase] = useState<string | null>(null);
  const [copied, setCopied]   = useState(false);

  const applyCase = useCallback((option: CaseOption) => {
    setResult(option.fn(input));
    setActiveCase(option.label);
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: silently fail
    }
  }, [result]);

  const handleClear = useCallback(() => {
    setInput("");
    setResult("");
    setActiveCase(null);
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Case Converter</h1>
        <p className="text-sm text-muted-foreground">
          Type or paste your text, then choose a case transformation to apply.
        </p>
      </div>

      {/* ── Input ────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="case-input">
          Input text
        </label>
        <textarea
          id="case-input"
          className="w-full min-h-[120px] resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          rows={5}
          placeholder="Type or paste your text here…"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (activeCase) {
              const option = CASE_OPTIONS.find((o) => o.label === activeCase);
              if (option) setResult(option.fn(e.target.value));
            }
          }}
          aria-label="Input text"
        />
      </div>

      {/* ── Case buttons ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {CASE_OPTIONS.map((option) => (
          <Button
            key={option.label}
            variant={activeCase === option.label ? "default" : "outline"}
            size="sm"
            onClick={() => applyCase(option)}
            disabled={!input}
            className="font-mono text-xs"
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* ── Result ───────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground" htmlFor="case-output">
            Result
            {activeCase && (
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                — {activeCase}
              </span>
            )}
          </label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!result}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!input && !result}
            >
              Clear
            </Button>
          </div>
        </div>
        <textarea
          id="case-output"
          className="w-full min-h-[120px] resize-y rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          rows={5}
          readOnly
          value={result}
          placeholder="Converted text will appear here…"
          aria-label="Converted text output"
        />
      </div>
    </div>
  );
}
