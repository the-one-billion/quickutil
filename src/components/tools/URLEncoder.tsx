"use client";

import { useState, useCallback, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

// ── helpers ──────────────────────────────────────────────────────────────────

function looksEncoded(s: string): boolean {
  return /%[0-9A-Fa-f]{2}/.test(s);
}

function safeDecodeURIComponent(s: string): { result: string; error: string | null } {
  try {
    return { result: decodeURIComponent(s), error: null };
  } catch (e) {
    return { result: "", error: e instanceof Error ? e.message : "Invalid encoded sequence" };
  }
}

function parseURL(raw: string): {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  params: { key: string; value: string }[];
  error: string | null;
} {
  try {
    const u = new URL(raw);
    const params: { key: string; value: string }[] = [];
    u.searchParams.forEach((v, k) => params.push({ key: k, value: v }));
    return {
      protocol: u.protocol,
      hostname: u.hostname,
      port: u.port,
      pathname: u.pathname,
      search: u.search,
      hash: u.hash,
      params,
      error: null,
    };
  } catch {
    // Try adding https:// prefix
    try {
      const u = new URL("https://" + raw);
      const params: { key: string; value: string }[] = [];
      u.searchParams.forEach((v, k) => params.push({ key: k, value: v }));
      return {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port,
        pathname: u.pathname,
        search: u.search,
        hash: u.hash,
        params,
        error: null,
      };
    } catch {
      return { protocol: "", hostname: "", port: "", pathname: "", search: "", hash: "", params: [], error: "Not a valid URL" };
    }
  }
}

// ── CopyButton ────────────────────────────────────────────────────────────────

function CopyButton({ text, label = "Copy", size = "sm" }: { text: string; label?: string; size?: "sm" | "default" }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);
  return (
    <Button variant="outline" size={size} onClick={copy} disabled={!text} className="text-xs h-7 shrink-0">
      {copied ? "Copied!" : label}
    </Button>
  );
}

// ── Tab 1: Encode/Decode ─────────────────────────────────────────────────────

