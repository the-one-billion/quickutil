"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ─── YAML Parser ─────────────────────────────────────────────────────────────

type YAMLValue = string | number | boolean | null | YAMLObject | YAMLArray;
type YAMLObject = { [key: string]: YAMLValue };
type YAMLArray = YAMLValue[];

function parseYAML(src: string): YAMLValue {
  const lines = src.split("\n");
  // Remove trailing empty lines
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();

  if (lines.length === 0) return null;

  const ctx = { lines, pos: 0 };
  return parseBlock(ctx, 0);
}

interface ParseCtx {
  lines: string[];
  pos: number;
}

function getIndent(line: string): number {
  let i = 0;
  while (i < line.length && line[i] === " ") i++;
  return i;
}

function stripComment(line: string): string {
  // Very simple comment stripping — don't strip inside quoted strings
  let inSingle = false, inDouble = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (ch === "#" && !inSingle && !inDouble) {
      return line.slice(0, i).trimEnd();
    }
  }
  return line;
}

function parseScalar(raw: string): YAMLValue {
  const s = raw.trim();
  if (s === "" || s === "~" || s === "null" || s === "Null" || s === "NULL") return null;
  if (s === "true" || s === "True" || s === "TRUE" || s === "yes" || s === "Yes" || s === "YES") return true;
  if (s === "false" || s === "False" || s === "FALSE" || s === "no" || s === "No" || s === "NO") return false;
  // Quoted strings
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1).replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\"/g, '"');
  }
  // Number
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(s)) return Number(s);
  if (/^0x[0-9a-fA-F]+$/.test(s)) return parseInt(s, 16);
  return s;
}

function skipEmptyAndCommentLines(ctx: ParseCtx): void {
  while (ctx.pos < ctx.lines.length) {
    const line = ctx.lines[ctx.pos];
    const stripped = stripComment(line).trim();
    if (stripped === "") {
      ctx.pos++;
    } else {
      break;
    }
  }
}

function parseBlock(ctx: ParseCtx, baseIndent: number): YAMLValue {
  skipEmptyAndCommentLines(ctx);
  if (ctx.pos >= ctx.lines.length) return null;

  const firstLine = ctx.lines[ctx.pos];
  const firstStripped = stripComment(firstLine).trim();
  const firstIndent = getIndent(firstLine);

  if (firstIndent < baseIndent) return null;

  // Detect if it's a sequence
  if (firstStripped.startsWith("- ") || firstStripped === "-") {
    return parseSequence(ctx, firstIndent);
  }

  // Detect if it's a mapping
  if (firstStripped.includes(": ") || firstStripped.endsWith(":")) {
    return parseMapping(ctx, firstIndent);
  }

  // Scalar
  ctx.pos++;
  return parseScalar(firstStripped);
}

function parseSequence(ctx: ParseCtx, seqIndent: number): YAMLArray {
  const arr: YAMLArray = [];

  while (ctx.pos < ctx.lines.length) {
    skipEmptyAndCommentLines(ctx);
    if (ctx.pos >= ctx.lines.length) break;

    const line = ctx.lines[ctx.pos];
    const indent = getIndent(line);
    if (indent < seqIndent) break;
    if (indent > seqIndent) break; // shouldn't happen at top level

    const stripped = stripComment(line).trim();
    if (!stripped.startsWith("- ") && stripped !== "-") break;

    const rest = stripped.startsWith("- ") ? stripped.slice(2).trim() : "";
    ctx.pos++;

    if (rest === "" || rest === "|" || rest === ">") {
      // value on next lines
      if (rest === "|" || rest === ">") {
        arr.push(parseMultiline(ctx, seqIndent + 2, rest === "|"));
      } else {
        skipEmptyAndCommentLines(ctx);
        if (ctx.pos < ctx.lines.length) {
          const nextIndent = getIndent(ctx.lines[ctx.pos]);
          if (nextIndent > seqIndent) {
            arr.push(parseBlock(ctx, nextIndent));
          } else {
            arr.push(null);
          }
        } else {
          arr.push(null);
        }
      }
    } else if (rest.includes(": ") || rest.endsWith(":")) {
      // inline mapping start, treat current line as start of mapping
      // We need to parse it as a mapping from this line onwards
      // Inject this line back with extra indentation context
      const mappingLines: string[] = [" ".repeat(seqIndent + 2) + rest];
      // Peek ahead for continuation lines at deeper indent
      while (ctx.pos < ctx.lines.length) {
        const nextLine = ctx.lines[ctx.pos];
        const nextIndent = getIndent(nextLine);
        if (nextIndent > seqIndent) {
          mappingLines.push(nextLine);
          ctx.pos++;
        } else break;
      }
      const subCtx: ParseCtx = { lines: mappingLines, pos: 0 };
      arr.push(parseMapping(subCtx, seqIndent + 2));
    } else if (rest === "|" || rest === ">") {
      arr.push(parseMultiline(ctx, seqIndent + 2, rest === "|"));
    } else {
      arr.push(parseScalar(rest));
    }
  }

  return arr;
}

