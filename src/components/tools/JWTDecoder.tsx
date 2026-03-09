"use client";

import { useState, useCallback } from "react";
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

// ── helpers ─────────────────────────────────────────────────────────────────

function base64urlDecode(str: string): string {
  // base64url → base64
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  // pad to multiple of 4
  while (s.length % 4 !== 0) s += "=";
  return atob(s);
}

function tryParseJWT(token: string):
  | { ok: true; header: Record<string, unknown>; payload: Record<string, unknown>; signature: string; parts: [string, string, string] }
  | { ok: false; error: string } {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return { ok: false, error: "A JWT must have exactly 3 parts separated by '.'" };
  try {
    const header = JSON.parse(base64urlDecode(parts[0]));
    const payload = JSON.parse(base64urlDecode(parts[1]));
    return { ok: true, header, payload, signature: parts[2], parts: [parts[0], parts[1], parts[2]] };
  } catch {
    return { ok: false, error: "Failed to decode — the token may be malformed or not a valid JWT." };
  }
}

// ── syntax highlighting ──────────────────────────────────────────────────────

function colorizeJSON(obj: unknown, indent = 0): React.ReactNode {
  const pad = "  ".repeat(indent);
  const padInner = "  ".repeat(indent + 1);

  if (obj === null) return <span className="text-gray-400 dark:text-gray-500">null</span>;
  if (typeof obj === "boolean")
    return <span className="text-amber-500 dark:text-amber-400">{String(obj)}</span>;
  if (typeof obj === "number")
    return <span className="text-blue-500 dark:text-blue-400">{String(obj)}</span>;
  if (typeof obj === "string")
    return <span className="text-green-600 dark:text-green-400">&quot;{obj}&quot;</span>;

  if (Array.isArray(obj)) {
    if (obj.length === 0) return <span>{"[]"}</span>;
    return (
      <>
        {"["}
        {obj.map((item, i) => (
          <div key={i} style={{ marginLeft: "1.25rem" }}>
            {colorizeJSON(item, indent + 1)}
            {i < obj.length - 1 ? "," : ""}
          </div>
        ))}
        {pad}{"]"}
      </>
    );
  }

  if (typeof obj === "object" && obj !== null) {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return <span>{"{}"}</span>;
    return (
      <>
        {"{"}
        {entries.map(([k, v], i) => (
          <div key={k} style={{ marginLeft: "1.25rem" }}>
            <span className="text-purple-600 dark:text-purple-400">&quot;{k}&quot;</span>
            {": "}
            {colorizeJSON(v, indent + 1)}
            {i < entries.length - 1 ? "," : ""}
          </div>
        ))}
        {pad}{"}"}
      </>
    );
  }

  return <span>{String(obj)}</span>;
}

// ── timestamp formatting ─────────────────────────────────────────────────────

function formatTimestamp(epoch: number): string {
  return new Date(epoch * 1000).toUTCString();
}

function timeDiff(epoch: number): { text: string; future: boolean } {
  const nowSec = Math.floor(Date.now() / 1000);
  const diff = epoch - nowSec;
  if (diff === 0) return { text: "just now", future: true };
  const abs = Math.abs(diff);
  const parts: string[] = [];
  const days = Math.floor(abs / 86400);
  const hours = Math.floor((abs % 86400) / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  const seconds = abs % 60;
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (!days && seconds) parts.push(`${seconds}s`);
  return { text: parts.join(" ") || "< 1s", future: diff > 0 };
}

const TIMESTAMP_CLAIMS = new Set(["exp", "iat", "nbf"]);
const KNOWN_STRING_CLAIMS: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  jti: "JWT ID",
};

// ── payload viewer ───────────────────────────────────────────────────────────

