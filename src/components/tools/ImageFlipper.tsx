"use client";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  Download,
  Upload,
} from "lucide-react";

export default function ImageFlipper() {
  const [original, setOriginal] = useState("");
  const [result, setResult] = useState("");
  const [fileName, setFileName] = useState("image.png");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name.replace(/\.[^.]+$/, "") + "-edited.png");
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setOriginal(src);
      setResult(src);
    };
    reader.readAsDataURL(file);
  };

  const transform = (flipH: boolean, flipV: boolean, rotate: number) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      const swap = rotate === 90 || rotate === 270;
      canvas.width = swap ? img.height : img.width;
      canvas.height = swap ? img.width : img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotate * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
      setResult(canvas.toDataURL("image/png"));
    };
    img.src = original || result;
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = result;
    a.download = fileName;
    a.click();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {!original ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium">Drop an image or click to browse</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) processFile(f);
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => transform(true, false, 0)}
            >
              <FlipHorizontal className="h-4 w-4 mr-2" />
              Flip Horizontal
            </Button>
            <Button
              variant="outline"
              onClick={() => transform(false, true, 0)}
            >
              <FlipVertical className="h-4 w-4 mr-2" />
              Flip Vertical
            </Button>
            <Button
              variant="outline"
              onClick={() => transform(false, false, 90)}
            >
              Rotate 90°
            </Button>
            <Button
              variant="outline"
              onClick={() => transform(false, false, 180)}
            >
              Rotate 180°
            </Button>
            <Button
              variant="outline"
              onClick={() => transform(false, false, 270)}
            >
              Rotate 270°
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setOriginal("");
                setResult("");
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Original</p>
              <img
                src={original}
                alt="original"
                className="rounded-lg border object-contain max-h-64 w-full"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Result</p>
              <img
                src={result}
                alt="result"
                className="rounded-lg border object-contain max-h-64 w-full"
              />
            </div>
          </div>
          <Button onClick={download}>
            <Download className="h-4 w-4 mr-2" />
            Download PNG
          </Button>
        </div>
      )}
    </div>
  );
}
