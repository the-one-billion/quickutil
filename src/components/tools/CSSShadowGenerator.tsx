"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Check, Plus, Trash2 } from "lucide-react";

interface ShadowLayer {
  x: number; y: number; blur: number; spread: number;
  color: string; opacity: number; inset: boolean;
}

function layerToCSS(l: ShadowLayer): string {
  const hex = l.color;
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  const rgba = `rgba(${r},${g},${b},${(l.opacity/100).toFixed(2)})`;
  return `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${rgba}`;
}

const defaultLayer = (): ShadowLayer => ({ x: 0, y: 4, blur: 12, spread: 0, color: "#000000", opacity: 15, inset: false });

export default function CSSShadowGenerator() {
  const [layers, setLayers] = useState<ShadowLayer[]>([defaultLayer()]);
  const [copied, setCopied] = useState(false);

  const css = layers.map(layerToCSS).join(", ");
  const fullCSS = `box-shadow: ${css};`;

  const update = (i: number, key: keyof ShadowLayer, val: unknown) =>
    setLayers(p => p.map((l, idx) => idx === i ? { ...l, [key]: val } : l));

  const copy = async () => {
    await navigator.clipboard.writeText(fullCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sliders: { key: keyof ShadowLayer; label: string; min: number; max: number; unit: string }[] = [
    { key: "x",       label: "X Offset",  min: -50, max: 50,  unit: "px" },
    { key: "y",       label: "Y Offset",  min: -50, max: 50,  unit: "px" },
    { key: "blur",    label: "Blur",      min: 0,   max: 100, unit: "px" },
    { key: "spread",  label: "Spread",    min: -50, max: 50,  unit: "px" },
    { key: "opacity", label: "Opacity",   min: 0,   max: 100, unit: "%" },
  ];

  return (
    <div className="space-y-5">
      {/* Preview */}
      <div className="flex items-center justify-center h-36 rounded-xl border bg-muted/20">
        <div className="h-20 w-32 rounded-xl bg-background border"
          style={{ boxShadow: css }} />
      </div>

      {layers.map((layer, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Layer {i + 1}</span>
            <div className="flex gap-2">
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="checkbox" checked={layer.inset}
                  onChange={e => update(i, "inset", e.target.checked)} />
                Inset
              </label>
              {layers.length > 1 && (
                <Button size="icon" variant="ghost" onClick={() => setLayers(p => p.filter((_,idx) => idx !== i))}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="color" value={layer.color}
              onChange={e => update(i, "color", e.target.value)}
              className="h-8 w-8 rounded border border-border p-0.5 cursor-pointer" />
            <span className="font-mono text-sm">{layer.color}</span>
          </div>
          {sliders.map(({ key, label, min, max, unit }) => (
            <div key={key} className="flex items-center gap-3">
              <Label className="w-20 text-xs">{label}</Label>
              <input type="range" min={min} max={max} value={layer[key] as number}
                onChange={e => update(i, key, Number(e.target.value))} className="flex-1" />
              <span className="text-xs w-14 text-right">{layer[key] as number}{unit}</span>
            </div>
          ))}
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={() => setLayers(p => [...p, defaultLayer()])}>
        <Plus className="h-3.5 w-3.5 mr-1" />Add Layer
      </Button>

      <div className="rounded-lg border bg-muted/30 px-4 py-3 font-mono text-sm break-all">
        {fullCSS}
      </div>
      <Button onClick={copy} variant="outline">
        {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
        {copied ? "Copied!" : "Copy CSS"}
      </Button>
    </div>
  );
}
