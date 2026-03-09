"use client";
/**
 * Discount Calculator
 * Three tabs: Sale Price, Discount %, Original Price.
 * Bonus: multi-discount (stacked) + quick reference table.
 * Currency symbol selector. Copy result. Live calculation.
 */
import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// ── Helpers ───────────────────────────────────────────────────────────────
function fmt2(n: number): string {
  if (isNaN(n) || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtPct(n: number): string {
  if (isNaN(n) || !isFinite(n)) return "—";
  return n.toFixed(2).replace(/\.?0+$/, "") + "%";
}

const CURRENCIES = ["$", "£", "€", "¥", "₹"];
const QUICK_DISCOUNTS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70];

// ── Copy button ───────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? "Copied!" : "Copy Result"}
    </Button>
  );
}

// ── Savings bar ───────────────────────────────────────────────────────────
function SavingsBar({ savingsPct }: { savingsPct: number }) {
  const pctSave = Math.max(0, Math.min(100, savingsPct));
  const pctPay  = 100 - pctSave;
  return (
    <div className="space-y-1">
      <div className="flex rounded-full overflow-hidden h-4 w-full">
        <div
          className="bg-green-500 transition-all duration-300"
          style={{ width: `${pctSave}%` }}
          title={`Savings: ${fmtPct(pctSave)}`}
        />
        <div
          className="bg-muted border border-border"
          style={{ width: `${pctPay}%` }}
          title={`You pay: ${fmtPct(pctPay)}`}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="text-green-600 dark:text-green-400 font-medium">Save {fmtPct(pctSave)}</span>
        <span>Pay {fmtPct(pctPay)}</span>
      </div>
    </div>
  );
}

