"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, ArrowUpDown } from "lucide-react";

type SortMode = "alpha-asc" | "alpha-desc" | "len-asc" | "len-desc" | "numeric" | "random";

const MODES: { value: SortMode; label: string }[] = [
  { value: "alpha-asc",  label: "A → Z" },
  { value: "alpha-desc", label: "Z → A" },
  { value: "len-asc",    label: "Shortest first" },
  { value: "len-desc",   label: "Longest first" },
  { value: "numeric",    label: "Numeric" },
  { value: "random",     label: "Shuffle" },
];

export default function LineSorter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<SortMode>("alpha-asc");
  const [removeBlanks, setRemoveBlanks] = useState(false);
  const [copied, setCopied] = useState(false);

  const sort = () => {
    let lines = input.split("\n");
    if (removeBlanks) lines = lines.filter((l) => l.trim() !== "");
    switch (mode) {
      case "alpha-asc":  lines.sort((a, b) => a.localeCompare(b)); break;
      case "alpha-desc": lines.sort((a, b) => b.localeCompare(a)); break;
      case "len-asc":    lines.sort((a, b) => a.length - b.length); break;
      case "len-desc":   lines.sort((a, b) => b.length - a.length); break;
      case "numeric":    lines.sort((a, b) => parseFloat(a) - parseFloat(b)); break;
      case "random":     for (let i = lines.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [lines[i], lines[j]] = [lines[j], lines[i]]; } break;
    }
    setOutput(lines.join("\n"));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              mode === m.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary/50 hover:bg-accent"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input type="checkbox" checked={removeBlanks} onChange={(e) => setRemoveBlanks(e.target.checked)} />
        Remove blank lines
      </label>

      <div>
        <Label className="mb-1 block">Input</Label>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="One line per item…" rows={8} />
      </div>

      <Button onClick={sort} disabled={!input.trim()}>
        <ArrowUpDown className="h-4 w-4 mr-2" />Sort Lines
      </Button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label>Result</Label>
            <Button size="sm" variant="outline" onClick={copy}>
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Textarea value={output} readOnly rows={8} />
        </div>
      )}
    </div>
  );
}
