"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

type Option    = { id: string; name: string };
type Criterion = { id: string; name: string; weight: number };
type Scores    = Record<string, Record<string, number>>; // scores[optionId][criterionId]

let _id = 0;
const uid = () => String(++_id);

function defaultOptions(): Option[] {
  return [{ id: uid(), name: "Option A" }, { id: uid(), name: "Option B" }];
}
function defaultCriteria(): Criterion[] {
  return [
    { id: uid(), name: "Cost",       weight: 3 },
    { id: uid(), name: "Ease",       weight: 2 },
    { id: uid(), name: "Impact",     weight: 5 },
  ];
}

export default function DecisionMatrix() {
  const [options,   setOptions]   = useState<Option[]>(defaultOptions);
  const [criteria,  setCriteria]  = useState<Criterion[]>(defaultCriteria);
  const [scores,    setScores]    = useState<Scores>({});

  // ── helpers ──────────────────────────────────────────────────────────────
  function getScore(optId: string, criId: string) {
    return scores[optId]?.[criId] ?? "";
  }
  function setScore(optId: string, criId: string, val: string) {
    const n = Math.min(10, Math.max(0, Number(val)));
    setScores(prev => ({
      ...prev,
      [optId]: { ...(prev[optId] ?? {}), [criId]: n },
    }));
  }
  function weightedTotal(opt: Option) {
    return criteria.reduce((sum, c) => {
      const s = scores[opt.id]?.[c.id] ?? 0;
      return sum + s * c.weight;
    }, 0);
  }
  const maxTotal = criteria.reduce((s, c) => s + 10 * c.weight, 0);
  const ranked   = [...options].sort((a, b) => weightedTotal(b) - weightedTotal(a));
  const winner   = ranked[0];

  // ── mutations ─────────────────────────────────────────────────────────────
  function addOption()    { setOptions(o  => [...o,  { id: uid(), name: `Option ${String.fromCharCode(65 + o.length)}`  }]); }
  function addCriterion() { setCriteria(c => [...c, { id: uid(), name: "Criterion", weight: 1 }]); }
  function removeOption(id: string)    { setOptions(o  => o.filter(x => x.id !== id)); }
  function removeCriterion(id: string) { setCriteria(c => c.filter(x => x.id !== id)); }

  function updateOption(id: string, name: string) {
    setOptions(o => o.map(x => x.id === id ? { ...x, name } : x));
  }
  function updateCriterion(id: string, key: keyof Criterion, val: string) {
    setCriteria(c => c.map(x => x.id === id
      ? { ...x, [key]: key === "weight" ? Math.max(1, Math.min(10, Number(val))) : val }
      : x));
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-auto">
      {/* Options row */}
      <div className="space-y-2">
        <Label>Options (what you&apos;re choosing between)</Label>
        <div className="flex flex-wrap gap-2">
          {options.map(opt => (
            <div key={opt.id} className="flex items-center gap-1">
              <Input
                value={opt.name}
                onChange={e => updateOption(opt.id, e.target.value)}
                className="w-36 h-8 text-sm"
              />
              <Button
                variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                onClick={() => removeOption(opt.id)}
                disabled={options.length <= 2}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addOption} className="h-8 gap-1">
            <Plus className="h-3.5 w-3.5" /> Add option
          </Button>
        </div>
      </div>

      {/* Matrix table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground w-44">
                Criterion
              </th>
              <th className="px-2 py-2 text-center font-medium text-muted-foreground w-16">
                Weight
              </th>
              {options.map(opt => (
                <th key={opt.id} className="px-3 py-2 text-center font-medium">
                  {opt.name}
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {criteria.map(c => (
              <tr key={c.id} className="border-t border-border hover:bg-muted/20">
                <td className="px-3 py-1.5">
                  <Input
                    value={c.name}
                    onChange={e => updateCriterion(c.id, "name", e.target.value)}
                    className="h-7 text-sm border-0 px-0 bg-transparent focus-visible:ring-0"
                  />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <Input
                    type="number" min="1" max="10"
                    value={c.weight}
                    onChange={e => updateCriterion(c.id, "weight", e.target.value)}
                    className="h-7 w-14 text-center text-sm mx-auto"
                  />
                </td>
                {options.map(opt => (
                  <td key={opt.id} className="px-3 py-1.5 text-center">
                    <Input
                      type="number" min="0" max="10"
                      placeholder="0–10"
                      value={getScore(opt.id, c.id)}
                      onChange={e => setScore(opt.id, c.id, e.target.value)}
                      className="h-7 w-16 text-center text-sm mx-auto"
                    />
                  </td>
                ))}
                <td className="px-1 py-1.5">
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                    onClick={() => removeCriterion(c.id)}
                    disabled={criteria.length <= 1}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            ))}
            <tr className="border-t border-border">
              <td className="px-3 py-2" colSpan={2}>
                <Button variant="ghost" size="sm" onClick={addCriterion} className="h-7 gap-1 text-xs">
                  <Plus className="h-3 w-3" /> Add criterion
                </Button>
              </td>
              {options.map(opt => (
                <td key={opt.id} />
              ))}
              <td />
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/50">
              <td className="px-3 py-2 font-semibold" colSpan={2}>
                Weighted Total <span className="text-xs font-normal text-muted-foreground">(max {maxTotal})</span>
              </td>
              {options.map(opt => {
                const total   = weightedTotal(opt);
                const pct     = maxTotal ? Math.round(total / maxTotal * 100) : 0;
                const isWinner = winner && opt.id === winner.id && total > 0;
                return (
                  <td key={opt.id} className="px-3 py-2 text-center">
                    <div className={`font-bold text-base ${isWinner ? "text-green-500" : ""}`}>
                      {total}
                    </div>
                    <div className="text-xs text-muted-foreground">{pct}%</div>
                    {isWinner && <div className="text-xs font-semibold text-green-500">★ Best</div>}
                  </td>
                );
              })}
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Rankings */}
      {ranked.some(o => weightedTotal(o) > 0) && (
        <div className="space-y-2">
          <Label>Ranking</Label>
          <div className="space-y-1.5">
            {ranked.map((opt, i) => {
              const total = weightedTotal(opt);
              const pct   = maxTotal ? total / maxTotal * 100 : 0;
              return (
                <div key={opt.id} className="flex items-center gap-3">
                  <span className="w-6 text-sm text-muted-foreground text-right">{i + 1}.</span>
                  <span className="w-28 text-sm font-medium truncate">{opt.name}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: i === 0 ? "#22c55e" : i === 1 ? "#6366f1" : "#94a3b8",
                      }}
                    />
                  </div>
                  <span className="text-sm font-mono w-20 text-right">
                    {total} / {maxTotal}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-md bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        Score each option per criterion from <strong>0–10</strong>. Assign a <strong>weight (1–10)</strong> to each
        criterion based on its importance. The weighted total = Σ(score × weight). Higher is better.
      </div>
    </div>
  );
}
