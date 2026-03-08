"use client";
/**
 * QR Code Generator
 * Live QR preview with size, error-correction, and color controls.
 * Download as PNG (canvas render) or SVG.
 */
import { useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type ECLevel = "L" | "M" | "Q" | "H";

const EC_LEVELS: { value: ECLevel; label: string; desc: string }[] = [
  { value: "L", label: "L — Low",      desc: "7% data restore" },
  { value: "M", label: "M — Medium",   desc: "15% data restore" },
  { value: "Q", label: "Q — Quartile", desc: "25% data restore" },
  { value: "H", label: "H — High",     desc: "30% data restore" },
];

export default function QRGenerator() {
  const [content,   setContent]   = useState("https://quickutil.io");
  const [size,      setSize]      = useState(256);
  const [ecLevel,   setEcLevel]   = useState<ECLevel>("M");
  const [fgColor,   setFgColor]   = useState("#000000");
  const [bgColor,   setBgColor]   = useState("#ffffff");
  const [copied,    setCopied]    = useState(false);

  const svgWrapRef = useRef<HTMLDivElement>(null);

  // ── PNG download via canvas ─────────────────────────────────────────────
  const downloadPNG = useCallback(() => {
    const svgEl = svgWrapRef.current?.querySelector("svg");
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    const svgStr     = serializer.serializeToString(svgEl);
    const svgBlob    = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url        = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas  = document.createElement("canvas");
      canvas.width  = size;
      canvas.height = size;
      const ctx     = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);

      const a    = document.createElement("a");
      a.href     = canvas.toDataURL("image/png");
      a.download = "qrcode.png";
      a.click();
    };
    img.src = url;
  }, [size]);

  // ── SVG download ────────────────────────────────────────────────────────
  const downloadSVG = useCallback(() => {
    const svgEl = svgWrapRef.current?.querySelector("svg");
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    const svgStr     = serializer.serializeToString(svgEl);
    const blob       = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url        = URL.createObjectURL(blob);
    const a          = document.createElement("a");
    a.href           = url;
    a.download       = "qrcode.svg";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const copyContent = useCallback(async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [content]);

  const safeContent = content.trim() || " ";

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">QR Code Generator</h1>
        <p className="text-sm text-muted-foreground">
          Turn any URL or text into a QR code. Customize size, colors, and error correction.
        </p>
      </div>

      {/* ── Content input ─────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="qr-content">Content</Label>
        <div className="flex gap-2">
          <Input
            id="qr-content"
            type="text"
            placeholder="https://example.com"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={copyContent} className="shrink-0">
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>

      {/* ── Options grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Size slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Size</Label>
            <span className="text-sm font-medium text-foreground">{size} px</span>
          </div>
          <Slider
            min={128}
            max={512}
            step={8}
            value={[size]}
            onValueChange={([v]) => setSize(v)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>128 px</span>
            <span>512 px</span>
          </div>
        </div>

        {/* Error correction */}
        <div className="space-y-1.5">
          <Label htmlFor="ec-select">Error Correction</Label>
          <select
            id="ec-select"
            value={ecLevel}
            onChange={(e) => setEcLevel(e.target.value as ECLevel)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {EC_LEVELS.map((ec) => (
              <option key={ec.value} value={ec.value}>
                {ec.label} ({ec.desc})
              </option>
            ))}
          </select>
        </div>

        {/* Foreground color */}
        <div className="space-y-1.5">
          <Label htmlFor="fg-color">Foreground Color</Label>
          <div className="flex items-center gap-3">
            <input
              id="fg-color"
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-md border border-border bg-background p-0.5"
            />
            <Input
              type="text"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="flex-1 font-mono text-sm uppercase"
              maxLength={7}
            />
          </div>
        </div>

        {/* Background color */}
        <div className="space-y-1.5">
          <Label htmlFor="bg-color">Background Color</Label>
          <div className="flex items-center gap-3">
            <input
              id="bg-color"
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-md border border-border bg-background p-0.5"
            />
            <Input
              type="text"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="flex-1 font-mono text-sm uppercase"
              maxLength={7}
            />
          </div>
        </div>
      </div>

      {/* ── Live preview ─────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6">
        <div
          ref={svgWrapRef}
          className="rounded-lg shadow-sm"
          style={{ lineHeight: 0 }}
        >
          <QRCodeSVG
            value={safeContent}
            size={Math.min(size, 320)}
            level={ecLevel}
            fgColor={fgColor}
            bgColor={bgColor}
            marginSize={2}
          />
        </div>

        <p className="max-w-xs truncate text-center text-xs text-muted-foreground">
          {content || "Enter content above"}
        </p>

        {/* Download buttons */}
        <div className="flex gap-3">
          <Button onClick={downloadPNG} variant="default" size="sm">
            Download PNG
          </Button>
          <Button onClick={downloadSVG} variant="outline" size="sm">
            Download SVG
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground border-t border-border pt-4">
        Higher error correction allows the QR code to be read even if partially damaged or
        obscured — useful when placing a logo over the center.
      </p>
    </div>
  );
}
