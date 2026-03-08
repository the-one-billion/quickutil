"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TargetFormat = "image/jpeg" | "image/png" | "image/webp" | "gif-as-png";

interface SourceImage {
  file: File;
  url: string;
  width: number;
  height: number;
}

interface ConvertResult {
  url: string;
  blob: Blob;
  format: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[mime] ?? "png";
}

export default function ImageConvert() {
  const [isDragging, setIsDragging] = useState(false);
  const [source, setSource] = useState<SourceImage | null>(null);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>("image/webp");
  const [quality, setQuality] = useState(85);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [converting, setConverting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setSource({ file, url, width: img.naturalWidth, height: img.naturalHeight });
      setResult(null);
    };
    img.src = url;
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) loadImage(file);
    },
    [loadImage]
  );

  const convert = useCallback(async () => {
    if (!source) return;
    setConverting(true);

    const img = new window.Image();
    img.src = source.url;
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      if (img.complete) resolve();
    });

    const canvas = document.createElement("canvas");
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setConverting(false); return; }

    // Fill white background for JPEG (no transparency)
    if (targetFormat === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);

    // GIF → just encode as PNG with note
    const actualMime = targetFormat === "gif-as-png" ? "image/png" : targetFormat;
    const qualityVal =
      actualMime === "image/jpeg" || actualMime === "image/webp" ? quality / 100 : undefined;

    canvas.toBlob(
      (blob) => {
        if (!blob) { setConverting(false); return; }
        const url = URL.createObjectURL(blob);
        setResult({ url, blob, format: actualMime });
        setConverting(false);
      },
      actualMime,
      qualityVal
    );
  }, [source, targetFormat, quality]);

  const download = () => {
    if (!result || !source) return;
    const ext = mimeToExt(result.format);
    const baseName = source.file.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `${baseName}.${ext}`;
    a.click();
  };

  const showQuality = targetFormat === "image/jpeg" || targetFormat === "image/webp";
  const sizeDelta =
    result && source
      ? Math.round((1 - result.blob.size / source.file.size) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Drop zone */}
      <div
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div>
          <p className="font-medium">Drop an image here or click to browse</p>
          <p className="text-sm text-muted-foreground">Any common image format accepted</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && loadImage(e.target.files[0])}
        />
      </div>

      {/* Options */}
      {source && (
        <>
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
            <p className="font-medium truncate">{source.file.name}</p>
            <p className="text-muted-foreground">
              {source.width} × {source.height} px &nbsp;·&nbsp; {formatBytes(source.file.size)}
              &nbsp;·&nbsp; <span className="uppercase">{source.file.type.replace("image/", "")}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Output Format</Label>
              <Select
                value={targetFormat}
                onValueChange={(v) => { setTargetFormat(v as TargetFormat); setResult(null); }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image/jpeg">JPEG</SelectItem>
                  <SelectItem value="image/png">PNG</SelectItem>
                  <SelectItem value="image/webp">WebP</SelectItem>
                  <SelectItem value="gif-as-png">GIF (→ PNG)</SelectItem>
                </SelectContent>
              </Select>
              {targetFormat === "gif-as-png" && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  GIF export is not natively supported by browsers — image will be saved as PNG.
                </p>
              )}
            </div>

            {showQuality && (
              <div className="space-y-1.5">
                <Label className="flex justify-between">
                  <span>Quality</span>
                  <span className="font-normal text-muted-foreground">{quality}%</span>
                </Label>
                <Slider
                  min={1}
                  max={100}
                  step={1}
                  value={[quality]}
                  onValueChange={([v]) => setQuality(v)}
                />
              </div>
            )}
          </div>

          <Button className="w-full gap-2" onClick={convert} disabled={converting}>
            <RefreshCw className={`h-4 w-4 ${converting ? "animate-spin" : ""}`} />
            {converting ? "Converting…" : "Convert"}
          </Button>
        </>
      )}

      {/* Result */}
      {result && source && (
        <div className="rounded-xl border border-border overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.url}
            alt="Converted preview"
            className="w-full max-h-64 object-contain bg-muted/20"
          />
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm space-y-0.5">
              <p className="font-medium">
                {formatBytes(source.file.size)} → {formatBytes(result.blob.size)}
              </p>
              <p
                className={`text-xs font-semibold ${
                  sizeDelta > 0
                    ? "text-green-600 dark:text-green-400"
                    : sizeDelta < 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
                }`}
              >
                {sizeDelta > 0
                  ? `↓ ${sizeDelta}% smaller`
                  : sizeDelta < 0
                  ? `↑ ${Math.abs(sizeDelta)}% larger`
                  : "Same size"}
              </p>
            </div>
            <Button onClick={download} className="gap-2">
              <Download className="h-4 w-4" /> Download
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