function parseMapping(ctx: ParseCtx, mapIndent: number): YAMLObject {
  const obj: YAMLObject = {};

  while (ctx.pos < ctx.lines.length) {
    skipEmptyAndCommentLines(ctx);
    if (ctx.pos >= ctx.lines.length) break;

    const line = ctx.lines[ctx.pos];
    const indent = getIndent(line);
    if (indent < mapIndent) break;
    if (indent > mapIndent) break;

    const stripped = stripComment(line).trim();
    if (!stripped.includes(":") && !stripped.endsWith(":")) break;

    // Find key: value split (not inside quotes)
    const colonIdx = findColon(stripped);
    if (colonIdx === -1) { ctx.pos++; continue; }

    const key = stripped.slice(0, colonIdx).trim();
    const valueRaw = stripped.slice(colonIdx + 1).trim();
    ctx.pos++;

    if (valueRaw === "" || valueRaw === "|" || valueRaw === ">") {
      // Multi-line or nested block
      skipEmptyAndCommentLines(ctx);
      if (ctx.pos >= ctx.lines.length) {
        obj[key] = null;
        continue;
      }
      if (valueRaw === "|" || valueRaw === ">") {
        obj[key] = parseMultiline(ctx, mapIndent + 2, valueRaw === "|");
        continue;
      }
      const nextLine = ctx.lines[ctx.pos];
      const nextIndent = getIndent(nextLine);
      if (nextIndent > mapIndent) {
        obj[key] = parseBlock(ctx, nextIndent);
      } else {
        obj[key] = null;
      }
    } else {
      obj[key] = parseScalar(valueRaw);
    }
  }

  return obj;
}

function findColon(s: string): number {
  let inSingle = false, inDouble = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (ch === ":" && !inSingle && !inDouble) {
      // Valid if followed by space or end of string
      if (i + 1 >= s.length || s[i + 1] === " " || s[i + 1] === "\t") return i;
    }
  }
  return -1;
}

function parseMultiline(ctx: ParseCtx, contentIndent: number, literal: boolean): string {
  const parts: string[] = [];
  while (ctx.pos < ctx.lines.length) {
    const line = ctx.lines[ctx.pos];
    const indent = getIndent(line);
    if (line.trim() === "") {
      parts.push("");
      ctx.pos++;
      continue;
    }
    if (indent < contentIndent) break;
    parts.push(line.slice(contentIndent));
    ctx.pos++;
  }
  // Remove trailing empty lines
  while (parts.length > 0 && parts[parts.length - 1] === "") parts.pop();
  return literal ? parts.join("\n") : parts.join(" ").replace(/\s+/g, " ").trim();
}

// ─── YAML Serializer ──────────────────────────────────────────────────────────

