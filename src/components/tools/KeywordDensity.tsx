"use client";
/**
 * Keyword Density Analyzer
 * Counts word frequency in pasted text, filters stop words, and shows
 * the top 20 keywords with density %, live-debounced at 300 ms.
 */
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

// ── Stop words ─────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","as","is","was","are","were","be","been","being","have",
  "has","had","do","does","did","will","would","could","should","may",
  "might","shall","can","not","no","nor","so","yet","both","either",
  "neither","each","few","more","most","other","some","such","than",
  "too","very","just","this","that","these","those","it","its","if",
  "then","else","when","where","who","which","what","how","why","all",
  "any","every","about","up","out","into","over","after","before",
  "between","into","through","during","about","against","without","within",
  "i","me","my","we","our","you","your","he","she","they","them","their",
  "us","him","her","his","hers","ours","yours","theirs","also","only",
  "even","well","back","there","here","now","still","however","although",
  "because","while","since","though","whether","off","own","same","down",
]);

// ── Types ──────────────────────────────────────────────────────────────────

interface KeywordRow {
  rank: number;
  word: string;
  count: number;
  density: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function analyze(text: string, minLen: number): { rows: KeywordRow[]; total: number; unique: number } {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= minLen && !STOP_WORDS.has(w) && /[a-z]/.test(w));

  const total = text.trim() ? text.trim().split(/\s+/).length : 0;
  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] ?? 0) + 1;

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const unique = sorted.length;

  const rows = sorted.slice(0, 20).map(([word, count], idx) => ({
    rank: idx + 1,
    word,
    count,
    density: total > 0 ? ((count / total) * 100).toFixed(2) : "0.00",
  }));

  return { rows, total, unique };
}

function toCSV(rows: KeywordRow[]): string {
  const header = "Rank,Keyword,Count,Density %";
  const body = rows.map((r) => `${r.rank},"${r.word}",${r.count},${r.density}`).join("\n");
  return `${header}\n${body}`;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function KeywordDensity() {
  const [rawText, setRawText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [minLen, setMinLen] = useState(4);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce text input 300 ms
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebounced(rawText), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [rawText]);

  const { rows, total, unique } = useMemo(() => analyze(debounced, minLen), [debounced, minLen]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q ? rows.filter((r) => r.word.includes(q)) : rows;
  }, [rows, search]);

  const topKeyword = rows[0]?.word ?? "—";

  const handleCopyCSV = useCallback(async () => {
    await navigator.clipboard.writeText(toCSV(rows));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [rows]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Keyword Density</h1>
        <p className="text-sm text-muted-foreground">
          Paste your text below to analyze keyword frequency and density.
        </p>
      </div>

      {/* Input textarea */}
      <textarea
        className="w-full min-h-[160px] resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
        placeholder="Paste or type your text here…"
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        aria-label="Input text"
      />

      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 space-y-1">
          <Label className="text-xs text-muted-foreground">
            Min word length: <span className="font-semibold text-foreground">{minLen}</span>
          </Label>
          <Slider
            min={2}
            max={10}
            step={1}
            value={[minLen]}
            onValueChange={([v]) => setMinLen(v)}
            className="w-full max-w-xs"
            aria-label="Minimum word length"
          />
        </div>
        <div className="flex-1">
          <Input
            placeholder="Filter keywords…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 text-sm"
            aria-label="Filter keywords"
          />
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Words", value: total.toLocaleString() },
          { label: "Unique Keywords", value: unique.toLocaleString() },
          { label: "Top Keyword", value: topKeyword },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/30 p-3 gap-0.5"
          >
            <span className="text-lg font-bold text-foreground truncate max-w-full">{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Results table */}
      {filtered.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground w-12">#</th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Keyword</th>
                <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">Count</th>
                <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">Density %</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr
                  key={row.word}
                  className={`border-b border-border last:border-0 transition-colors ${
                    idx % 2 === 0 ? "bg-background" : "bg-muted/10"
                  } hover:bg-muted/30`}
                >
                  <td className="px-4 py-2 text-muted-foreground tabular-nums">{row.rank}</td>
                  <td className="px-4 py-2 font-medium text-foreground">{row.word}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-foreground">{row.count}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-foreground">{row.density}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : debounced.trim() ? (
        <p className="text-center text-sm text-muted-foreground py-6">
          No keywords match your filters.
        </p>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-6">
          Enter some text above to see keyword analysis.
        </p>
      )}

      {/* Copy CSV */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyCSV}
          disabled={rows.length === 0}
        >
          {copied ? "Copied!" : "Copy as CSV"}
        </Button>
      </div>
    </div>
  );
}
