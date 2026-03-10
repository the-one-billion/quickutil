"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, RefreshCw } from "lucide-react";

export default function SVGtoPNG() {
  const [svgCode, setSvgCode] = useState("");
  const [scale, setScale] = useState(2);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  const convert = () => {
    setError("");
    if (!svgCode.trim()) { setError("Paste SVG code first"); return; }
    try {
      const blob = new Blob([svgCode], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const w = (img.naturalWidth || 300) * scale;
        const h = (img.naturalHeight || 300) * scale;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        setPreview(canvas.toDataURL("image/png"));
      };
      img.onerror = () => { setError("Invalid SVG — could not render"); URL.revokeObjectURL(url); };
      img.src = url;
    } catch {
      setError("Failed to parse SVG");
    }
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = preview;
    a.download = "image.png";
    a.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setSvgCode(ev.target?.result as string);
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label className="mb-2 block">Paste SVG Code</Label>
          <Textarea
            value={svgCode}
            onChange={(e) => setSvgCode(e.target.value)}
            placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">...</svg>'
            rows={10}
            className="font-mono text-xs"
          />
        </div>
        <div className="sm:w-44 space-y-4">
          <div>
            <Label className="mb-2 block">Or Upload .svg</Label>
            <input type="file" accept=".svg,image/svg+xml" className="text-sm" onChange={handleFile} />
          </div>
          <div>
            <Label className="mb-2 block">Scale (×{scale})</Label>
            <Input
              type="number"
              min={1}
              max={8}
              value={scale}
              onChange={(e) => setScale(Math.max(1, Math.min(8, Number(e.target.value))))}
            />
            <p className="text-xs text-muted-foreground mt-1">Higher = sharper PNG</p>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button onClick={convert}>
          <RefreshCw className="h-4 w-4 mr-2" />Convert to PNG
        </Button>
        {preview && (
          <Button variant="outline" onClick={download}>
            <Download className="h-4 w-4 mr-2" />Download PNG
          </Button>
        )}
      </div>

      {preview && (
        <div>
          <Label className="mb-2 block">Preview</Label>
          <img src={preview} alt="PNG preview" className="rounded-lg border max-h-72 object-contain" />
        </div>
      )}
    </div>
  );
}
