"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmt(d: Date): string {
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export default function OvulationCalculator() {
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [result, setResult] = useState<{
    ovulation: Date;
    fertileStart: Date;
    fertileEnd: Date;
    nextPeriod: Date;
  } | null>(null);

  const calculate = () => {
    if (!lastPeriod) return;
    const lp = new Date(lastPeriod);
    const cl = Math.max(21, Math.min(45, Number(cycleLength) || 28));
    const ovulation = addDays(lp, cl - 14);
    setResult({
      ovulation,
      fertileStart: addDays(ovulation, -5),
      fertileEnd: addDays(ovulation, 1),
      nextPeriod: addDays(lp, cl),
    });
  };

  return (
    <div className="space-y-5 max-w-sm">
      <div>
        <Label className="mb-1 block">First day of last period</Label>
        <Input type="date" value={lastPeriod} onChange={(e) => setLastPeriod(e.target.value)} />
      </div>
      <div>
        <Label className="mb-1 block">Average cycle length (days)</Label>
        <Input type="number" min={21} max={45} value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} />
        <p className="text-xs text-muted-foreground mt-1">Typical range: 21–45 days</p>
      </div>
      <Button onClick={calculate} className="w-full">
        <Calendar className="h-4 w-4 mr-2" />Calculate
      </Button>

      {result && (
        <div className="rounded-lg border divide-y text-sm">
          {[
            { label: "Fertile Window", value: `${fmt(result.fertileStart)} – ${fmt(result.fertileEnd)}`, highlight: true },
            { label: "Ovulation Day (est.)", value: fmt(result.ovulation), highlight: true },
            { label: "Next Period (est.)", value: fmt(result.nextPeriod), highlight: false },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="flex justify-between items-center px-4 py-3">
              <span className="text-muted-foreground">{label}</span>
              <Badge variant={highlight ? "default" : "secondary"}>{value}</Badge>
            </div>
          ))}
          <p className="px-4 py-2 text-xs text-muted-foreground">
            For informational purposes only. Consult a healthcare provider for medical advice.
          </p>
        </div>
      )}
    </div>
  );
}
