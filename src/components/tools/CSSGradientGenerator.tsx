"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Plus, Trash2 } from "lucide-react";

type GradientType = "linear" | "radial";
interface Stop { color: string; position: number; }

export default function CSSGradientGenerator() {
  const [type, setType]       = useState<GradientType>("linear");
  const [angle, setAngle]     = useState(135);
  const [stops, setStops]     = useState<Stop[]>([
    { color: "#6366f1", position: 0 },
    { color: "#ec4899", position: 100 },
  ]);
  const [copied, setCopied]   = useState(false);

  const stopsCSS = stops
    .slice()
    .sort((a,b) => a.position - b.position)
    .map(s => `${s.color} ${s.position}%`)
    .join(", ");

  const css = type === "linear"
    ? `linear-gradient(${angle}deg, ${stopsCSS})`
    : `radial-gradient(circle, ${stopsCSS})`;

  const fullCSS = `background: ${css};`;

  const addStop = () => setStops(p => [...p, { color: "#a855f7", position: 50 }]);
  const removeStop = (i: number) => setStops(p => p.filter((_,idx) => idx !== i));
  const updateStop = (i: number, key: keyof Stop, val: string | number) =>
    setStops(p => p.map((s, idx) => idx === i ? { ...s, [key]: val } : s));

  const copy = async () => {
    await navigator.clipboard.writeText(fullCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Preview */}
      <div className="h-32 rounded-xl border" style={{ background: css }} />

      <div className="flex gap-2">
        {(["linear","radial"] as GradientType[]).map(t => (
          <Button key={t} variant={type === t ? "default" : "outline"} size="sm"
            onClick={() => setType(t)} className="capitalize">{t}</Button>
        ))}
        {type === "linear" && (
          <div className="flex items-center gap-2 ml-auto">
            <Label className="text-sm">Angle</Label>
            <input type="range" min={0} max={360} value={angle}
              onChange={e => setAngle(Number(e.target.value))} className="w-24" />
            <span className="text-sm w-10">{angle}°</span>
          </div>
        )}
      </div>

      {/* Color stops */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Color Stops</Label>
          <Button size="sm" variant="outline" onClick={addStop}>
            <Plus className="h-3.5 w-3.5 mr-1" />Add Stop
          </Button>
        </div>
        {stops.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <input type="color" value={s.color}
              onChange={e => updateStop(i, "color", e.target.value)}
              className="h-8 w-8 rounded border border-border p-0.5 cursor-pointer" />
            <Input value={s.color}
              onChange={e => updateStop(i, "color", e.target.value)}
              className="w-28 font-mono text-sm" />
            <input type="range" min={0} max={100} value={s.position}
              onChange={e => updateStop(i, "position", Number(e.target.value))}
              className="flex-1" />
            <span className="text-sm w-10 text-right">{s.position}%</span>
            {stops.length > 2 && (
              <Button size="icon" variant="ghost" onClick={() => removeStop(i)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Output */}
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
