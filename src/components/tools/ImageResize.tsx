"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Download, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OutputFormat = "original" | "image/jpeg" | "image/png" | "image/webp";

interface ImageInfo {
  file: File;
  width: number;
  height: number;
  url: string;
}

interface ResizeResult {
  url: string;
  blob: Blob;
  width: number;
  height: number;
  format: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatExt(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "png";
}

export default function ImageResize() {
  const [isDragging, setIsDragging] = useState(false);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [lockAspect, setLockAspect] = useState(true);
  const [pixelWidth, setPixelWidth] = useState("");
  const [pixelHeight, setPixelHeight] = useState("");
  const [percentage, setPercentage] = useState("100");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("original");
  const [quality, setQuality] = useState(85);
  const [result, setResult] = useState<ResizeResult | null>(null);
  const [resizing, setResizing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setImageInfo({ file, width: img.naturalWidth, height: img.naturalHeight, url });
      setPixelWidth(String(img.naturalWidth));
      setPixelHeight(String(img.naturalHeight));
      setPercentage("100");
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

  const onWidthChange = (val: string) => {
    setPixelWidth(val);
    if (lockAspect && imageInfo) {
      const w = parseFloat(val);
      if (!isNaN(w) && w > 0) {
        const ratio = imageInfo.height / imageInfo.width;
        setPixelHeight(String(Math.round(w * ratio)));
      }
    }
  };

  const onHeightChange = (val: string) => {
    setPixelHeight(val);
    if (lockAspect && imageInfo) {
      const h = parseFloat(val);
      if (!isNaN(h) && h > 0) {
        const ratio = imageInfo.width / imageInfo.height;
        setPixelWidth(String(Math.round(h * ratio)));
      }
    }
  };

  const handleResize = useCallback(
    async (mode: "pixels" | "percentage") => {
      if (!imageInfo) return;
      setResizing(true);

      let targetW: number;
      let targetH: number;

      if (mode === "pixels") {
        targetW = Math.max(1, parseInt(pixelWidth) || imageInfo.width);
        targetH = Math.max(1, parseInt(pixelHeight) || imageInfo.height);
      } else {
        const pct = Math.max(1, parseFloat(percentage) || 100) / 100;
        targetW = Math.round(imageInfo.width * pct);
        targetH = Math.round(imageInfo.height * pct);
      }

      const img = new window.Image();
      img.src = imageInfo.url;

      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        if (img.complete) resolve();
      });

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) { setResizing(false); return; }
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const mime: string =
        outputFormat === "original" ? imageInfo.file.type || "image/png" : outputFormat;
      const qualityVal = mime === "image/jpeg" || mime === "image/webp" ? quality / 100 : undefined;

      canvas.toBlob(
        (blob) => {
          if (!blob) { setResizing(false); return; }
          const url = URL.createObjectURL(blob);
          setResult({ url, blob, width: targetW, height: targetH, format: mime });
          setResizing(false);
        },
        mime,
        qualityVal
      );
    },
    [imageInfo, pixelWidth, pixelHeight, percentage, outputFormat, quality]
  );

  const download = () => {
    if (!result || !imageInfo) return;
    const ext = formatExt(result.format);
    const baseName = imageInfo.file.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `${baseName}_resized.${ext}`;
    a.click();
  };

  const showQuality = outputFormat === "image/jpeg" || outputFormat === "image/webp";

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
          <p className="text-sm text-muted-foreground">Supports JPG, PNG, WebP, GIF, BMP</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && loadImage(e.target.files[0])}
        />
      </div>

      {/* Image info */}
      {imageInfo && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
          <p className="font-medium truncate">{imageInfo.file.name}</p>
          <p className="text-muted-foreground">
            {imageInfo.width} × {imageInfo.height} px &nbsp;·&nbsp; {formatBytes(imageInfo.file.size)}
          </p>
        </div>
      )}

      {imageInfo && (
        <>
          {/* Resize mode tabs */}
          <Tabs defaultValue="pixels">
            <TabsList className="w-full">
              <TabsTrigger value="pixels" className="flex-1">By Pixels</TabsTrigger>
              <TabsTrigger value="percentage" className="flex-1">By Percentage</TabsTrigger>
            </TabsList>

            <TabsContent value="pixels" className="mt-4 space-y-4">
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label>Width (px)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={pixelWidth}
                    onChange={(e) => onWidthChange(e.target.value)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mb-0.5 shrink-0"
                  onClick={() => setLockAspect((v) => !v)}
                  title={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
                >
                  {lockAspect ? (
                    <Lock className="h-4 w-4 text-primary" />
                  ) : (
                    <Unlock className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <div className="flex-1 space-y-1.5">
                  <Label>Height (px)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={pixelHeight}
                    onChange={(e) => onHeightChange(e.target.value)}
                    disabled={lockAspect}
                  />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => handleResize("pixels")}
                disabled={resizing}
              >
                {resizing ? "Resizing…" : "Resize"}
              </Button>
            </TabsContent>

            <TabsContent value="percentage" className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label>Scale (%)</Label>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="100"
                />
                {imageInfo && percentage && !isNaN(parseFloat(percentage)) && (
                  <p className="text-xs text-muted-foreground">
                    Output: {Math.round(imageInfo.width * parseFloat(percentage) / 100)} ×{" "}
                    {Math.round(imageInfo.height * parseFloat(percentage) / 100)} px
                  </p>
                )}
              </div>
              <Button
                className="w-full"
                onClick={() => handleResize("percentage")}
                disabled={resizing}
              >
                {resizing ? "Resizing…" : "Resize"}
              </Button>
            </TabsContent>
          </Tabs>

          {/* Output options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Output Format</Label>
              <Select
                value={outputFormat}
                onValueChange={(v) => setOutputFormat(v as OutputFormat)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original</SelectItem>
                  <SelectItem value="image/jpeg">JPEG</SelectItem>
                  <SelectItem value="image/png">PNG</SelectItem>
                  <SelectItem value="image/webp">WebP</SelectItem>
                </SelectContent>
              </Select>
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
        </>
      )}

      {/* Result */}
      {result && imageInfo && (
        <div className="space-y-3 rounded-xl border border-border overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.url}
            alt="Resized preview"
            className="w-full max-h-64 object-contain bg-muted/20"
          />
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm">
              <p className="font-medium">
                {result.width} × {result.height} px &nbsp;·&nbsp; {formatBytes(result.blob.size)}
              </p>
              <p className="text-muted-foreground text-xs">
                Was {formatBytes(imageInfo.file.size)} &nbsp;
                <span className={result.blob.size < imageInfo.file.size ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}>
                  ({result.blob.size < imageInfo.file.size
                    ? `↓ ${Math.round((1 - result.blob.size / imageInfo.file.size) * 100)}% smaller`
                    : `↑ ${Math.round((result.blob.size / imageInfo.file.size - 1) * 100)}% larger`})
                </span>
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
