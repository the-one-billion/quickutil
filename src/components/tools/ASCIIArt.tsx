"use client";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy, Check, Upload } from "lucide-react";

const CHARS_DENSE  = "@%#*+=-:. ";
const CHARS_SIMPLE = "@#S%?*+;:,. ";

function imageToASCII(img: HTMLImageElement, width: number, charset: string): string {
  const aspect = img.naturalHeight / img.naturalWidth;
  const height = Math.floor(width * aspect * 0.45); // account for char aspect ratio
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  const data = ctx.getImageData(0, 0, width, height).data;
  let result = "";
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const brightness = (0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]) / 255;
      const idx = Math.floor(brightness * (charset.length - 1));
      result += charset[charset.length - 1 - idx];
    }
    result += "\n";
  }
  return result;
}

export default function ASCIIArt() {
  const [ascii, setAscii]     = useState("");
  const [preview, setPreview] = useState("");
  const [width, setWidth]     = useState(80);
  const [dense, setDense]     = useState(false);
  const [copied, setCopied]   = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef   = useRef<HTMLImageElement | null>(null);

  const generate = (img: HTMLImageElement) => {
    const charset = dense ? CHARS_DENSE : CHARS_SIMPLE;
    setAscii(imageToASCII(img, Math.max(20, Math.min(200, width)), charset));
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target?.result as string;
      setPreview(src);
      const img = new Image();
      img.onload = () => { imgRef.current = img; generate(img); };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) processFile(f);
  }, []);

  const copy = async () => {
    await navigator.clipboard.writeText(ascii);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
        >
          <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium">Drop an image to convert to ASCII art</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Width</Label>
              <Input type="number" min={20} max={200} value={width}
                onChange={e => setWidth(Number(e.target.value))} className="w-20" />
              <span className="text-sm text-muted-foreground">chars</span>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={dense} onChange={e => setDense(e.target.checked)} />
              Dense charset
            </label>
            <Button size="sm" onClick={() => imgRef.current && generate(imgRef.current)}>Regenerate</Button>
            <Button size="sm" variant="outline" onClick={() => { setPreview(""); setAscii(""); }}>Reset</Button>
          </div>

          {ascii && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label>ASCII Art</Label>
                <Button size="sm" variant="outline" onClick={copy}>
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <pre className="rounded-lg border bg-black text-green-400 font-mono text-[7px] leading-[1.1] p-3 overflow-auto max-h-[400px] whitespace-pre">
                {ascii}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
