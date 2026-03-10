"use client";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Download, Upload } from "lucide-react";

export default function ImageEXIFStripper() {
  const [original, setOriginal]     = useState<{ src: string; size: number; name: string } | null>(null);
  const [stripped, setStripped]     = useState<{ src: string; size: number } | null>(null);
  const [dragging, setDragging]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target?.result as string;
      setOriginal({ src, size: file.size, name: file.name.replace(/\.[^.]+$/,"") });
      setStripped(null);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        // toDataURL re-encodes without EXIF
        const clean = canvas.toDataURL("image/jpeg", 0.95);
        const bytes = Math.round((clean.length - 22) * 3 / 4);
        setStripped({ src: clean, size: bytes });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) processFile(f);
  }, []);

  const download = () => {
    if (!stripped || !original) return;
    const a = document.createElement("a");
    a.href = stripped.src;
    a.download = `${original.name}-clean.jpg`;
    a.click();
  };

  const fmt = (b: number) => b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(2)} MB`;

  return (
    <div className="space-y-5">
      {!original ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
        >
          <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium">Drop image to strip EXIF metadata</p>
          <p className="text-sm text-muted-foreground mt-1">GPS, camera model, timestamps — all removed</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Original</p>
              <img src={original.src} alt="original" className="rounded-lg border object-contain max-h-48 w-full" />
              <Badge variant="secondary" className="mt-2">{fmt(original.size)}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Stripped (EXIF removed)</p>
              {stripped && (
                <>
                  <img src={stripped.src} alt="stripped" className="rounded-lg border object-contain max-h-48 w-full" />
                  <div className="flex gap-2 mt-2">
                    <Badge>{fmt(stripped.size)}</Badge>
                    <Badge variant="default" className="bg-green-600">✓ No EXIF</Badge>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {stripped && (
              <Button onClick={download}>
                <Download className="h-4 w-4 mr-2" />Download Clean Image
              </Button>
            )}
            <Button variant="outline" onClick={() => { setOriginal(null); setStripped(null); }}>
              Try Another
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            EXIF is removed by re-drawing the image on a canvas. GPS, camera model, date/time and all other metadata are stripped.
          </p>
        </div>
      )}
    </div>
  );
}
