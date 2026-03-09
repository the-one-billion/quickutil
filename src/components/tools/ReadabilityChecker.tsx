"use client";
/**
 * Readability Checker
 * Computes Flesch Reading Ease, FK Grade Level, Gunning Fog, SMOG,
 * ARI, Coleman-Liau from pasted text. All calculations are pure JS.
 */
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ── Syllable counter ───────────────────────────────────────────────────────────

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;

  // Remove silent trailing e (not if only vowel)
  let cleaned = w.endsWith("e") && w.length > 2 ? w.slice(0, -1) : w;

  // -tion / -sion / -cion → count as 1 syllable together
  cleaned = cleaned.replace(/[csz]ion/g, "shun");

  // Count vowel groups
  const vowelGroups = cleaned.match(/[aeiou]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;

  // Adjustments for common patterns
  if (w.endsWith("le") && w.length > 2 && !/[aeiou]l$/.test(w.slice(0, -1))) count++;
  if (w.endsWith("ly") && w.length > 4) count = Math.max(count, 2);
  if (w.endsWith("ed") && !(/[aeiou]ed$/.test(w))) count = Math.max(count - 1, 1);

  return Math.max(count, 1);
}

// ── Text stats ─────────────────────────────────────────────────────────────────

interface TextStats {
  charCount: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  syllableCount: number;
  polysyllableCount: number;  // 3+ syllables
  complexWordCount: number;   // 3+ syllables, not compound, not -ing/-ed/-es
  avgWordLength: number;
  avgSentenceLength: number;
  readingTime: number;   // seconds at 200 wpm
  speakingTime: number;  // seconds at 130 wpm
}

function isComplexWord(word: string): boolean {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (countSyllables(w) < 3) return false;
  // Exclude common suffixes that inflate syllable count artificially
  if (/ing$|ed$|es$/.test(w)) return false;
  // Exclude proper nouns (starts with uppercase) — we can't detect reliably in plain text
  return true;
}

function computeStats(text: string): TextStats {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      charCount: 0, wordCount: 0, sentenceCount: 0, paragraphCount: 0,
      syllableCount: 0, polysyllableCount: 0, complexWordCount: 0,
      avgWordLength: 0, avgSentenceLength: 0, readingTime: 0, speakingTime: 0,
    };
  }

  // Characters (letters only for ARI)
  const charCount = trimmed.replace(/\s/g, "").length;

  // Words
  const words = trimmed.match(/\b[a-zA-Z'-]+\b/g) || [];
  const wordCount = words.length;

  // Sentences: split on . ! ? followed by whitespace or end
  const sentences = trimmed.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim().length > 0);
  const sentenceCount = Math.max(sentences.length, 1);

  // Paragraphs: split on blank lines
  const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const paragraphCount = Math.max(paragraphs.length, 1);

  // Syllables
  let syllableCount = 0;
  let polysyllableCount = 0;
  let complexWordCount = 0;
  let totalWordLength = 0;

  for (const word of words) {
    const syl = countSyllables(word);
    syllableCount += syl;
    if (syl >= 3) {
      polysyllableCount++;
      if (isComplexWord(word)) complexWordCount++;
    }
    totalWordLength += word.replace(/[^a-zA-Z]/g, "").length;
  }

  const avgWordLength = wordCount > 0 ? totalWordLength / wordCount : 0;
  const avgSentenceLength = wordCount > 0 ? wordCount / sentenceCount : 0;
  const readingTime = wordCount / (200 / 60); // seconds
  const speakingTime = wordCount / (130 / 60);

  return {
    charCount, wordCount, sentenceCount, paragraphCount,
    syllableCount, polysyllableCount, complexWordCount,
    avgWordLength, avgSentenceLength, readingTime, speakingTime,
  };
}

// ── Readability formulas ───────────────────────────────────────────────────────

interface Scores {
  fleschEase: number;
  fleschKincaid: number;
  gunningFog: number;
  smog: number;
  ari: number;
  colemanLiau: number;
}

