"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// ─── Myers Diff Algorithm ─────────────────────────────────────────────────────

type EditType = "equal" | "add" | "remove";

interface Edit {
  type: EditType;
  text: string;
  oldLineNum: number | null;
  newLineNum: number | null;
}

interface SideBySideLine {
  type: "equal" | "add" | "remove" | "modify";
  oldLine: string | null;
  newLine: string | null;
  oldLineNum: number | null;
  newLineNum: number | null;
}

function myersDiff(a: string[], b: string[]): Array<{ type: "equal" | "insert" | "delete"; aIdx: number; bIdx: number }> {
  const n = a.length, m = b.length;
  const max = n + m;
  const v: number[] = new Array(2 * max + 1).fill(0);
  const trace: number[][] = [];

  for (let d = 0; d <= max; d++) {
    trace.push([...v]);
    for (let k = -d; k <= d; k += 2) {
      let x: number;
      const ki = k + max;
      if (k === -d || (k !== d && v[ki - 1] < v[ki + 1])) {
        x = v[ki + 1];
      } else {
        x = v[ki - 1] + 1;
      }
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) { x++; y++; }
      v[ki] = x;
      if (x >= n && y >= m) {
        // Backtrack
        return backtrack(trace, a, b, n, m, max);
      }
    }
  }
  return backtrack(trace, a, b, n, m, max);
}

function backtrack(
  trace: number[][],
  a: string[],
  b: string[],
  n: number,
  m: number,
  max: number
): Array<{ type: "equal" | "insert" | "delete"; aIdx: number; bIdx: number }> {
  const edits: Array<{ type: "equal" | "insert" | "delete"; aIdx: number; bIdx: number }> = [];
  let x = n, y = m;

  for (let d = trace.length - 1; d >= 0; d--) {
    const v = trace[d];
    const k = x - y;
    const ki = k + max;
    let prevK: number;
    if (k === -d || (k !== d && v[ki - 1] < v[ki + 1])) {
      prevK = k + 1;
    } else {
      prevK = k - 1;
    }
    const prevX = v[prevK + max];
    const prevY = prevX - prevK;

    while (x > prevX + 1 && y > prevY + 1) {
      edits.push({ type: "equal", aIdx: x - 1, bIdx: y - 1 });
      x--; y--;
    }

    if (d > 0) {
      if (x === prevX) {
        edits.push({ type: "insert", aIdx: x, bIdx: y - 1 });
        y--;
      } else {
        edits.push({ type: "delete", aIdx: x - 1, bIdx: y });
        x--;
      }
    }

    while (x > prevX && y > prevY) {
      edits.push({ type: "equal", aIdx: x - 1, bIdx: y - 1 });
      x--; y--;
    }
  }

  return edits.reverse();
}

function computeLineDiff(
  original: string,
  modified: string,
  ignoreWhitespace: boolean,
  ignoreCase: boolean
): SideBySideLine[] {
  const normalize = (s: string) => {
    let r = s;
    if (ignoreWhitespace) r = r.replace(/\s+/g, " ").trim();
    if (ignoreCase) r = r.toLowerCase();
    return r;
  };

  const aRaw = original === "" ? [] : original.split("\n");
  const bRaw = modified === "" ? [] : modified.split("\n");
  const aNorm = aRaw.map(normalize);
  const bNorm = bRaw.map(normalize);

  const edits = myersDiff(aNorm, bNorm);

  // Build raw edit stream
  const rawEdits: Edit[] = [];
  let aLineNum = 1, bLineNum = 1;

  for (const edit of edits) {
    if (edit.type === "equal") {
      rawEdits.push({ type: "equal", text: aRaw[edit.aIdx], oldLineNum: aLineNum++, newLineNum: bLineNum++ });
    } else if (edit.type === "insert") {
      rawEdits.push({ type: "add", text: bRaw[edit.bIdx], oldLineNum: null, newLineNum: bLineNum++ });
    } else {
      rawEdits.push({ type: "remove", text: aRaw[edit.aIdx], oldLineNum: aLineNum++, newLineNum: null });
    }
  }

  // Pair up removes+adds into "modify" for side-by-side
  const result: SideBySideLine[] = [];
  let i = 0;
  while (i < rawEdits.length) {
    const cur = rawEdits[i];
    if (cur.type === "remove" && i + 1 < rawEdits.length && rawEdits[i + 1].type === "add") {
      const next = rawEdits[i + 1];
      result.push({
        type: "modify",
        oldLine: cur.text,
        newLine: next.text,
        oldLineNum: cur.oldLineNum,
        newLineNum: next.newLineNum,
      });
      i += 2;
    } else if (cur.type === "equal") {
      result.push({ type: "equal", oldLine: cur.text, newLine: cur.text, oldLineNum: cur.oldLineNum, newLineNum: cur.newLineNum });
      i++;
    } else if (cur.type === "add") {
      result.push({ type: "add", oldLine: null, newLine: cur.text, oldLineNum: null, newLineNum: cur.newLineNum });
      i++;
    } else {
      result.push({ type: "remove", oldLine: cur.text, newLine: null, oldLineNum: cur.oldLineNum, newLineNum: null });
      i++;
    }
  }

  return result;
}

