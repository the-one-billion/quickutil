"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Matrix = number[][];

function parseMatrix(rows: string[][]): Matrix {
  return rows.map(row => row.map(v => parseFloat(v) || 0));
}

function add(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((v, j) => v + b[i][j]));
}

function subtract(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((v, j) => v - b[i][j]));
}

function multiply(a: Matrix, b: Matrix): Matrix | null {
  if (a[0].length !== b.length) return null;
  return a.map((row, i) =>
    b[0].map((_, j) => row.reduce((sum, _, k) => sum + a[i][k] * b[k][j], 0))
  );
}

function transpose(m: Matrix): Matrix {
  return m[0].map((_, i) => m.map(row => row[i]));
}

function det2(m: Matrix): number { return m[0][0]*m[1][1] - m[0][1]*m[1][0]; }
function det3(m: Matrix): number {
  return m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])
        -m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])
        +m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
}

function fmtNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(4).replace(/\.?0+$/,"");
}

function MatrixGrid({ values, onChange, label }: { values: string[][]; onChange: (r: number, c: number, v: string) => void; label: string }) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <div className="inline-block space-y-1">
        {values.map((row, r) => (
          <div key={r} className="flex gap-1">
            {row.map((v, c) => (
              <Input key={c} value={v} onChange={e => onChange(r, c, e.target.value)}
                className="w-16 h-8 text-center font-mono text-sm p-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function emptyGrid(rows: number, cols: number): string[][] {
  return Array.from({length: rows}, () => Array(cols).fill("0"));
}

export default function MatrixCalculator() {
  const [size, setSize]   = useState(2);
  const [aVals, setAVals] = useState<string[][]>(emptyGrid(2,2));
  const [bVals, setBVals] = useState<string[][]>(emptyGrid(2,2));
  const [result, setResult] = useState<{ value: Matrix | number | null; label: string } | null>(null);
  const [error, setError]   = useState("");

  const updateSize = (n: number) => {
    setSize(n);
    setAVals(emptyGrid(n,n));
    setBVals(emptyGrid(n,n));
    setResult(null);
  };

  const updateA = (r: number, c: number, v: string) => setAVals(p => p.map((row,i) => row.map((val,j) => i===r&&j===c ? v : val)));
  const updateB = (r: number, c: number, v: string) => setBVals(p => p.map((row,i) => row.map((val,j) => i===r&&j===c ? v : val)));

  const A = parseMatrix(aVals), B = parseMatrix(bVals);

  const ops = [
    { label: "A + B",       fn: () => ({ value: add(A,B), label: "A + B" }) },
    { label: "A − B",       fn: () => ({ value: subtract(A,B), label: "A − B" }) },
    { label: "A × B",       fn: () => {
      const r = multiply(A,B);
      return r ? { value: r, label: "A × B" } : null;
    }},
    { label: "Transpose A", fn: () => ({ value: transpose(A), label: "Transpose of A" }) },
    { label: "det(A)",      fn: () => ({ value: size===2 ? det2(A) : size===3 ? det3(A) : null, label: "det(A)" }) },
  ];

  const run = (fn: typeof ops[0]["fn"], label: string) => {
    setError("");
    const r = fn();
    if (!r || r.value === null) { setError(label === "A × B" ? "Incompatible dimensions for multiplication" : `${label} not supported for ${size}×${size}`); setResult(null); }
    else setResult(r);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Label>Matrix size</Label>
        {[2,3,4].map(n => (
          <Button key={n} variant={size===n ? "default" : "outline"} size="sm" onClick={() => updateSize(n)}>{n}×{n}</Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-8">
        <MatrixGrid values={aVals} onChange={updateA} label="Matrix A" />
        <MatrixGrid values={bVals} onChange={updateB} label="Matrix B" />
      </div>
      <div className="flex flex-wrap gap-2">
        {ops.map(({ label, fn }) => (
          <Button key={label} variant="outline" size="sm" onClick={() => run(fn, label)}>{label}</Button>
        ))}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <div className="rounded-lg border p-4">
          <p className="text-sm font-semibold mb-3">{result.label}</p>
          {typeof result.value === "number" ? (
            <p className="text-3xl font-mono font-bold">{fmtNum(result.value)}</p>
          ) : Array.isArray(result.value) ? (
            <div className="inline-block space-y-1">
              {(result.value as Matrix).map((row, i) => (
                <div key={i} className="flex gap-2">
                  {row.map((v, j) => (
                    <div key={j} className="w-20 h-8 rounded border bg-muted flex items-center justify-center font-mono text-sm">
                      {fmtNum(v)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
