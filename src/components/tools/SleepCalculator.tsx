"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun } from "lucide-react";

function addMinutes(base: Date, mins: number): string {
  const d = new Date(base.getTime() + mins * 60000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const CYCLES = [6, 5, 4, 3] as const;

export default function SleepCalculator() {
  const [mode, setMode] = useState<"wakeup" | "bedtime">("wakeup");
  const [time, setTime] = useState("");
  const [results, setResults] = useState<{ t: string; cycles: number }[]>([]);

  const calculate = () => {
    if (!time) return;
    const [h, m] = time.split(":").map(Number);
    const base = new Date();
    base.setHours(h, m, 0, 0);
    const FALL_ASLEEP = 15;
    const CYCLE = 90;
    setResults(CYCLES.map((cycles) => {
      const mins = mode === "wakeup"
        ? -(cycles * CYCLE + FALL_ASLEEP)
        : cycles * CYCLE + FALL_ASLEEP;
      return { t: addMinutes(base, mins), cycles };
    }));
  };

  return (
    <div className="space-y-5 max-w-sm">
      <div className="flex gap-2">
        <Button variant={mode === "wakeup" ? "default" : "outline"} size="sm" onClick={() => { setMode("wakeup"); setResults([]); }}>
          <Sun className="h-4 w-4 mr-1" />Wake-up time
        </Button>
        <Button variant={mode === "bedtime" ? "default" : "outline"} size="sm" onClick={() => { setMode("bedtime"); setResults([]); }}>
          <Moon className="h-4 w-4 mr-1" />Bedtime
        </Button>
      </div>

      <div>
        <Label className="mb-1 block">
          {mode === "wakeup" ? "I want to wake up at" : "I want to go to bed at"}
        </Label>
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>

      <Button onClick={calculate} className="w-full">Calculate Sleep Times</Button>

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {mode === "wakeup" ? "Fall asleep at one of these times:" : "Set your alarm for one of these times:"}
          </p>
          {results.map(({ t, cycles }) => (
            <div key={cycles} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <span className="text-xl font-semibold">{t}</span>
              <Badge variant={cycles >= 5 ? "default" : "secondary"}>
                {cycles * 1.5}h · {cycles} cycles
              </Badge>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Based on 90-min sleep cycles + ~15 min to fall asleep</p>
        </div>
      )}
    </div>
  );
}
