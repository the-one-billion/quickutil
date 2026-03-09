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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── keyword lists ────────────────────────────────────────────────────────────

// Ordered longest-first to avoid partial matches
const KEYWORDS = [
  "IS NOT NULL", "IS NULL", "NOT IN", "NOT BETWEEN", "NOT LIKE",
  "NOT EXISTS", "LEFT OUTER JOIN", "RIGHT OUTER JOIN", "FULL OUTER JOIN",
  "CROSS JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN",
  "INSERT INTO", "CREATE TABLE", "DROP TABLE", "ALTER TABLE",
  "GROUP BY", "ORDER BY", "UNION ALL", "UNION", "INTERSECT", "EXCEPT",
  "SELECT", "DISTINCT", "FROM", "WHERE", "AND", "OR", "NOT",
  "JOIN", "ON", "HAVING", "LIMIT", "OFFSET", "WITH",
  "VALUES", "UPDATE", "SET", "DELETE",
  "CASE", "WHEN", "THEN", "ELSE", "END",
  "AS", "IN", "BETWEEN", "LIKE", "EXISTS",
];

// Clauses that start on their own line (after uppercasing)
const NEWLINE_CLAUSES = new Set([
  "SELECT", "DISTINCT",
  "FROM",
  "WHERE",
  "AND", "OR",
  "LEFT OUTER JOIN", "RIGHT OUTER JOIN", "FULL OUTER JOIN",
  "CROSS JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN", "JOIN",
  "GROUP BY",
  "ORDER BY",
  "HAVING",
  "LIMIT", "OFFSET",
  "UNION ALL", "UNION", "INTERSECT", "EXCEPT",
  "WITH",
  "ON",
  "SET",
  "VALUES",
]);

// ── SQL processing ───────────────────────────────────────────────────────────

