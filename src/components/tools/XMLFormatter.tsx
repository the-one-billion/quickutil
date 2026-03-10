"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ─── XML Tokenizer ────────────────────────────────────────────────────────────

type Token =
  | { kind: "decl"; raw: string }
  | { kind: "doctype"; raw: string }
  | { kind: "comment"; raw: string }
  | { kind: "cdata"; raw: string }
  | { kind: "open"; name: string; attrs: Array<{ name: string; value: string }>; selfClose: boolean }
  | { kind: "close"; name: string }
  | { kind: "text"; value: string };

function tokenize(xml: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < xml.length) {
    if (xml[i] !== "<") {
      // text node
      const start = i;
      while (i < xml.length && xml[i] !== "<") i++;
      const text = xml.slice(start, i);
      if (text.trim()) tokens.push({ kind: "text", value: text.trim() });
      continue;
    }

    // starts with <
    if (xml.startsWith("<?xml", i)) {
      const end = xml.indexOf("?>", i);
      if (end === -1) break;
      tokens.push({ kind: "decl", raw: xml.slice(i, end + 2) });
      i = end + 2;
    } else if (xml.startsWith("<!--", i)) {
      const end = xml.indexOf("-->", i);
      if (end === -1) break;
      tokens.push({ kind: "comment", raw: xml.slice(i, end + 3) });
      i = end + 3;
    } else if (xml.startsWith("<![CDATA[", i)) {
      const end = xml.indexOf("]]>", i);
      if (end === -1) break;
      tokens.push({ kind: "cdata", raw: xml.slice(i, end + 3) });
      i = end + 3;
    } else if (xml.startsWith("<!DOCTYPE", i) || xml.startsWith("<!doctype", i)) {
      const end = xml.indexOf(">", i);
      if (end === -1) break;
      tokens.push({ kind: "doctype", raw: xml.slice(i, end + 1) });
      i = end + 1;
    } else if (xml[i + 1] === "/") {
      // closing tag
      const end = xml.indexOf(">", i);
      if (end === -1) break;
      const inner = xml.slice(i + 2, end).trim();
      tokens.push({ kind: "close", name: inner });
      i = end + 1;
    } else {
      // opening or self-closing tag
      const end = xml.indexOf(">", i);
      if (end === -1) break;
      const inner = xml.slice(i + 1, end);
      const selfClose = inner.endsWith("/");
      const content = selfClose ? inner.slice(0, -1).trim() : inner.trim();

      const nameMatch = content.match(/^([^\s/]+)/);
      const name = nameMatch ? nameMatch[1] : "";
      const attrStr = content.slice(name.length).trim();
      const attrs = parseAttributes(attrStr);
      tokens.push({ kind: "open", name, attrs, selfClose });
      i = end + 1;
    }
  }

  return tokens;
}

function parseAttributes(str: string): Array<{ name: string; value: string }> {
  const attrs: Array<{ name: string; value: string }> = [];
  let i = 0;

  while (i < str.length) {
    // skip whitespace
    while (i < str.length && /\s/.test(str[i])) i++;
    if (i >= str.length) break;

    // attribute name
    const nameStart = i;
    while (i < str.length && str[i] !== "=" && !/\s/.test(str[i])) i++;
    const name = str.slice(nameStart, i).trim();
    if (!name) break;

    while (i < str.length && /\s/.test(str[i])) i++;

    if (str[i] !== "=") {
      // boolean attribute
      attrs.push({ name, value: "" });
      continue;
    }
    i++; // skip =
    while (i < str.length && /\s/.test(str[i])) i++;

    const quote = str[i];
    if (quote === '"' || quote === "'") {
      i++;
      const valueStart = i;
      while (i < str.length && str[i] !== quote) i++;
      attrs.push({ name, value: str.slice(valueStart, i) });
      i++; // skip closing quote
    } else {
      const valueStart = i;
      while (i < str.length && !/\s/.test(str[i])) i++;
      attrs.push({ name, value: str.slice(valueStart, i) });
    }
  }

  return attrs;
}

// ─── Pretty Printer ───────────────────────────────────────────────────────────

function prettyPrint(tokens: Token[], sortAttrs: boolean): string {
  const lines: string[] = [];
  let depth = 0;
  const indent = (d: number) => "  ".repeat(d);

  for (const tok of tokens) {
    switch (tok.kind) {
      case "decl":
        lines.push(tok.raw);
        break;
      case "doctype":
        lines.push(indent(depth) + tok.raw);
        break;
      case "comment":
        lines.push(indent(depth) + tok.raw);
        break;
      case "cdata":
        lines.push(indent(depth) + tok.raw);
        break;
      case "text":
        lines.push(indent(depth) + tok.value);
        break;
      case "open": {
        const attrs = sortAttrs
          ? [...tok.attrs].sort((a, b) => a.name.localeCompare(b.name))
          : tok.attrs;
        const attrStr = attrs.length
          ? " " + attrs.map((a) => (a.value !== "" ? `${a.name}="${a.value}"` : a.name)).join(" ")
          : "";
        const close = tok.selfClose ? " />" : ">";
        lines.push(indent(depth) + `<${tok.name}${attrStr}${close}`);
        if (!tok.selfClose) depth++;
        break;
      }
      case "close":
        depth = Math.max(0, depth - 1);
        lines.push(indent(depth) + `</${tok.name}>`);
        break;
    }
  }

  return lines.join("\n");
}

