"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Download, Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CropBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

type AspectPreset = "free" | "1:1" | "4:3" | "16:9" | "3:2";
type DragMode = "move" | "nw" | "ne" | "sw" | "se" | null;

interface SourceImage {
  file: File;
  url: string;
  naturalWidth: number;
  naturalHeight: number;
}

const HANDLE_SIZE = 10; // px — hit area half-size for corner handles
const MIN_SIZE = 20;    // minimum crop box dimension in display pixels

function aspectRatio(preset: AspectPreset): number | null {
  switch (preset) {
    case "1:1":  return 1;
    case "4:3":  return 4 / 3;
    case "16:9": return 16 / 9;
    case "3:2":  return 3 / 2;
    default:     return null;
  }
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ImageCrop() {
  const [isDragging, setIsDragging] = useState(false);
  const [source, setSource] = useState<SourceImage | null>(null);
  const [cropBox, setCropBox] = useState<CropBox>({ x: 20, y: 20, w: 200, h: 200 });
  const [aspectPreset, setAspectPreset] = useState<AspectPreset>("free");
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [result, setResult] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Track drag state in a ref so mouse-move handlers always see fresh values
  const dragState = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    startBox: CropBox;
  } | null>(null);

  // ── Measure rendered image size ─────────────────────────────────────────────
  useEffect(() => {
    if (!imgRef.current) return;
    const observer = new ResizeObserver(() => {
      if (imgRef.current) {
        setDisplaySize({
          w: imgRef.current.clientWidth,
          h: imgRef.current.clientHeight,
        });
      }
    });
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [source]);

  // ── Load image ──────────────────────────────────────────────────────────────
  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setSource({ file, url, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
      setResult(null);
    };
    img.src = url;
  }, []);

  // Reset crop box when display size is known
  useEffect(() => {
    if (displaySize.w === 0 || displaySize.h === 0) return;
    const margin = 20;
    const w = Math.max(MIN_SIZE, displaySize.w - margin * 2);
    const h = Math.max(MIN_SIZE, displaySize.h - margin * 2);
    const ar = aspectRatio(aspectPreset);
    if (ar) {
      const constrainedH = Math.min(h, w / ar);
      const constrainedW = constrainedH * ar;
      setCropBox({ x: (displaySize.w - constrainedW) / 2, y: (displaySize.h - constrainedH) / 2, w: constrainedW, h: constrainedH });
    } else {
      setCropBox({ x: margin, y: margin, w, h });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displaySize]);

  // ── Apply aspect ratio constraint ───────────────────────────────────────────
  const applyAspect = useCallback((box: CropBox, ar: number | null, containerW: number, containerH: number): CropBox => {
    if (!ar) return box;
    let { x, y, w, h } = box;
    h = w / ar;
    if (y + h > containerH) { h = containerH - y; w = h * ar; }
    if (x + w > containerW) { w = containerW - x; h = w / ar; }
    return { x, y, w: Math.max(MIN_SIZE, w), h: Math.max(MIN_SIZE, h) };
  }, []);

  // ── Hit test: which part of the crop box is at (px, py)? ───────────────────
  const hitTest = useCallback((px: number, py: number, box: CropBox): DragMode => {
    const { x, y, w, h } = box;
    const inCorner = (cx: number, cy: number) =>
      Math.abs(px - cx) <= HANDLE_SIZE && Math.abs(py - cy) <= HANDLE_SIZE;

    if (inCorner(x, y))         return "nw";
    if (inCorner(x + w, y))     return "ne";
    if (inCorner(x, y + h))     return "sw";
    if (inCorner(x + w, y + h)) return "se";
    if (px >= x && px <= x + w && py >= y && py <= y + h) return "move";
    return null;
  }, []);

  // ── Mouse events ────────────────────────────────────────────────────────────
  const getRelativePos = (e: React.MouseEvent<HTMLDivElement> | MouseEvent): { px: number; py: number } => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { px: 0, py: 0 };
    return { px: e.clientX - rect.left, py: e.clientY - rect.top };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const { px, py } = getRelativePos(e);
    const mode = hitTest(px, py, cropBox);
    if (!mode) return;
    dragState.current = { mode, startX: px, startY: py, startBox: { ...cropBox } };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragState.current || displaySize.w === 0) return;
      const { px, py } = getRelativePos(e);
      const { mode, startX, startY, startBox } = dragState.current;
      const dx = px - startX;
      const dy = py - startY;
      const cw = displaySize.w;
      const ch = displaySize.h;
      const ar = aspectRatio(aspectPreset);
      let next: CropBox = { ...startBox };

      if (mode === "move") {
        next.x = clamp(startBox.x + dx, 0, cw - startBox.w);
        next.y = clamp(startBox.y + dy, 0, ch - startBox.h);
      } else {
        // Resize from corners
        let { x, y, w, h } = startBox;

        if (mode === "nw") {
          const newX = clamp(x + dx, 0, x + w - MIN_SIZE);
          const newY = clamp(y + dy, 0, y + h - MIN_SIZE);
          w = x + w - newX;
          h = y + h - newY;
          x = newX;
          y = newY;
        } else if (mode === "ne") {
          const newW = clamp(w + dx, MIN_SIZE, cw - x);
          const newY = clamp(y + dy, 0, y + h - MIN_SIZE);
          h = y + h - newY;
          y = newY;
          w = newW;
        } else if (mode === "sw") {
          const newX = clamp(x + dx, 0, x + w - MIN_SIZE);
          const newH = clamp(h + dy, MIN_SIZE, ch - y);
          w = x + w - newX;
          x = newX;
          h = newH;
        } else if (mode === "se") {
          w = clamp(w + dx, MIN_SIZE, cw - x);
          h = clamp(h + dy, MIN_SIZE, ch - y);
        }

        next = { x, y, w, h };

        // Enforce aspect ratio: anchor by width when resizing, except nw/sw which anchor by height
        if (ar) {
          if (mode === "nw" || mode === "sw") {
            next.h = next.w / ar;
            if (mode === "nw") next.y = startBox.y + startBox.h - next.h;
          } else {
            next.h = next.w / ar;
          }
        }

        // Clamp back into container
        next.x = clamp(next.x, 0, cw - MIN_SIZE);
        next.y = clamp(next.y, 0, ch - MIN_SIZE);
        next.w = clamp(next.w, MIN_SIZE, cw - next.x);
        next.h = clamp(next.h, MIN_SIZE, ch - next.y);
      }

      setCropBox(next);
    };

    const onUp = () => { dragState.current = null; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [displaySize, aspectPreset, applyAspect]);

  // When aspect preset changes, re-apply constraint to current box
  useEffect(() => {
    if (displaySize.w === 0) return;
    const ar = aspectRatio(aspectPreset);
    setCropBox((b) => applyAspect(b, ar, displaySize.w, displaySize.h));
  }, [aspectPreset, applyAspect, displaySize]);

  // ── Crop and produce downloadable image ─────────────────────────────────────
  const doCrop = useCallback(() => {
    if (!source || !imgRef.current || displaySize.w === 0 || displaySize.h === 0) return;

    const scaleX = source.naturalWidth / displaySize.w;
    const scaleY = source.naturalHeight / displaySize.h;

    const sx = Math.round(cropBox.x * scaleX);
    const sy = Math.round(cropBox.y * scaleY);
    const sw = Math.round(cropBox.w * scaleX);
    const sh = Math.round(cropBox.h * scaleY);

    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      const url = canvas.toDataURL("image/png");
      setResult(url);
    };
    img.src = source.url;
  }, [source, cropBox, displaySize]);

  const download = () => {
    if (!result || !source) return;
    const baseName = source.file.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = result;
    a.download = `${baseName}_cropped.png`;
    a.click();
  };

  // ── Cursor style based on hover position ────────────────────────────────────
  const getCursor = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (dragState.current) return;
      const { px, py } = getRelativePos(e);
      const mode = hitTest(px, py, cropBox);
      const cursors: Record<NonNullable<DragMode>, string> = {
        move: "move",
        nw: "nw-resize",
        ne: "ne-resize",
        sw: "sw-resize",
        se: "se-resize",
      };
      if (mode && containerRef.current) {
        containerRef.current.style.cursor = cursors[mode];
      } else if (containerRef.current) {
        containerRef.current.style.cursor = "default";
      }
    },
    [cropBox, hitTest]
  );

  // ── Pixel dimensions of crop in original image space ────────────────────────
  const cropPixelW = source && displaySize.w > 0
    ? Math.round(cropBox.w * (source.naturalWidth / displaySize.w))
    : 0;
  const cropPixelH = source && displaySize.h > 0
    ? Math.round(cropBox.h * (source.naturalHeight / displaySize.h))
    : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Drop zone */}
      {!source && (
        <div
          className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
          onDrop={(e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) loadImage(file);
          }}
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
            <p className="text-sm text-muted-foreground">Supports JPG, PNG, WebP and more</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadImage(e.target.files[0])}
          />
        </div>
      )}

      {/* Crop UI */}
      {source && (
        <>
          {/* Controls bar */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label>Aspect Ratio</Label>
              <Select value={aspectPreset} onValueChange={(v) => setAspectPreset(v as AspectPreset)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="1:1">1 : 1</SelectItem>
                  <SelectItem value="4:3">4 : 3</SelectItem>
                  <SelectItem value="16:9">16 : 9</SelectItem>
                  <SelectItem value="3:2">3 : 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{cropPixelW} × {cropPixelH}</span>
              &nbsp;px crop
            </div>

            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSource(null); setResult(null); }}
              >
                Change Image
              </Button>
              <Button className="gap-2" onClick={doCrop}>
                <Crop className="h-4 w-4" /> Crop
              </Button>
            </div>
          </div>

          {/* Canvas area with crop overlay */}
          <div
            ref={containerRef}
            className="relative select-none overflow-hidden rounded-xl border border-border bg-muted/20"
            style={{ touchAction: "none" }}
            onMouseDown={onMouseDown}
            onMouseMove={getCursor}
          >
            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={source.url}
              alt="Source"
              className="block w-full pointer-events-none"
              draggable={false}
            />

            {/* Dim mask — top */}
            <div
              className="absolute left-0 top-0 right-0 bg-black/50 pointer-events-none"
              style={{ height: cropBox.y }}
            />
            {/* Dim mask — bottom */}
            <div
              className="absolute left-0 right-0 bottom-0 bg-black/50 pointer-events-none"
              style={{ top: cropBox.y + cropBox.h }}
            />
            {/* Dim mask — left */}
            <div
              className="absolute left-0 bg-black/50 pointer-events-none"
              style={{ top: cropBox.y, width: cropBox.x, height: cropBox.h }}
            />
            {/* Dim mask — right */}
            <div
              className="absolute right-0 bg-black/50 pointer-events-none"
              style={{ top: cropBox.y, left: cropBox.x + cropBox.w, height: cropBox.h }}
            />

            {/* Crop box border */}
            <div
              className="absolute border-2 border-white pointer-events-none"
              style={{
                left: cropBox.x,
                top: cropBox.y,
                width: cropBox.w,
                height: cropBox.h,
                boxSizing: "border-box",
              }}
            >
              {/* Rule-of-thirds grid lines */}
              <div className="absolute inset-0 opacity-40 pointer-events-none">
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white" />
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white" />
              </div>

              {/* Corner handles */}
              {(["nw", "ne", "sw", "se"] as const).map((corner) => {
                const isTop = corner.startsWith("n");
                const isLeft = corner.endsWith("w");
                return (
                  <div
                    key={corner}
                    className="absolute w-3 h-3 bg-white border border-white/80 rounded-sm"
                    style={{
                      top: isTop ? -6 : undefined,
                      bottom: !isTop ? -6 : undefined,
                      left: isLeft ? -6 : undefined,
                      right: !isLeft ? -6 : undefined,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-border overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result} alt="Cropped" className="w-full object-contain max-h-64 bg-muted/20" />
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Cropped: <span className="text-foreground font-medium">{cropPixelW} × {cropPixelH} px</span>
            </p>
            <Button onClick={download} className="gap-2">
              <Download className="h-4 w-4" /> Download PNG
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