function EncodeDecodeTab() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fullURL, setFullURL] = useState(false);

  const encode = useCallback(() => {
    const encoded = fullURL ? encodeURI(input) : encodeURIComponent(input);
    setOutput(encoded);
    setError(null);
  }, [input, fullURL]);

  const decode = useCallback(() => {
    const { result, error: err } = safeDecodeURIComponent(input);
    if (err) {
      setError(err);
      setOutput("");
    } else {
      setOutput(result);
      setError(null);
    }
  }, [input]);

  const isEncoded = looksEncoded(input);

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
          <input
            type="checkbox"
            checked={fullURL}
            onChange={(e) => setFullURL(e.target.checked)}
            className="accent-primary"
          />
          Encode full URL mode{" "}
          <span className="text-muted-foreground text-xs">(uses encodeURI — preserves : / ? # & =)</span>
        </label>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Input</Label>
          {isEncoded && (
            <Badge variant="secondary" className="text-xs">Looks encoded — try Decode</Badge>
          )}
        </div>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setOutput(""); setError(null); }}
          placeholder="Paste text or URL-encoded string here…"
          className="w-full h-28 font-mono text-sm resize-y rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          spellCheck={false}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={encode} disabled={!input} size="sm">
          Encode
        </Button>
        <Button onClick={decode} variant="outline" disabled={!input} size="sm">
          Decode
        </Button>
        {input && (
          <Button variant="ghost" size="sm" onClick={() => { setInput(""); setOutput(""); setError(null); }}>
            Clear
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Output</Label>
          <CopyButton text={output} />
        </div>
        <textarea
          value={output}
          readOnly
          placeholder="Output will appear here…"
          className="w-full h-28 font-mono text-sm resize-y rounded-md border border-input bg-muted/30 px-3 py-2 focus:outline-none placeholder:text-muted-foreground"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

// ── Tab 2: Query String Builder ───────────────────────────────────────────────

interface QSParam { id: number; key: string; value: string }

function QueryBuilderTab() {
  const [baseURL, setBaseURL] = useState("");
  const [params, setParams] = useState<QSParam[]>([{ id: 1, key: "", value: "" }]);
  const [nextId, setNextId] = useState(2);
  const uid = useId();

  const addRow = () => {
    setParams((p) => [...p, { id: nextId, key: "", value: "" }]);
    setNextId((n) => n + 1);
  };

  const removeRow = (id: number) => {
    setParams((p) => p.filter((r) => r.id !== id));
  };

  const updateRow = (id: number, field: "key" | "value", val: string) => {
    setParams((p) => p.map((r) => r.id === id ? { ...r, [field]: val } : r));
  };

  const queryString = params
    .filter((p) => p.key.trim())
    .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join("&");

  const fullOutput = queryString
    ? (baseURL.trim() ? baseURL.trim().replace(/\?$/, "") + "?" + queryString : "?" + queryString)
    : "";

  return (
    <div className="space-y-4">
      {/* Base URL */}
      <div className="space-y-1">
        <Label htmlFor={`${uid}-base`}>Base URL (optional)</Label>
        <Input
          id={`${uid}-base`}
          value={baseURL}
          onChange={(e) => setBaseURL(e.target.value)}
          placeholder="https://example.com/path"
          className="font-mono text-sm"
        />
      </div>

      {/* Parameters table */}
      <div className="space-y-2">
        <Label>Parameters</Label>
        <div className="space-y-2">
          {params.map((row) => (
            <div key={row.id} className="flex gap-2 items-center">
              <Input
                value={row.key}
                onChange={(e) => updateRow(row.id, "key", e.target.value)}
                placeholder="key"
                className="font-mono text-sm flex-1"
              />
              <span className="text-muted-foreground text-sm">=</span>
              <Input
                value={row.value}
                onChange={(e) => updateRow(row.id, "value", e.target.value)}
                placeholder="value"
                className="font-mono text-sm flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeRow(row.id)}
                disabled={params.length === 1}
                className="text-muted-foreground hover:text-destructive px-2"
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addRow} className="text-xs">
          + Add Parameter
        </Button>
      </div>

      {/* Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Query String</Label>
          <div className="flex gap-2">
            <CopyButton text={queryString ? "?" + queryString : ""} label="Copy Query String" />
            {baseURL.trim() && <CopyButton text={fullOutput} label="Copy Full URL" />}
          </div>
        </div>
        <div className="font-mono text-sm bg-muted/30 rounded-md border border-border px-3 py-2 min-h-12 break-all text-foreground">
          {fullOutput || <span className="text-muted-foreground">Query string will appear here…</span>}
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: URL Parser ─────────────────────────────────────────────────────────

function URLParserTab() {
  const [input, setInput] = useState("");
  const parsed = input.trim() ? parseURL(input.trim()) : null;
  const uid = useId();

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="grid grid-cols-[120px_1fr_auto] gap-2 items-center py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="font-mono text-sm break-all">{value || <span className="text-muted-foreground italic">—</span>}</span>
      {value && <CopyButton text={value} />}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${uid}-url`}>Full URL</Label>
        <div className="flex gap-2">
          <Input
            id={`${uid}-url`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://example.com/path?key=value#section"
            className="font-mono text-sm"
          />
          {input && (
            <Button variant="outline" size="sm" onClick={() => setInput("")} className="shrink-0">
              Clear
            </Button>
          )}
        </div>
      </div>

      {parsed && parsed.error && (
        <p className="text-sm text-destructive">{parsed.error}</p>
      )}

      {parsed && !parsed.error && (
        <div className="space-y-4">
          {/* Parts */}
          <div className="rounded-md border border-border px-4 py-1 bg-background">
            <Field label="Protocol" value={parsed.protocol} />
            <Field label="Hostname" value={parsed.hostname} />
            <Field label="Port" value={parsed.port} />
            <Field label="Pathname" value={parsed.pathname} />
            <Field label="Search" value={parsed.search} />
            <Field label="Hash" value={parsed.hash} />
          </div>

          {/* Query params table */}
          {parsed.params.length > 0 && (
            <div className="space-y-2">
              <Label>Query Parameters ({parsed.params.length})</Label>
              <div className="rounded-md border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Key</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Value</th>
                      <th className="px-3 py-2 w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.params.map((p, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                        <td className="px-3 py-2 font-mono text-purple-600 dark:text-purple-400 break-all">{p.key}</td>
                        <td className="px-3 py-2 font-mono break-all">{p.value || <span className="text-muted-foreground italic">empty</span>}</td>
                        <td className="px-3 py-2 text-right">
                          <CopyButton text={p.value} label="Copy" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {!parsed && (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Paste a URL above to parse it into its component parts.
        </div>
      )}
    </div>
  );
}

// ── main component ───────────────────────────────────────────────────────────

export default function URLEncoder() {
  return (
    <div className="space-y-5">
      <Tabs defaultValue="encode" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="encode">Encode / Decode</TabsTrigger>
          <TabsTrigger value="builder">Query Builder</TabsTrigger>
          <TabsTrigger value="parser">URL Parser</TabsTrigger>
        </TabsList>

        <TabsContent value="encode" className="mt-5">
          <EncodeDecodeTab />
        </TabsContent>

        <TabsContent value="builder" className="mt-5">
          <QueryBuilderTab />
        </TabsContent>

        <TabsContent value="parser" className="mt-5">
          <URLParserTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