// ─── Minifier ─────────────────────────────────────────────────────────────────

function minifyXML(xml: string, stripDecl: boolean): string {
  // Remove comments
  let result = xml.replace(/<!--[\s\S]*?-->/g, "");
  // Remove XML declaration if requested
  if (stripDecl) result = result.replace(/<\?xml[\s\S]*?\?>/i, "");
  // Collapse whitespace between tags
  result = result.replace(/>\s+</g, "><");
  // Trim text nodes
  result = result.replace(/>\s+([^<]+)\s+</g, (_, t) => `>${t.trim()}<`);
  // Remove leading/trailing whitespace
  return result.trim();
}

// ─── Validator ────────────────────────────────────────────────────────────────

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateXML(xml: string): ValidationResult {
  const errors: string[] = [];
  const lines = xml.split("\n");

  function lineOf(offset: number): number {
    let count = 1;
    for (let i = 0; i < offset && i < xml.length; i++) {
      if (xml[i] === "\n") count++;
    }
    return count;
  }

  // Check tag name validity
  const tagPattern = /<([^\s!?/][^\s>/]*)/g;
  let m: RegExpExecArray | null;
  while ((m = tagPattern.exec(xml)) !== null) {
    const name = m[1];
    if (!/^[a-zA-Z_:][a-zA-Z0-9._:-]*$/.test(name)) {
      errors.push(`Invalid tag name "<${name}>" at line ${lineOf(m.index)}`);
    }
  }

  // Check attribute quoting
  const unquotedAttr = /=([^"'\s>][^\s>]*)/g;
  while ((m = unquotedAttr.exec(xml)) !== null) {
    // Ignore if inside a declaration
    const before = xml.slice(0, m.index);
    const lastOpen = before.lastIndexOf("<");
    const lastClose = before.lastIndexOf(">");
    if (lastOpen > lastClose) {
      errors.push(`Unquoted attribute value at line ${lineOf(m.index)}`);
    }
  }

  // Balanced tag check using a stack
  const stack: Array<{ name: string; line: number }> = [];
  const tokenRe = /<(\/?)([a-zA-Z_:][a-zA-Z0-9._:-]*)([^>]*)(\/?)>/g;
  while ((m = tokenRe.exec(xml)) !== null) {
    const isClose = m[1] === "/";
    const name = m[2];
    const isSelfClose = m[4] === "/" || /^\?/.test(name);
    if (isSelfClose || name.startsWith("?") || name.startsWith("!")) continue;
    const line = lineOf(m.index);
    if (isClose) {
      if (stack.length === 0) {
        errors.push(`Unexpected closing tag </${name}> at line ${line} — no matching open tag`);
      } else {
        const top = stack[stack.length - 1];
        if (top.name !== name) {
          errors.push(
            `Mismatched tag: expected </${top.name}> (opened at line ${top.line}) but found </${name}> at line ${line}`
          );
        } else {
          stack.pop();
        }
      }
    } else {
      // Check for duplicate attributes
      const attrStr = m[3];
      const attrNames = new Set<string>();
      const attrNameRe = /([a-zA-Z_:][a-zA-Z0-9._:-]*)\s*=/g;
      let am: RegExpExecArray | null;
      while ((am = attrNameRe.exec(attrStr)) !== null) {
        if (attrNames.has(am[1])) {
          errors.push(`Duplicate attribute "${am[1]}" in <${name}> at line ${line}`);
        }
        attrNames.add(am[1]);
      }
      stack.push({ name, line });
    }
  }

  for (const unclosed of stack) {
    errors.push(`Unclosed tag <${unclosed.name}> opened at line ${unclosed.line}`);
  }

  // Suppress line-count warnings for empty input
  void lines;

  return { valid: errors.length === 0, errors };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(1)} KB`;
}

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Book catalog -->
<catalog>
  <book id="bk101" lang="en">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <genre>Computer</genre>
    <price>44.95</price>
    <publish_date>2000-10-01</publish_date>
    <description><![CDATA[An in-depth look at creating applications with XML.]]></description>
  </book>
  <book id="bk102" lang="en">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
    <genre>Fantasy</genre>
    <price>5.95</price>
    <publish_date>2000-12-16</publish_date>
  </book>
</catalog>`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function XMLFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [sortAttrs, setSortAttrs] = useState(false);
  const [stripDecl, setStripDecl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [validResult, setValidResult] = useState<ValidationResult | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyOutput = useCallback(() => {
    if (!output) return;
    void navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1500);
    });
  }, [output]);

  const handleFormat = useCallback(() => {
    const src = input.trim();
    if (!src) { setOutput(""); setError(null); return; }
    try {
      const tokens = tokenize(src);
      const pretty = prettyPrint(tokens, sortAttrs);
      setOutput(pretty);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Parse error");
      setOutput("");
    }
  }, [input, sortAttrs]);

  const handleMinify = useCallback(() => {
    const src = input.trim();
    if (!src) { setOutput(""); setError(null); return; }
    try {
      const minified = minifyXML(src, stripDecl);
      setOutput(minified);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setOutput("");
    }
  }, [input, stripDecl]);

  const handleValidate = useCallback(() => {
    const src = input.trim();
    if (!src) { setValidResult(null); return; }
    const result = validateXML(src);
    setValidResult(result);
    setOutput(result.valid ? "XML is valid." : result.errors.join("\n"));
    setError(null);
  }, [input]);

  const inputBytes = new TextEncoder().encode(input).length;
  const outputBytes = new TextEncoder().encode(output).length;

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
      <Tabs defaultValue="format">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <TabsList>
            <TabsTrigger value="format">Format</TabsTrigger>
            <TabsTrigger value="minify">Minify</TabsTrigger>
            <TabsTrigger value="validate">Validate</TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setInput(SAMPLE_XML); setOutput(""); setError(null); setValidResult(null); }}
          >
            Sample XML
          </Button>
        </div>

        {/* ── FORMAT TAB ── */}
        <TabsContent value="format" className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-primary"
                checked={sortAttrs}
                onChange={(e) => setSortAttrs(e.target.checked)}
              />
              Sort attributes alphabetically
            </label>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Input XML</Label>
                {inputBytes > 0 && <Badge variant="secondary">{formatBytes(inputBytes)}</Badge>}
              </div>
              <textarea
                className="h-96 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Paste XML here…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
              />
              <Button onClick={handleFormat} className="w-full">Format XML</Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Formatted Output</Label>
                <div className="flex items-center gap-2">
                  {outputBytes > 0 && <Badge variant="secondary">{formatBytes(outputBytes)}</Badge>}
                  <Button variant="outline" size="sm" onClick={copyOutput} disabled={!output}>
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              <textarea
                className="h-96 w-full resize-y rounded-lg border border-border bg-muted px-3 py-2 font-mono text-sm text-foreground focus:outline-none"
                readOnly
                value={output}
                placeholder="Formatted XML will appear here…"
                spellCheck={false}
              />
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 font-mono">{error}</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── MINIFY TAB ── */}
        <TabsContent value="minify" className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-primary"
                checked={stripDecl}
                onChange={(e) => setStripDecl(e.target.checked)}
              />
              Strip XML declaration
            </label>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Input XML</Label>
                {inputBytes > 0 && <Badge variant="secondary">{formatBytes(inputBytes)}</Badge>}
              </div>
              <textarea
                className="h-96 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Paste XML here…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
              />
              <Button onClick={handleMinify} className="w-full">Minify XML</Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Minified Output</Label>
                <div className="flex items-center gap-2">
                  {outputBytes > 0 && <Badge variant="secondary">{formatBytes(outputBytes)}</Badge>}
                  {inputBytes > 0 && outputBytes > 0 && (
                    <Badge variant="outline">
                      {Math.round((1 - outputBytes / inputBytes) * 100)}% smaller
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={copyOutput} disabled={!output}>
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              <textarea
                className="h-96 w-full resize-y rounded-lg border border-border bg-muted px-3 py-2 font-mono text-sm text-foreground focus:outline-none"
                readOnly
                value={output}
                placeholder="Minified XML will appear here…"
                spellCheck={false}
              />
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 font-mono">{error}</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── VALIDATE TAB ── */}
        <TabsContent value="validate" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Input XML</Label>
                {inputBytes > 0 && <Badge variant="secondary">{formatBytes(inputBytes)}</Badge>}
              </div>
              <textarea
                className="h-96 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Paste XML to validate…"
                value={input}
                onChange={(e) => { setInput(e.target.value); setValidResult(null); setOutput(""); }}
                spellCheck={false}
              />
              <Button onClick={handleValidate} className="w-full">Validate XML</Button>
            </div>
            <div className="space-y-2">
              <Label>Validation Result</Label>
              {validResult ? (
                <div
                  className={`rounded-lg border p-4 space-y-2 min-h-32 ${
                    validResult.valid
                      ? "border-green-500 bg-green-500/10"
                      : "border-red-500 bg-red-500/10"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{validResult.valid ? "✓" : "✗"}</span>
                    <span
                      className={`font-semibold ${
                        validResult.valid
                          ? "text-green-700 dark:text-green-400"
                          : "text-red-700 dark:text-red-400"
                      }`}
                    >
                      {validResult.valid ? "Valid XML" : `${validResult.errors.length} error(s) found`}
                    </span>
                  </div>
                  {!validResult.valid && (
                    <ul className="space-y-1 font-mono text-sm text-red-700 dark:text-red-400">
                      {validResult.errors.map((err, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="shrink-0 text-red-400">•</span>
                          {err}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-muted p-4 min-h-32 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Validation results will appear here</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
