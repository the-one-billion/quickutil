"use client";
/**
 * Color Converter
 * Synced HEX / RGB / HSL / CMYK inputs + native color picker + copy buttons.
 * All math implemented inline — no external color library.
 */
import { useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// ── Types ────────────────────────────────────────────────────────────────────
interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }
interface CMYK { c: number; m: number; y: number; k: number }

// ── Color math ───────────────────────────────────────────────────────────────
function clamp(v: number, min = 0, max = 255): number {
  return Math.max(min, Math.min(max, v));
}

function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => clamp(Math.round(v)).toString(16).padStart(2, "0"))
      .join("")
  );
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
    case gn: h = ((bn - rn) / d + 2) / 6; break;
    case bn: h = ((rn - gn) / d + 4) / 6; break;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const hn = h / 360, sn = s / 100, ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hue2rgb = (t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return {
    r: Math.round(hue2rgb(hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(hn) * 255),
    b: Math.round(hue2rgb(hn - 1 / 3) * 255),
  };
}

function rgbToCmyk({ r, g, b }: RGB): CMYK {
  if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 };
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  const c = (1 - rn - k) / (1 - k);
  const m = (1 - gn - k) / (1 - k);
  const y = (1 - bn - k) / (1 - k);
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

function cmykToRgb({ c, m, y, k }: CMYK): RGB {
  const kn = k / 100;
  return {
    r: Math.round(255 * (1 - c / 100) * (1 - kn)),
    g: Math.round(255 * (1 - m / 100) * (1 - kn)),
    b: Math.round(255 * (1 - y / 100) * (1 - kn)),
  };
}

// ── Copy helper ───────────────────────────────────────────────────────────────
function useCopied() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback((key: string, text: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopiedKey(null), 1500);
    });
  }, []);

  return { copiedKey, copy };
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ColorConverter() {
  // The canonical colour state is always an RGB triple
  const [rgb, setRgb] = useState<RGB>({ r: 99, g: 102, b: 241 }); // indigo-500

  // Intermediate text state for each format (so user can type freely)
  const [hexText, setHexText] = useState("#6366f1");
  const [rgbText, setRgbText] = useState("99, 102, 241");
  const [hslText, setHslText] = useState("");
  const [cmykText, setCmykText] = useState("");

  const hsl = rgbToHsl(rgb);
  const cmyk = rgbToCmyk(rgb);
  const hex = rgbToHex(rgb);

  const derivedHslText = `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
  const derivedCmykText = `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`;

  const { copiedKey, copy } = useCopied();

  // ── Sync helpers ────────────────────────────────────────────────────────
  const syncFromRgb = useCallback((newRgb: RGB) => {
    setRgb(newRgb);
    setHexText(rgbToHex(newRgb));
    setRgbText(`${newRgb.r}, ${newRgb.g}, ${newRgb.b}`);
    setHslText("");
    setCmykText("");
  }, []);

  // ── HEX input ────────────────────────────────────────────────────────────
  function handleHexChange(val: string) {
    setHexText(val);
    const parsed = hexToRgb(val.startsWith("#") ? val : `#${val}`);
    if (parsed) {
      setRgb(parsed);
      setRgbText(`${parsed.r}, ${parsed.g}, ${parsed.b}`);
      setHslText("");
      setCmykText("");
    }
  }

  // ── Native color picker ───────────────────────────────────────────────────
  function handlePickerChange(val: string) {
    const parsed = hexToRgb(val);
    if (parsed) syncFromRgb(parsed);
    setHexText(val);
  }

  // ── RGB input ─────────────────────────────────────────────────────────────
  function handleRgbChange(val: string) {
    setRgbText(val);
    const parts = val.split(",").map((s) => parseInt(s.trim(), 10));
    if (parts.length === 3 && parts.every((p) => !isNaN(p))) {
      const newRgb: RGB = {
        r: clamp(parts[0]),
        g: clamp(parts[1]),
        b: clamp(parts[2]),
      };
      setRgb(newRgb);
      setHexText(rgbToHex(newRgb));
      setHslText("");
      setCmykText("");
    }
  }

  // ── HSL input ─────────────────────────────────────────────────────────────
  function handleHslChange(val: string) {
    setHslText(val);
    const clean = val.replace(/%/g, "");
    const parts = clean.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length === 3 && parts.every((p) => !isNaN(p))) {
      const newHsl: HSL = {
        h: clamp(parts[0], 0, 360),
        s: clamp(parts[1], 0, 100),
        l: clamp(parts[2], 0, 100),
      };
      const newRgb = hslToRgb(newHsl);
      setRgb(newRgb);
      setHexText(rgbToHex(newRgb));
      setRgbText(`${newRgb.r}, ${newRgb.g}, ${newRgb.b}`);
      setCmykText("");
    }
  }

  // ── CMYK input ────────────────────────────────────────────────────────────
  function handleCmykChange(val: string) {
    setCmykText(val);
    const clean = val.replace(/%/g, "");
    const parts = clean.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
      const newCmyk: CMYK = {
        c: clamp(parts[0], 0, 100),
        m: clamp(parts[1], 0, 100),
        y: clamp(parts[2], 0, 100),
        k: clamp(parts[3], 0, 100),
      };
      const newRgb = cmykToRgb(newCmyk);
      setRgb(newRgb);
      setHexText(rgbToHex(newRgb));
      setRgbText(`${newRgb.r}, ${newRgb.g}, ${newRgb.b}`);
      setHslText("");
    }
  }

  const formatRows: Array<{
    id: string;
    label: string;
    value: string;
    displayValue: string;
    placeholder: string;
    onChange: (v: string) => void;
    copyText: string;
  }> = [
    {
      id: "hex",
      label: "HEX",
      value: hexText,
      displayValue: hex,
      placeholder: "#6366f1",
      onChange: handleHexChange,
      copyText: hex,
    },
    {
      id: "rgb",
      label: "RGB",
      value: rgbText,
      displayValue: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      placeholder: "255, 0, 0",
      onChange: handleRgbChange,
      copyText: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    },
    {
      id: "hsl",
      label: "HSL",
      value: hslText || derivedHslText,
      displayValue: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      placeholder: "240, 50%, 60%",
      onChange: handleHslChange,
      copyText: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    },
    {
      id: "cmyk",
      label: "CMYK",
      value: cmykText || derivedCmykText,
      displayValue: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
      placeholder: "0%, 100%, 100%, 0%",
      onChange: handleCmykChange,
      copyText: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Color Converter</h1>
        <p className="text-sm text-muted-foreground">
          Convert colors between HEX, RGB, HSL, and CMYK. Edit any field or use the color picker — all formats stay in sync.
        </p>
      </div>

      {/* Color swatch + native picker */}
      <div className="flex items-center gap-4">
        <div
          className="h-24 w-24 rounded-2xl border border-border shadow-lg shrink-0"
          style={{ backgroundColor: hex }}
          aria-label="Color preview"
        />
        <div className="space-y-2 flex-1">
          <Label htmlFor="color-picker">Color Picker</Label>
          <div className="flex items-center gap-3">
            <input
              id="color-picker"
              type="color"
              value={hex}
              onChange={(e) => handlePickerChange(e.target.value)}
              className="h-10 w-20 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
            />
            <span className="text-sm text-muted-foreground font-mono">{hex.toUpperCase()}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            rgb({rgb.r}, {rgb.g}, {rgb.b}) · hsl({hsl.h}°, {hsl.s}%, {hsl.l}%)
          </p>
        </div>
      </div>

      {/* Format inputs */}
      <div className="space-y-3">
        {formatRows.map((row) => (
          <div key={row.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`input-${row.id}`} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {row.label}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => copy(row.id, row.copyText)}
              >
                {copiedKey === row.id ? "Copied!" : "Copy"}
              </Button>
            </div>
            <Input
              id={`input-${row.id}`}
              value={row.value}
              onChange={(e) => row.onChange(e.target.value)}
              placeholder={row.placeholder}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground font-mono">{row.displayValue}</p>
          </div>
        ))}
      </div>

      <p className="border-t border-border pt-4 text-xs text-muted-foreground">
        All color math is performed inline. CMYK conversion assumes sRGB color space.
      </p>
    </div>
  );
}
