"use client";
/**
 * Currency Converter
 * Hardcoded indicative exchange rates relative to USD.
 * Features: main conversion, mini table, multi-convert table with search.
 */
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ── Exchange rates (relative to USD) ─────────────────────────────────────
interface CurrencyInfo {
  code: string;
  name: string;
  flag: string;
  rate: number; // units per 1 USD
}

const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", name: "US Dollar",           flag: "🇺🇸", rate: 1 },
  { code: "EUR", name: "Euro",                flag: "🇪🇺", rate: 0.92 },
  { code: "GBP", name: "British Pound",       flag: "🇬🇧", rate: 0.79 },
  { code: "JPY", name: "Japanese Yen",        flag: "🇯🇵", rate: 149.5 },
  { code: "INR", name: "Indian Rupee",        flag: "🇮🇳", rate: 83.1 },
  { code: "AUD", name: "Australian Dollar",   flag: "🇦🇺", rate: 1.53 },
  { code: "CAD", name: "Canadian Dollar",     flag: "🇨🇦", rate: 1.36 },
  { code: "CHF", name: "Swiss Franc",         flag: "🇨🇭", rate: 0.89 },
  { code: "CNY", name: "Chinese Yuan",        flag: "🇨🇳", rate: 7.24 },
  { code: "HKD", name: "Hong Kong Dollar",    flag: "🇭🇰", rate: 7.82 },
  { code: "SGD", name: "Singapore Dollar",    flag: "🇸🇬", rate: 1.34 },
  { code: "NZD", name: "New Zealand Dollar",  flag: "🇳🇿", rate: 1.63 },
  { code: "NOK", name: "Norwegian Krone",     flag: "🇳🇴", rate: 10.55 },
  { code: "SEK", name: "Swedish Krona",       flag: "🇸🇪", rate: 10.41 },
  { code: "DKK", name: "Danish Krone",        flag: "🇩🇰", rate: 6.89 },
  { code: "MXN", name: "Mexican Peso",        flag: "🇲🇽", rate: 17.15 },
  { code: "BRL", name: "Brazilian Real",      flag: "🇧🇷", rate: 4.97 },
  { code: "ZAR", name: "South African Rand",  flag: "🇿🇦", rate: 18.73 },
  { code: "AED", name: "UAE Dirham",          flag: "🇦🇪", rate: 3.67 },
  { code: "SAR", name: "Saudi Riyal",         flag: "🇸🇦", rate: 3.75 },
  { code: "TRY", name: "Turkish Lira",        flag: "🇹🇷", rate: 30.51 },
  { code: "KRW", name: "South Korean Won",    flag: "🇰🇷", rate: 1325 },
  { code: "THB", name: "Thai Baht",           flag: "🇹🇭", rate: 35.1 },
  { code: "MYR", name: "Malaysian Ringgit",   flag: "🇲🇾", rate: 4.67 },
  { code: "IDR", name: "Indonesian Rupiah",   flag: "🇮🇩", rate: 15610 },
  { code: "PHP", name: "Philippine Peso",     flag: "🇵🇭", rate: 56.4 },
  { code: "VND", name: "Vietnamese Dong",     flag: "🇻🇳", rate: 24380 },
  { code: "PKR", name: "Pakistani Rupee",     flag: "🇵🇰", rate: 279 },
  { code: "EGP", name: "Egyptian Pound",      flag: "🇪🇬", rate: 30.9 },
  { code: "NGN", name: "Nigerian Naira",      flag: "🇳🇬", rate: 1465 },
  { code: "KES", name: "Kenyan Shilling",     flag: "🇰🇪", rate: 128 },
  { code: "CZK", name: "Czech Koruna",        flag: "🇨🇿", rate: 22.7 },
  { code: "PLN", name: "Polish Zloty",        flag: "🇵🇱", rate: 4.0 },
  { code: "HUF", name: "Hungarian Forint",    flag: "🇭🇺", rate: 355 },
  { code: "RON", name: "Romanian Leu",        flag: "🇷🇴", rate: 4.6 },
  { code: "RUB", name: "Russian Ruble",       flag: "🇷🇺", rate: 92.5 },
];

const MINI_TABLE_CODES = ["USD", "EUR", "GBP", "JPY", "INR", "AUD", "CAD", "CHF"];

const currencyMap = new Map<string, CurrencyInfo>(CURRENCIES.map((c) => [c.code, c]));

function convert(amount: number, from: string, to: string): number {
  const fromRate = currencyMap.get(from)?.rate ?? 1;
  const toRate   = currencyMap.get(to)?.rate ?? 1;
  return (amount / fromRate) * toRate;
}