function needsQuoting(s: string): boolean {
  if (s === "") return true;
  if (/^(true|false|yes|no|null|~|True|False|Yes|No|Null|NULL|TRUE|FALSE|YES|NO)$/.test(s)) return true;
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(s)) return true;
  if (/[:#\[\]{},&*?|<>=!%@`\n\r]/.test(s)) return true;
  if (s.startsWith(" ") || s.endsWith(" ")) return true;
  return false;
}

function quoteStr(s: string): string {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
}

function toYAML(value: YAMLValue, indent = 0): string {
  const pad = "  ".repeat(indent);

  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    return needsQuoting(value) ? quoteStr(value) : value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value
      .map((item) => {
        if (typeof item === "object" && item !== null && !Array.isArray(item)) {
          const entries = Object.entries(item as YAMLObject);
          if (entries.length === 0) return `${pad}- {}`;
          const [firstKey, firstVal] = entries[0];
          const rest = entries.slice(1);
          const firstValStr = typeof firstVal === "object" && firstVal !== null
            ? "\n" + toYAMLEntries(firstVal as YAMLObject, indent + 2)
            : " " + toYAML(firstVal, indent + 1);
          const restStr = rest.length > 0
            ? "\n" + rest.map(([k, v]) => {
                const valStr = typeof v === "object" && v !== null
                  ? "\n" + toYAMLEntries(v as YAMLObject, indent + 2)
                  : " " + toYAML(v, indent + 1);
                return `${pad}  ${needsQuoting(k) ? quoteStr(k) : k}:${valStr}`;
              }).join("\n")
            : "";
          return `${pad}- ${needsQuoting(firstKey) ? quoteStr(firstKey) : firstKey}:${firstValStr}${restStr}`;
        }
        return `${pad}- ${toYAML(item, indent + 1)}`;
      })
      .join("\n");
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as YAMLObject);
    if (entries.length === 0) return "{}";
    return toYAMLEntries(value as YAMLObject, indent);
  }
  return String(value);
}

function toYAMLEntries(obj: YAMLObject, indent: number): string {
  const pad = "  ".repeat(indent);
  return Object.entries(obj)
    .map(([k, v]) => {
      const keyStr = needsQuoting(k) ? quoteStr(k) : k;
      if (typeof v === "object" && v !== null) {
        if (Array.isArray(v)) {
          if (v.length === 0) return `${pad}${keyStr}: []`;
          return `${pad}${keyStr}:\n${toYAML(v, indent + 1)}`;
        }
        const entries = Object.entries(v as YAMLObject);
        if (entries.length === 0) return `${pad}${keyStr}: {}`;
        return `${pad}${keyStr}:\n${toYAMLEntries(v as YAMLObject, indent + 1)}`;
      }
      return `${pad}${keyStr}: ${toYAML(v, indent)}`;
    })
    .join("\n");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(1)} KB`;
}

const SAMPLE_YAML = `# Application configuration
name: My Application
version: 2.1.0
debug: false
database:
  host: localhost
  port: 5432
  name: myapp_db
  ssl: true
features:
  - authentication
  - caching
  - notifications
server:
  host: 0.0.0.0
  port: 8080
  timeout: 30
