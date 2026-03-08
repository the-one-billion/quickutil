"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type ValidationStatus =
  | { kind: "idle" }
  | { kind: "valid" }
  | { kind: "error"; message: string };

function parseJSON(input: string): { value: unknown; error: string | null } {
  try {
    return { value: JSON.parse(input), error: null };
  } catch (e) {
    return { value: null, error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}

function extractLineNumber(errorMsg: string): number | null {
  // Modern engines include "line N" or "at position N"
  const lineMatch = errorMsg.match(/line (\d+)/i);
  if (lineMatch) return parseInt(lineMatch[1], 10);
  return null;
}

function countLines(text: string): number {
  if (!text) return 0;
  return text.split("\n").length;
}

export default function JSONFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<ValidationStatus>({ kind: "idle" });
  const [copied, setCopied] = useState(false);

  const format = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setOutput("");
      setStatus({ kind: "idle" });
      return;
    }
    const { value, error } = parseJSON(trimmed);
    if (error !== null) {
      const line = extractLineNumber(error);
      setOutput("");
      setStatus({
        kind: "error",
        message: line ? `${error} (line ${line})` : error,
      });
    } else {
      const formatted = JSON.stringify(value, null, 2);
      setOutput(formatted);
      setStatus({ kind: "valid" });
    }
  }, [input]);

  const minify = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setOutput("");
      setStatus({ kind: "idle" });
      return;
    }
    const { value, error } = parseJSON(trimmed);
    if (error !== null) {
      const line = extractLineNumber(error);
      setOutput("");
      setStatus({
        kind: "error",
        message: line ? `${error} (line ${line})` : error,
      });
    } else {
      const minified = JSON.stringify(value);
      setOutput(minified);
      setStatus({ kind: "valid" });
    }
  }, [input]);

  const validate = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setStatus({ kind: "idle" });
      return;
    }
    const { error } = parseJSON(trimmed);
    if (error !== null) {
      const line = extractLineNumber(error);
      setStatus({
        kind: "error",
        message: line ? `${error} (line ${line})` : error,
      });
    } else {
      setStatus({ kind: "valid" });
    }
  }, [input]);

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function clear() {
    setInput("");
    setOutput("");
    setStatus({ kind: "idle" });
    setCopied(false);
  }

  const outputLines = countLines(output);
  const outputChars = output.length;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">JSON Formatter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Format, minify, and validate JSON. Errors include line numbers when available.
        </p>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-foreground">JSON Input</Label>
          <span className="text-xs text-muted-foreground">
            {input.length > 0 && `${countLines(input)} lines · ${input.length} chars`}
          </span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Paste your JSON here, e.g. {"name":"Alice","age":30}'
          rows={10}
          spellCheck={false}
          className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={format} disabled={!input.trim()}>
          Format
        </Button>
        <Button variant="outline" onClick={minify} disabled={!input.trim()} className="border-border">
          Minify
        </Button>
        <Button variant="outline" onClick={validate} disabled={!input.trim()} className="border-border">
          Validate
        </Button>
        <Button variant="ghost" onClick={clear} disabled={!input && !output} className="ml-auto">
          Clear
        </Button>
      </div>

      {/* Status bar */}
      {status.kind !== "idle" && (
        <div
          className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
            status.kind === "valid"
              ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
          }`}
        >
          <span className="mt-px shrink-0">{status.kind === "valid" ? "✅" : "❌"}</span>
          <span>{status.kind === "valid" ? "Valid JSON" : status.message}</span>
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-foreground">Output</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={copyOutput}
              className="border-border"
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <textarea
            readOnly
            value={output}
            rows={12}
            spellCheck={false}
            className="w-full resize-y rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-mono text-foreground focus:outline-none"
          />
          {/* Footer stats */}
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>{outputLines} lines</span>
            <span>{outputChars.toLocaleString()} characters</span>
          </div>
        </div>
      )}
    </div>
  );
}
