"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface Item { label: string; amount: string; }

const DEFAULT_ASSETS = [
  { label: "Checking/Savings", amount: "5000" },
  { label: "Investments", amount: "20000" },
  { label: "Home Value", amount: "300000" },
];
const DEFAULT_LIABILITIES = [
  { label: "Mortgage", amount: "200000" },
  { label: "Car Loan", amount: "15000" },
  { label: "Credit Cards", amount: "3000" },
];

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function Section({ title, items, color, onAdd, onRemove, onChange }: {
  title: string; items: Item[]; color: string;
  onAdd: () => void; onRemove: (i: number) => void; onChange: (i: number, k: keyof Item, v: string) => void;
}) {
  const total = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold ${color}`}>{title}</h3>
        <span className={`text-sm font-mono font-bold ${color}`}>{fmt(total)}</span>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input value={item.label} onChange={e => onChange(i, "label", e.target.value)} placeholder="Label" className="flex-1" />
          <Input value={item.amount} onChange={e => onChange(i, "amount", e.target.value)} placeholder="0" className="w-32 font-mono" type="number" />
          <Button size="icon" variant="ghost" onClick={() => onRemove(i)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={onAdd}><Plus className="h-3.5 w-3.5 mr-1" />Add {title.replace("Total ","")}</Button>
    </div>
  );
}

export default function NetWorthCalculator() {
  const [assets, setAssets]           = useState<Item[]>(DEFAULT_ASSETS);
  const [liabilities, setLiabilities] = useState<Item[]>(DEFAULT_LIABILITIES);

  const totalAssets = assets.reduce((s,i) => s+(parseFloat(i.amount)||0), 0);
  const totalLiab   = liabilities.reduce((s,i) => s+(parseFloat(i.amount)||0), 0);
  const netWorth    = totalAssets - totalLiab;

  const updA = (i: number, k: keyof Item, v: string) => setAssets(p => p.map((x,idx) => idx===i ? {...x,[k]:v} : x));
  const updL = (i: number, k: keyof Item, v: string) => setLiabilities(p => p.map((x,idx) => idx===i ? {...x,[k]:v} : x));

  return (
    <div className="space-y-6">
      <Section title="Assets" color="text-green-600 dark:text-green-400" items={assets}
        onAdd={() => setAssets(p => [...p, { label: "", amount: "" }])}
        onRemove={i => setAssets(p => p.filter((_,idx) => idx!==i))}
        onChange={updA} />
      <Section title="Liabilities" color="text-red-600 dark:text-red-400" items={liabilities}
        onAdd={() => setLiabilities(p => [...p, { label: "", amount: "" }])}
        onRemove={i => setLiabilities(p => p.filter((_,idx) => idx!==i))}
        onChange={updL} />
      <div className={`rounded-xl border-2 p-5 text-center ${netWorth >= 0 ? "border-green-500/40 bg-green-500/5" : "border-red-500/40 bg-red-500/5"}`}>
        <p className="text-sm text-muted-foreground mb-1">Your Net Worth</p>
        <p className={`text-4xl font-black ${netWorth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {fmt(netWorth)}
        </p>
        <div className="flex justify-center gap-6 mt-3 text-sm">
          <span className="text-muted-foreground">Assets: <strong className="text-foreground">{fmt(totalAssets)}</strong></span>
          <span className="text-muted-foreground">Liabilities: <strong className="text-foreground">{fmt(totalLiab)}</strong></span>
        </div>
      </div>
    </div>
  );
}