// ── Result card ───────────────────────────────────────────────────────────
interface ResultRow {
  label: string;
  value: string;
  accent?: boolean;
  color?:  "green" | "red" | "blue";
}
function ResultCard({ rows }: { rows: ResultRow[] }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/50 px-4 py-2.5 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Results</p>
      </div>
      <div className="divide-y divide-border">
        {rows.map(({ label, value, accent, color }) => {
          const colorClass = color === "green"
            ? "text-green-600 dark:text-green-400"
            : color === "red"
            ? "text-red-500"
            : color === "blue"
            ? "text-blue-600 dark:text-blue-400"
            : "text-foreground";
          return (
            <div key={label} className={`flex items-center justify-between px-5 py-4 ${accent ? "bg-primary/5" : ""}`}>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className={`font-extrabold tabular-nums tracking-tight ${accent ? "text-3xl text-primary" : `text-xl ${colorClass}`}`}>
                {value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function DiscountCalculator() {
  const [currency, setCurrency] = useState("$");

  // Tab 1 – Sale Price
  const [salePriceOrig, setSalePriceOrig] = useState("");
  const [salePricePct,  setSalePricePct]  = useState("");

  // Tab 2 – Discount %
  const [dpOrig, setDpOrig] = useState("");
  const [dpSale, setDpSale] = useState("");

  // Tab 3 – Original Price
  const [opSale, setOpSale] = useState("");
  const [opPct,  setOpPct]  = useState("");

  // Multi-discount
  const [mdOrigStr, setMdOrigStr] = useState("");
  const [mdDiscounts, setMdDiscounts] = useState<string[]>(["20", "10", ""]);

  // ── Tab 1 calcs
  const salePriceCalc = useMemo(() => {
    const orig = parseFloat(salePriceOrig);
    const pct  = parseFloat(salePricePct);
    if (isNaN(orig) || isNaN(pct) || orig < 0 || pct < 0 || pct > 100) return null;
    const saved     = orig * (pct / 100);
    const salePrice = orig - saved;
    return { orig, pct, saved, salePrice };
  }, [salePriceOrig, salePricePct]);

  // ── Tab 2 calcs
  const discountPctCalc = useMemo(() => {
    const orig = parseFloat(dpOrig);
    const sale = parseFloat(dpSale);
    if (isNaN(orig) || isNaN(sale) || orig <= 0 || sale < 0 || sale > orig) return null;
    const saved = orig - sale;
    const pct   = (saved / orig) * 100;
    return { orig, sale, saved, pct };
  }, [dpOrig, dpSale]);

  // ── Tab 3 calcs
  const origPriceCalc = useMemo(() => {
    const sale = parseFloat(opSale);
    const pct  = parseFloat(opPct);
    if (isNaN(sale) || isNaN(pct) || sale < 0 || pct <= 0 || pct >= 100) return null;
    const orig  = sale / (1 - pct / 100);
    const saved = orig - sale;
    return { orig, sale, pct, saved };
  }, [opSale, opPct]);

  // ── Multi-discount calcs
  const mdCalc = useMemo(() => {
    const base = parseFloat(mdOrigStr);
    if (isNaN(base) || base <= 0) return null;
    let price = base;
    const steps: { pct: number; price: number; saved: number }[] = [];
    for (const d of mdDiscounts) {
      const pct = parseFloat(d);
      if (isNaN(pct) || pct <= 0 || pct >= 100) continue;
      const saved = price * (pct / 100);
      price = price - saved;
      steps.push({ pct, price, saved });
    }
    if (steps.length === 0) return null;
    const totalSaved    = base - price;
    const effectivePct  = (totalSaved / base) * 100;
    return { base, finalPrice: price, totalSaved, effectivePct, steps };
  }, [mdOrigStr, mdDiscounts]);

  // ── Quick table
  const quickTableOrig = useMemo(() => {
    const n = parseFloat(salePriceOrig) || parseFloat(dpOrig) || parseFloat(opSale) || 100;
    return isNaN(n) || n <= 0 ? 100 : n;
  }, [salePriceOrig, dpOrig, opSale]);

  function addMdRow() {
    if (mdDiscounts.length < 5) setMdDiscounts((d) => [...d, ""]);
  }
  function removeMdRow(i: number) {
    setMdDiscounts((d) => d.filter((_, idx) => idx !== i));
  }
  function setMdDiscount(i: number, v: string) {
    setMdDiscounts((d) => d.map((x, idx) => (idx === i ? v : x)));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Discount Calculator</h1>
        <p className="text-sm text-muted-foreground">Calculate sale prices, discount percentages, and original prices.</p>
      </div>

      {/* Currency selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Currency:</span>
        {CURRENCIES.map((c) => (
          <Button
            key={c}
            variant={currency === c ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrency(c)}
            className="min-w-[36px]"
          >
            {c}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="sale">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="sale">Sale Price</TabsTrigger>
          <TabsTrigger value="pct">Discount %</TabsTrigger>
          <TabsTrigger value="orig">Original Price</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Sale Price ───────────────────────────────────────────── */}
        <TabsContent value="sale" className="space-y-5 mt-5">
          <p className="text-sm text-muted-foreground">What is X% off Y?</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Original Price</Label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-muted-foreground text-sm select-none pointer-events-none">{currency}</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="100.00"
                  value={salePriceOrig}
                  onChange={(e) => setSalePriceOrig(e.target.value)}
                  className="pl-7 text-lg h-12"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Discount</Label>
              <div className="relative flex items-center">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="20"
                  value={salePricePct}
                  onChange={(e) => setSalePricePct(e.target.value)}
                  className="pr-8 text-lg h-12"
                />
                <span className="absolute right-3 text-muted-foreground text-sm pointer-events-none select-none">%</span>
              </div>
            </div>
          </div>
          {salePriceCalc ? (
            <div className="space-y-4">
              <ResultCard rows={[
                { label: "Sale Price",    value: `${currency}${fmt2(salePriceCalc.salePrice)}`, accent: true },
                { label: "Amount Saved",  value: `${currency}${fmt2(salePriceCalc.saved)}`, color: "green" },
                { label: "You Pay",       value: `${fmtPct(100 - salePriceCalc.pct)} of original` },
              ]} />
              <SavingsBar savingsPct={salePriceCalc.pct} />
              <CopyButton text={`Sale Price: ${currency}${fmt2(salePriceCalc.salePrice)}\nAmount Saved: ${currency}${fmt2(salePriceCalc.saved)}`} />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              Enter original price and discount % above
            </div>
          )}
        </TabsContent>

        {/* ── Tab 2: Discount % ────────────────────────────────────────────── */}
        <TabsContent value="pct" className="space-y-5 mt-5">
          <p className="text-sm text-muted-foreground">What % off was it?</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Original Price</Label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-muted-foreground text-sm select-none pointer-events-none">{currency}</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="100.00"
                  value={dpOrig}
                  onChange={(e) => setDpOrig(e.target.value)}
                  className="pl-7 text-lg h-12"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Sale Price</Label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-muted-foreground text-sm select-none pointer-events-none">{currency}</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="80.00"
                  value={dpSale}
                  onChange={(e) => setDpSale(e.target.value)}
                  className="pl-7 text-lg h-12"
                />
              </div>
            </div>
          </div>
          {discountPctCalc ? (
            <div className="space-y-4">
              <ResultCard rows={[
                { label: "Discount %",   value: fmtPct(discountPctCalc.pct), accent: true },
                { label: "Amount Saved", value: `${currency}${fmt2(discountPctCalc.saved)}`, color: "green" },
              ]} />
              <div className="rounded-lg bg-muted/40 border border-border px-4 py-3 text-xs text-muted-foreground font-mono">
                ({currency}{fmt2(discountPctCalc.orig)} − {currency}{fmt2(discountPctCalc.sale)}) ÷ {currency}{fmt2(discountPctCalc.orig)} × 100 = {fmtPct(discountPctCalc.pct)}
              </div>
              <SavingsBar savingsPct={discountPctCalc.pct} />
              <CopyButton text={`Discount: ${fmtPct(discountPctCalc.pct)}\nAmount Saved: ${currency}${fmt2(discountPctCalc.saved)}`} />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              Enter both original and sale price above
            </div>
          )}
        </TabsContent>

        {/* ── Tab 3: Original Price ─────────────────────────────────────────── */}
        <TabsContent value="orig" className="space-y-5 mt-5">
          <p className="text-sm text-muted-foreground">What was the original price before the discount?</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Sale Price</Label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-muted-foreground text-sm select-none pointer-events-none">{currency}</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="80.00"
                  value={opSale}
                  onChange={(e) => setOpSale(e.target.value)}
                  className="pl-7 text-lg h-12"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Discount Applied</Label>
              <div className="relative flex items-center">
                <Input
                  type="number"
                  min="0"
                  max="99.99"
                  step="0.01"
                  placeholder="20"
                  value={opPct}
                  onChange={(e) => setOpPct(e.target.value)}
                  className="pr-8 text-lg h-12"
                />
                <span className="absolute right-3 text-muted-foreground text-sm pointer-events-none select-none">%</span>
              </div>
            </div>
          </div>
          {origPriceCalc ? (
            <div className="space-y-4">
              <ResultCard rows={[
                { label: "Original Price", value: `${currency}${fmt2(origPriceCalc.orig)}`, accent: true },
                { label: "Amount Saved",   value: `${currency}${fmt2(origPriceCalc.saved)}`, color: "green" },
                { label: "You Paid",       value: `${currency}${fmt2(origPriceCalc.sale)}` },
              ]} />
              <CopyButton text={`Original Price: ${currency}${fmt2(origPriceCalc.orig)}\nYou Paid: ${currency}${fmt2(origPriceCalc.sale)}\nSaved: ${currency}${fmt2(origPriceCalc.saved)}`} />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              Enter sale price and discount % above
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Multi-discount (stacked) ─────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-muted/50 px-4 py-2.5 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Multi-Discount — Stacked Discounts
          </p>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Apply multiple discounts sequentially. Note: 20% off then 10% off is NOT the same as 30% off.
          </p>
          <div className="space-y-1.5">
            <Label>Original Price</Label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted-foreground text-sm select-none pointer-events-none">{currency}</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="100.00"
                value={mdOrigStr}
                onChange={(e) => setMdOrigStr(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>
          <div className="space-y-2">
            {mdDiscounts.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16 shrink-0">
                  Discount {i + 1}
                </span>
                <div className="relative flex-1 flex items-center">
                  <Input
                    type="number"
                    min="0"
                    max="99"
                    step="0.01"
                    placeholder={`${[20,10,5,15,25][i] ?? 10}`}
                    value={d}
                    onChange={(e) => setMdDiscount(i, e.target.value)}
                    className="pr-7"
                  />
                  <span className="absolute right-3 text-muted-foreground text-sm pointer-events-none select-none">%</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMdRow(i)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  ✕
                </Button>
              </div>
            ))}
            {mdDiscounts.length < 5 && (
              <Button variant="outline" size="sm" onClick={addMdRow} className="w-full">
                + Add Discount
              </Button>
            )}
          </div>
          {mdCalc && (
            <div className="space-y-3">
              {/* Step-by-step */}
              <div className="rounded-lg border border-border divide-y divide-border overflow-hidden text-xs">
                <div className="flex justify-between px-3 py-2 bg-muted/30 text-muted-foreground">
                  <span>Step</span>
                  <span>Price After Discount</span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span>Original</span>
                  <span className="font-semibold">{currency}{fmt2(mdCalc.base)}</span>
                </div>
                {mdCalc.steps.map((s, i) => (
                  <div key={i} className="flex justify-between px-3 py-2">
                    <span className="text-muted-foreground">After {fmtPct(s.pct)} off</span>
                    <span className="font-semibold">{currency}{fmt2(s.price)}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-green-500/30 bg-green-500/5 px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Effective discount</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-400">{fmtPct(mdCalc.effectivePct)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Final price</p>
                  <p className="text-2xl font-extrabold text-primary">{currency}{fmt2(mdCalc.finalPrice)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick reference table ────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Reference — {currency}{fmt2(quickTableOrig)}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-4 py-2.5 text-left font-semibold">Discount</th>
                <th className="px-4 py-2.5 text-right font-semibold">Sale Price</th>
                <th className="px-4 py-2.5 text-right font-semibold">You Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {QUICK_DISCOUNTS.map((pct) => {
                const saved = quickTableOrig * (pct / 100);
                const sale  = quickTableOrig - saved;
                return (
                  <tr key={pct} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-2.5 font-semibold">{pct}% off</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-bold text-primary">{currency}{fmt2(sale)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-green-600 dark:text-green-400">{currency}{fmt2(saved)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
