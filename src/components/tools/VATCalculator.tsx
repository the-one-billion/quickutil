"use client";
/**
 * VAT / Sales Tax Calculator
 * Three modes: Add VAT, Remove VAT, Find Rate
 * Country presets, quick rate buttons, split bill, copy-all.
 */
import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Constants ─────────────────────────────────────────────────────────────
const QUICK_RATES = [5, 10, 15, 20, 21, 23, 25];

interface CountryPreset {
  label: string;
  rate: number | null; // null = Custom
}
const COUNTRY_PRESETS: CountryPreset[] = [
  { label: "UK (20%)",         rate: 20 },
  { label: "EU Average (21%)", rate: 21 },
  { label: "USA (10%)",        rate: 10 },
  { label: "Australia (10%)",  rate: 10 },
  { label: "India (18%)",      rate: 18 },
  { label: "Canada (13%)",     rate: 13 },
  { label: "UAE (5%)",         rate: 5  },
  { label: "Japan (10%)",      rate: 10 },
  { label: "Custom",           rate: null },
];

function fmt2(n: number): string {
  return isNaN(n) || !isFinite(n) ? "—" : n.toFixed(2);
}
function fmtPct(n: number): string {
  return isNaN(n) || !isFinite(n) ? "—" : n.toFixed(4).replace(/\.?0+$/, "") + "%";
}