function computeScores(stats: TextStats): Scores | null {
  const { wordCount, sentenceCount, syllableCount, polysyllableCount, complexWordCount, charCount, avgSentenceLength } = stats;
  if (wordCount < 2 || sentenceCount < 1) return null;

  const syllPerWord = syllableCount / wordCount;
  const wordsPerSent = avgSentenceLength;

  const fleschEase = 206.835 - 1.015 * wordsPerSent - 84.6 * syllPerWord;
  const fleschKincaid = 0.39 * wordsPerSent + 11.8 * syllPerWord - 15.59;
  const gunningFog = 0.4 * (wordsPerSent + 100 * (complexWordCount / wordCount));
  const smog = sentenceCount >= 3
    ? 3 + Math.sqrt(polysyllableCount * (30 / sentenceCount))
    : 0;
  const ari = 4.71 * (charCount / wordCount) + 0.5 * wordsPerSent - 21.43;

  // Coleman-Liau: L = avg letters per 100 words, S = avg sentences per 100 words
  const L = (charCount / wordCount) * 100;
  const S = (sentenceCount / wordCount) * 100;
  const colemanLiau = 0.0588 * L - 0.296 * S - 15.8;

  return { fleschEase, fleschKincaid, gunningFog, smog, ari, colemanLiau };
}

// ── Grade level label helpers ──────────────────────────────────────────────────

function fleschEaseLabel(score: number): { label: string; audience: string; color: string } {
  if (score >= 90) return { label: "Very Easy", audience: "5th grade", color: "green" };
  if (score >= 80) return { label: "Easy", audience: "6th grade", color: "green" };
  if (score >= 70) return { label: "Fairly Easy", audience: "7th grade", color: "emerald" };
  if (score >= 60) return { label: "Standard", audience: "8th–9th grade", color: "amber" };
  if (score >= 50) return { label: "Fairly Difficult", audience: "10th–12th grade", color: "orange" };
  if (score >= 30) return { label: "Difficult", audience: "College level", color: "red" };
  return { label: "Very Difficult", audience: "Academic / Professional", color: "red" };
}

function gradeLabel(grade: number): { audience: string; color: string } {
  if (grade <= 6) return { audience: "Elementary school", color: "green" };
  if (grade <= 8) return { audience: "Middle school", color: "emerald" };
  if (grade <= 10) return { audience: "High school", color: "amber" };
  if (grade <= 12) return { audience: "High school senior", color: "orange" };
  if (grade <= 16) return { audience: "College level", color: "red" };
  return { audience: "Academic / Professional", color: "red" };
}

