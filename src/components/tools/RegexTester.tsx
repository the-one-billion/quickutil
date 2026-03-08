"use client";
/**
 * Regex Tester
 * Pattern + flags, test string textarea, live match highlighting,
 * match list with index / value / groups. Error banner for bad patterns.
 */
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ── Types ────────────────────────────────────────────────────────────────────
type Flag = "g" | "i" | "m" | "s" | "u";

interface MatchResult {
  index: number;
  value: string;
  groups: Record<string, string> | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function buildRegex(pattern: string, flags: Set<Flag>): { regex: RegExp; error: null } | { regex: null; error: string } {
  if (!pattern) return { regex: null, error: null } as unknown as { regex: RegExp; error: null };
  try {
    const flagStr = Array.from(flags).join("") + (flags.has("g") ? "" : "g");
    // Always include 'g' for match iteration; caller notes when user didn't request it
    const f = Array.from(new Set([...Array.from(flags), "g"])).join("");
    const regex = new RegExp(pattern, f);
    return { regex, error: null };
  } catch (e) {
    return { regex: null, error: (e as Error).message };
  }
}

/** Split testStr into alternating [non-match, match, non-match, match …] segments */
interface Segment {
  text: string;
  isMatch: boolean;
}

function buildSegments(testStr: string, regex: RegExp): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  // We need a fresh exec-loop because the regex already has 'g'
  const re = new RegExp(regex.source, regex.flags);
  let match: RegExpExecArray | null;
  while ((match = re.exec(testStr)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: testStr.slice(lastIndex, match.index), isMatch: false });
    }
    segments.push({ text: match[0], isMatch: true });
    lastIndex = re.lastIndex;
    // avoid infinite loop on zero-length match
    if (match[0].length === 0) {
      re.lastIndex++;
    }
  }
  if (lastIndex < testStr.length) {
    segments.push({ text: testStr.slice(lastIndex), isMatch: false });
  }
  return segments;
}

function collectMatches(testStr: string, regex: RegExp): MatchResult[] {
  const results: MatchResult[] = [];
  const re = new RegExp(regex.source, regex.flags);
  let match: RegExpExecArray | null;
  while ((match = re.exec(testStr)) !== null) {
    results.push({
      index: match.index,
      value: match[0],
      groups: match.groups ? { ...match.groups } : null,
    });
    if (match[0].length === 0) re.lastIndex++;
  }
  return results;
}

// ── Component ────────────────────────────────────────────────────────────────
const ALL_FLAGS: Flag[] = ["g", "i", "m", "s", "u"];
const FLAG_LABELS: Record<Flag, string> = {
  g: "global (g)",
  i: "case insensitive (i)",
  m: "multiline (m)",
  s: "dotAll (s)",
  u: "unicode (u)",
};

export default function RegexTester() {
  const [pattern, setPattern] = useState("(\\w+)");
  const [flags, setFlags] = useState<Set<Flag>>(new Set(["g"]));
  const [testStr, setTestStr] = useState("Hello World! Testing 123 regex patterns.");

  function toggleFlag(flag: Flag) {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      return next;
    });
  }

  const { regex, error } = useMemo(() => buildRegex(pattern, flags), [pattern, flags]);

  const segments = useMemo<Segment[]>(() => {
    if (!regex || !testStr) return [{ text: testStr, isMatch: false }];
    try {
      return buildSegments(testStr, regex);
    } catch {
      return [{ text: testStr, isMatch: false }];
    }
  }, [regex, testStr]);

  const matches = useMemo<MatchResult[]>(() => {
    if (!regex || !testStr) return [];
    try {
      return collectMatches(testStr, regex);
    } catch {
      return [];
    }
  }, [regex, testStr]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Regex Tester</h1>
        <p className="text-sm text-muted-foreground">
          Test regular expressions live. Matches are highlighted inline and listed below with index and capture groups.
        </p>
      </div>

      {/* Pattern */}
      <div className="space-y-1.5">
        <Label htmlFor="pattern">Pattern</Label>
        <div className="flex items-center gap-1">
          <span className="text-lg text-muted-foreground font-mono select-none">/</span>
          <Input
            id="pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="(\w+)"
            className={`font-mono ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            spellCheck={false}
          />
          <span className="text-lg text-muted-foreground font-mono select-none">
            /{Array.from(flags).join("")}
          </span>
        </div>
        {error && (
          <div className="rounded-lg border border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            <span className="font-semibold">Invalid pattern: </span>{error}
          </div>
        )}
      </div>

      {/* Flags */}
      <div className="space-y-2">
        <Label>Flags</Label>
        <div className="flex flex-wrap gap-2">
          {ALL_FLAGS.map((flag) => (
            <button
              key={flag}
              onClick={() => toggleFlag(flag)}
              className={`rounded-full border px-3 py-1 text-xs font-mono transition-colors ${
                flags.has(flag)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              {FLAG_LABELS[flag]}
            </button>
          ))}
        </div>
      </div>

      {/* Test string */}
      <div className="space-y-1.5">
        <Label htmlFor="test-str">Test String</Label>
        <textarea
          id="test-str"
          value={testStr}
          onChange={(e) => setTestStr(e.target.value)}
          rows={5}
          placeholder="Enter text to test your regex against…"
          spellCheck={false}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono resize-y min-h-[100px]"
        />
      </div>

      {/* Highlighted preview */}
      {testStr && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Highlighted Preview</Label>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              matches.length > 0
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                : "bg-muted text-muted-foreground"
            }`}>
              {matches.length} match{matches.length !== 1 ? "es" : ""}
            </span>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
            {segments.map((seg, i) =>
              seg.isMatch ? (
                <mark
                  key={i}
                  className="rounded bg-amber-200 text-amber-900 dark:bg-amber-700/60 dark:text-amber-100 px-0.5"
                >
                  {seg.text}
                </mark>
              ) : (
                <span key={i}>{seg.text}</span>
              )
            )}
          </div>
        </div>
      )}

      {/* Match list */}
      {matches.length > 0 && (
        <div className="space-y-2">
          <Label>Matches</Label>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {matches.map((m, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-semibold text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                    #{i + 1}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    index: {m.index}–{m.index + m.value.length}
                  </span>
                  <code className="font-mono bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 rounded px-1.5 py-0.5 text-xs break-all">
                    {m.value || "(empty)"}
                  </code>
                </div>
                {m.groups && Object.keys(m.groups).length > 0 && (
                  <div className="mt-2 space-y-0.5">
                    {Object.entries(m.groups).map(([key, val]) => (
                      <div key={key} className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{key}:</span>{" "}
                        <code className="font-mono">{val ?? "undefined"}</code>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="border-t border-border pt-4 text-xs text-muted-foreground">
        Uses native JavaScript RegExp. The global flag is always applied internally for match iteration.
      </p>
    </div>
  );
}
