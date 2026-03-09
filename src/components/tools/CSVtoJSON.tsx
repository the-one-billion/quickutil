"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// CSV → JSON parsing (no external libs)
// ---------------------------------------------------------------------------

type Delimiter = "," | "\t" | ";";

function parseCSV(raw: string, delimiter: Delimiter, hasHeader: boolean): object[] {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return [];

  function splitLine(line: string): string[] {
    const cols: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delimiter && !inQuotes) {
        cols.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    cols.push(cur);
    return cols;
  }

  if (hasHeader) {
    const headers = splitLine(lines[0]);
    return lines.slice(1).map((line) => {
      const cols = splitLine(line);
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = cols[i] ?? "";
      });
      return obj;
    });
  } else {
    return lines.map((line) => splitLine(line));
  }
}

// ---------------------------------------------------------------------------
// JSON → CSV serialisation (no external libs)
// ---------------------------------------------------------------------------

function serialiseCSV(json: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Invalid JSON.");
  }
  if (!Array.isArray(parsed)) throw new Error("JSON must be an array of objects.");
  if (parsed.length === 0) return "";

  function escapeCell(val: unknown): string {
    const s = val == null ? "" : String(val);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  const first = parsed[0];
  if (typeof first !== "object" || first === null || Array.isArray(first)) {
    throw new Error("JSON must be an array of objects (not primitives or nested arrays).");
  }

  const headers = Object.keys(first as Record<string, unknown>);
  const rows = [
    headers.join(","),
    ...(parsed as Record<string, unknown>[]).map((row) =>
      headers.map((h) => escapeCell(row[h])).join(",")
    ),
  ];
  return rows.join("\n");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type DelimiterKey = "comma" | "tab" | "semicolon";
const DELIMITERS: Record<DelimiterKey, Delimiter> = { comma: ",", tab: "\t", semicolon: ";" };

export default function CSVtoJSON() {
  // CSV → JSON tab
  const [csvInput, setCsvInput] = useState("");
  const [csvDelimiter, setCsvDelimiter] = useState<DelimiterKey>("comma");
  const [hasHeader, setHasHeader] = useState(true);
  const [jsonOutput, setJsonOutput] = useState("");
  const [csvError, setCsvError] = useState("");
  const [csvCopied, setCsvCopied] = useState(false);

  // JSON → CSV tab
  const [jsonInput, setJsonInput] = useState("");
  const [csvOutput, setCsvOutput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [jsonCopied, setJsonCopied] = useState(false);

  // --- CSV → JSON ---
  function handleCsvInput(value: string, delimiter?: DelimiterKey, header?: boolean) {
    const delim = DELIMITERS[delimiter ?? csvDelimiter];
    const useHeader = header ?? hasHeader;
    setCsvInput(value);
    if (!value.trim()) {
      setJsonOutput("");
      setCsvError("");
      return;
    }
    try {
      const result = parseCSV(value, delim, useHeader);
      setJsonOutput(JSON.stringify(result, null, 2));
      setCsvError("");
    } catch (e) {
      setJsonOutput("");
      setCsvError(e instanceof Error ? e.message : "Parse error.");
    }
  }

  function handleDelimiterChange(val: DelimiterKey) {
    setCsvDelimiter(val);
    handleCsvInput(csvInput, val, hasHeader);
  }

  function handleHeaderChange(val: boolean) {
    setHasHeader(val);
    handleCsvInput(csvInput, csvDelimiter, val);
  }

  async function copyCsvToJson() {
    if (!jsonOutput) return;
    await navigator.clipboard.writeText(jsonOutput);
    setCsvCopied(true);
    setTimeout(() => setCsvCopied(false), 2000);
  }

  // --- JSON → CSV ---
  function handleJsonInput(value: string) {
    setJsonInput(value);
    if (!value.trim()) {
      setCsvOutput("");
      setJsonError("");
      return;
    }
    try {
      const result = serialiseCSV(value);
      setCsvOutput(result);
      setJsonError("");
    } catch (e) {
      setCsvOutput("");
      setJsonError(e instanceof Error ? e.message : "Parse error.");
    }
  }

  async function copyJsonToCsv() {
    if (!csvOutput) return;
    await navigator.clipboard.writeText(csvOutput);
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
  }

  function downloadCsv() {
    if (!csvOutput) return;
    const blob = new Blob([csvOutput], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">CSV ↔ JSON Converter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Convert between CSV and JSON formats. Supports custom delimiters and header rows.
        </p>
      </div>

      <Tabs defaultValue="csv-to-json">
        <TabsList className="w-full">
          <TabsTrigger value="csv-to-json" className="flex-1">CSV → JSON</TabsTrigger>
          <TabsTrigger value="json-to-csv" className="flex-1">JSON → CSV</TabsTrigger>
        </TabsList>

        {/* ── CSV → JSON ── */}
        <TabsContent value="csv-to-json" className="mt-4 space-y-4">
          {/* Options row */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Delimiter</Label>
              <Select value={csvDelimiter} onValueChange={(v) => handleDelimiterChange(v as DelimiterKey)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comma">Comma ( , )</SelectItem>
                  <SelectItem value="tab">Tab ( ⇥ )</SelectItem>
                  <SelectItem value="semicolon">Semicolon ( ; )</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                id="header-checkbox"
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => handleHeaderChange(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
              />
              <Label htmlFor="header-checkbox" className="cursor-pointer text-sm">
                First row is header
              </Label>
            </div>
          </div>

          {/* CSV Input */}
          <div className="space-y-1.5">
            <Label>CSV Input</Label>
            <textarea
              value={csvInput}
              onChange={(e) => handleCsvInput(e.target.value)}
              placeholder={"name,age,city\nAlice,30,New York\nBob,25,London"}
              rows={7}
              className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {csvError && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {csvError}
            </p>
          )}

          {/* JSON Output */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>JSON Output</Label>
              <Button variant="outline" size="sm" onClick={copyCsvToJson} disabled={!jsonOutput}>
                {csvCopied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <textarea
              readOnly
              value={jsonOutput}
              rows={9}
              placeholder="JSON output will appear here..."
              className="w-full resize-y rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </TabsContent>

        {/* ── JSON → CSV ── */}
        <TabsContent value="json-to-csv" className="mt-4 space-y-4">
          {/* JSON Input */}
          <div className="space-y-1.5">
            <Label>JSON Input (array of objects)</Label>
            <textarea
              value={jsonInput}
              onChange={(e) => handleJsonInput(e.target.value)}
              placeholder={'[\n  { "name": "Alice", "age": 30 },\n  { "name": "Bob", "age": 25 }\n]'}
              rows={7}
              className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {jsonError && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {jsonError}
            </p>
          )}

          {/* CSV Output */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>CSV Output</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyJsonToCsv} disabled={!csvOutput}>
                  {jsonCopied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={downloadCsv} disabled={!csvOutput}>
                  Download
                </Button>
              </div>
            </div>
            <textarea
              readOnly
              value={csvOutput}
              rows={9}
              placeholder="CSV output will appear here..."
              className="w-full resize-y rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
