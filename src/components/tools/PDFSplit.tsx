"use client";
/**
 * PDF Split Tool
 * Uses pdf-lib (client-side) to extract pages or split every page.
 * No server. No uploads. 100% private.
 */
import { useState, useCallback, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, FileText, Download, Scissors, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/cn";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Parse a page-range string like "1-3, 5, 7-9" into 0-based page indices.
 * Returns null if the format is invalid.
 */
function parsePageRange(input: string, total: number): number[] | null {
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  const indices = new Set<number>();

  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)-(\d+)$/);
    const singleMatch = part.match(/^(\d+)$/);

    if (rangeMatch) {
      const from = parseInt(rangeMatch[1], 10);
      const to   = parseInt(rangeMatch[2], 10);
      if (from < 1 || to > total || from > to) return null;
      for (let p = from; p <= to; p++) indices.add(p - 1);
    } else if (singleMatch) {
      const page = parseInt(singleMatch[1], 10);
      if (page < 1 || page > total) return null;
      indices.add(page - 1);
    } else {
      return null;
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}

function triggerDownload(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Component ─────────────────────────────────────────────────────────────────

type Status = "idle" | "processing" | "done" | "error";

export default function PDFSplit() {
  const [file,        setFile]        = useState<File | null>(null);
  const [pageCount,   setPageCount]   = useState<number>(0);
  const [isDragging,  setIsDragging]  = useState(false);
  const [rangeInput,  setRangeInput]  = useState("");
  const [rangeError,  setRangeError]  = useState("");
  const [progress,    setProgress]    = useState(0);
  const [status,      setStatus]      = useState<Status>("idle");
  const [errorMsg,    setErrorMsg]    = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ── File loading ────────────────────────────────────────────────────────────

  const loadFile = useCallback(async (incoming: File) => {
    if (incoming.type !== "application/pdf") {
      setErrorMsg("Please select a valid PDF file.");
      setStatus("error");
      return;
    }
    try {
      const bytes  = await incoming.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes);
      setFile(incoming);
      setPageCount(srcDoc.getPageCount());
      setStatus("idle");
      setErrorMsg("");
      setRangeInput("");
      setRangeError("");
      setProgress(0);
    } catch {
      setErrorMsg("Failed to read the PDF. Ensure it is a valid, unencrypted file.");
      setStatus("error");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) void loadFile(dropped);
    },
    [loadFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) void loadFile(picked);
  };

  // ── Validate range input on change ─────────────────────────────────────────

  const handleRangeChange = (value: string) => {
    setRangeInput(value);
    if (value.trim() === "") {
      setRangeError("");
      return;
    }
    const parsed = parsePageRange(value, pageCount);
    setRangeError(
      parsed === null
        ? `Invalid range. Use format like "1-3, 5, 7-9" (pages 1–${pageCount}).`
        : ""
    );
  };

  // ── Extract pages ───────────────────────────────────────────────────────────

  const handleExtract = async () => {
    if (!file) return;
    const indices = parsePageRange(rangeInput, pageCount);
    if (!indices) {
      setRangeError(`Invalid range. Use format like "1-3, 5" (pages 1–${pageCount}).`);
      return;
    }

    setStatus("processing");
    setProgress(0);
    setErrorMsg("");

    try {
      const bytes  = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes);
      setProgress(30);

      const outDoc  = await PDFDocument.create();
      const copied  = await outDoc.copyPages(srcDoc, indices);
      copied.forEach((p) => outDoc.addPage(p));
      setProgress(80);

      const outBytes = await outDoc.save();
      const baseName = file.name.replace(/\.pdf$/i, "");
      triggerDownload(outBytes, `${baseName}_pages.pdf`);
      setProgress(100);
      setStatus("done");
    } catch {
      setErrorMsg("Failed to extract pages. The PDF may be encrypted or malformed.");
      setStatus("error");
    }
  };

  // ── Split all ───────────────────────────────────────────────────────────────

  const handleSplitAll = async () => {
    if (!file || pageCount === 0) return;
    setStatus("processing");
    setProgress(0);
    setErrorMsg("");

    try {
      const bytes  = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes);
      const baseName = file.name.replace(/\.pdf$/i, "");

      for (let i = 0; i < pageCount; i++) {
        const outDoc   = await PDFDocument.create();
        const [copied] = await outDoc.copyPages(srcDoc, [i]);
        outDoc.addPage(copied);
        const outBytes = await outDoc.save();
        const padded   = String(i + 1).padStart(String(pageCount).length, "0");
        triggerDownload(outBytes, `${baseName}_page${padded}.pdf`);

        setProgress(Math.round(((i + 1) / pageCount) * 100));

        // Stagger downloads so the browser doesn't suppress them
        if (i < pageCount - 1) await sleep(200);
      }

      setStatus("done");
    } catch {
      setErrorMsg("Failed to split the PDF. The file may be encrypted or malformed.");
      setStatus("error");
    }
  };

  // ── Reset ───────────────────────────────────────────────────────────────────

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setStatus("idle");
    setProgress(0);
    setErrorMsg("");
    setRangeInput("");
    setRangeError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Drop zone */}
      {!file && (
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border",
            "px-6 py-14 text-center transition-colors cursor-pointer",
            "hover:border-primary/60 hover:bg-muted/30",
            isDragging && "border-primary bg-primary/5"
          )}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">Drop a PDF here</p>
          <p className="text-sm text-muted-foreground">or click to select a file</p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* File info bar */}
      {file && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <FileText className="h-5 w-5 shrink-0 text-red-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatSize(file.size)} · {pageCount} page{pageCount !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
            onClick={reset}
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Tabs */}
      {file && status !== "processing" && (
        <Tabs defaultValue="extract" className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="extract" className="flex-1">Extract Pages</TabsTrigger>
            <TabsTrigger value="split"   className="flex-1">Split All</TabsTrigger>
          </TabsList>

          {/* ── Extract pages tab ──────────────────────────────────────── */}
          <TabsContent value="extract" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="page-range">
                Page range{" "}
                <span className="text-muted-foreground font-normal">
                  (e.g. 1-3, 5, 7-9)
                </span>
              </Label>
              <Input
                id="page-range"
                placeholder={`1-${pageCount}`}
                value={rangeInput}
                onChange={(e) => handleRangeChange(e.target.value)}
                className={cn(rangeError && "border-destructive focus-visible:ring-destructive")}
              />
              {rangeError && (
                <p className="text-xs text-destructive">{rangeError}</p>
              )}
              {!rangeError && rangeInput && (
                <p className="text-xs text-muted-foreground">
                  {(parsePageRange(rangeInput, pageCount) ?? []).length} page(s) selected
                </p>
              )}
            </div>
            <Button
              onClick={() => void handleExtract()}
              disabled={!rangeInput.trim() || !!rangeError}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Extracted PDF
            </Button>
          </TabsContent>

          {/* ── Split all tab ───────────────────────────────────────────── */}
          <TabsContent value="split" className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              This will produce <strong className="text-foreground">{pageCount} individual PDF file{pageCount !== 1 ? "s" : ""}</strong>.
              Each file will be downloaded separately with a 200 ms delay between files so the browser doesn&apos;t block them.
            </div>
            <Button
              onClick={() => void handleSplitAll()}
              className="gap-2"
            >
              <Scissors className="h-4 w-4" />
              Download {pageCount} Separate Files
            </Button>
          </TabsContent>
        </Tabs>
      )}

      {/* Progress */}
      {status === "processing" && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Processing…</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      {/* Success */}
      {status === "done" && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download complete! You can split again using the tabs above.
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        All processing happens locally in your browser — your file is never uploaded.
      </p>
    </div>
  );
}
