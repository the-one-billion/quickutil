"use client";
/**
 * Image Watermark Tool
 * Applies a text watermark to an image via the Canvas 2D API.
 * No external libraries — 100% client-side.
 */
import {
  useState,
  useCallback,
  useRef,
  useEffect,
  ChangeEvent,
} from "react";
import { Upload, Download, X, Image as ImageIcon } from "lucide-react";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Label }   from "@/components/ui/label";
import { Slider }  from "@/components/ui/slider";
import { Switch }  from "@/components/ui/switch";
import { cn }      from "@/lib/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

type Position =
  | "top-left"    | "top-center"    | "top-right"
  | "middle-left" | "center"        | "middle-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

type Rotation = 0 | 45 | -45;

interface WatermarkOptions {
  text:     string;
  fontSize: number;
  opacity:  number;   // 0–1
  color:    string;   // hex
  position: Position;
  rotation: Rotation;
  tile:     boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const POSITIONS: Position[] = [
  "top-left",    "top-center",    "top-right",
  "middle-left", "center",        "middle-right",
  "bottom-left", "bottom-center", "bottom-right",
];

const POSITION_LABELS: Record<Position, string> = {
  "top-left":      "↖",
  "top-center":    "↑",
  "top-right":     "↗",
  "middle-left":   "←",
  "center":        "·",
  "middle-right":  "→",
  "bottom-left":   "↙",
  "bottom-center": "↓",
  "bottom-right":  "↘",
};

function getAnchorPoint(
  position: Position,
  canvasW: number,
  canvasH: number,
  padX: number,
  padY: number
): [number, number] {
  const col = position.includes("left")
    ? padX
    : position.includes("right")
    ? canvasW - padX
    : canvasW / 2;

  const row = position.startsWith("top")
    ? padY
    : position.startsWith("bottom")
    ? canvasH - padY
    : canvasH / 2;

  return [col, row];
}

function applyWatermark(
  src: HTMLImageElement,
  opts: WatermarkOptions,
  canvas: HTMLCanvasElement
): void {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  canvas.width  = src.naturalWidth;
  canvas.height = src.naturalHeight;

  // Draw the original image
  ctx.drawImage(src, 0, 0);

  if (!opts.text.trim()) return;

  ctx.save();
  ctx.globalAlpha = opts.opacity;
  ctx.fillStyle   = opts.color;
  ctx.font        = `bold ${opts.fontSize}px sans-serif`;
  ctx.textBaseline = "middle";

  const w = canvas.width;
  const h = canvas.height;
  const padX = opts.fontSize * 1.5;
  const padY = opts.fontSize * 1.5;

  if (opts.tile) {
    // ── Tiled mode: repeat across the whole canvas ────────────────────────
    // Measure a sample text to determine step size
    const metrics  = ctx.measureText(opts.text);
    const textW    = metrics.width + opts.fontSize * 2;
    const textH    = opts.fontSize  * 3;

    // Determine the diagonal extent so we cover rotated corners too
    const diag = Math.sqrt(w * w + h * h);
    ctx.translate(w / 2, h / 2);
    ctx.rotate((opts.rotation * Math.PI) / 180);
    ctx.textAlign = "center";

    const cols = Math.ceil(diag / textW) + 2;
    const rows = Math.ceil(diag / textH) + 2;

    for (let r = -rows; r <= rows; r++) {
      for (let c = -cols; c <= cols; c++) {
        ctx.fillText(opts.text, c * textW, r * textH);
      }
    }
  } else {
    // ── Positioned mode ───────────────────────────────────────────────────
    const [cx, cy] = getAnchorPoint(opts.position, w, h, padX, padY);

    ctx.translate(cx, cy);
    ctx.rotate((opts.rotation * Math.PI) / 180);

    ctx.textAlign =
      opts.position.includes("left")  ? "left"  :
      opts.position.includes("right") ? "right" : "center";

    ctx.fillText(opts.text, 0, 0);
  }

  ctx.restore();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ImageWatermark() {
  const [srcImage,   setSrcImage]   = useState<HTMLImageElement | null>(null);
  const [fileName,   setFileName]   = useState("");
  const [fileSize,   setFileSize]   = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const [opts, setOpts] = useState<WatermarkOptions>({
    text:     "Confidential",
    fontSize: 36,
    opacity:  0.5,
    color:    "#ffffff",
    position: "center",
    rotation: -45,
    tile:     false,
  });

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  // ── Re-render watermark whenever image or options change ─────────────────

  useEffect(() => {
    if (!srcImage || !canvasRef.current) return;
    applyWatermark(srcImage, opts, canvasRef.current);
  }, [srcImage, opts]);

  // ── File loading ──────────────────────────────────────────────────────────

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      const result = ev.target?.result;
      if (typeof result !== "string") return;

      const img     = new Image();
      img.onload    = () => {
        setSrcImage(img);
        setFileName(file.name);
        setFileSize(file.size);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) loadFile(f);
    },
    [loadFile]
  );

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
  };

  // ── Options helpers ────────────────────────────────────────────────────────

  const set = <K extends keyof WatermarkOptions>(key: K, value: WatermarkOptions[K]) =>
    setOpts((prev) => ({ ...prev, [key]: value }));

  // ── Download ───────────────────────────────────────────────────────────────

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url  = canvas.toDataURL("image/png");
    const a    = document.createElement("a");
    const base = fileName.replace(/\.[^.]+$/, "");
    a.href     = url;
    a.download = `${base}_watermarked.png`;
    a.click();
  };

  const reset = () => {
    setSrcImage(null);
    setFileName("");
    setFileSize(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Format helpers ────────────────────────────────────────────────────────

  const fmtSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* ── Drop zone ────────────────────────────────────────────────────── */}
      {!srcImage && (
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border",
            "px-6 py-14 text-center transition-colors cursor-pointer",
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
          <p className="font-medium">Drop an image here</p>
          <p className="text-sm text-muted-foreground">JPG, PNG, WebP, GIF — any image format</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      )}

      {/* ── File info bar ─────────────────────────────────────────────────── */}
      {srcImage && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <ImageIcon className="h-5 w-5 shrink-0 text-blue-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fileName}</p>
            <p className="text-xs text-muted-foreground">
              {fmtSize(fileSize)} · {srcImage.naturalWidth}×{srcImage.naturalHeight}px
            </p>
          </div>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
            onClick={reset}
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ── Options ──────────────────────────────────────────────────────── */}
      {srcImage && (
        <div className="rounded-lg border border-border p-4 space-y-5">
          <p className="text-sm font-semibold">Watermark Options</p>

          {/* Text */}
          <div className="space-y-1.5">
            <Label htmlFor="wm-text">Watermark text</Label>
            <Input
              id="wm-text"
              value={opts.text}
              onChange={(e) => set("text", e.target.value)}
              placeholder="Enter watermark text…"
            />
          </div>

          {/* Font size */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Font size</Label>
              <span className="text-sm text-muted-foreground">{opts.fontSize}px</span>
            </div>
            <Slider
              min={12} max={72} step={1}
              value={[opts.fontSize]}
              onValueChange={([v]) => set("fontSize", v)}
            />
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Opacity</Label>
              <span className="text-sm text-muted-foreground">{Math.round(opts.opacity * 100)}%</span>
            </div>
            <Slider
              min={0.1} max={1} step={0.05}
              value={[opts.opacity]}
              onValueChange={([v]) => set("opacity", v)}
            />
          </div>

          {/* Color */}
          <div className="flex items-center gap-3">
            <Label htmlFor="wm-color">Color</Label>
            <div className="flex items-center gap-2">
              <input
                id="wm-color"
                type="color"
                value={opts.color}
                onChange={(e) => set("color", e.target.value)}
                className="h-8 w-14 rounded border border-border cursor-pointer bg-transparent p-0.5"
              />
              <span className="text-sm font-mono text-muted-foreground">{opts.color}</span>
            </div>
          </div>

          {/* Position — 3×3 grid */}
          <div className="space-y-1.5">
            <Label>Position</Label>
            <div className="grid grid-cols-3 gap-1.5 w-fit">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  onClick={() => set("position", pos)}
                  disabled={opts.tile}
                  title={pos.replace(/-/g, " ")}
                  className={cn(
                    "h-10 w-10 rounded-md border text-lg transition-colors",
                    opts.position === pos && !opts.tile
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted",
                    opts.tile && "opacity-40 cursor-not-allowed"
                  )}
                  aria-label={pos.replace(/-/g, " ")}
                >
                  {POSITION_LABELS[pos]}
                </button>
              ))}
            </div>
          </div>

          {/* Rotation */}
          <div className="space-y-1.5">
            <Label>Rotation</Label>
            <div className="flex gap-2">
              {([0, 45, -45] as Rotation[]).map((r) => (
                <button
                  key={r}
                  onClick={() => set("rotation", r)}
                  className={cn(
                    "px-3 py-1.5 rounded-md border text-sm transition-colors",
                    opts.rotation === r
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {r === 0 ? "0°" : r === 45 ? "+45°" : "−45°"}
                </button>
              ))}
            </div>
          </div>

          {/* Tile */}
          <div className="flex items-center gap-3">
            <Switch
              id="wm-tile"
              checked={opts.tile}
              onCheckedChange={(v) => set("tile", v)}
            />
            <Label htmlFor="wm-tile" className="cursor-pointer">
              Tile watermark across entire image
            </Label>
          </div>
        </div>
      )}

      {/* ── Live preview ──────────────────────────────────────────────────── */}
      {srcImage && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Preview</p>
          <div className="overflow-auto rounded-lg border border-border bg-muted/20 p-2">
            <canvas
              ref={canvasRef}
              className="max-w-full rounded"
              style={{ display: "block", margin: "0 auto" }}
            />
          </div>
        </div>
      )}

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      {srcImage && (
        <div className="flex flex-wrap gap-3">
          <Button onClick={download} className="gap-2">
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            Change Image
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        All processing happens locally in your browser — your image is never uploaded.
      </p>
    </div>
  );
}
