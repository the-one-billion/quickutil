"use client";
/**
 * Images to PDF Tool
 * Embeds JPG / PNG / WebP images into a PDF using pdf-lib.
 * WebP is rasterised via canvas → PNG blob before embedding.
 * No server. No uploads. 100% private.
 */
import { useState, useCallback, useRef } from "react";
import { PDFDocument, PageSizes } from "pdf-lib";
import { Upload, Image as ImageIcon, ArrowUp, ArrowDown, X, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ImageFile {
  id:       string;
  file:     File;
  name:     string;
  previewUrl: string;
}

type PageSize    = "a4" | "letter" | "fit";
type Orientation = "portrait" | "landscape";
type Margin      = "none" | "small" | "medium";
type Status      = "idle" | "converting" | "done" | "error";

// ── Constants ─────────────────────────────────────────────────────────────────

const MARGIN_PT: Record<Margin, number> = {
  none:   0,
  small:  10,
  medium: 20,
};

// A4 and Letter in portrait points [width, height]
const PAGE_SIZE_PT: Record<"a4" | "letter", [number, number]> = {
  a4:     PageSizes.A4,
  letter: PageSizes.Letter,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isJpeg(file: File): boolean {
  return file.type === "image/jpeg" || file.type === "image/jpg";
}

function isPng(file: File): boolean {
  return file.type === "image/png";
}

/** Decode any image to a PNG ArrayBuffer via an off-screen canvas. */
async function toPngArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas") as HTMLCanvasElement;
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error("Canvas toBlob failed")); return; }
        blob.arrayBuffer().then(resolve).catch(reject);
      }, "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ImagesToPDF() {
  const [images,      setImages]      = useState<ImageFile[]>([]);
  const [isDragging,  setIsDragging]  = useState(false);
  const [pageSize,    setPageSize]    = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margin,      setMargin]      = useState<Margin>("small");
  const [progress,    setProgress]    = useState(0);
  const [status,      setStatus]      = useState<Status>("idle");
  const [errorMsg,    setErrorMsg]    = useState("");
  const [pdfUrl,      setPdfUrl]      = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── File helpers ──────────────────────────────────────────────────────────

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter((f) =>
      ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(f.type)
    );
    if (valid.length === 0) return;

    setImages((prev) => [
      ...prev,
      ...valid.map((f) => ({
        id:         crypto.randomUUID(),
        file:       f,
        name:       f.name,
        previewUrl: URL.createObjectURL(f),
      })),
    ]);
    // Reset result when new files are added
    setPdfUrl(null);
    setStatus("idle");
  }, []);

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const move = (index: number, dir: -1 | 1) => {
    setImages((prev) => {
      const next   = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  // ── Drop zone handlers ────────────────────────────────────────────────────

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  // ── Conversion ────────────────────────────────────────────────────────────

  const convert = async () => {
    if (images.length === 0) return;
    setStatus("converting");
    setProgress(0);
    setErrorMsg("");
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);

    try {
      const pdfDoc = await PDFDocument.create();
      const step   = 100 / images.length;

      for (let i = 0; i < images.length; i++) {
        const { file } = images[i];

        // ── Embed image ────────────────────────────────────────────────────
        let embedded: Awaited<ReturnType<typeof pdfDoc.embedPng>>;

        if (isJpeg(file)) {
          const bytes = await file.arrayBuffer();
          embedded = await pdfDoc.embedJpg(bytes);
        } else {
          // PNG and WebP both go through embedPng
          // (WebP is first rasterised to PNG via canvas)
          const bytes = isPng(file)
            ? await file.arrayBuffer()
            : await toPngArrayBuffer(file);
          embedded = await pdfDoc.embedPng(bytes);
        }

        // ── Determine page dimensions ──────────────────────────────────────
        const m = MARGIN_PT[margin];

        let pageW: number;
        let pageH: number;

        if (pageSize === "fit") {
          pageW = embedded.width  + m * 2;
          pageH = embedded.height + m * 2;
        } else {
          const [bw, bh] = PAGE_SIZE_PT[pageSize];
          // In pdf-lib portrait means width < height
          pageW = orientation === "portrait" ? Math.min(bw, bh) : Math.max(bw, bh);
          pageH = orientation === "portrait" ? Math.max(bw, bh) : Math.min(bw, bh);
        }

        const page = pdfDoc.addPage([pageW, pageH]);

        // ── Scale image to fit within margins ──────────────────────────────
        const availW = pageW - m * 2;
        const availH = pageH - m * 2;
        const scale  = Math.min(availW / embedded.width, availH / embedded.height, 1);
        const drawW  = embedded.width  * scale;
        const drawH  = embedded.height * scale;

        // Centre the image
        const x = m + (availW - drawW) / 2;
        const y = m + (availH - drawH) / 2;

        page.drawImage(embedded, { x, y, width: drawW, height: drawH });

        setProgress(Math.round((i + 1) * step));
      }

      const pdfBytes = await pdfDoc.save();
      const blob     = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setPdfUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob); });
      setStatus("done");
      setProgress(100);
    } catch (err) {
      console.error(err);
      setErrorMsg("Conversion failed. Make sure all images are valid JPG, PNG, or WebP files.");
      setStatus("error");
    }
  };

  const downloadPdf = () => {
    if (!pdfUrl) return;
    const a    = document.createElement("a");
    a.href     = pdfUrl;
    a.download = "images.pdf";
    a.click();
  };

  const reset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setImages([]);
    setPdfUrl(null);
    setStatus("idle");
    setProgress(0);
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Drop zone */}
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border",
          "px-6 py-10 text-center transition-colors cursor-pointer",
          "hover:border-primary/60 hover:bg-muted/30",
          isDragging && "border-primary bg-primary/5"
        )}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="font-medium">Drop images here</p>
        <p className="text-sm text-muted-foreground">JPG, PNG, WebP · click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Image list */}
      {images.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>{images.length} image{images.length !== 1 ? "s" : ""}</span>
            <button
              onClick={reset}
              className="hover:text-destructive transition-colors"
            >
              Remove all
            </button>
          </div>

          <ul className="divide-y divide-border">
            {images.map((img, i) => (
              <li
                key={img.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                {/* Thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.previewUrl}
                  alt={img.name}
                  className="h-10 w-10 rounded object-cover border border-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{img.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(img.file.size)}</p>
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
                    onClick={() => move(i, 1)} disabled={i === images.length - 1}
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeImage(img.id)}
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

      {/* Options */}
      {images.length > 0 && (
        <div className="rounded-lg border border-border p-4 space-y-4">
          <p className="text-sm font-semibold">Options</p>

          {/* Page size */}
          <div className="space-y-1.5">
            <Label>Page size</Label>
            <div className="flex gap-2 flex-wrap">
              {(["a4", "letter", "fit"] as PageSize[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setPageSize(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-md border text-sm transition-colors",
                    pageSize === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {s === "a4" ? "A4" : s === "letter" ? "Letter" : "Fit to image"}
                </button>
              ))}
            </div>
          </div>

          {/* Orientation */}
          {pageSize !== "fit" && (
            <div className="space-y-1.5">
              <Label>Orientation</Label>
              <div className="flex gap-2">
                {(["portrait", "landscape"] as Orientation[]).map((o) => (
                  <button
                    key={o}
                    onClick={() => setOrientation(o)}
                    className={cn(
                      "px-3 py-1.5 rounded-md border text-sm transition-colors capitalize",
                      orientation === o
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Margin */}
          <div className="space-y-1.5">
            <Label>Margin</Label>
            <div className="flex gap-2">
              {(["none", "small", "medium"] as Margin[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMargin(m)}
                  className={cn(
                    "px-3 py-1.5 rounded-md border text-sm transition-colors capitalize",
                    margin === m
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {m === "none" ? "None" : m === "small" ? "Small (10pt)" : "Medium (20pt)"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      {status === "converting" && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Converting…</span>
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
      {status === "done" && pdfUrl && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-400 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 shrink-0" />
            PDF ready — {images.length} page{images.length !== 1 ? "s" : ""}
          </div>
          <Button size="sm" onClick={downloadPdf} className="gap-1.5 shrink-0">
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </Button>
        </div>
      )}

      {/* Actions */}
      {images.length > 0 && status !== "converting" && (
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => void convert()}
            disabled={images.length === 0}
            className="gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            {status === "done" ? "Re-convert" : `Convert ${images.length} Image${images.length !== 1 ? "s" : ""} to PDF`}
          </Button>
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            Add More
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        All processing happens locally in your browser — your images are never uploaded.
      </p>
    </div>
  );
}
