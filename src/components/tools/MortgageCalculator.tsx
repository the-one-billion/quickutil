"use client";
/**
 * Mortgage Calculator
 * Inputs: home price, down payment (amount/%), interest rate, term, extra payment, start date.
 * Results: monthly payment, totals, LTV.
 * Amortization: SVG line chart + year-by-year table + optional month-by-month.
 */
import { useState, useMemo, useCallback } from "react";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge }  from "@/components/ui/badge";

// ── Helpers ───────────────────────────────────────────────────────────────
function fmtUSD(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function fmtUSD2(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtPct(n: number, d = 2): string {
  return n.toFixed(d) + "%";
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS_RANGE  = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR + i);

// ── Mortgage math ─────────────────────────────────────────────────────────
interface AmortRow {
  month: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumInterest: number;
  cumPrincipal: number;
}

function calcAmortization(
  principal: number,
  annualRate: number,
  termMonths: number,
  extraPayment: number,
  startMonth: number, // 0-indexed
  startYear: number
): AmortRow[] {
  const r = annualRate / 100 / 12;
  const rows: AmortRow[] = [];
  let balance     = principal;
  let cumInterest = 0;
  let cumPrincipal = 0;

  for (let m = 0; m < termMonths; m++) {
    if (balance <= 0) break;
    const interest = balance * r;
    // Base payment (standard formula)
    const basePmt = r === 0
      ? principal / termMonths
      : principal * (r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
    const principalPmt = Math.min(basePmt - interest + extraPayment, balance);
    const payment      = interest + principalPmt;
    balance     = Math.max(0, balance - principalPmt);
    cumInterest  += interest;
    cumPrincipal += principalPmt;

    const mIdx    = (startMonth + m) % 12;
    const yr      = startYear + Math.floor((startMonth + m) / 12);
    rows.push({
      month: m + 1,
      date: `${MONTHS[mIdx]} ${yr}`,
      payment,
      principal: principalPmt,
      interest,
      balance,
      cumInterest,
      cumPrincipal,
    });
  }
  return rows;
}

// ── SVG Chart ─────────────────────────────────────────────────────────────
const CHART_W = 600;
const CHART_H = 200;
const PAD_L   = 60;
const PAD_R   = 20;
const PAD_T   = 16;
const PAD_B   = 30;

interface ChartProps {
  rows: AmortRow[];
  principal: number;
}
function AmortChart({ rows, principal }: ChartProps) {
  if (rows.length === 0) return null;

  const maxVal   = principal;
  const plotW    = CHART_W - PAD_L - PAD_R;
  const plotH    = CHART_H - PAD_T - PAD_B;

  function xPct(i: number) { return PAD_L + (i / (rows.length - 1 || 1)) * plotW; }
  function yPct(v: number) { return PAD_T + plotH - (v / maxVal) * plotH; }

  const balancePts = rows.map((r, i) => `${xPct(i).toFixed(1)},${yPct(r.balance).toFixed(1)}`).join(" ");
  const interestPts= rows.map((r, i) => `${xPct(i).toFixed(1)},${yPct(r.cumInterest).toFixed(1)}`).join(" ");

  // Y axis labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    label: fmtUSD(f * maxVal),
    y: PAD_T + plotH - f * plotH,
  }));
  // X axis labels (years)
  const termYears = Math.ceil(rows.length / 12);
  const xTicks = Array.from({ length: termYears + 1 }, (_, i) => ({
    label: `Y${i}`,
    x: PAD_L + (i / termYears) * plotW,
  }));

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amortization Chart</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="inline-block w-6 h-0.5 bg-blue-500 rounded" /> Balance</span>
          <span className="flex items-center gap-1"><span className="inline-block w-6 h-0.5 bg-orange-400 rounded" /> Cum. Interest</span>
        </div>
      </div>
      <div className="p-3 overflow-x-auto">
        <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full" style={{ minWidth: 300 }}>
          {/* Grid lines */}
          {yTicks.map((t) => (
            <line key={t.label} x1={PAD_L} y1={t.y} x2={CHART_W - PAD_R} y2={t.y}
              stroke="currentColor" strokeOpacity={0.1} strokeWidth={1} />
          ))}
          {/* Y axis labels */}
          {yTicks.map((t) => (
            <text key={t.label} x={PAD_L - 4} y={t.y + 4} textAnchor="end"
              fontSize={9} fill="currentColor" fillOpacity={0.5}>{t.label}</text>
          ))}
          {/* X axis labels */}
          {xTicks.filter((_, i) => i % Math.max(1, Math.ceil(xTicks.length / 8)) === 0).map((t) => (
            <text key={t.x} x={t.x} y={CHART_H - 6} textAnchor="middle"
              fontSize={9} fill="currentColor" fillOpacity={0.5}>{t.label}</text>
          ))}
          {/* Balance line */}
          <polyline
            points={balancePts}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {/* Cumulative interest line */}
          <polyline
            points={interestPts}
            fill="none"
            stroke="#fb923c"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function MortgageCalculator() {
  const [homePriceStr,    setHomePriceStr]    = useState("350000");
  const [downPaymentStr,  setDownPaymentStr]  = useState("70000");
  const [dpMode,          setDpMode]          = useState<"amount" | "pct">("amount"); // toggle
  const [rateStr,         setRateStr]         = useState("6.5");
  const [term,            setTerm]            = useState(30);
  const [extraStr,        setExtraStr]        = useState("0");
  const [startMonth,      setStartMonth]      = useState(new Date().getMonth());
  const [startYear,       setStartYear]       = useState(CURRENT_YEAR);
  const [showAllMonths,   setShowAllMonths]   = useState(false);
  const [showMonthly,     setShowMonthly]     = useState(false);

  // Sync home price & down payment
  const homePrice = useMemo(() => {
    const n = parseFloat(homePriceStr.replace(/,/g, ""));
    return isNaN(n) || n < 0 ? 0 : n;
  }, [homePriceStr]);

  // Down payment resolved to dollar amount
  const downPayment = useMemo(() => {
    if (dpMode === "amount") {
      const n = parseFloat(downPaymentStr.replace(/,/g, ""));
      return isNaN(n) || n < 0 ? 0 : Math.min(n, homePrice);
    } else {
      const pct = parseFloat(downPaymentStr);
      return isNaN(pct) ? 0 : (pct / 100) * homePrice;
    }
  }, [downPaymentStr, dpMode, homePrice]);

  const dpPct     = homePrice > 0 ? (downPayment / homePrice) * 100 : 0;
  const principal = Math.max(0, homePrice - downPayment);
  const rate      = useMemo(() => { const n = parseFloat(rateStr); return isNaN(n) || n < 0 ? 0 : n; }, [rateStr]);
  const extra     = useMemo(() => { const n = parseFloat(extraStr); return isNaN(n) || n < 0 ? 0 : n; }, [extraStr]);
  const termMonths = term * 12;

  // Monthly payment (no extra)
  const monthlyPayment = useMemo(() => {
    if (principal <= 0 || rate === 0) return principal / termMonths;
    const r = rate / 100 / 12;
    return principal * (r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
  }, [principal, rate, termMonths]);

  // Full amortization (with extra)
  const amortRows = useMemo(
    () => calcAmortization(principal, rate, termMonths, extra, startMonth, startYear),
    [principal, rate, termMonths, extra, startMonth, startYear]
  );

  const totalPaid     = amortRows.reduce((s, r) => s + r.payment, 0);
  const totalInterest = amortRows.reduce((s, r) => s + r.interest, 0);
  const actualMonths  = amortRows.length;
  const monthsSaved   = termMonths - actualMonths;
  const ltv           = homePrice > 0 ? (principal / homePrice) * 100 : 0;

  // Savings from extra payment
  const baseAmort = useMemo(
    () => extra > 0 ? calcAmortization(principal, rate, termMonths, 0, startMonth, startYear) : amortRows,
    [principal, rate, termMonths, startMonth, startYear, extra, amortRows]
  );
  const baseInterest = baseAmort.reduce((s, r) => s + r.interest, 0);
  const interestSaved = extra > 0 ? baseInterest - totalInterest : 0;

  // Year-by-year summary
  const yearRows = useMemo(() => {
    const yrs: { year: number; principalPaid: number; interestPaid: number; totalPaid: number; balance: number }[] = [];
    for (let y = 0; y < Math.ceil(amortRows.length / 12); y++) {
      const slice = amortRows.slice(y * 12, y * 12 + 12);
      yrs.push({
        year: startYear + y,
        principalPaid: slice.reduce((s, r) => s + r.principal, 0),
        interestPaid:  slice.reduce((s, r) => s + r.interest, 0),
        totalPaid:     slice.reduce((s, r) => s + r.payment, 0),
        balance:       slice[slice.length - 1]?.balance ?? 0,
      });
    }
    return yrs;
  }, [amortRows, startYear]);

  const handleDpToggle = useCallback(() => {
    if (dpMode === "amount") {
      setDpMode("pct");
      setDownPaymentStr(dpPct.toFixed(1));
    } else {
      setDpMode("amount");
      setDownPaymentStr(downPayment.toFixed(0));
    }
  }, [dpMode, dpPct, downPayment]);

  const displayedMonthRows = showAllMonths ? amortRows : amortRows.slice(0, 24);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Mortgage Calculator</h1>
        <p className="text-sm text-muted-foreground">
          Calculate your monthly payment and full amortization schedule.
        </p>
      </div>

      {/* ── Inputs ─────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Home price */}
          <div className="space-y-1.5">
            <Label>Home Price</Label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted-foreground text-sm select-none pointer-events-none">$</span>
              <Input
                type="text"
                placeholder="350,000"
                value={homePriceStr}
                onChange={(e) => setHomePriceStr(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          {/* Down payment */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Down Payment</Label>
              <Button variant="ghost" size="sm" onClick={handleDpToggle} className="h-5 text-xs px-2">
                {dpMode === "amount" ? "Switch to %" : "Switch to $"}
              </Button>
            </div>
            <div className="relative flex items-center">
              {dpMode === "amount" && (
                <span className="absolute left-3 text-muted-foreground text-sm select-none pointer-events-none">$</span>
              )}
              <Input
                type="text"
                placeholder={dpMode === "amount" ? "70,000" : "20"}
                value={downPaymentStr}
                onChange={(e) => setDownPaymentStr(e.target.value)}
                className={dpMode === "amount" ? "pl-7 pr-24" : "pr-8"}
              />
              {dpMode === "pct" && (
                <span className="absolute right-3 text-muted-foreground text-sm pointer-events-none select-none">%</span>
              )}
              {dpMode === "amount" && homePrice > 0 && (
                <span className="absolute right-3 text-muted-foreground text-xs pointer-events-none select-none">
                  ({fmtPct(dpPct, 1)})
                </span>
              )}
            </div>
          </div>

          {/* Interest rate */}
          <div className="space-y-1.5">
            <Label>Annual Interest Rate</Label>
            <div className="relative flex items-center">
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="6.5"
                value={rateStr}
                onChange={(e) => setRateStr(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 text-muted-foreground text-sm pointer-events-none select-none">%</span>
            </div>
          </div>

          {/* Extra payment */}
          <div className="space-y-1.5">
            <Label>Extra Monthly Payment</Label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted-foreground text-sm select-none pointer-events-none">$</span>
              <Input
                type="number"
                min="0"
                step="10"
                placeholder="0"
                value={extraStr}
                onChange={(e) => setExtraStr(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>
        </div>

        {/* Loan term */}
        <div className="space-y-2">
          <Label>Loan Term</Label>
          <div className="flex flex-wrap gap-2">
            {[10, 15, 20, 25, 30].map((t) => (
              <Button
                key={t}
                variant={term === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTerm(t)}
                className="min-w-[56px]"
              >
                {t} yr
              </Button>
            ))}
          </div>
        </div>

        {/* Start date */}
        <div className="space-y-2">
          <Label>Start Date (first payment)</Label>
          <div className="flex gap-3">
            <select
              value={startMonth}
              onChange={(e) => setStartMonth(parseInt(e.target.value))}
              className="flex h-10 w-36 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select
              value={startYear}
              onChange={(e) => setStartYear(parseInt(e.target.value))}
              className="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {YEARS_RANGE.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Summary stats ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-muted/50 px-4 py-2.5 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Loan Summary</p>
        </div>
        {/* Main payment */}
        <div className="px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Monthly Payment (P+I)</p>
            <p className="text-4xl font-extrabold text-primary tracking-tight">{fmtUSD2(monthlyPayment)}</p>
            {extra > 0 && (
              <p className="text-sm text-muted-foreground mt-1">With extra: <span className="font-semibold text-foreground">{fmtUSD2(monthlyPayment + extra)}/mo</span></p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary">Loan: {fmtUSD(principal)}</Badge>
            <Badge variant="secondary">LTV: {fmtPct(ltv, 1)}</Badge>
            <Badge variant="secondary">Down: {fmtPct(dpPct, 1)}</Badge>
          </div>
        </div>
        {/* Detail rows */}
        <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-border">
          {[
            { label: "Total Payment",    value: fmtUSD(totalPaid) },
            { label: "Total Interest",   value: fmtUSD(totalInterest) },
            { label: "Total Principal",  value: fmtUSD(principal) },
            { label: "Payoff Date",      value: amortRows[amortRows.length - 1]?.date ?? "—" },
            { label: "Loan Term",        value: extra > 0 ? `${Math.floor(actualMonths / 12)}y ${actualMonths % 12}m` : `${term}y` },
            { label: "Interest Rate",    value: fmtPct(rate) },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
            </div>
          ))}
        </div>
        {/* Savings from extra payment */}
        {extra > 0 && monthsSaved > 0 && (
          <div className="px-5 py-3 bg-green-500/5 border-t border-green-500/20 flex flex-wrap items-center gap-4 text-sm">
            <span className="text-green-700 dark:text-green-400 font-semibold">
              Extra {fmtUSD2(extra)}/mo saves you:
            </span>
            <span className="text-foreground font-bold">{fmtUSD(interestSaved)} interest</span>
            <span className="text-foreground font-bold">
              {Math.floor(monthsSaved / 12)}y {monthsSaved % 12}m sooner
            </span>
          </div>
        )}
      </div>

      {/* ── SVG Chart ──────────────────────────────────────────────────────── */}
      {amortRows.length > 0 && <AmortChart rows={amortRows} principal={principal} />}

      {/* ── Year-by-year table ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Year-by-Year Breakdown</p>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowMonthly((v) => !v)}>
            {showMonthly ? "Show Yearly" : "Show Monthly"}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-3 py-2 text-left font-semibold">Year</th>
                <th className="px-3 py-2 text-right font-semibold">Principal</th>
                <th className="px-3 py-2 text-right font-semibold">Interest</th>
                <th className="px-3 py-2 text-right font-semibold">Total Paid</th>
                <th className="px-3 py-2 text-right font-semibold">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!showMonthly
                ? yearRows.map((r) => (
                    <tr key={r.year} className="hover:bg-accent/30 transition-colors">
                      <td className="px-3 py-2 font-medium">{r.year}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{fmtUSD(r.principalPaid)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-orange-600 dark:text-orange-400">{fmtUSD(r.interestPaid)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{fmtUSD(r.totalPaid)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-blue-600 dark:text-blue-400">{fmtUSD(r.balance)}</td>
                    </tr>
                  ))
                : displayedMonthRows.map((r) => (
                    <tr key={r.month} className="hover:bg-accent/30 transition-colors">
                      <td className="px-3 py-2 font-medium">{r.date}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{fmtUSD2(r.principal)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-orange-600 dark:text-orange-400">{fmtUSD2(r.interest)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{fmtUSD2(r.payment)}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-blue-600 dark:text-blue-400">{fmtUSD(r.balance)}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        {showMonthly && amortRows.length > 24 && (
          <div className="px-4 py-3 border-t border-border text-center">
            <Button variant="outline" size="sm" onClick={() => setShowAllMonths((v) => !v)}>
              {showAllMonths
                ? `Show less (${amortRows.length} months total)`
                : `Show all ${amortRows.length} months`}
            </Button>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground border-t border-border pt-4">
        Formula: M = P × [r(1+r)^n] / [(1+r)^n − 1] where r = monthly rate, n = total months.
        Does not include property tax, insurance, or PMI.
      </p>
    </div>
  );
}
