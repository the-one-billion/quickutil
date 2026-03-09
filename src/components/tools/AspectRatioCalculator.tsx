"use client";
/**
 * Aspect Ratio Calculator
 * Tab 1: Calculate dimensions from W×H, find missing dimension
 * Tab 2: Common ratios table with visual preview
 * Tab 3: Ratio converter — generate size table for common widths
 */
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// ── Helpers ────────────────────────────────────────────────────────────────────
function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

function reduceRatio(w: number, h: number): [number, number] {
  const d = gcd(w, h);
  return [w / d, h / d];
}

function decimalRatio(w: number, h: number): string {
  if (!h) return "—";
  return (w / h).toFixed(4);
}

/** Common equivalent sizes for a given reduced ratio */
function equivalentSizes(rw: number, rh: number): { w: number; h: number }[] {
  const targets = [3840, 2560, 1920, 1280, 1024, 854, 720, 640, 480, 320];
  const seen = new Set<string>();
  const result: { w: number; h: number }[] = [];
  for (const tw of targets) {
    if (tw % rw === 0) {
      const th = (tw / rw) * rh;
      if (Number.isInteger(th)) {
        const key = `${tw}x${th}`;
        if (!seen.has(key)) { seen.add(key); result.push({ w: tw, h: th }); }
      }
    }
  }
  return result.slice(0, 8);
}

// ── Common ratios data ─────────────────────────────────────────────────────────
interface CommonRatio {
  label: string;
  description: string;
  rw: number;
  rh: number;
}

const COMMON_RATIOS: CommonRatio[] = [
  { label: "1:1",    description: "Square, Instagram posts",             rw: 1,    rh: 1    },
  { label: "4:3",    description: "SD video, old monitors, iPad",        rw: 4,    rh: 3    },
  { label: "5:4",    description: "Large format photography",            rw: 5,    rh: 4    },
  { label: "3:2",    description: "35mm film, DSLR photography",         rw: 3,    rh: 2    },
  { label: "16:9",   description: "HD video, YouTube, most monitors",    rw: 16,   rh: 9    },
  { label: "16:10",  description: "Widescreen laptops/monitors",         rw: 16,   rh: 10   },
  { label: "21:9",   description: "Ultrawide monitors, cinema",          rw: 21,   rh: 9    },
  { label: "2.35:1", description: "CinemaScope / anamorphic widescreen", rw: 2.35, rh: 1    },
  { label: "1.85:1", description: "US widescreen theatrical standard",   rw: 1.85, rh: 1    },
  { label: "9:16",   description: "Vertical video, Stories, TikTok",     rw: 9,    rh: 16   },
  { label: "4:5",    description: "Instagram portrait posts",            rw: 4,    rh: 5    },
  { label: "2:3",    description: "Portrait photography (3:2 flipped)",  rw: 2,    rh: 3    },
  { label: "3:4",    description: "Portrait orientation (4:3 flipped)",  rw: 3,    rh: 4    },
];

const COMMON_WIDTHS = [320, 640, 720, 1024, 1280, 1366, 1440, 1920, 2560, 3840];

// ── RatioPreview ───────────────────────────────────────────────────────────────
function RatioPreview({ rw, rh }: { rw: number; rh: number }) {
  const containerH = 80;
  const containerW = 200;
  const ratio = rw / (rh || 1);
  let previewW: number, previewH: number;
  if (ratio >= 1) {
    previewW = Math.min(containerW, containerH * ratio);
    previewH = previewW / ratio;
  } else {
    previewH = Math.min(containerH, containerW / ratio);
    previewW = previewH * ratio;
  }
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: containerW, height: containerH }}
    >
      <div
        className="bg-primary/20 border-2 border-primary/60 rounded-sm flex items-center justify-center text-[10px] text-primary font-medium"
        style={{ width: Math.round(previewW), height: Math.round(previewH) }}
      >
        {rw}:{rh}
      </div>
    </div>
  );
}