// ── Result card ───────────────────────────────────────────────────────────
interface ResultCardProps {
  net: number | null;
  vat: number | null;
  gross: number | null;
  currency: string;
}
function ResultCard({ net, vat, gross, currency }: ResultCardProps) {
  const items = [
    { label: "Net Amount",  value: net,   accent: false },
    { label: "VAT Amount",  value: vat,   accent: false },
    { label: "Gross Amount",value: gross, accent: true  },
  ];
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/50 px-4 py-2.5 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Results</p>
      </div>
      <div className="divide-y divide-border">
        {items.map(({ label, value, accent }) => (
          <div key={label} className={`flex items-center justify-between px-5 py-4 ${accent ? "bg-primary/5" : ""}`}>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className={`font-extrabold tabular-nums tracking-tight ${accent ? "text-3xl text-primary" : "text-xl text-foreground"}`}>
              {value === null ? "—" : `${currency}${fmt2(value)}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────
function CopyAllButton({ net, vat, gross, currency }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    const lines = [
      `Net:   ${currency}${fmt2(net ?? 0)}`,
      `VAT:   ${currency}${fmt2(vat ?? 0)}`,
      `Gross: ${currency}${fmt2(gross ?? 0)}`,
    ].join("\n");
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="w-full">
      {copied ? "Copied!" : "Copy All Values"}
    </Button>
  );
}

// ── Rate input group ──────────────────────────────────────────────────────
interface RateGroupProps {
  rateStr: string;
  setRateStr: (v: string) => void;
  onCountryPreset: (rate: number | null) => void;
}
function RateGroup({ rateStr, setRateStr, onCountryPreset }: RateGroupProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-1.5">
          <Label>VAT / Tax Rate (%)</Label>
          <div className="relative flex items-center">
            <Input
              type="number"
              min="0"
              max="999"
              step="0.01"
              placeholder="20"
              value={rateStr}
              onChange={(e) => setRateStr(e.target.value)}
              className="pr-8"
            />
            <span className="absolute right-3 text-muted-foreground text-sm pointer-events-none select-none">%</span>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          <Label>Country Preset</Label>
          <Select onValueChange={(v) => {
            const idx = parseInt(v);
            onCountryPreset(COUNTRY_PRESETS[idx].rate);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select country…" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_PRESETS.map((p, i) => (
                <SelectItem key={i} value={String(i)}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Quick rate buttons */}
      <div className="flex flex-wrap gap-2">
        {QUICK_RATES.map((r) => (
          <Button
            key={r}
            variant={parseFloat(rateStr) === r ? "default" : "outline"}
            size="sm"
            onClick={() => setRateStr(String(r))}
            className="min-w-[48px]"
          >
            {r}%
          </Button>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function VATCalculator() {
  const [currency, setCurrency] = useState("£");

  // Tab 1 – Add VAT
  const [addNetStr,  setAddNetStr]  = useState("");
  const [addRateStr, setAddRateStr] = useState("20");

  // Tab 2 – Remove VAT
  const [remGrossStr,  setRemGrossStr]  = useState("");
  const [remRateStr,   setRemRateStr]   = useState("20");

  // Tab 3 – Find Rate
  const [findNetStr,   setFindNetStr]   = useState("");
  const [findGrossStr, setFindGrossStr] = useState("");

  // Split bill
  const [splitGrossStr, setSplitGrossStr] = useState("");
  const [splitPeopleStr, setSplitPeopleStr] = useState("2");
  const [splitRateStr,   setSplitRateStr]   = useState("20");

  // ── Tab 1 results
  const addResults = useMemo(() => {
    const net  = parseFloat(addNetStr);
    const rate = parseFloat(addRateStr);
    if (isNaN(net) || isNaN(rate) || net < 0 || rate < 0) return null;
    const vat   = net * (rate / 100);
    const gross = net + vat;
    return { net, vat, gross };
  }, [addNetStr, addRateStr]);

  // ── Tab 2 results
  const remResults = useMemo(() => {
    const gross = parseFloat(remGrossStr);
    const rate  = parseFloat(remRateStr);
    if (isNaN(gross) || isNaN(rate) || gross < 0 || rate < 0) return null;
    const net = gross / (1 + rate / 100);
    const vat = gross - net;
    return { net, vat, gross };
  }, [remGrossStr, remRateStr]);

  // ── Tab 3 results
  const findResults = useMemo(() => {
    const net   = parseFloat(findNetStr);
    const gross = parseFloat(findGrossStr);
    if (isNaN(net) || isNaN(gross) || net <= 0 || gross <= 0 || gross <= net) return null;
    const vat      = gross - net;
    const rateCalc = (vat / net) * 100;
    return { net, vat, gross, rate: rateCalc };
  }, [findNetStr, findGrossStr]);

  // ── Split bill results
  const splitResults = useMemo(() => {
    const gross  = parseFloat(splitGrossStr);
    const people = parseInt(splitPeopleStr);
    const rate   = parseFloat(splitRateStr);
    if (isNaN(gross) || isNaN(people) || isNaN(rate) || people < 1 || gross <= 0) return null;
    const net         = gross / (1 + rate / 100);
    const vatTotal    = gross - net;
    const perGross    = gross / people;
    const perVat      = vatTotal / people;
    const perNet      = net / people;
    return { perGross, perVat, perNet };
  }, [splitGrossStr, splitPeopleStr, splitRateStr]);

  const CURRENCIES = ["$", "£", "€", "¥", "₹", "A$", "C$"];

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">VAT / Tax Calculator</h1>
        <p className="text-sm text-muted-foreground">Add tax, remove tax, or find what rate was applied.</p>
      </div>

      {/* Currency selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">Currency symbol:</span>
        {CURRENCIES.map((c) => (
          <Button
            key={c}
            variant={currency === c ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrency(c)}
            className="min-w-[40px]"
          >
            {c}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="add">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="add">Add VAT</TabsTrigger>
          <TabsTrigger value="remove">Remove VAT</TabsTrigger>
          <TabsTrigger value="find">Find Rate</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Add VAT ──────────────────────────────────────────────── */}
        <TabsContent value="add" className="space-y-5 mt-5">
          <p className="text-sm text-muted-foreground">Enter net (pre-tax) amount and rate to get the gross (inclusive) total.</p>
          <div className="space-y-1.5">
            <Label>Net Amount (excl. VAT)</Label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted-foreground text-sm select-none pointer-events-none">{currency}</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="100.00"
                value={addNetStr}
                onChange={(e) => setAddNetStr(e.target.value)}
                className="pl-8 text-lg h-12"
              />
            </div>
          </div>
          <RateGroup rateStr={addRateStr} setRateStr={setAddRateStr} onCountryPreset={(r) => r !== null && setAddRateStr(String(r))} />
          <ResultCard
            net={addResults?.net ?? null}
            vat={addResults?.vat ?? null}
            gross={addResults?.gross ?? null}
            currency={currency}
          />
          <CopyAllButton net={addResults?.net ?? null} vat={addResults?.vat ?? null} gross={addResults?.gross ?? null} currency={currency} />
        </TabsContent>

        {/* ── Tab 2: Remove VAT ─────────────────────────────────────────────── */}
        <TabsContent value="remove" className="space-y-5 mt-5">
          <p className="text-sm text-muted-foreground">Enter gross (tax-inclusive) amount and rate to extract the net amount.</p>
          <div className="space-y-1.5">
            <Label>Gross Amount (incl. VAT)</Label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted-foreground text-sm select-none pointer-events-none">{currency}</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="120.00"
                value={remGrossStr}
                onChange={(e) => setRemGrossStr(e.target.value)}
                className="pl-8 text-lg h-12"
              />
            </div>
          </div>
          <RateGroup rateStr={remRateStr} setRateStr={setRemRateStr} onCountryPreset={(r) => r !== null && setRemRateStr(String(r))} />
          <ResultCard
            net={remResults?.net ?? null}
            vat={remResults?.vat ?? null}
            gross={remResults?.gross ?? null}
            currency={currency}
          />
          <CopyAllButton net={remResults?.net ?? null} vat={remResults?.vat ?? null} gross={remResults?.gross ?? null} currency={currency} />
        </TabsContent>

        {/* ── Tab 3: Find Rate ──────────────────────────────────────────────── */}
        <TabsContent value="find" className="space-y-5 mt-5">
          <p className="text-sm text-muted-foreground">Enter both net and gross amounts to calculate the VAT rate applied.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Net Amount</Label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-muted-foreground text-sm select-none pointer-events-none">{currency}</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="100.00"
                  value={findNetStr}
                  onChange={(e) => setFindNetStr(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Gross Amount</Label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-muted-foreground text-sm select-none pointer-events-none">{currency}</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="120.00"
                  value={findGrossStr}
                  onChange={(e) => setFindGrossStr(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          {findResults ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="bg-muted/50 px-4 py-2.5 border-b border-border">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Results</p>
                </div>
                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between px-5 py-4 bg-primary/5">
                    <div>
                      <p className="text-sm font-medium text-foreground">VAT Rate Applied</p>
                      <p className="text-xs text-muted-foreground mt-0.5">VAT ÷ Net × 100</p>
                    </div>
                    <p className="text-3xl font-extrabold text-primary">{fmtPct(findResults.rate)}</p>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3">
                    <p className="text-sm font-medium text-foreground">VAT Amount</p>
                    <p className="text-xl font-bold text-foreground">{currency}{fmt2(findResults.vat)}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 border border-border px-4 py-3 text-xs text-muted-foreground font-mono">
                VAT Rate = ({currency}{fmt2(findResults.gross)} − {currency}{fmt2(findResults.net)}) ÷ {currency}{fmt2(findResults.net)} × 100 = {fmtPct(findResults.rate)}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              Enter both net and gross amounts above
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Split bill ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-muted/50 px-4 py-2.5 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Split Bill</p>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-xs text-muted-foreground">Split a gross (VAT-inclusive) amount between multiple people.</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Gross Total</Label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-muted-foreground text-sm select-none pointer-events-none">{currency}</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="120.00"
                  value={splitGrossStr}
                  onChange={(e) => setSplitGrossStr(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>People</Label>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="2"
                value={splitPeopleStr}
                onChange={(e) => setSplitPeopleStr(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>VAT Rate</Label>
              <div className="relative flex items-center">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="20"
                  value={splitRateStr}
                  onChange={(e) => setSplitRateStr(e.target.value)}
                  className="pr-7"
                />
                <span className="absolute right-3 text-muted-foreground text-sm pointer-events-none select-none">%</span>
              </div>
            </div>
          </div>
          {splitResults ? (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Per Person (Gross)", value: splitResults.perGross },
                { label: "Per Person (Net)",   value: splitResults.perNet   },
                { label: "Per Person (VAT)",   value: splitResults.perVat   },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <p className="text-xl font-bold text-foreground">{currency}{fmt2(value)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">Fill in the fields above to split</p>
          )}
        </div>
      </div>
    </div>
  );
}
