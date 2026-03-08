"use client";
/**
 * PDF Merge Tool
 * Uses pdf-lib (client-side) to merge multiple PDFs into one.
 * No server. No uploads. 100% private.
 */
import { useState, useCallback, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Upload, FilePlus2, X, Download, ArrowUp, ArrowDown, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/cn";

interface PDFFile {
  id:       string;
  file:     File;
  name:     string;
  sizeKB:   number;
  pages?:   number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function PDFMerge() {
  const [files,      setFiles]      = useState<PDFFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [status,     setStatus]     = useState<"idle" | "merging" | "done" | "error">("idle");
  const [errorMsg,   setErrorMsg]   = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const pdfs = Array.from(incoming).filter((f) => f.type === "application/pdf");
    if (pdfs.length === 0) return;

    setFiles((prev) => [
      ...prev,
      ...pdfs.map((f) => ({
        id:     crypto.randomUUID(),
        file:   f,
        name:   f.name,
        sizeKB: Math.round(f.size / 1024),
      })),
    ]);
  }, []);

  // ── Drag & Drop handlers ────────────────────────────────────────────────
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true);  };
  const onDragLeave = ()                    => { setIsDragging(false); };

  // ── Reorder helpers ─────────────────────────────────────────────────────
  const move = (index: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const remove = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  // ── Core merge logic ────────────────────────────────────────────────────
  const merge = async () => {
    if (files.length < 2) return;
    setStatus("merging");
    setProgress(0);
    setErrorMsg("");

    try {
      const merged = await PDFDocument.create();
      const step   = 100 / files.length;

      for (let i = 0; i < files.length; i++) {
        const bytes  = await files[i].file.arrayBuffer();
        const srcDoc = await PDFDocument.load(bytes);
        const copied = await merged.copyPages(srcDoc, srcDoc.getPageIndices());
        copied.forEach((p) => merged.addPage(p));
        setProgress(Math.round((i + 1) * step));
      }

      const pdfBytes = await merged.save();
      const blob     = new Blob([pdfBytes], { type: "application/pdf" });
      const url      = URL.createObjectURL(blob);

      const a    = document.createElement("a");
      a.href     = url;
      a.download = "merged.pdf";
      a.click();
      URL.revokeObjectURL(url);

      setStatus("done");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to merge PDFs. Ensure all files are valid, unencrypted PDFs.");
      setStatus("error");
    }
  };

  const reset = () => {
    setFiles([]);
    setStatus("idle");
    setProgress(0);
    setErrorMsg("");
  };

  return (
    <div className="space-y-5">
      {/* ── Drop zone ──────────────────────────────────────────────────── */}
      <div
        className={cn("drop-zone", isDragging && "active")}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="font-medium">Drop PDF files here</p>
        <p className="text-sm text-muted-foreground">or click to select multiple files</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* ── File list ──────────────────────────────────────────────────── */}
      {files.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>{files.length} file{files.length !== 1 ? "s" : ""} · drag to reorder</span>
            <button onClick={() => setFiles([])} className="hover:text-destructive transition-colors">
              Remove all
            </button>
          </div>

          <ul className="divide-y divide-border">
            {files.map((f, i) => (
              <li
                key={f.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <FileText className="h-5 w-5 text-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(f.file.size)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => move(i, -1)} disabled={i === 0}
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => move(i, 1)} disabled={i === files.length - 1}
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(f.id)}
                    aria-label="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Progress ───────────────────────────────────────────────────── */}
      {status === "merging" && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Merging…</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {status === "error" && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      {/* ── Success ────────────────────────────────────────────────────── */}
      {status === "done" && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Merged PDF downloaded successfully!
        </div>
      )}

      {/* ── Actions ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={merge}
          disabled={files.length < 2 || status === "merging"}
          className="gap-2"
        >
          <FilePlus2 className="h-4 w-4" />
          {status === "merging" ? "Merging…" : `Merge ${files.length || ""} PDFs`}
        </Button>

        {files.length > 0 && (
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            Add More
          </Button>
        )}

        {(status === "done" || status === "error") && (
          <Button variant="ghost" onClick={reset}>
            Start Over
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Supports PDF/A and standard PDFs · Max ~500 MB total · No encryption
      </p>
    </div>
  );
}
