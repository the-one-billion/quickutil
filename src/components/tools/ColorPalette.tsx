"use client";

import { useState, useMemo, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Color math ────────────────────────────────────────────────────────────────

interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface ColorEntry {
  hex: string;
  rgb: RGB;
  hsl: HSL;
}

function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  if (isNaN(num)) return null;
  return { r: (num >> 16) & 0xff, g: (num >> 8) & 0xff, b: num & 0xff };
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const sn = s / 100;
  const ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hk = h / 360;
  const toC = (t: number): number => {
    const tc = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (tc < 1 / 6) return p + (q - p) * 6 * tc;
    if (tc < 1 / 2) return q;
    if (tc < 2 / 3) return p + (q - p) * (2 / 3 - tc) * 6;
    return p;
  };
  return {
    r: Math.round(toC(hk + 1 / 3) * 255),
    g: Math.round(toC(hk) * 255),
    b: Math.round(toC(hk - 1 / 3) * 255),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function hslToEntry(hsl: HSL): ColorEntry {
  const h = ((hsl.h % 360) + 360) % 360;
  const normalized: HSL = { ...hsl, h };
  const rgb = hslToRgb(normalized);
  return { hex: rgbToHex(rgb), rgb, hsl: normalized };
}

function baseToEntry(hex: string): ColorEntry | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const hsl = rgbToHsl(rgb);
  return { hex: rgbToHex(rgb), rgb, hsl };
}

// ─── Harmony generators ────────────────────────────────────────────────────────

type HarmonyType =
  | "complementary"
  | "triadic"
  | "analogous"
  | "split-complementary"
  | "tetradic"
  | "monochromatic";

function generatePalette(base: ColorEntry, harmony: HarmonyType): ColorEntry[] {
  const { h, s, l } = base.hsl;

  switch (harmony) {
    case "complementary":
      return [
        base,
        hslToEntry({ h: h + 30, s, l }),
        hslToEntry({ h: h + 180, s, l }),
        hslToEntry({ h: h + 210, s, l }),
        hslToEntry({ h: h + 180, s: Math.min(100, s + 10), l: Math.max(10, l - 10) }),
      ];

    case "triadic":
      return [
        base,
        hslToEntry({ h: h + 120, s, l }),
        hslToEntry({ h: h + 240, s, l }),
        hslToEntry({ h: h + 60, s: Math.max(0, s - 15), l: Math.min(90, l + 10) }),
        hslToEntry({ h: h + 180, s: Math.max(0, s - 15), l: Math.min(90, l + 10) }),
      ];

    case "analogous":
      return [
        hslToEntry({ h: h - 40, s, l }),
        hslToEntry({ h: h - 20, s, l }),
        base,
        hslToEntry({ h: h + 20, s, l }),
        hslToEntry({ h: h + 40, s, l }),
      ];

    case "split-complementary":
      return [
        base,
        hslToEntry({ h: h + 150, s, l }),
        hslToEntry({ h: h + 210, s, l }),
        hslToEntry({ h: h + 30, s: Math.max(0, s - 10), l: Math.min(90, l + 15) }),
        hslToEntry({ h: h + 330, s: Math.max(0, s - 10), l: Math.min(90, l + 15) }),
      ];

    case "tetradic":
      return [
        base,
        hslToEntry({ h: h + 90, s, l }),
        hslToEntry({ h: h + 180, s, l }),
        hslToEntry({ h: h + 270, s, l }),
        hslToEntry({ h: h + 45, s: Math.max(0, s - 10), l: Math.min(90, l + 15) }),
      ];

    case "monochromatic": {
      const steps = [
        { l: Math.min(95, l + 30) },
        { l: Math.min(95, l + 15) },
        { l },
        { l: Math.max(5, l - 15) },
        { l: Math.max(5, l - 30) },
      ];
      return steps.map((step) => hslToEntry({ h, s, l: step.l }));
    }
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ColorPalette() {
  const [baseHex, setBaseHex] = useState("#3b82f6");
  const [hexInput, setHexInput] = useState("#3b82f6");
  const [harmony, setHarmony] = useState<HarmonyType>("complementary");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedCss, setCopiedCss] = useState(false);

  const palette = useMemo(() => {
    const base = baseToEntry(baseHex);
    if (!base) return [];
    return generatePalette(base, harmony);
  }, [baseHex, harmony]);

  const copyHex = useCallback((hex: string, idx: number) => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1500);
    });
  }, []);

  const exportCss = useCallback(() => {
    const vars = palette
      .map((c, i) => `  --color-${i + 1}: ${c.hex};`)
      .join("\n");
    const css = `:root {\n${vars}\n}`;
    navigator.clipboard.writeText(css).then(() => {
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 1500);
    });
  }, [palette]);

  const applyHexInput = (val: string) => {
    setHexInput(val);
    const norm = val.startsWith("#") ? val : `#${val}`;
    if (/^#[0-9a-fA-F]{6}$/.test(norm)) {
      setBaseHex(norm.toLowerCase());
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label>Base Color</Label>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="color"
                value={baseHex}
                onChange={(e) => {
                  setBaseHex(e.target.value);
                  setHexInput(e.target.value);
                }}
                className="h-10 w-10 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
                title="Pick a color"
              />
            </div>
            <Input
              className="w-28 font-mono uppercase"
              value={hexInput}
              onChange={(e) => applyHexInput(e.target.value)}
              maxLength={7}
              placeholder="#3b82f6"
            />
          </div>
        </div>

        <div className="space-y-1.5 flex-1 min-w-40">
          <Label>Harmony</Label>
          <Select value={harmony} onValueChange={(v) => setHarmony(v as HarmonyType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="complementary">Complementary</SelectItem>
              <SelectItem value="triadic">Triadic</SelectItem>
              <SelectItem value="analogous">Analogous</SelectItem>
              <SelectItem value="split-complementary">Split-Complementary</SelectItem>
              <SelectItem value="tetradic">Tetradic</SelectItem>
              <SelectItem value="monochromatic">Monochromatic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" className="gap-2" onClick={exportCss}>
          {copiedCss ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copiedCss ? "Copied!" : "Export CSS"}
        </Button>
      </div>

      {/* Palette swatches */}
      {palette.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {palette.map((color, idx) => (
            <div
              key={idx}
              className="rounded-xl overflow-hidden border border-border shadow-sm"
            >
              {/* Swatch */}
              <div
                className="h-20 w-full"
                style={{ backgroundColor: color.hex }}
              />
              {/* Info */}
              <div className="p-2.5 space-y-1 bg-card">
                <p className="font-mono text-xs font-semibold uppercase tracking-wide">
                  {color.hex}
                </p>
                <p className="text-xs text-muted-foreground">
                  {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                </p>
                <p className="text-xs text-muted-foreground">
                  {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%
                </p>
                <button
                  onClick={() => copyHex(color.hex, idx)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
                  title="Copy hex"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy hex
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
