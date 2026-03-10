"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Mode = "linear" | "quadratic" | "cubic";

function solveLinear(a: number, b: number): { roots: number[]; steps: string[] } {
  const steps = [`${a}x + ${b} = 0`, `${a}x = ${-b}`, `x = ${-b}/${a} = ${-b/a}`];
  return { roots: a !== 0 ? [-b/a] : [], steps };
}

function solveQuadratic(a: number, b: number, c: number): { roots: (number|string)[]; steps: string[] } {
  const disc = b*b - 4*a*c;
  const steps = [
    `x = (-b ± √(b²-4ac)) / 2a`,
    `Discriminant = ${b}² - 4(${a})(${c}) = ${disc}`,
  ];
  if (disc < 0) {
    const real = -b/(2*a), imag = Math.sqrt(-disc)/(2*a);
    steps.push(`Complex roots: ${real.toFixed(4)} ± ${imag.toFixed(4)}i`);
    return { roots: [`${real.toFixed(4)} + ${imag.toFixed(4)}i`, `${real.toFixed(4)} - ${imag.toFixed(4)}i`], steps };
  }
  const x1 = (-b + Math.sqrt(disc))/(2*a), x2 = (-b - Math.sqrt(disc))/(2*a);
  steps.push(`x₁ = (${-b} + √${disc}) / ${2*a} = ${x1.toFixed(6)}`);
  steps.push(`x₂ = (${-b} - √${disc}) / ${2*a} = ${x2.toFixed(6)}`);
  return { roots: disc === 0 ? [x1] : [x1, x2], steps };
}

function solveCubic(a: number, b: number, c: number, d: number): { roots: string[]; steps: string[] } {
  // Numerical approach using Cardano-based Newton's method for real roots
  const f  = (x: number) => a*x**3 + b*x**2 + c*x + d;
  const df = (x: number) => 3*a*x**2 + 2*b*x + c;
  const roots: number[] = [];
  for (let guess = -10; guess <= 10; guess += 1) {
    let x = guess;
    for (let i = 0; i < 100; i++) {
      const fx = f(x), dfx = df(x);
      if (Math.abs(dfx) < 1e-12) break;
      x -= fx/dfx;
      if (Math.abs(f(x)) < 1e-10) break;
    }
    if (Math.abs(f(x)) < 1e-6 && !roots.some(r => Math.abs(r-x) < 0.001)) roots.push(x);
  }
  const steps = [`f(x) = ${a}x³ + ${b}x² + ${c}x + ${d}`, `Solved numerically (Newton's method)`];
  return { roots: roots.map(r => r.toFixed(6)), steps };
}

function fmt(n: number|string) {
  if (typeof n === "string") return n;
  const s = Number(n.toFixed(6)).toString();
  return s;
}

export default function EquationSolver() {
  const [mode, setMode]   = useState<Mode>("quadratic");
  const [a, setA] = useState("1"), [b, setB] = useState("-5"), [c, setC] = useState("6"), [d, setD] = useState("0");
  const [result, setResult] = useState<{ roots: (number|string)[]; steps: string[] } | null>(null);

  const solve = () => {
    const na=Number(a), nb=Number(b), nc=Number(c), nd=Number(d);
    if (mode === "linear")    setResult(solveLinear(na, nb));
    if (mode === "quadratic") setResult(solveQuadratic(na, nb, nc));
    if (mode === "cubic")     setResult(solveCubic(na, nb, nc, nd) as any);
  };

  const fields = mode === "linear" ? [
    { label: "a (coefficient of x)", val: a, set: setA },
    { label: "b (constant)",          val: b, set: setB },
  ] : mode === "quadratic" ? [
    { label: "a (x²)", val: a, set: setA },
    { label: "b (x)",  val: b, set: setB },
    { label: "c",      val: c, set: setC },
  ] : [
    { label: "a (x³)", val: a, set: setA },
    { label: "b (x²)", val: b, set: setB },
    { label: "c (x)",  val: c, set: setC },
    { label: "d",      val: d, set: setD },
  ];

  const equation = mode === "linear"
    ? `${a}x + ${b} = 0`
    : mode === "quadratic"
    ? `${a}x² + ${b}x + ${c} = 0`
    : `${a}x³ + ${b}x² + ${c}x + ${d} = 0`;

  return (
    <div className="space-y-4 max-w-sm">
      <div className="flex gap-2">
        {(["linear","quadratic","cubic"] as Mode[]).map(m => (
          <Button key={m} variant={mode===m ? "default" : "outline"} size="sm"
            onClick={() => { setMode(m); setResult(null); }} className="capitalize">{m}</Button>
        ))}
      </div>
      <div className="rounded-lg bg-muted/30 px-4 py-2 font-mono text-center font-semibold">{equation}</div>
      {fields.map(({ label, val, set }) => (
        <div key={label}>
          <Label className="mb-1 block text-sm">{label}</Label>
          <Input type="number" value={val} onChange={e => set(e.target.value)} className="font-mono" />
        </div>
      ))}
      <Button onClick={solve} className="w-full">Solve</Button>
      {result && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {result.roots.length === 0
              ? <Badge variant="destructive">No real solutions</Badge>
              : result.roots.map((r,i) => (
                <Badge key={i} className="font-mono text-base px-3 py-1">x{result.roots.length>1?`${i+1}`:""} = {fmt(r)}</Badge>
              ))
            }
          </div>
          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Steps</p>
            {result.steps.map((s,i) => <p key={i} className="font-mono text-xs">{s}</p>)}
          </div>
        </div>
      )}
    </div>
  );
}
