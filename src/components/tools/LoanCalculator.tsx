"use client";
/**
 * Loan Calculator
 * Standard amortization: monthly payment, total paid, total interest.
 * Amortization schedule table with first-5-rows toggle.
 */
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

// ── Types ────────────────────────────────────────────────────────────────────
interface AmortizationRow {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtCurrency(n: number): string {
  return `$${fmt(n)}`;
}

function computeAmortization(
  principal: number,
  annualRate: number,
  termYears: number
): { monthlyPayment: number; schedule: AmortizationRow[] } {
  if (principal <= 0 || termYears <= 0 || annualRate < 0) {
    return { monthlyPayment: 0, schedule: [] };
  }

  const months = termYears * 12;
  let monthlyPayment: number;

  if (annualRate === 0) {
    monthlyPayment = principal / months;
  } else {
    const r = annualRate / 100 / 12;
    monthlyPayment = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  }

  const schedule: AmortizationRow[] = [];
  let balance = principal;

  for (let year = 1; year <= termYears; year++) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    const monthsInYear = Math.min(12, months - (year - 1) * 12);

    for (let m = 0; m < monthsInYear; m++) {
      const interestPayment = annualRate === 0 ? 0 : balance * (annualRate / 100 / 12);
      const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
      yearInterest += interestPayment;
      yearPrincipal += principalPayment;
      balance = Math.max(0, balance - principalPayment);
    }

    schedule.push({
      year,
      principalPaid: yearPrincipal,
      interestPaid: yearInterest,
      balance,
    });
  }

  return { monthlyPayment, schedule };
}

// ── Component ────────────────────────────────────────────────────────────────
export default function LoanCalculator() {
  const [principalStr, setPrincipalStr] = useState("250000");
  const [rateStr, setRateStr] = useState("6.5");
  const [term, setTerm] = useState(30);
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const principal = useMemo(() => {
    const n = parseFloat(principalStr.replace(/,/g, ""));
    return isNaN(n) || n < 0 ? 0 : n;
  }, [principalStr]);

  const rate = useMemo(() => {
    const n = parseFloat(rateStr);
    return isNaN(n) || n < 0 ? 0 : n;
  }, [rateStr]);

  const { monthlyPayment, schedule } = useMemo(
    () => computeAmortization(principal, rate, term),
    [principal, rate, term]
  );

  const totalPaid = useMemo(() => monthlyPayment * term * 12, [monthlyPayment, term]);
  const totalInterest = useMemo(() => totalPaid - principal, [totalPaid, principal]);

  const displayedRows = showFullSchedule ? schedule : schedule.slice(0, 5);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Loan Calculator</h1>
        <p className="text-sm text-muted-foreground">
          Calculate monthly payments and total interest using standard amortization. All results update live.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="principal">Principal Amount</Label>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-3 text-sm font-medium text-muted-foreground select-none">
              $
            </span>
            <Input
              id="principal"
              type="number"
              min="0"
              step="1000"
              placeholder="250000"
              value={principalStr}
              onChange={(e) => setPrincipalStr(e.target.value)}
              className="pl-7"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rate">Annual Interest Rate</Label>
          <div className="relative flex items-center">
            <Input
              id="rate"
              type="number"
              min="0"
              max="30"
              step="0.1"
              placeholder="6.5"
              value={rateStr}
              onChange={(e) => setRateStr(e.target.value)}
              className="pr-7"
            />
            <span className="pointer-events-none absolute right-3 text-sm font-medium text-muted-foreground select-none">
              %
            </span>
          </div>
        </div>
      </div>

      {/* Term slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Loan Term</Label>
          <span className="text-lg font-bold text-foreground">
            {term} {term === 1 ? "year" : "years"}
          </span>
        </div>
        <Slider
          min={1}
          max={30}
          step={1}
          value={[term]}
          onValueChange={([v]) => setTerm(v)}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 yr</span>
          <span>30 yrs</span>
        </div>
      </div>

      {/* Results */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="bg-muted/50 px-5 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Results
          </span>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-5 py-4 bg-primary/5">
            <p className="text-base font-medium text-foreground">Monthly Payment</p>
            <p className="text-3xl font-extrabold tracking-tight text-primary">
              {fmtCurrency(monthlyPayment)}
            </p>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-sm font-medium text-foreground">Total Amount Paid</p>
            <p className="text-xl font-extrabold text-foreground">{fmtCurrency(totalPaid)}</p>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-sm font-medium text-foreground">Total Interest Paid</p>
            <p className="text-xl font-extrabold text-destructive">{fmtCurrency(totalInterest)}</p>
          </div>
        </div>
      </div>

      {/* Amortization Schedule */}
      {schedule.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Amortization Schedule</h2>
            <span className="text-xs text-muted-foreground">(yearly summary)</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 text-left">Year</th>
                  <th className="px-4 py-3 text-right">Principal</th>
                  <th className="px-4 py-3 text-right">Interest</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayedRows.map((row) => (
                  <tr
                    key={row.year}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{row.year}</td>
                    <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">
                      {fmtCurrency(row.principalPaid)}
                    </td>
                    <td className="px-4 py-3 text-right text-red-500 dark:text-red-400">
                      {fmtCurrency(row.interestPaid)}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {fmtCurrency(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {schedule.length > 5 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowFullSchedule((v) => !v)}
            >
              {showFullSchedule
                ? "Show less"
                : `Show full schedule (${schedule.length} years)`}
            </Button>
          )}
        </div>
      )}

      <p className="border-t border-border pt-4 text-xs text-muted-foreground">
        This calculator uses the standard fixed-rate amortization formula. Actual loan terms may vary by lender.
      </p>
    </div>
  );
}
