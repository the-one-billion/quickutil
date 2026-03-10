"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Trash2 } from "lucide-react";

export default function DuplicateRemover() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [stats, setStats] = useState<{ total: number; unique: number; removed: number } | null>(null);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [copied, setCopied] = useState(false);

  const process = () => {
    const lines = input.split("\n");
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const line of lines) {
      const display = trimLines ? line.trim() : line;
      const key = caseSensitive ? display : display.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(display);
      }
    }
    setOutput(unique.join("\n"));
    setStats({ total: lines.length, unique: unique.length, removed: lines.length - unique.length });
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
          Case sensitive
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={trimLines} onChange={(e) => setTrimLines(e.target.checked)} />
          Trim whitespace
        </label>
      </div>

      <div>
        <Label className="mb-1 block">Input (one item per line)</Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"apple\nbanana\napple\norange\nbanana"}
          rows={8}
        />
      </div>

      <Button onClick={process} disabled={!input.trim()}>
        <Trash2 className="h-4 w-4 mr-2" />Remove Duplicates
      </Button>

      {stats && (
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">Total: {stats.total}</Badge>
          <Badge>Unique: {stats.unique}</Badge>
          <Badge variant="destructive">Removed: {stats.removed}</Badge>
        </div>
      )}

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
