"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

function primeFactors(n: number): number[] {
  const factors: number[] = [];
  let d = 2;
  while (d * d <= n) {
    while (n % d === 0) { factors.push(d); n = Math.floor(n / d); }
    d++;
  }
  if (n > 1) factors.push(n);
  return factors;
}

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }
function lcm(a: number, b: number): number { return (a * b) / gcd(a, b); }

function factorMap(factors: number[]): Record<number, number> {
  const m: Record<number, number> = {};
  for (const f of factors) m[f] = (m[f] || 0) + 1;
  return m;
}

export default function PrimeFactorization() {
  const [num, setNum]   = useState("360");
  const [a, setA]       = useState("48");
  const [b, setB]       = useState("18");
  const [result, setResult] = useState<{ factors: number[]; map: Record<number,number>; isPrime: boolean } | null>(null);
  const [gcdLcm, setGcdLcm] = useState<{ gcd: number; lcm: number } | null>(null);

  const factorize = () => {
    const n = Math.floor(Math.abs(Number(num)));
    if (!n || n < 2) return;
    const factors = primeFactors(n);
    setResult({ factors, map: factorMap(factors), isPrime: factors.length === 1 && factors[0] === n });
  };

  const calcGcdLcm = () => {
    const na = Math.floor(Math.abs(Number(a))), nb = Math.floor(Math.abs(Number(b)));
    if (!na || !nb) return;
    setGcdLcm({ gcd: gcd(na, nb), lcm: lcm(na, nb) });
  };

  return (
    <div className="space-y-6 max-w-sm">
      {/* Factorization */}
      <div className="space-y-3">
        <h3 className="font-semibold">Prime Factorization</h3>
        <div>
          <Label className="mb-1 block">Number</Label>
          <Input type="number" value={num} onChange={e => setNum(e.target.value)} min={2} max={10000000} />
        </div>
        <Button onClick={factorize}>Factorize</Button>
        {result && (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(result.map).map(([p, exp]) => (
                <Badge key={p} variant="default" className="font-mono text-sm">
                  {p}{exp > 1 ? <sup>{exp}</sup> : ""}
                </Badge>
              ))}
            </div>
            <p className="font-mono text-sm">
              {num} = {Object.entries(result.map).map(([p,e]) => `${p}${e>1?`^${e}`:""}`).join(" × ")}
            </p>
            {result.isPrime && <Badge variant="secondary">✓ Prime number</Badge>}
          </div>
        )}
      </div>

      {/* GCD / LCM */}
      <div className="space-y-3 border-t pt-5">
        <h3 className="font-semibold">GCD &amp; LCM</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1 block">Number A</Label>
            <Input type="number" value={a} onChange={e => setA(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 block">Number B</Label>
            <Input type="number" value={b} onChange={e => setB(e.target.value)} />
          </div>
        </div>
        <Button onClick={calcGcdLcm} variant="outline">Calculate</Button>
        {gcdLcm && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">GCD (HCF)</p>
              <p className="text-2xl font-bold font-mono">{gcdLcm.gcd}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">LCM</p>
              <p className="text-2xl font-bold font-mono">{gcdLcm.lcm.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