function colorClasses(color: string): { bg: string; text: string; border: string } {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    green:   { bg: "bg-green-500/10",  text: "text-green-700 dark:text-green-400",  border: "border-green-500/30" },
    emerald: { bg: "bg-emerald-500/10",text: "text-emerald-700 dark:text-emerald-400",border: "border-emerald-500/30" },
    amber:   { bg: "bg-amber-500/10",  text: "text-amber-700 dark:text-amber-400",  border: "border-amber-500/30" },
    orange:  { bg: "bg-orange-500/10", text: "text-orange-700 dark:text-orange-400", border: "border-orange-500/30" },
    red:     { bg: "bg-red-500/10",    text: "text-red-700 dark:text-red-400",       border: "border-red-500/30" },
  };
  return map[color] ?? map.amber;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// ── Component ──────────────────────────────────────────────────────────────────

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. This sentence contains most letters of the alphabet. Readability scores measure how easy it is to understand written text. Simple sentences with common words score higher on the Flesch Reading Ease scale. Complex vocabulary and long sentences reduce readability and make text harder to follow.`;

export default function ReadabilityChecker() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [analyzed, setAnalyzed] = useState(true);

  const stats = useMemo<TextStats>(() => (analyzed ? computeStats(text) : computeStats("")), [text, analyzed]);
  const scores = useMemo<Scores | null>(() => (analyzed ? computeScores(stats) : null), [stats, analyzed]);

  const easeInfo = scores ? fleschEaseLabel(scores.fleschEase) : null;
  const easeGauge = scores ? Math.max(0, Math.min(100, scores.fleschEase)) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Readability Checker</h1>
        <p className="text-sm text-muted-foreground">
          Analyze text readability using 6 industry-standard formulas including Flesch, Gunning Fog, SMOG, and more.
        </p>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <Label htmlFor="text-input">Paste your text</Label>
        <Textarea
          id="text-input"
          value={text}
          onChange={(e) => { setText(e.target.value); setAnalyzed(false); }}
          rows={8}
          placeholder="Paste your article, blog post, or any text here…"
          className="resize-y font-sans text-sm min-h-[160px]"
        />
        <Button onClick={() => setAnalyzed(true)} disabled={!text.trim()}>
          Analyze Readability
        </Button>
      </div>

      {analyzed && stats.wordCount > 0 && (
        <>
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Words", value: stats.wordCount.toLocaleString() },
              { label: "Sentences", value: stats.sentenceCount.toLocaleString() },
              { label: "Paragraphs", value: stats.paragraphCount.toLocaleString() },
              { label: "Syllables", value: stats.syllableCount.toLocaleString() },
              { label: "Avg word length", value: stats.avgWordLength.toFixed(1) + " chars" },
              { label: "Avg sentence", value: stats.avgSentenceLength.toFixed(1) + " words" },
              { label: "Reading time", value: formatTime(stats.readingTime) },
              { label: "Speaking time", value: formatTime(stats.speakingTime) },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-card px-4 py-3 text-center">
                <div className="text-lg font-bold text-foreground">{item.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>

          {scores ? (
            <>
              {/* Flesch Ease gauge */}
              <div className={`rounded-xl border px-5 py-4 space-y-3 ${colorClasses(easeInfo!.color).border} ${colorClasses(easeInfo!.color).bg}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Flesch Reading Ease</div>
                    <div className={`text-3xl font-bold mt-1 ${colorClasses(easeInfo!.color).text}`}>
                      {scores.fleschEase.toFixed(1)}
                    </div>
                    <div className={`text-sm font-medium mt-0.5 ${colorClasses(easeInfo!.color).text}`}>{easeInfo!.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Audience: {easeInfo!.audience}</div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>0 = Very difficult</div>
                    <div>100 = Very easy</div>
                  </div>
                </div>
                {/* Gauge bar */}
                <div className="space-y-1">
                  <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                      style={{
                        width: `${easeGauge}%`,
                        background: easeGauge >= 70 ? "#22c55e" : easeGauge >= 50 ? "#f59e0b" : "#ef4444",
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Very Difficult</span>
                    <span>Standard</span>
                    <span>Very Easy</span>
                  </div>
                </div>
              </div>

              {/* Score grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    name: "Flesch-Kincaid Grade",
                    value: scores.fleschKincaid,
                    fmt: (v: number) => v.toFixed(1),
                    info: gradeLabel(scores.fleschKincaid),
                    note: "US school grade level",
                  },
                  {
                    name: "Gunning Fog Index",
                    value: scores.gunningFog,
                    fmt: (v: number) => v.toFixed(1),
                    info: gradeLabel(scores.gunningFog),
                    note: "Years of formal education needed",
                  },
                  {
                    name: "SMOG Index",
                    value: scores.smog,
                    fmt: (v: number) => (stats.sentenceCount < 3 ? "N/A" : v.toFixed(1)),
                    info: stats.sentenceCount < 3 ? { audience: "Needs ≥ 3 sentences", color: "amber" } : gradeLabel(scores.smog),
                    note: "Simple Measure of Gobbledygook",
                  },
                  {
                    name: "Automated Readability (ARI)",
                    value: scores.ari,
                    fmt: (v: number) => v.toFixed(1),
                    info: gradeLabel(scores.ari),
                    note: "Based on character & word counts",
                  },
                  {
                    name: "Coleman-Liau Index",
                    value: scores.colemanLiau,
                    fmt: (v: number) => v.toFixed(1),
                    info: gradeLabel(scores.colemanLiau),
                    note: "Based on letters, not syllables",
                  },
                ].map((item) => {
                  const c = colorClasses(item.info.color);
                  const displayVal = item.fmt(item.value);
                  return (
                    <div key={item.name} className={`rounded-xl border px-4 py-4 space-y-2 ${c.border} ${c.bg}`}>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{item.name}</div>
                      <div className={`text-2xl font-bold ${c.text}`}>{displayVal}</div>
                      <div className="space-y-0.5">
                        <div className={`text-sm font-medium ${c.text}`}>{item.info.audience}</div>
                        <div className="text-xs text-muted-foreground">{item.note}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
              Add more text (at least 2 words and 1 sentence) to see readability scores.
            </div>
          )}
        </>
      )}

      {analyzed && stats.wordCount === 0 && text.trim() && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          No readable words found. Make sure the text contains letters.
        </div>
      )}

      <p className="border-t border-border pt-4 text-xs text-muted-foreground">
        All calculations are performed client-side. Reading time assumes 200 wpm; speaking time assumes 130 wpm.
      </p>
    </div>
  );
}
