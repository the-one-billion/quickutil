"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

export default function CreditCardPayoff() {
  const [balance, setBalance] = useState("");
  const [apr, setApr] = useState("");
  const [payment, setPayment] = useState("");
  const [result, setResult] = useState<{
    months: number;
    totalPaid: number;
    totalInterest: number;
    minPayment: number;
    impossible: boolean;
  } | null>(null);

  const calculate = () => {
    const b = Number(balance);
    const r = Number(apr) / 100 / 12;
    const p = Number(payment);
    if (!b || !r || !p) return;
    const minPay = Math.max(25, b * 0.02);
    if (p <= b * r) {
      setResult({ months: 0, totalPaid: 0, totalInterest: 0, minPayment: minPay, impossible: true });
      return;
    }
    const months = Math.ceil(-Math.log(1 - (b * r) / p) / Math.log(1 + r));
    const totalPaid = p * months;
    setResult({ months, totalPaid, totalInterest: totalPaid - b, minPayment: minPay, impossible: false });
  };

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  return (
    <div className="space-y-4 max-w-sm">
      {[
        { label: "Current Balance ($)", val: balance, set: setBalance, placeholder: "5000" },
        { label: "APR (%)", val: apr, set: setApr, placeholder: "24.99" },
        { label: "Monthly Payment ($)", val: payment, set: setPayment, placeholder: "200" },
      ].map(({ label, val, set, placeholder }) => (
        <div key={label}>
          <Label className="mb-1 block">{label}</Label>
          <Input type="number" value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder} />
        </div>
      ))}
      <Button onClick={calculate} className="w-full">
        <CreditCard className="h-4 w-4 mr-2" />Calculate Payoff
      </Button>
      {result && (
        <div className="rounded-lg border p-4 space-y-3">
          {result.impossible ? (
            <div className="space-y-2">
              <p className="text-destructive font-medium text-sm">
                Payment too low — you&apos;ll never pay this off.
              </p>
              <p className="text-sm text-muted-foreground">
                Monthly interest: {fmt(Number(balance) * Number(apr) / 100 / 12)}. Increase your payment above this amount.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {result.months < 12
                    ? `${result.months} months`
                    : `${Math.floor(result.months / 12)}y ${result.months % 12}mo`}
                </p>
                <p className="text-sm text-muted-foreground">to pay off</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Paid</span><span className="font-medium">{fmt(result.totalPaid)}</span></div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Interest</span>
                  <Badge variant="destructive">{fmt(result.totalInterest)}</Badge>
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">Min. payment (est.)</span><span>{fmt(result.minPayment)}/mo</span></div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
