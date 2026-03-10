"use client";
import { useState, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface MetaRow {
  label: string;
  value: string;
}

export default function EXIFViewer() {
  const [rows, setRows] = useState<MetaRow[]>([]);
  const [preview, setPreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setPreview(src);
      const img = new Image();
      img.onload = () => {
        setRows([
          { label: "File Name", value: file.name },
          { label: "File Type", value: file.type },
          {
            label: "File Size",
            value:
              file.size < 1048576
                ? `${(file.size / 1024).toFixed(1)} KB`
                : `${(file.size / 1048576).toFixed(2)} MB`,
          },
          {
            label: "Last Modified",
            value: new Date(file.lastModified).toLocaleString(),
          },
          { label: "Width", value: `${img.naturalWidth} px` },
          { label: "Height", value: `${img.naturalHeight} px` },
          {
            label: "Aspect Ratio",
            value: `${img.naturalWidth}:${img.naturalHeight}`,
          },
          {
            label: "Megapixels",
            value: `${(
              (img.naturalWidth * img.naturalHeight) /
              1_000_000
            ).toFixed(2)} MP`,
          },
        ]);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  return (
    <div className="space-y-6">
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
        <Info className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="font-medium">Drop an image to view its metadata</p>
        <p className="text-sm text-muted-foreground mt-1">
          Works 100% in your browser — no upload
        </p>
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

      {preview && rows.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <img
            src={preview}
            alt="preview"
            className="rounded-lg border object-contain max-h-56 w-full"
          />
          <div className="rounded-lg border divide-y text-sm">
            {rows.map((r) => (
              <div key={r.label} className="flex justify-between px-3 py-2">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-medium">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