// ─── Character-level diff for inline mode ────────────────────────────────────

function charDiff(a: string, b: string): Array<{ type: "equal" | "insert" | "delete"; text: string }> {
  const aChars = [...a];
  const bChars = [...b];
  const edits = myersDiff(aChars, bChars);
  const result: Array<{ type: "equal" | "insert" | "delete"; text: string }> = [];

  for (const e of edits) {
    if (e.type === "equal") result.push({ type: "equal", text: aChars[e.aIdx] });
    else if (e.type === "insert") result.push({ type: "insert", text: bChars[e.bIdx] });
    else result.push({ type: "delete", text: aChars[e.aIdx] });
  }

  return result;
}

// ─── Unified patch format ─────────────────────────────────────────────────────

function buildUnifiedPatch(lines: SideBySideLine[], oldName = "original", newName = "modified"): string {
  const patch: string[] = [];
  patch.push(`--- ${oldName}`);
  patch.push(`+++ ${newName}`);

  let oldLine = 1, newLine = 1;
  const chunks: string[][] = [];
  let current: string[] | null = null;
  let context = 0;

  for (const line of lines) {
    if (line.type === "equal") {
      if (current && context < 3) {
        current.push(` ${line.oldLine ?? ""}`);
        context++;
      } else if (current) {
        chunks.push(current);
        current = null;
        context = 0;
      }
    } else {
      if (!current) {
        current = [];
        // Add up to 3 context lines before
      }
      context = 0;
      if (line.type === "modify") {
        current.push(`-${line.oldLine ?? ""}`);
        current.push(`+${line.newLine ?? ""}`);
      } else if (line.type === "remove") {
        current.push(`-${line.oldLine ?? ""}`);
      } else if (line.type === "add") {
        current.push(`+${line.newLine ?? ""}`);
      }
    }
  }
  if (current) chunks.push(current);

  // Build @@ headers (simplified)
  let oLine = 1, nLine = 1;
  for (const chunk of chunks) {
    const oCount = chunk.filter(l => l.startsWith("-") || l.startsWith(" ")).length;
    const nCount = chunk.filter(l => l.startsWith("+") || l.startsWith(" ")).length;
    patch.push(`@@ -${oLine},${oCount} +${nLine},${nCount} @@`);
    chunk.forEach(l => patch.push(l));
    oLine += oCount;
    nLine += nCount;
  }

  void oldLine; void newLine;
  return patch.join("\n");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LineNumGutter({ num }: { num: number | null }) {
  return (
    <span className="select-none w-10 shrink-0 text-right pr-3 text-muted-foreground text-xs border-r border-border mr-2">
      {num ?? ""}
    </span>
  );
}

function InlineLine({ old: oldText, new: newText }: { old: string; new: string }) {
  const chars = charDiff(oldText, newText);
  return (
    <>
      <span>
        {chars.filter(c => c.type !== "insert").map((c, i) => (
          c.type === "delete"
            ? <span key={i} className="bg-red-400/40 dark:bg-red-500/30">{c.text}</span>
            : <span key={i}>{c.text}</span>
        ))}
      </span>
      <span className="mx-2 text-muted-foreground">→</span>
      <span>
        {chars.filter(c => c.type !== "delete").map((c, i) => (
          c.type === "insert"
            ? <span key={i} className="bg-green-400/40 dark:bg-green-500/30">{c.text}</span>
            : <span key={i}>{c.text}</span>
        ))}
      </span>
    </>
  );
}

const BG: Record<string, string> = {
  equal: "bg-background",
  add: "bg-green-500/10",
  remove: "bg-red-500/10",
  modify: "bg-yellow-400/10 dark:bg-yellow-500/10",
};

const TEXT: Record<string, string> = {
  equal: "text-foreground",
  add: "text-green-800 dark:text-green-300",
  remove: "text-red-800 dark:text-red-300",
  modify: "text-yellow-800 dark:text-yellow-300",
};

const PREFIX: Record<string, string> = {
  equal: " ",
  add: "+",
  remove: "−",
  modify: "~",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DiffChecker() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [inlineDiff, setInlineDiff] = useState(false);
  const [unifiedView, setUnifiedView] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [manualTrigger, setManualTrigger] = useState(0);
  const [copiedPatch, setCopiedPatch] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedOriginal, setDebouncedOriginal] = useState("");
  const [debouncedModified, setDebouncedModified] = useState("");
  const patchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce for live mode
  useEffect(() => {
    if (!liveMode) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedOriginal(original);
      setDebouncedModified(modified);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [original, modified, liveMode]);

  // Manual compare
  const handleCompare = useCallback(() => {
    setDebouncedOriginal(original);
    setDebouncedModified(modified);
    setManualTrigger(n => n + 1);
  }, [original, modified]);

  const diffLines = useMemo(
    () => computeLineDiff(debouncedOriginal, debouncedModified, ignoreWhitespace, ignoreCase),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedOriginal, debouncedModified, ignoreWhitespace, ignoreCase, manualTrigger]
  );

  const stats = useMemo(() => ({
    added: diffLines.filter(l => l.type === "add").length,
    removed: diffLines.filter(l => l.type === "remove").length,
    modified: diffLines.filter(l => l.type === "modify").length,
    unchanged: diffLines.filter(l => l.type === "equal").length,
  }), [diffLines]);

  const hasContent = original || modified;

  const copyPatch = useCallback(() => {
    const patch = buildUnifiedPatch(diffLines);
    void navigator.clipboard.writeText(patch).then(() => {
      setCopiedPatch(true);
      if (patchTimerRef.current) clearTimeout(patchTimerRef.current);
      patchTimerRef.current = setTimeout(() => setCopiedPatch(false), 1500);
    });
  }, [diffLines]);

  const clearAll = useCallback(() => {
    setOriginal("");
    setModified("");
    setDebouncedOriginal("");
    setDebouncedModified("");
  }, []);

  const textareaClass = "h-56 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
      {/* Input area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Original</Label>
          <textarea
            className={textareaClass}
            placeholder="Paste original text here…"
            value={original}
            onChange={e => setOriginal(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <Label>Modified</Label>
          <textarea
            className={textareaClass}
            placeholder="Paste modified text here…"
            value={modified}
            onChange={e => setModified(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" className="h-4 w-4 rounded accent-primary" checked={ignoreWhitespace} onChange={e => setIgnoreWhitespace(e.target.checked)} />
            Ignore whitespace
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" className="h-4 w-4 rounded accent-primary" checked={ignoreCase} onChange={e => setIgnoreCase(e.target.checked)} />
            Ignore case
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" className="h-4 w-4 rounded accent-primary" checked={inlineDiff} onChange={e => setInlineDiff(e.target.checked)} />
            Inline char diff
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" className="h-4 w-4 rounded accent-primary" checked={unifiedView} onChange={e => setUnifiedView(e.target.checked)} />
            Unified view
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" className="h-4 w-4 rounded accent-primary" checked={liveMode} onChange={e => setLiveMode(e.target.checked)} />
            Live diff
          </label>
        </div>
        <div className="flex gap-2">
          {!liveMode && (
            <Button size="sm" onClick={handleCompare}>Compare</Button>
          )}
          <Button size="sm" variant="outline" onClick={clearAll}>Clear</Button>
        </div>
      </div>

      {/* Stats */}
      {hasContent && (
        <div className="flex flex-wrap gap-2 items-center">
          <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 hover:bg-green-500/15">
            +{stats.added} added
          </Badge>
          <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 hover:bg-red-500/15">
            −{stats.removed} removed
          </Badge>
          {stats.modified > 0 && (
            <Badge className="bg-yellow-400/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30 hover:bg-yellow-400/15">
              ~{stats.modified} modified
            </Badge>
          )}
          <Badge variant="secondary">{stats.unchanged} unchanged</Badge>
          <div className="ml-auto">
            <Button size="sm" variant="outline" onClick={copyPatch} disabled={diffLines.length === 0}>
              {copiedPatch ? "Copied!" : "Copy Patch"}
            </Button>
          </div>
        </div>
      )}

      {/* Diff output */}
      {hasContent && diffLines.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden">
          {unifiedView ? (
            // Unified view
            <div className="font-mono text-sm divide-y divide-border">
              {diffLines.map((line, idx) => {
                if (line.type === "modify") {
                  return (
                    <div key={idx}>
                      <div className={`flex items-start px-3 py-1 ${BG.remove} ${TEXT.remove}`}>
                        <LineNumGutter num={line.oldLineNum} />
                        <span className="shrink-0 w-4 text-center select-none mr-2 opacity-60">−</span>
                        <span className="whitespace-pre-wrap break-all">{line.oldLine || "\u00a0"}</span>
                      </div>
                      <div className={`flex items-start px-3 py-1 ${BG.add} ${TEXT.add}`}>
                        <LineNumGutter num={line.newLineNum} />
                        <span className="shrink-0 w-4 text-center select-none mr-2 opacity-60">+</span>
                        <span className="whitespace-pre-wrap break-all">{line.newLine || "\u00a0"}</span>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={idx} className={`flex items-start px-3 py-1 ${BG[line.type]} ${TEXT[line.type]}`}>
                    <LineNumGutter num={line.type === "add" ? line.newLineNum : line.oldLineNum} />
                    <span className="shrink-0 w-4 text-center select-none mr-2 opacity-60">
                      {PREFIX[line.type]}
                    </span>
                    <span className="whitespace-pre-wrap break-all">
                      {(line.type === "add" ? line.newLine : line.oldLine) || "\u00a0"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            // Side-by-side view
            <div className="font-mono text-sm divide-y divide-border">
              {diffLines.map((line, idx) => {
                const bg = BG[line.type];
                return (
                  <div key={idx} className={`grid grid-cols-2 divide-x divide-border ${bg}`}>
                    {/* Left — old */}
                    <div className={`flex items-start px-3 py-1 ${line.type === "add" ? "bg-muted/50" : bg} ${line.type === "add" ? "text-muted-foreground" : TEXT[line.type]}`}>
                      <LineNumGutter num={line.oldLineNum} />
                      {line.oldLine !== null ? (
                        <>
                          <span className="shrink-0 w-4 text-center select-none mr-2 opacity-60">
                            {line.type === "remove" ? "−" : line.type === "modify" ? "~" : " "}
                          </span>
                          {inlineDiff && line.type === "modify" && line.newLine !== null ? (
                            <span className="whitespace-pre-wrap break-all">
                              {charDiff(line.oldLine, line.newLine)
                                .filter(c => c.type !== "insert")
                                .map((c, i) =>
                                  c.type === "delete"
                                    ? <span key={i} className="bg-red-400/50 rounded">{c.text}</span>
                                    : <span key={i}>{c.text}</span>
                                )}
                            </span>
                          ) : (
                            <span className="whitespace-pre-wrap break-all">{line.oldLine || "\u00a0"}</span>
                          )}
                        </>
                      ) : (
                        <span className="opacity-30 select-none whitespace-pre-wrap">{"empty"}</span>
                      )}
                    </div>
                    {/* Right — new */}
                    <div className={`flex items-start px-3 py-1 ${line.type === "remove" ? "bg-muted/50" : bg} ${line.type === "remove" ? "text-muted-foreground" : TEXT[line.type]}`}>
                      <LineNumGutter num={line.newLineNum} />
                      {line.newLine !== null ? (
                        <>
                          <span className="shrink-0 w-4 text-center select-none mr-2 opacity-60">
                            {line.type === "add" ? "+" : line.type === "modify" ? "~" : " "}
                          </span>
                          {inlineDiff && line.type === "modify" && line.oldLine !== null ? (
                            <span className="whitespace-pre-wrap break-all">
                              {charDiff(line.oldLine, line.newLine)
                                .filter(c => c.type !== "delete")
                                .map((c, i) =>
                                  c.type === "insert"
                                    ? <span key={i} className="bg-green-400/50 rounded">{c.text}</span>
                                    : <span key={i}>{c.text}</span>
                                )}
                            </span>
                          ) : (
                            <span className="whitespace-pre-wrap break-all">{line.newLine || "\u00a0"}</span>
                          )}
                        </>
                      ) : (
                        <span className="opacity-30 select-none whitespace-pre-wrap">{"empty"}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!hasContent && (
        <div className="rounded-xl border border-border bg-muted/30 p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Paste text into both fields above to see a diff. Supports live diffing (debounced 300ms) or manual compare.
          </p>
        </div>
      )}

      {hasContent && stats.added === 0 && stats.removed === 0 && stats.modified === 0 && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">No differences found</p>
        </div>
      )}
    </div>
  );
}
