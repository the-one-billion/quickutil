"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

// ── CSS processing ───────────────────────────────────────────────────────────

function minifyCSS(css: string): string {
  let result = css;
  // Remove /* ... */ block comments (including multi-line)
  result = result.replace(/\/\*[\s\S]*?\*\//g, "");
  // Remove // line comments
  result = result.replace(/\/\/[^\n]*/g, "");
  // Collapse whitespace / newlines to single space
  result = result.replace(/\s+/g, " ");
  // Remove spaces around structural characters
  result = result.replace(/\s*{\s*/g, "{");
  result = result.replace(/\s*}\s*/g, "}");
  result = result.replace(/\s*:\s*/g, ":");
  result = result.replace(/\s*;\s*/g, ";");
  result = result.replace(/\s*,\s*/g, ",");
  // Combinator selectors
  result = result.replace(/\s*>\s*/g, ">");
  result = result.replace(/\s*~\s*/g, "~");
  result = result.replace(/\s*\+\s*/g, "+");
  // Remove trailing semicolons before }
  result = result.replace(/;}/g, "}");
  // Remove leading/trailing whitespace
  result = result.trim();
  return result;
}

function beautifyCSS(css: string): string {
  // Start from minified form for normalisation, then re-expand
  let result = css;
  // Strip block comments
  result = result.replace(/\/\*[\s\S]*?\*\//g, "");
  // Strip line comments
  result = result.replace(/\/\/[^\n]*/g, "");
  // Collapse whitespace
  result = result.replace(/\s+/g, " ").trim();

  let output = "";
  let indent = 0;
  let i = 0;

  while (i < result.length) {
    const ch = result[i];

    if (ch === "{") {
      output += " {\n";
      indent++;
      output += "  ".repeat(indent);
      i++;
    } else if (ch === "}") {
      // trim trailing space on current line
      output = output.trimEnd();
      output += "\n";
      indent = Math.max(0, indent - 1);
      output += "  ".repeat(indent) + "}\n";
      if (indent === 0 && i < result.length - 1) output += "\n";
      else output += "  ".repeat(indent);
      i++;
    } else if (ch === ";") {
      output += ";\n" + "  ".repeat(indent);
      i++;
    } else if (ch === ":") {
      output += ": ";
      i++;
      // skip any leading space after colon (already normalised)
      while (i < result.length && result[i] === " ") i++;
    } else if (ch === ",") {
      // Inside a selector list: add newline + indent; inside a value: just comma+space
      // Heuristic: if inside a block (indent > 0), it's likely a value list
      if (indent > 0) {
        output += ", ";
      } else {
        output += ",\n" + "  ".repeat(indent);
      }
      i++;
      while (i < result.length && result[i] === " ") i++;
    } else {
      output += ch;
      i++;
    }
  }

  return output.trim();
}

// ── sample CSS ───────────────────────────────────────────────────────────────

const SAMPLE_CSS = `/* Reset & base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #333333;
  background-color: #ffffff;
}

/* Navigation */
nav,
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #1a1a2e;
  color: #ffffff;
}

nav ul {
  list-style: none;
  display: flex;
  gap: 1.5rem;
}

nav ul li a {
  text-decoration: none;
  color: inherit;
  font-weight: 500;
  transition: color 0.2s ease;
}

nav ul li a:hover {
  color: #e94560;
}

/* Hero section */
.hero {
  display: grid;
  place-items: center;
  min-height: 80vh;
  text-align: center;
  padding: 4rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero h1 {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 1rem;
}

/* Buttons */
.btn,
.button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #6366f1;
  color: #ffffff;
  border: none;
}

.btn-primary:hover {
  background-color: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

@media (max-width: 768px) {
  nav {
    flex-direction: column;
    gap: 1rem;
  }

  .hero h1 {
    font-size: 2rem;
  }
}`;

// ── stat helpers ─────────────────────────────────────────────────────────────

function byteSize(str: string): number {
  return new TextEncoder().encode(str).length;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(2)} KB`;
}

// ── main component ───────────────────────────────────────────────────────────

export default function CSSMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"minify" | "beautify">("minify");
  const [copied, setCopied] = useState(false);

  const process = useCallback((text: string, m: "minify" | "beautify") => {
    if (!text.trim()) { setOutput(""); return; }
    setOutput(m === "minify" ? minifyCSS(text) : beautifyCSS(text));
  }, []);

  const handleInput = useCallback((val: string) => {
    setInput(val);
    process(val, mode);
  }, [mode, process]);

  const handleTabChange = useCallback((val: string) => {
    const m = val as "minify" | "beautify";
    setMode(m);
    process(input, m);
  }, [input, process]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const inputBytes = byteSize(input);
  const outputBytes = byteSize(output);
  const ratio = inputBytes > 0 && outputBytes > 0
    ? mode === "minify"
      ? `${(((inputBytes - outputBytes) / inputBytes) * 100).toFixed(1)}% smaller`
      : `${((outputBytes / inputBytes) * 100).toFixed(0)}% of original`
    : null;

  return (
    <div className="space-y-5">
      <Tabs value={mode} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="minify">Minify</TabsTrigger>
          <TabsTrigger value="beautify">Beautify</TabsTrigger>
        </TabsList>

        {/* Both tabs share the same UI layout */}
        {(["minify", "beautify"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-5 space-y-5">
            {/* Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Input CSS</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{input.length} chars</Badge>
                  <Badge variant="secondary">{formatBytes(inputBytes)}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInput(SAMPLE_CSS)}
                    className="text-xs h-7"
                  >
                    Sample
                  </Button>
                  {input && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setInput(""); setOutput(""); }}
                      className="text-xs h-7"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                placeholder={`Paste your CSS here to ${tab}…`}
                className="w-full h-56 font-mono text-sm resize-y rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                spellCheck={false}
              />
            </div>

            {/* Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  {tab === "minify" ? "Minified" : "Beautified"} Output
                </Label>
                <div className="flex items-center gap-2">
                  {output && (
                    <>
                      <Badge variant="secondary">{output.length} chars</Badge>
                      <Badge variant="secondary">{formatBytes(outputBytes)}</Badge>
                      {ratio && (
                        <Badge className={tab === "minify" ? "bg-green-600 text-white hover:bg-green-700" : "bg-blue-600 text-white hover:bg-blue-700"}>
                          {ratio}
                        </Badge>
                      )}
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!output}
                    className="text-xs h-7"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="Output will appear here…"
                className="w-full h-56 font-mono text-sm resize-y rounded-md border border-input bg-muted/30 px-3 py-2 focus:outline-none placeholder:text-muted-foreground"
                spellCheck={false}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