function fmtAmount(n: number, code: string): string {
  if (isNaN(n)) return "—";
  // Use compact notation for very large numbers
  if (Math.abs(n) >= 1_000_000) {
    return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  const decimals = n >= 100 ? 2 : n >= 1 ? 4 : 6;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

// ── Searchable currency dropdown ──────────────────────────────────────────
interface CurrencySelectProps {
  value: string;
  onChange: (code: string) => void;
  label: string;
}

function CurrencySelect({ value, onChange, label }: CurrencySelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
    );
  }, [query]);

  const selected = currencyMap.get(value);

  return (
    <div className="relative">
      <Label className="mb-1.5 block">{label}</Label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
      >
        <span className="text-xl leading-none">{selected?.flag}</span>
        <span className="font-semibold text-foreground">{selected?.code}</span>
        <span className="text-muted-foreground truncate flex-1">{selected?.name}</span>
        <span className="text-muted-foreground text-xs">▼</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
          <div className="p-2 border-b border-border">
            <Input
              autoFocus
              placeholder="Search currency..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground text-center">No results</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onChange(c.code); setOpen(false); setQuery(""); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left ${
                    c.code === value ? "bg-accent/60" : ""
                  }`}
                >
                  <span className="text-lg leading-none">{c.flag}</span>
                  <span className="font-semibold w-10 shrink-0">{c.code}</span>
                  <span className="text-muted-foreground truncate">{c.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setQuery(""); }} />
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function CurrencyConverter() {
  const [amountStr, setAmountStr] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo]     = useState("EUR");
  const [multiSearch, setMultiSearch] = useState("");

  const amount = useMemo(() => {
    const n = parseFloat(amountStr);
    return isNaN(n) || n < 0 ? 0 : n;
  }, [amountStr]);

  const result = useMemo(() => convert(amount, from, to), [amount, from, to]);

  const miniTableRows = useMemo(
    () =>
      MINI_TABLE_CODES.map((code) => ({
        ...currencyMap.get(code)!,
        value: convert(1, from, code),
      })),
    [from]
  );

  const multiRows = useMemo(() => {
    const q = multiSearch.toLowerCase();
    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
    ).map((c) => ({
      ...c,
      value: convert(amount, from, c.code),
    }));
  }, [amount, from, multiSearch]);

  function handleSwap() {
    setFrom(to);
    setTo(from);
  }

  const fromInfo = currencyMap.get(from);
  const toInfo   = currencyMap.get(to);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Currency Converter</h1>
        <p className="text-sm text-muted-foreground">
          Convert between 36 world currencies using indicative reference rates.
        </p>
      </div>

      {/* ── Amount input ──────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          min="0"
          step="any"
          placeholder="1"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          className="text-2xl h-14 font-semibold"
        />
      </div>

      {/* ── Currency selectors ────────────────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
        <CurrencySelect value={from} onChange={setFrom} label="From" />
        <Button
          variant="outline"
          size="icon"
          onClick={handleSwap}
          className="mb-0.5 h-10 w-10 text-lg"
          title="Swap currencies"
        >
          ⇄
        </Button>
        <CurrencySelect value={to} onChange={setTo} label="To" />
      </div>

      {/* ── Conversion result ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground mb-1">
          {fmtAmount(amount, from)} {fromInfo?.code} =
        </p>
        <p className="text-4xl font-extrabold text-primary tracking-tight">
          {fmtAmount(result, to)} <span className="text-2xl">{toInfo?.flag} {toInfo?.code}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          1 {from} = {fmtAmount(convert(1, from, to), to)} {to} &nbsp;·&nbsp; 1 {to} = {fmtAmount(convert(1, to, from), from)} {from}
        </p>
      </div>

      {/* ── Mini conversion table ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-muted/50 px-4 py-2.5 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            1 {fromInfo?.flag} {from} in popular currencies
          </p>
        </div>
        <div className="divide-y divide-border">
          {miniTableRows.map((row) => (
            <div key={row.code} className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base">{row.flag}</span>
                <span className="text-sm font-medium text-foreground">{row.code}</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">{row.name}</span>
              </div>
              <span className="font-semibold text-foreground tabular-nums">
                {fmtAmount(row.value, row.code)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground italic">
        Indicative rates for reference only. Not for financial transactions.
      </p>

      {/* ── Multi-convert table ───────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">
            Multi-Convert — {fmtAmount(amount, from)} {from} in all currencies
          </h2>
          <Badge variant="secondary">{multiRows.length}</Badge>
        </div>
        <Input
          placeholder="Search by currency name or code..."
          value={multiSearch}
          onChange={(e) => setMultiSearch(e.target.value)}
          className="text-sm"
        />
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="max-h-96 overflow-y-auto divide-y divide-border">
            {multiRows.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">No currencies found</p>
            ) : (
              multiRows.map((row) => (
                <div key={row.code} className="flex items-center justify-between px-4 py-2.5 hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{row.flag}</span>
                    <span className="text-sm font-semibold w-10 shrink-0">{row.code}</span>
                    <span className="text-xs text-muted-foreground truncate">{row.name}</span>
                  </div>
                  <span className="font-semibold text-foreground tabular-nums text-sm">
                    {fmtAmount(row.value, row.code)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