logging:
  level: info
  file: /var/log/app.log`;

const SAMPLE_JSON = `{
  "name": "My Application",
  "version": "2.1.0",
  "debug": false,
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp_db",
    "ssl": true
  },
  "features": [
    "authentication",
    "caching",
    "notifications"
  ],
  "server": {
    "host": "0.0.0.0",
    "port": 8080,
    "timeout": 30
  },
  "logging": {
    "level": "info",
    "file": "/var/log/app.log"
  }
}`;

// ─── Component ────────────────────────────────────────────────────────────────

function IOPane({
  inputLabel,
  outputLabel,
  inputValue,
  outputValue,
  onInputChange,
  onConvert,
  convertLabel,
  error,
  onSample,
  copied,
  onCopy,
  inputPlaceholder,
  outputPlaceholder,
}: {
  inputLabel: string;
  outputLabel: string;
  inputValue: string;
  outputValue: string;
  onInputChange: (v: string) => void;
  onConvert: () => void;
  convertLabel: string;
  error: string | null;
  onSample: () => void;
  copied: boolean;
  onCopy: () => void;
  inputPlaceholder: string;
  outputPlaceholder: string;
}) {
  const inputBytes = new TextEncoder().encode(inputValue).length;
  const outputBytes = new TextEncoder().encode(outputValue).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onSample}>
          Sample
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{inputLabel}</Label>
            {inputBytes > 0 && <Badge variant="secondary">{formatBytes(inputBytes)}</Badge>}
          </div>
          <textarea
            className="h-96 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={inputPlaceholder}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            spellCheck={false}
          />
          <Button onClick={onConvert} className="w-full">{convertLabel}</Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{outputLabel}</Label>
            <div className="flex items-center gap-2">
              {outputBytes > 0 && <Badge variant="secondary">{formatBytes(outputBytes)}</Badge>}
              <Button variant="outline" size="sm" onClick={onCopy} disabled={!outputValue}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
          <textarea
            className={`h-96 w-full resize-y rounded-lg border px-3 py-2 font-mono text-sm focus:outline-none ${
              error
                ? "border-red-500 bg-red-500/5 text-foreground"
                : "border-border bg-muted text-foreground"
            }`}
            readOnly
            value={error ? "" : outputValue}
            placeholder={outputPlaceholder}
            spellCheck={false}
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 font-mono">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function YAMLJSON() {
  const [yamlInput, setYamlInput] = useState("");
  const [jsonFromYaml, setJsonFromYaml] = useState("");
  const [yamlError, setYamlError] = useState<string | null>(null);

  const [jsonInput, setJsonInput] = useState("");
  const [yamlFromJson, setYamlFromJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const [copiedA, setCopiedA] = useState(false);
  const [copiedB, setCopiedB] = useState(false);
  const timerA = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerB = useRef<ReturnType<typeof setTimeout> | null>(null);

  const convertYamlToJson = useCallback(() => {
    try {
      const parsed = parseYAML(yamlInput.trim());
      setJsonFromYaml(JSON.stringify(parsed, null, 2));
      setYamlError(null);
    } catch (e) {
      setYamlError(e instanceof Error ? e.message : "Invalid YAML");
      setJsonFromYaml("");
    }
  }, [yamlInput]);

  const convertJsonToYaml = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonInput.trim());
      const yaml = toYAML(parsed as YAMLValue, 0);
      setYamlFromJson(yaml);
      setJsonError(null);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : "Invalid JSON");
      setYamlFromJson("");
    }
  }, [jsonInput]);

  const copyA = useCallback(() => {
    void navigator.clipboard.writeText(jsonFromYaml).then(() => {
      setCopiedA(true);
      if (timerA.current) clearTimeout(timerA.current);
      timerA.current = setTimeout(() => setCopiedA(false), 1500);
    });
  }, [jsonFromYaml]);

  const copyB = useCallback(() => {
    void navigator.clipboard.writeText(yamlFromJson).then(() => {
      setCopiedB(true);
      if (timerB.current) clearTimeout(timerB.current);
      timerB.current = setTimeout(() => setCopiedB(false), 1500);
    });
  }, [yamlFromJson]);

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
      <Tabs defaultValue="yaml-to-json">
        <TabsList className="mb-4">
          <TabsTrigger value="yaml-to-json">YAML → JSON</TabsTrigger>
          <TabsTrigger value="json-to-yaml">JSON → YAML</TabsTrigger>
        </TabsList>

        <TabsContent value="yaml-to-json">
          <IOPane
            inputLabel="YAML Input"
            outputLabel="JSON Output"
            inputValue={yamlInput}
            outputValue={jsonFromYaml}
            onInputChange={(v) => { setYamlInput(v); setYamlError(null); }}
            onConvert={convertYamlToJson}
            convertLabel="Convert to JSON"
            error={yamlError}
            onSample={() => { setYamlInput(SAMPLE_YAML); setJsonFromYaml(""); setYamlError(null); }}
            copied={copiedA}
            onCopy={copyA}
            inputPlaceholder="Paste YAML here…"
            outputPlaceholder="JSON output will appear here…"
          />
        </TabsContent>

        <TabsContent value="json-to-yaml">
          <IOPane
            inputLabel="JSON Input"
            outputLabel="YAML Output"
            inputValue={jsonInput}
            outputValue={yamlFromJson}
            onInputChange={(v) => { setJsonInput(v); setJsonError(null); }}
            onConvert={convertJsonToYaml}
            convertLabel="Convert to YAML"
            error={jsonError}
            onSample={() => { setJsonInput(SAMPLE_JSON); setYamlFromJson(""); setJsonError(null); }}
            copied={copiedB}
            onCopy={copyB}
            inputPlaceholder="Paste JSON here…"
            outputPlaceholder="YAML output will appear here…"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
