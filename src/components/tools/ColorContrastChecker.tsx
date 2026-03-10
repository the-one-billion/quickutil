"use client";
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#","").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const s = [r,g,b].map(c => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
}

function contrastRatio(l1: number, l2: number): number {
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

export default function ColorContrastChecker() {
  const [fg, setFg] = useState("#1e293b");
  const [bg, setBg] = useState("#f8fafc");

  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  const ratio = fgRgb && bgRgb
    ? contrastRatio(relativeLuminance(...fgRgb), relativeLuminance(...bgRgb))
    : null;

  const aaLarge  = ratio !== null && ratio >= 3;
  const aaNormal = ratio !== null && ratio >= 4.5;
  const aaaLarge = ratio !== null && ratio >= 4.5;
  const aaaNormal= ratio !== null && ratio >= 7;

  return (
    <div className="space-y-6 max-w-sm">
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Foreground", val: fg, set: setFg },
          { label: "Background", val: bg, set: setBg },
        ].map(({ label, val, set }) => (
          <div key={label}>
            <Label className="mb-2 block">{label}</Label>
            <div className="flex gap-2 items-center">
              <input type="color" value={val} onChange={e => set(e.target.value)}
                className="h-9 w-9 cursor-pointer rounded border border-border p-0.5" />
              <Input value={val} onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) set(e.target.value); }}
                className="font-mono text-sm" maxLength={7} />
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="rounded-xl border overflow-hidden">
        <div className="p-6 text-center" style={{ backgroundColor: bg, color: fg }}>
          <p className="text-2xl font-bold">Aa Bb Cc 123</p>
          <p className="text-sm mt-1">Normal text preview</p>
          <p className="text-lg font-semibold mt-2">Large text preview (18pt+)</p>
        </div>
      </div>

      {ratio !== null && (
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-5xl font-black">{ratio.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">contrast ratio</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { label: "AA Normal", pass: aaNormal, req: "≥4.5" },
              { label: "AA Large",  pass: aaLarge,  req: "≥3.0" },
              { label: "AAA Normal",pass: aaaNormal, req: "≥7.0" },
              { label: "AAA Large", pass: aaaLarge,  req: "≥4.5" },
            ].map(({ label, pass, req }) => (
              <div key={label} className="flex justify-between items-center rounded-lg border px-3 py-2">
                <div>
                  <span className="font-medium">{label}</span>
                  <span className="text-xs text-muted-foreground ml-1">{req}</span>
                </div>
                <Badge variant={pass ? "default" : "destructive"}>{pass ? "Pass" : "Fail"}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