function stripComments(sql: string): string {
  // Block comments /* ... */
  let result = sql.replace(/\/\*[\s\S]*?\*\//g, " ");
  // Line comments -- ...
  result = result.replace(/--[^\n]*/g, " ");
  return result;
}

function normalizeWhitespace(sql: string): string {
  return sql.replace(/\s+/g, " ").trim();
}

function uppercaseKeywords(sql: string): string {
  let result = sql;
  for (const kw of KEYWORDS) {
    // Word-boundary aware replacement (case-insensitive)
    const re = new RegExp(`(?<![\\w])${kw.replace(/ /g, "\\s+")}(?![\\w])`, "gi");
    result = result.replace(re, kw);
  }
  return result;
}

function minifySQL(sql: string): string {
  return normalizeWhitespace(uppercaseKeywords(stripComments(sql)));
}

function formatSQL(sql: string): string {
  const minified = minifySQL(sql);
  if (!minified) return "";

  const tokens = tokenize(minified);
  const lines: string[] = [];
  let current = "";
  let parenDepth = 0;

  const flush = () => {
    const t = current.trim();
    if (t) lines.push(t);
    current = "";
  };

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];

    if (tok === "(") {
      current += tok;
      parenDepth++;
      continue;
    }
    if (tok === ")") {
      current += tok;
      parenDepth--;
      continue;
    }
    if (tok === ",") {
      // Inside parens: keep on same line; top-level SELECT list → newline
      current += ",";
      if (parenDepth === 0) {
        flush();
        current = "  "; // indent for next item in clause list
      }
      continue;
    }
    if (tok === ";") {
      current += ";";
      flush();
      lines.push(""); // blank between statements
      continue;
    }

    // Check if this token (possibly multi-word) starts a new clause
    if (parenDepth === 0 && NEWLINE_CLAUSES.has(tok)) {
      flush();
      current = tok + " ";
      continue;
    }

    current += (current && !current.endsWith(" ") && !current.endsWith("(") ? " " : "") + tok;
  }
  flush();

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Simple tokenizer that respects multi-word keywords and string literals */
function tokenize(sql: string): string[] {
  const tokens: string[] = [];
  let i = 0;

  while (i < sql.length) {
    // Skip whitespace
    if (/\s/.test(sql[i])) { i++; continue; }

    // String literals
    if (sql[i] === "'" || sql[i] === '"' || sql[i] === '`') {
      const quote = sql[i];
      let j = i + 1;
      while (j < sql.length && sql[j] !== quote) {
        if (sql[j] === "\\") j++;
        j++;
      }
      tokens.push(sql.slice(i, j + 1));
      i = j + 1;
      continue;
    }

    // Single-char punctuation
    if ("(),;".includes(sql[i])) {
      tokens.push(sql[i]);
      i++;
      continue;
    }

    // Try multi-word keywords first
    let matched = false;
    for (const kw of KEYWORDS) {
      if (sql.slice(i).toUpperCase().startsWith(kw)) {
        const after = sql[i + kw.length];
        if (!after || /[\s(),;'"` ]/.test(after)) {
          tokens.push(kw);
          i += kw.length;
          matched = true;
          break;
        }
      }
    }
    if (matched) continue;

    // Generic word/number token
    let j = i;
    while (j < sql.length && !/[\s(),;'"` ]/.test(sql[j])) j++;
    if (j > i) tokens.push(sql.slice(i, j));
    i = j;
  }

  return tokens;
}

// ── sample SQL ───────────────────────────────────────────────────────────────

const SAMPLE_SQL = `with monthly_sales as (select p.category, date_trunc('month', o.order_date) as month, sum(oi.quantity * oi.unit_price) as revenue, count(distinct o.customer_id) as unique_customers from orders o inner join order_items oi on o.id = oi.order_id inner join products p on oi.product_id = p.id where o.status not in ('cancelled', 'refunded') and o.order_date >= '2024-01-01' group by p.category, date_trunc('month', o.order_date)) select ms.category, ms.month, ms.revenue, ms.unique_customers, round(ms.revenue / ms.unique_customers, 2) as revenue_per_customer from monthly_sales ms where ms.revenue > 10000 order by ms.month desc, ms.revenue desc limit 50;`;

// ── dialect label ─────────────────────────────────────────────────────────────

const DIALECT_LABELS: Record<string, string> = {
  generic: "Generic SQL",
  mysql: "MySQL",
  postgresql: "PostgreSQL",
  sqlite: "SQLite",
};

// ── main component ───────────────────────────────────────────────────────────

export default function SQLFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [dialect, setDialect] = useState("generic");
  const [copied, setCopied] = useState(false);

  const process = useCallback((text: string, m: "format" | "minify") => {
    if (!text.trim()) { setOutput(""); return; }
    setOutput(m === "format" ? formatSQL(text) : minifySQL(text));
  }, []);

  const handleInput = useCallback((val: string) => {
    setInput(val);
    process(val, mode);
  }, [mode, process]);

  const handleTabChange = useCallback((val: string) => {
    const m = val as "format" | "minify";
    setMode(m);
    process(input, m);
  }, [input, process]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  return (
    <div className="space-y-5">
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="shrink-0">Dialect:</Label>
          <Select value={dialect} onValueChange={setDialect}>
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DIALECT_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Badge variant="secondary" className="text-xs">{DIALECT_LABELS[dialect]} — keywords uppercased</Badge>
      </div>

      <Tabs value={mode} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="format">Format</TabsTrigger>
          <TabsTrigger value="minify">Minify</TabsTrigger>
        </TabsList>

        {(["format", "minify"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Input SQL</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInput(SAMPLE_SQL)}
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
                  placeholder={`Paste your SQL here to ${tab}…`}
                  className="w-full h-72 font-mono text-sm resize-y rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  spellCheck={false}
                />
              </div>

              {/* Output */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{tab === "format" ? "Formatted" : "Minified"} Output</Label>
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
                <textarea
                  value={output}
                  readOnly
                  placeholder="Output will appear here…"
                  className="w-full h-72 font-mono text-sm resize-y rounded-md border border-input bg-muted/30 px-3 py-2 focus:outline-none placeholder:text-muted-foreground"
                  spellCheck={false}
                />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
