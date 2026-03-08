"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";

// ─── LCS-based diff ────────────────────────────────────────────────────────────

type DiffOp = "equal" | "insert" | "delete";

interface DiffLine {
  op: DiffOp;
  text: string;
}

/**
 * Compute a line-by-line diff using the Longest Common Subsequence algorithm.
 * Returns an array of DiffLine objects describing each output line.
 */
function computeDiff(original: string, modified: string): DiffLine[] {
  const aLines = original === "" ? [] : original.split("\n");
  const bLines = modified === "" ? [] : modified.split("\n");

  const m = aLines.length;
  const n = bLines.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (aLines[i - 1] === bLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to produce diff
  const result: DiffLine[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aLines[i - 1] === bLines[j - 1]) {
      result.push({ op: "equal", text: aLines[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ op: "insert", text: bLines[j - 1] });
      j--;
    } else {
      result.push({ op: "delete", text: aLines[i - 1] });
      i--;
    }
  }

  return result.reverse();
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function TextDiff() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [showOnlyChanges, setShowOnlyChanges] = useState(false);

  const diff = useMemo(() => computeDiff(original, modified), [original, modified]);

  const added = useMemo(() => diff.filter((d) => d.op === "insert").length, [diff]);
  const removed = useMemo(() => diff.filter((d) => d.op === "delete").length, [diff]);

  const visibleLines = useMemo(
    () => (showOnlyChanges ? diff.filter((d) => d.op !== "equal") : diff),
    [diff, showOnlyChanges]
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Input textareas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="original-text">Original</Label>
          <textarea
            id="original-text"
            className="h-48 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Paste original text here…"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="modified-text">Modified</Label>
          <textarea
            id="modified-text"
            className="h-48 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Paste modified text here…"
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Stats & controls */}
      {(original || modified) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-3 text-sm">
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-green-700 dark:text-green-400 font-medium">
              +{added} added
            </span>
            <span className="rounded-full bg-red-500/10 px-3 py-1 text-red-700 dark:text-red-400 font-medium">
              −{removed} removed
            </span>
            {added === 0 && removed === 0 && (
              <span className="text-muted-foreground">No differences found</span>
            )}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-primary"
              checked={showOnlyChanges}
              onChange={(e) => setShowOnlyChanges(e.target.checked)}
            />
            Show only changes
          </label>
        </div>
      )}

      {/* Diff view */}
      {(original || modified) && (
        <div className="rounded-xl border border-border overflow-hidden">
          {visibleLines.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No changes to display
            </div>
          )}
          <div className="font-mono text-sm divide-y divide-border">
            {visibleLines.map((line, idx) => {
              const isInsert = line.op === "insert";
              const isDelete = line.op === "delete";
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 px-3 py-1 ${
                    isInsert
                      ? "bg-green-500/10 text-green-800 dark:text-green-300"
                      : isDelete
                      ? "bg-red-500/10 text-red-800 dark:text-red-300"
                      : "bg-background text-foreground"
                  }`}
                >
                  <span className="shrink-0 w-4 text-center select-none opacity-60">
                    {isInsert ? "+" : isDelete ? "−" : " "}
                  </span>
                  <span className="whitespace-pre-wrap break-all">{line.text || "\u00a0"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!original && !modified && (
        <p className="text-center text-sm text-muted-foreground">
          Paste text into both fields above to see a line-by-line diff.
        </p>
      )}
    </div>
  );
}
