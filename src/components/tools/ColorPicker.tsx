"use client";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToCmyk(r: number, g: number, b: number) {
  const rp = r / 255, gp = g / 255, bp = b / 255;
  const k = 1 - Math.max(rp, gp, bp);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rp - k) / (1 - k)) * 100),
    m: Math.round(((1 - gp - k) / (1 - k)) * 100),
    y: Math.round(((1 - bp - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function getContrastColor(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000000";
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

export default function ColorPicker() {
  const [color, setColor] = useState("#6366f1");
  const [copied, setCopied] = useState<string | null>(null);

  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  const cmyk = rgb ? rgbToCmyk(rgb.r, rgb.g, rgb.b) : null;

  const copy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const formats = rgb && hsl && cmyk ? [
    { label: "HEX", value: color.toUpperCase() },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: "CMYK", value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
  ] : [];

  const shades = [10, 20, 30, 40, 50, 60, 70, 80, 90].map((l) => {
    if (!hsl) return "";
    const h = `hsl(${hsl.h}, ${hsl.s}%, ${l}%)`;
    return h;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div>
          <Label className="mb-2 block">Pick a Color</Label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-24 w-24 cursor-pointer rounded-lg border-2 border-border p-1"
          />
        </div>
        <div className="flex-1">
          <Label className="mb-2 block">Hex Value</Label>
          <Input
            value={color}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setColor(v);
            }}
            className="font-mono"
            maxLength={7}
          />
          <div
            className="mt-3 h-16 rounded-lg flex items-center justify-center text-sm font-semibold"
            style={{ backgroundColor: color, color: getContrastColor(color) }}
          >
            {color.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {formats.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <span className="text-xs text-muted-foreground mr-2">{label}</span>
              <span className="font-mono text-sm">{value}</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => copy(value, label)}>
              {copied === label ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        ))}
      </div>

      {hsl && (
        <div>
          <Label className="mb-2 block">Shades</Label>
          <div className="flex gap-1 rounded-lg overflow-hidden">
            {shades.map((shade, i) => (
              <button
                key={i}
                className="flex-1 h-10 transition-transform hover:scale-y-110 hover:z-10 relative"
                style={{ backgroundColor: shade }}
                onClick={() => copy(shade, `shade-${i}`)}
                title={shade}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