function PayloadView({ payload }: { payload: Record<string, unknown> }) {
  const nowSec = Math.floor(Date.now() / 1000);
  const exp = typeof payload.exp === "number" ? payload.exp : null;

  let badge: React.ReactNode;
  let timeNote: string | null = null;
  if (exp === null) {
    badge = <Badge variant="secondary">No Expiry</Badge>;
  } else if (exp > nowSec) {
    const { text } = timeDiff(exp);
    badge = <Badge className="bg-green-600 text-white hover:bg-green-700">Valid</Badge>;
    timeNote = `Expires in ${text}`;
  } else {
    const { text } = timeDiff(exp);
    badge = <Badge variant="destructive">Expired</Badge>;
    timeNote = `Expired ${text} ago`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Token status:</span>
        {badge}
        {timeNote && <span className="text-sm text-muted-foreground">{timeNote}</span>}
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left px-3 py-2 font-medium text-muted-foreground w-32">Claim</th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(payload).map(([key, value], i) => (
              <tr key={key} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                <td className="px-3 py-2 font-mono text-purple-600 dark:text-purple-400 align-top">
                  {key}
                  {KNOWN_STRING_CLAIMS[key] && (
                    <div className="text-xs text-muted-foreground font-sans">{KNOWN_STRING_CLAIMS[key]}</div>
                  )}
                </td>
                <td className="px-3 py-2 font-mono align-top">
                  {TIMESTAMP_CLAIMS.has(key) && typeof value === "number" ? (
                    <div>
                      <span className="text-blue-500 dark:text-blue-400">{value}</span>
                      <div className="text-xs text-muted-foreground font-sans mt-0.5">
                        {formatTimestamp(value)}
                      </div>
                    </div>
                  ) : typeof value === "string" ? (
                    <span className="text-green-600 dark:text-green-400 break-all">{value}</span>
                  ) : typeof value === "boolean" ? (
                    <span className="text-amber-500 dark:text-amber-400">{String(value)}</span>
                  ) : value === null ? (
                    <span className="text-gray-400 dark:text-gray-500">null</span>
                  ) : (
                    <span className="text-foreground break-all">{JSON.stringify(value)}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── raw colored token ────────────────────────────────────────────────────────

function RawView({ parts }: { parts: [string, string, string] }) {
  return (
    <div className="font-mono text-sm break-all leading-relaxed bg-muted/30 rounded-md p-4 border border-border">
      <span className="text-blue-500 dark:text-blue-400">{parts[0]}</span>
      <span className="text-muted-foreground">.</span>
      <span className="text-green-600 dark:text-green-400">{parts[1]}</span>
      <span className="text-muted-foreground">.</span>
      <span className="text-orange-500 dark:text-orange-400">{parts[2]}</span>
      <div className="flex gap-4 mt-4 text-xs text-muted-foreground font-sans">
        <span><span className="text-blue-500 dark:text-blue-400">■</span> Header</span>
        <span><span className="text-green-600 dark:text-green-400">■</span> Payload</span>
        <span><span className="text-orange-500 dark:text-orange-400">■</span> Signature</span>
      </div>
    </div>
  );
}

// ── main component ───────────────────────────────────────────────────────────

export default function JWTDecoder() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [decoded, setDecoded] = useState<{
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
    signature: string;
    parts: [string, string, string];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const decode = useCallback((value: string) => {
    setInput(value);
    if (!value.trim()) {
      setError(null);
      setDecoded(null);
      return;
    }
    const result = tryParseJWT(value);
    if (result.ok) {
      setError(null);
      setDecoded({ header: result.header, payload: result.payload, signature: result.signature, parts: result.parts });
    } else {
      setError(result.error);
      setDecoded(null);
    }
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      decode(text);
    } catch {
      // clipboard access denied — silently ignore
    }
  }, [decode]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }, [input]);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="jwt-input">JWT Token</Label>
        <div className="flex gap-2">
          <Input
            id="jwt-input"
            value={input}
            onChange={(e) => decode(e.target.value)}
            placeholder="Paste your JWT here (header.payload.signature)…"
            className={`font-mono text-sm ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
          <Button variant="outline" size="sm" onClick={handlePaste} className="shrink-0">
            Paste
          </Button>
          {input && (
            <Button variant="outline" size="sm" onClick={() => decode("")} className="shrink-0">
              Clear
            </Button>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      {decoded && (
        <Tabs defaultValue="payload" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="header">Header</TabsTrigger>
            <TabsTrigger value="payload">Payload</TabsTrigger>
            <TabsTrigger value="signature">Signature</TabsTrigger>
            <TabsTrigger value="raw">Raw</TabsTrigger>
          </TabsList>

          <TabsContent value="header" className="mt-4">
            <div className="font-mono text-sm leading-relaxed bg-muted/30 rounded-md p-4 border border-border overflow-x-auto">
              {colorizeJSON(decoded.header)}
            </div>
          </TabsContent>

          <TabsContent value="payload" className="mt-4">
            <PayloadView payload={decoded.payload} />
          </TabsContent>

          <TabsContent value="signature" className="mt-4">
            <div className="space-y-3">
              <div className="font-mono text-sm break-all bg-muted/30 rounded-md p-4 border border-border text-orange-500 dark:text-orange-400">
                {decoded.signature}
              </div>
              <p className="text-sm text-muted-foreground">
                The signature is the base64url-encoded HMAC or RSA/ECDSA digest of the header and payload.
                Verifying it requires the secret key or public key — this cannot be done client-side without the key.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(decoded.signature);
                }}
              >
                Copy Signature
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="raw" className="mt-4">
            <div className="space-y-3">
              <RawView parts={decoded.parts} />
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy Token"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {!decoded && !error && !input && (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Paste a JWT above to decode it instantly — no data leaves your browser.
        </div>
      )}
    </div>
  );
}
