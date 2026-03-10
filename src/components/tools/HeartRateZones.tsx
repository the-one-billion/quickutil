"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ZONES = [
  { name: "Zone 1 – Warm Up",      pctLow: 50, pctHigh: 60, color: "#6366f1", desc: "Very light effort; recovery & warm-up"       },
  { name: "Zone 2 – Fat Burn",     pctLow: 60, pctHigh: 70, color: "#22c55e", desc: "Moderate effort; builds aerobic base"         },
  { name: "Zone 3 – Aerobic",      pctLow: 70, pctHigh: 80, color: "#eab308", desc: "Comfortably hard; improves cardiovascular fitness" },
  { name: "Zone 4 – Anaerobic",    pctLow: 80, pctHigh: 90, color: "#f97316", desc: "Hard effort; increases speed & power"         },
  { name: "Zone 5 – Maximum",      pctLow: 90, pctHigh: 100, color: "#ef4444", desc: "All-out effort; maximum sprint capacity"     },
];

export default function HeartRateZones() {
  const [age, setAge]         = useState("");
  const [restHR, setRestHR]   = useState("");
  const [method, setMethod]   = useState<"max" | "karvonen">("karvonen");
  const [customMax, setCustomMax] = useState("");

  const ageNum     = parseInt(age)     || 0;
  const restHRNum  = parseInt(restHR)  || 60;
  const maxHR      = customMax ? parseInt(customMax) : ageNum ? 220 - ageNum : 0;
  const hrReserve  = maxHR - restHRNum;

  function calcZone(pctLow: number, pctHigh: number) {
    if (!maxHR) return null;
    if (method === "karvonen") {
      return {
        low:  Math.round(pctLow  / 100 * hrReserve + restHRNum),
        high: Math.round(pctHigh / 100 * hrReserve + restHRNum),
      };
    }
    return {
      low:  Math.round(pctLow  / 100 * maxHR),
      high: Math.round(pctHigh / 100 * maxHR),
    };
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Age</Label>
          <Input
            type="number" min="10" max="100"
            placeholder="e.g. 30"
            value={age}
            onChange={e => setAge(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Resting HR (bpm)</Label>
          <Input
            type="number" min="30" max="120"
            placeholder="e.g. 60"
            value={restHR}
            onChange={e => setRestHR(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Custom Max HR (optional)</Label>
          <Input
            type="number" min="100" max="250"
            placeholder={ageNum ? `Auto: ${220 - ageNum}` : "Override"}
            value={customMax}
            onChange={e => setCustomMax(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Method</Label>
          <div className="flex gap-2 pt-1">
            {(["karvonen", "max"] as const).map(m => (
              <Button
                key={m}
                size="sm"
                variant={method === m ? "default" : "outline"}
                onClick={() => setMethod(m)}
                className="flex-1 capitalize"
              >
                {m === "karvonen" ? "Karvonen" : "% Max HR"}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {maxHR > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-2 bg-muted/50 text-sm text-muted-foreground flex justify-between">
            <span>Max HR: <strong className="text-foreground">{maxHR} bpm</strong></span>
            {method === "karvonen" && (
              <span>HR Reserve: <strong className="text-foreground">{hrReserve} bpm</strong></span>
            )}
          </div>
          {ZONES.map(zone => {
            const range = calcZone(zone.pctLow, zone.pctHigh);
            if (!range) return null;
            return (
              <div
                key={zone.name}
                className="flex items-center gap-3 px-4 py-3 border-t border-border"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: zone.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{zone.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{zone.desc}</p>
                </div>
                <div className="text-sm font-mono tabular-nums text-right shrink-0">
                  <span className="font-bold">{range.low}–{range.high}</span>
                  <span className="text-muted-foreground ml-1">bpm</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!maxHR && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Enter your age (or custom max HR) to calculate zones.
        </p>
      )}

      <div className="rounded-md bg-muted/40 px-4 py-3 text-xs text-muted-foreground space-y-1">
        <p><strong>Karvonen formula</strong> (recommended): takes resting HR into account for a more personalised result.</p>
        <p><strong>% Max HR</strong>: simpler method, uses only maximum heart rate.</p>
        <p>Default max HR uses the <em>220 – age</em> estimate. Enter a custom value if you know your true max HR from a test.</p>
      </div>
    </div>
  );
}
