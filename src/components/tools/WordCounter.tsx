"use client";
/**
 * Word Counter Tool
 * Counts words, characters, sentences, paragraphs, and estimated reading time.
 * All stats update live on every keystroke. Zero external dependencies.
 */
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

// ── Stat helpers ──────────────────────────────────────────────────────────────

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function countCharsWithSpaces(text: string): number {
  return text.length;
}

function countCharsNoSpaces(text: string): number {
  return text.replace(/\s/g, "").length;
}

function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[^.!?]*[.!?]+/g);
  return matches ? matches.length : (trimmed.length > 0 ? 1 : 0);
}

function countParagraphs(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\n\s*\n+/).filter((p) => p.trim().length > 0).length;
}

function readingTime(words: number): string {
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/30 p-4 gap-1">
      <span className="text-2xl font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WordCounter() {
  const [text, setText] = useState("");

  const handleClear = useCallback(() => setText(""), []);

  const words      = countWords(text);
  const charsWith  = countCharsWithSpaces(text);
  const charsNo    = countCharsNoSpaces(text);
  const sentences  = countSentences(text);
  const paragraphs = countParagraphs(text);
  const reading    = readingTime(words);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Word Counter</h1>
        <p className="text-sm text-muted-foreground">
          Paste or type your text below. Stats update instantly as you type.
        </p>
      </div>

      {/* ── Textarea ─────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <textarea
          className="w-full min-h-[200px] resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          rows={8}
          placeholder="Start typing or paste your text here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Input text"
          spellCheck
        />
      </div>

      {/* ── Stats grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Words" value={words} />
        <StatCard label="Characters (with spaces)" value={charsWith} />
        <StatCard label="Characters (no spaces)" value={charsNo} />
        <StatCard label="Sentences" value={sentences} />
        <StatCard label="Paragraphs" value={paragraphs} />
        <StatCard label="Reading Time" value={reading} />
      </div>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleClear} disabled={!text}>
          Clear
        </Button>
      </div>
    </div>
  );
}