// ── Tab 1: Calculate Dimensions ────────────────────────────────────────────────
function CalcDimensions() {
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [newW, setNewW] = useState("");
  const [newH, setNewH] = useState("");
  const [locked, setLocked] = useState(true);

  const w = parseFloat(width) || 0;
  const h = parseFloat(height) || 0;

  const [rw, rh] = useMemo(() => {
    if (!w || !h) return [0, 0];
    // Handle non-integer input by scaling
    const scale = 1000;
    const sw = Math.round(w * scale);
    const sh = Math.round(h * scale);
    const [a, b] = reduceRatio(sw, sh);
    return [a, b];
  }, [w, h]);

  const decimal = useMemo(() => (h ? decimalRatio(w, h) : "—"), [w, h]);
  const equivSizes = useMemo(() => (rw && rh ? equivalentSizes(rw, rh) : []), [rw, rh]);

  // New size calculation
  const calcNewSize = useMemo(() => {
    if (!rw || !rh) return null;
    const nw = parseFloat(newW);
    const nh = parseFloat(newH);
    if (nw && locked) return { w: nw, h: Math.round((nw * rh) / rw) };
    if (nh && locked) return { w: Math.round((nh * rw) / rh), h: nh };
    return null;
  }, [newW, newH, rw, rh, locked]);

  return (
    <div className="flex flex-col gap-6">
      {/* Input */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Width</Label>
          <Input value={width} onChange={(e) => setWidth(e.target.value)} placeholder="e.g. 1920" type="number" min={1} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Height</Label>
          <Input value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 1080" type="number" min={1} />
        </div>
      </div>

      {/* Results */}
      {w > 0 && h > 0 && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Aspect Ratio</span>
              <span className="font-mono font-bold text-xl">{rw}:{rh}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Decimal</span>
              <span className="font-mono font-bold text-xl">{decimal}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Input</span>
              <span className="font-mono text-sm font-medium">{Math.round(w)} × {Math.round(h)}</span>
            </div>
          </div>

          {equivSizes.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground font-medium">Equivalent sizes at this ratio</span>
              <div className="flex flex-wrap gap-1.5">
                {equivSizes.map(({ w: ew, h: eh }) => (
                  <Badge key={`${ew}x${eh}`} variant="secondary" className="font-mono text-xs">
                    {ew}×{eh}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Ratio visual */}
          <RatioPreview rw={rw} rh={rh} />
        </div>
      )}

      {/* Find missing dimension */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Find Missing Dimension</h3>
          <Button
            size="sm"
            variant={locked ? "default" : "outline"}
            onClick={() => setLocked(!locked)}
            className="gap-1 text-xs"
          >
            {locked ? "🔒 Ratio locked" : "🔓 Free"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter one dimension to calculate the other at the current {rw}:{rh} ratio.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>New Width</Label>
            <Input
              value={newW}
              onChange={(e) => { setNewW(e.target.value); setNewH(""); }}
              placeholder="Width"
              type="number"
              min={1}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>New Height</Label>
            <Input
              value={newH}
              onChange={(e) => { setNewH(e.target.value); setNewW(""); }}
              placeholder="Height"
              type="number"
              min={1}
            />
          </div>
        </div>
        {calcNewSize && (
          <div className="rounded-lg bg-primary/10 border border-primary/30 px-4 py-3 flex gap-4 items-center">
            <span className="font-mono font-bold text-lg">
              {Math.round(calcNewSize.w)} × {Math.round(calcNewSize.h)}
            </span>
            <span className="text-xs text-muted-foreground">
              at {rw}:{rh}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab 2: Common Ratios ───────────────────────────────────────────────────────
function CommonRatiosTab() {
  const [customDim, setCustomDim] = useState<Record<string, string>>({});
  const [useWidth, setUseWidth] = useState<Record<string, boolean>>({});

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Enter a width or height in the input to see the corresponding dimension for each ratio.
      </p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm min-w-[480px]">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Ratio</th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Usage</th>
              <th className="text-right px-3 py-2 font-medium text-muted-foreground">Decimal</th>
              <th className="text-center px-3 py-2 font-medium text-muted-foreground">Preview</th>
              <th className="text-center px-3 py-2 font-medium text-muted-foreground w-48">Custom Dim</th>
              <th className="text-right px-3 py-2 font-medium text-muted-foreground">Result</th>
            </tr>
          </thead>
          <tbody>
            {COMMON_RATIOS.map((r) => {
              const dim = parseFloat(customDim[r.label] || "") || 0;
              const uw = useWidth[r.label] !== false; // default: width
              let result = "";
              if (dim) {
                if (uw) {
                  result = `${Math.round(dim)} × ${Math.round((dim * r.rh) / r.rw)}`;
                } else {
                  result = `${Math.round((dim * r.rw) / r.rh)} × ${Math.round(dim)}`;
                }
              }
              return (
                <tr key={r.label} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 font-mono font-bold">{r.label}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{r.description}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{(r.rw / r.rh).toFixed(4)}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center">
                      <RatioPreview rw={r.rw} rh={r.rh} />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant={uw ? "default" : "outline"}
                        className="h-7 text-xs px-2"
                        onClick={() => setUseWidth((p) => ({ ...p, [r.label]: true }))}
                      >W</Button>
                      <Button
                        size="sm"
                        variant={!uw ? "default" : "outline"}
                        className="h-7 text-xs px-2"
                        onClick={() => setUseWidth((p) => ({ ...p, [r.label]: false }))}
                      >H</Button>
                      <Input
                        className="h-7 text-xs w-20"
                        value={customDim[r.label] || ""}
                        onChange={(e) => setCustomDim((p) => ({ ...p, [r.label]: e.target.value }))}
                        placeholder={uw ? "width" : "height"}
                        type="number"
                        min={1}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs font-medium">
                    {result || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 3: Ratio Converter ─────────────────────────────────────────────────────
function RatioConverter() {
  const [ratioInput, setRatioInput] = useState("16:9");

  const parsed = useMemo(() => {
    const str = ratioInput.trim();
    // Support "W:H" or "W.WW:H" formats
    const parts = str.split(":");
    if (parts.length === 2) {
      const a = parseFloat(parts[0]);
      const b = parseFloat(parts[1]);
      if (!isNaN(a) && !isNaN(b) && b > 0) return { rw: a, rh: b };
    }
    // Also support decimal like "2.39" (assume :1)
    const d = parseFloat(str);
    if (!isNaN(d) && d > 0) return { rw: d, rh: 1 };
    return null;
  }, [ratioInput]);

  const sizeTable = useMemo(() => {
    if (!parsed) return [];
    return COMMON_WIDTHS.map((w) => {
      const h = (w * parsed.rh) / parsed.rw;
      return { w, h: Math.round(h) };
    });
  }, [parsed]);

  const [rw, rh] = useMemo(() => {
    if (!parsed) return [0, 0];
    return reduceRatio(Math.round(parsed.rw * 1000), Math.round(parsed.rh * 1000));
  }, [parsed]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label>Custom Ratio</Label>
        <div className="flex gap-2 items-center">
          <Input
            value={ratioInput}
            onChange={(e) => setRatioInput(e.target.value)}
            placeholder='e.g. "2.39:1" or "16:9"'
            className="max-w-xs"
          />
          {parsed && (
            <Badge variant="secondary" className="font-mono">
              Reduced: {rw}:{rh}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Enter as W:H (e.g., 16:9, 2.39:1, 4:3) or a decimal (e.g., 1.78)
        </p>
      </div>

      {/* Quick select */}
      <div className="flex flex-wrap gap-1.5">
        {COMMON_RATIOS.map((r) => (
          <Button
            key={r.label}
            size="sm"
            variant="outline"
            className="text-xs h-7"
            onClick={() => setRatioInput(r.label)}
          >
            {r.label}
          </Button>
        ))}
      </div>

      {parsed ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <RatioPreview rw={parsed.rw} rh={parsed.rh} />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{parsed.rw}:{parsed.rh}</span>
              <span className="font-mono text-xs text-muted-foreground">
                = {(parsed.rw / parsed.rh).toFixed(6)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Width (px)</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">Height (px)</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Common Name</th>
                </tr>
              </thead>
              <tbody>
                {sizeTable.map(({ w, h }) => {
                  const names: Record<number, string> = {
                    320: "Mobile S",
                    640: "Mobile L / SD",
                    720: "HD Ready",
                    1024: "XGA / iPad",
                    1280: "HD / 720p",
                    1366: "Common laptop",
                    1440: "2K / QHD",
                    1920: "Full HD / 1080p",
                    2560: "QHD / 1440p",
                    3840: "4K UHD",
                  };
                  return (
                    <tr key={w} className="border-b border-border hover:bg-muted/20">
                      <td className="px-4 py-2 text-right font-mono font-semibold">{w}</td>
                      <td className="px-4 py-2 text-right font-mono">{h}</td>
                      <td className="px-4 py-2 text-muted-foreground text-xs">{names[w] || ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center text-muted-foreground text-sm py-8">
          Enter a valid ratio to see the size table.
        </div>
      )}
    </div>
  );
}

// ── Root export ────────────────────────────────────────────────────────────────
export default function AspectRatioCalculator() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Tabs defaultValue="calculate">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="calculate" className="flex-1">Calculate Dimensions</TabsTrigger>
          <TabsTrigger value="common" className="flex-1">Common Ratios</TabsTrigger>
          <TabsTrigger value="converter" className="flex-1">Ratio Converter</TabsTrigger>
        </TabsList>
        <TabsContent value="calculate"><CalcDimensions /></TabsContent>
        <TabsContent value="common"><CommonRatiosTab /></TabsContent>
        <TabsContent value="converter"><RatioConverter /></TabsContent>
      </Tabs>
    </div>
  );
}
