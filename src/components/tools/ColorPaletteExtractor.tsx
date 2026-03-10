"use client";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Upload } from "lucide-react";

function componentToHex(c: number) { return c.toString(16).padStart(2, "0"); }
function rgbToHex(r: number, g: number, b: number) { return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`; }

function quantizeColors(pixels: Uint8ClampedArray, count = 8): string[] {
  // Simple median cut approximation: sample every N pixels, cluster by rounding to nearest 32
  const buckets: Record<string, number> = {};
  for (let i = 0; i < pixels.length; i += 16) { // sample every 4th pixel
    const r = Math.round(pixels[i]   / 32) * 32;
    const g = Math.round(pixels[i+1] / 32) * 32;
    const b = Math.round(pixels[i+2] / 32) * 32;
    const key = `${r},${g},${b}`;
    buckets[key] = (buckets[key] || 0) + 1;
  }
  return Object.entries(buckets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => {
      const [r, g, b] = key.split(",").map(Number);
      return rgbToHex(Math.min(255,r), Math.min(255,g), Math.min(255,b));
    });
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgb(${r}, ${g}, ${b})`;
}

function getContrastColor(hex: string) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return (0.299*r + 0.587*g + 0.114*b)/255 > 0.5 ? "#000" : "#fff";
}

export default function ColorPaletteExtractor() {
  const [preview, setPreview]   = useState("");
  const [palette, setPalette]   = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied]     = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target?.result as string;
      setPreview(src);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 200;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        canvas.width  = Math.floor(img.width  * scale);
        canvas.height = Math.floor(img.height * scale);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        setPalette(quantizeColors(data, 10));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) processFile(f);
  }, []);

  const copy = async (hex: string) => {
    await navigator.clipboard.writeText(hex);
    setCopied(hex); setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-5">
      {!preview ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
        >
          <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium">Drop an image or click to browse</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          <img src={preview} alt="uploaded" className="rounded-lg border object-contain max-h-64 w-full" />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground mb-3">Dominant Colors</p>
            {palette.map(hex => (
              <div key={hex} className="flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => copy(hex)}>
                <div className="h-8 w-8 rounded-md border shadow-sm flex-shrink-0" style={{ backgroundColor: hex }} />
                <span className="font-mono text-sm flex-1">{hex.toUpperCase()}</span>
                <span className="text-xs text-muted-foreground">{hexToRgb(hex)}</span>
                {copied === hex ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>
      )}
      {preview && (
        <Button variant="outline" size="sm" onClick={() => { setPreview(""); setPalette([]); }}>
          Upload another image
        </Button>
      )}
    </div>
  );
}
