"use client";
/**
 * Image Compress Tool
 * Uses browser-image-compression (wasm-free, browser-native Canvas API).
 * Supports JPG, PNG, WebP, AVIF. 100% client-side.
 */
import { useState, useCallback, useRef } from "react";
import imageCompression from "browser-image-compression";
import { Upload, Download, RefreshCw, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/cn";

interface CompressedResult {
  originalFile: File;
  compressedBlob: Blob;
  originalURL: string;
  compressedURL: string;
  originalSize: number;
  compressedSize: number;
  savingPct: number;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageCompress() {
  const [isDragging,  setIsDragging]  = useState(false);
  const [quality,     setQuality]     = useState(75);        // 1–100
  const [maxWidthPx,  setMaxWidthPx]  = useState(1920);
  const [results,     setResults]     = useState<CompressedResult[]>([]);
  const [progress,    setProgress]    = useState(0);
  const [status,      setStatus]      = useState<"idle" | "compressing" | "done" | "error">("idle");
  const [errorMsg,    setErrorMsg]    = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
      const images  = Array.from(fileList).filter((f) => allowed.includes(f.type));
      if (images.length === 0) {
        setErrorMsg("Please select JPG, PNG, WebP, or AVIF images.");
        setStatus("error");
        return;
      }

      setStatus("compressing");
      setProgress(0);
      setErrorMsg("");
      setResults([]);

      const newResults: CompressedResult[] = [];

      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const originalURL = URL.createObjectURL(file);

        try {
          const compressed = await imageCompression(file, {
            maxSizeMB:     (quality / 100) * 10,   // rough target
            maxWidthOrHeight: maxWidthPx,
            useWebWorker: true,
            initialQuality: quality / 100,
            onProgress: (p) =>
              setProgress(Math.round(((i + p / 100) / images.length) * 100)),
          });

          const compressedURL = URL.createObjectURL(compressed);
          const saving        = 1 - compressed.size / file.size;

          newResults.push({
            originalFile:    file,
            compressedBlob:  compressed,
            originalURL,
            compressedURL,
            originalSize:    file.size,
            compressedSize:  compressed.size,
            savingPct:       Math.max(0, Math.round(saving * 100)),
          });
        } catch {
          newResults.push({
            originalFile:   file,
            compressedBlob: file,   // fallback
            originalURL,
            compressedURL:  originalURL,
            originalSize:   file.size,
            compressedSize: file.size,
            savingPct:      0,
          });
        }

        setProgress(Math.round(((i + 1) / images.length) * 100));
      }

      setResults(newResults);
      setStatus("done");
    },
    [quality, maxWidthPx]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const downloadAll = () => {
    results.forEach(({ compressedBlob, originalFile }) => {
      const ext  = originalFile.name.split(".").pop() ?? "jpg";
      const name = originalFile.name.replace(`.${ext}`, `_compressed.${ext}`);
      const blobUrl = URL.createObjectURL(compressedBlob);
      const a    = document.createElement("a");
      a.href     = blobUrl;
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    });
  };

  const reset = () => {
    results.forEach((r) => {
      URL.revokeObjectURL(r.originalURL);
      URL.revokeObjectURL(r.compressedURL);
    });
    setResults([]);
    setStatus("idle");
    setProgress(0);
    setErrorMsg("");
  };

  return (
    <div className="space-y-6">
      {/* ── Settings ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex justify-between">
            <span>Quality</span>
            <span className="font-normal text-muted-foreground">{quality}%</span>
          </Label>
          <Slider
            min={10} max={100} step={5}
            value={[quality]}
            onValueChange={([v]) => setQuality(v)}
          />
          <p className="text-xs text-muted-foreground">
            Lower = smaller file · Higher = better quality
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex justify-between">
            <span>Max width / height</span>
            <span className="font-normal text-muted-foreground">{maxWidthPx}px</span>
          </Label>
          <Slider
            min={320} max={4096} step={64}
            value={[maxWidthPx]}
            onValueChange={([v]) => setMaxWidthPx(v)}
          />
          <p className="text-xs text-muted-foreground">
            Images wider than this will be resized proportionally
          </p>
        </div>
      </div>

      {/* ── Drop zone ─────────────────────────────────────────────────────── */}
      <div
        className={cn("drop-zone", isDragging && "active")}
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
        <p className="text-sm text-muted-foreground">JPG, PNG, WebP, AVIF · multiple files OK</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>

      {/* ── Progress ──────────────────────────────────────────────────────── */}
      {status === "compressing" && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Compressing…</span><span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {status === "error" && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Results ({results.length} image{results.length !== 1 ? "s" : ""})</h3>
            <div className="flex gap-2">
              {results.length > 1 && (
                <Button size="sm" variant="outline" onClick={downloadAll} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Download All
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={reset} className="gap-1.5">
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((r, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                {/* Preview tabs */}
                <Tabs defaultValue="compressed">
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border">
                    <span className="text-xs font-medium truncate max-w-[140px]">
                      {r.originalFile.name}
                    </span>
                    <TabsList className="h-7 p-0.5">
                      <TabsTrigger value="original"   className="h-6 text-xs px-2">Original</TabsTrigger>
                      <TabsTrigger value="compressed" className="h-6 text-xs px-2">Compressed</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="original" className="m-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.originalURL} alt="Original" className="w-full h-44 object-cover" />
                  </TabsContent>
                  <TabsContent value="compressed" className="m-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.compressedURL} alt="Compressed" className="w-full h-44 object-cover" />
                  </TabsContent>
                </Tabs>

                {/* Stats */}
                <div className="flex items-center justify-between px-3 py-2.5 text-xs">
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground">
                      {formatBytes(r.originalSize)} → {formatBytes(r.compressedSize)}
                    </p>
                    <p className={cn(
                      "font-semibold",
                      r.savingPct > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                    )}>
                      {r.savingPct > 0 ? `↓ ${r.savingPct}% smaller` : "No size reduction"}
                    </p>
                  </div>
                  <a
                    href={r.compressedURL}
                    download={r.originalFile.name.replace(/(\.[^.]+)$/, "_compressed$1")}
                  >
                    <Button size="sm" variant="default" className="gap-1.5 h-7">
                      <Download className="h-3 w-3" /> Save
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Re-compress with new settings */}
          <Button
            variant="outline"
            className="gap-2 w-full"
            onClick={() => {
              const files = results.map((r) => r.originalFile);
              const dt = new DataTransfer();
              files.forEach((f) => dt.items.add(f));
              reset();
              setTimeout(() => processFiles(dt.files), 50);
            }}
          >
            <RefreshCw className="h-4 w-4" /> Re-compress with current settings
          </Button>
        </div>
      )}

      {status === "idle" && results.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          Supports batch compression · Compare before/after · Download individually or all at once
        </div>
      )}
    </div>
  );
}
