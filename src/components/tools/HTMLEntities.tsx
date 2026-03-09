"use client";
/**
 * HTML Entities Encoder / Decoder / Reference Table
 * Three tabs: encode, decode, and a searchable reference of common entities.
 * All logic is pure client-side with no external libraries.
 */
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ── Named entity reference table ──────────────────────────────────────────────

interface EntityEntry {
  name: string;    // &amp;
  symbol: string;  // &
  decimal: string; // &#38;
  hex: string;     // &#x26;
  description: string;
}

const ENTITY_TABLE: EntityEntry[] = [
  { name: "&amp;",    symbol: "&",  decimal: "&#38;",   hex: "&#x26;",  description: "Ampersand" },
  { name: "&lt;",     symbol: "<",  decimal: "&#60;",   hex: "&#x3C;",  description: "Less-than sign" },
  { name: "&gt;",     symbol: ">",  decimal: "&#62;",   hex: "&#x3E;",  description: "Greater-than sign" },
  { name: "&quot;",   symbol: '"',  decimal: "&#34;",   hex: "&#x22;",  description: "Quotation mark" },
  { name: "&apos;",   symbol: "'",  decimal: "&#39;",   hex: "&#x27;",  description: "Apostrophe" },
  { name: "&nbsp;",   symbol: "\u00a0", decimal: "&#160;",  hex: "&#xA0;",  description: "Non-breaking space" },
  { name: "&copy;",   symbol: "©",  decimal: "&#169;",  hex: "&#xA9;",  description: "Copyright sign" },
  { name: "&reg;",    symbol: "®",  decimal: "&#174;",  hex: "&#xAE;",  description: "Registered trademark" },
  { name: "&trade;",  symbol: "™",  decimal: "&#8482;", hex: "&#x2122;",description: "Trade mark sign" },
  { name: "&mdash;",  symbol: "—",  decimal: "&#8212;", hex: "&#x2014;",description: "Em dash" },
  { name: "&ndash;",  symbol: "–",  decimal: "&#8211;", hex: "&#x2013;",description: "En dash" },
  { name: "&hellip;", symbol: "…",  decimal: "&#8230;", hex: "&#x2026;",description: "Horizontal ellipsis" },
  { name: "&euro;",   symbol: "€",  decimal: "&#8364;", hex: "&#x20AC;",description: "Euro sign" },
  { name: "&pound;",  symbol: "£",  decimal: "&#163;",  hex: "&#xA3;",  description: "Pound sign" },
  { name: "&yen;",    symbol: "¥",  decimal: "&#165;",  hex: "&#xA5;",  description: "Yen sign" },
  { name: "&cent;",   symbol: "¢",  decimal: "&#162;",  hex: "&#xA2;",  description: "Cent sign" },
  { name: "&deg;",    symbol: "°",  decimal: "&#176;",  hex: "&#xB0;",  description: "Degree sign" },
  { name: "&plusmn;", symbol: "±",  decimal: "&#177;",  hex: "&#xB1;",  description: "Plus-minus sign" },
  { name: "&times;",  symbol: "×",  decimal: "&#215;",  hex: "&#xD7;",  description: "Multiplication sign" },
  { name: "&divide;", symbol: "÷",  decimal: "&#247;",  hex: "&#xF7;",  description: "Division sign" },
  { name: "&frac12;", symbol: "½",  decimal: "&#189;",  hex: "&#xBD;",  description: "Vulgar fraction one-half" },
  { name: "&frac14;", symbol: "¼",  decimal: "&#188;",  hex: "&#xBC;",  description: "Vulgar fraction one-quarter" },
  { name: "&frac34;", symbol: "¾",  decimal: "&#190;",  hex: "&#xBE;",  description: "Vulgar fraction three-quarters" },
  { name: "&sup2;",   symbol: "²",  decimal: "&#178;",  hex: "&#xB2;",  description: "Superscript two" },
  { name: "&sup3;",   symbol: "³",  decimal: "&#179;",  hex: "&#xB3;",  description: "Superscript three" },
  { name: "&hearts;", symbol: "♥",  decimal: "&#9829;", hex: "&#x2665;",description: "Black heart suit" },
  { name: "&spades;", symbol: "♠",  decimal: "&#9824;", hex: "&#x2660;",description: "Black spade suit" },
  { name: "&clubs;",  symbol: "♣",  decimal: "&#9827;", hex: "&#x2663;",description: "Black club suit" },
  { name: "&diams;",  symbol: "♦",  decimal: "&#9830;", hex: "&#x2666;",description: "Black diamond suit" },
  { name: "&laquo;",  symbol: "«",  decimal: "&#171;",  hex: "&#xAB;",  description: "Left double angle quotation mark" },
  { name: "&raquo;",  symbol: "»",  decimal: "&#187;",  hex: "&#xBB;",  description: "Right double angle quotation mark" },
  { name: "&lsquo;",  symbol: "\u2018", decimal: "&#8216;", hex: "&#x2018;",description: "Left single quotation mark" },
  { name: "&rsquo;",  symbol: "\u2019", decimal: "&#8217;", hex: "&#x2019;",description: "Right single quotation mark" },
  { name: "&ldquo;",  symbol: "\u201C", decimal: "&#8220;", hex: "&#x201C;",description: "Left double quotation mark" },
  { name: "&rdquo;",  symbol: "\u201D", decimal: "&#8221;", hex: "&#x201D;",description: "Right double quotation mark" },
  { name: "&bull;",   symbol: "•",  decimal: "&#8226;", hex: "&#x2022;",description: "Bullet" },
  { name: "&middot;", symbol: "·",  decimal: "&#183;",  hex: "&#xB7;",  description: "Middle dot" },
  { name: "&para;",   symbol: "¶",  decimal: "&#182;",  hex: "&#xB6;",  description: "Pilcrow sign (paragraph)" },
  { name: "&sect;",   symbol: "§",  decimal: "&#167;",  hex: "&#xA7;",  description: "Section sign" },
  { name: "&dagger;", symbol: "†",  decimal: "&#8224;", hex: "&#x2020;",description: "Dagger" },
  { name: "&Dagger;", symbol: "‡",  decimal: "&#8225;", hex: "&#x2021;",description: "Double dagger" },
  { name: "&permil;", symbol: "‰",  decimal: "&#8240;", hex: "&#x2030;",description: "Per mille sign" },
  { name: "&prime;",  symbol: "′",  decimal: "&#8242;", hex: "&#x2032;",description: "Prime (minutes/feet)" },
  { name: "&Prime;",  symbol: "″",  decimal: "&#8243;", hex: "&#x2033;",description: "Double prime (seconds/inches)" },
  { name: "&larr;",   symbol: "←",  decimal: "&#8592;", hex: "&#x2190;",description: "Left arrow" },
  { name: "&uarr;",   symbol: "↑",  decimal: "&#8593;", hex: "&#x2191;",description: "Up arrow" },
  { name: "&rarr;",   symbol: "→",  decimal: "&#8594;", hex: "&#x2192;",description: "Right arrow" },
  { name: "&darr;",   symbol: "↓",  decimal: "&#8595;", hex: "&#x2193;",description: "Down arrow" },
  { name: "&harr;",   symbol: "↔",  decimal: "&#8596;", hex: "&#x2194;",description: "Left right arrow" },
  { name: "&infin;",  symbol: "∞",  decimal: "&#8734;", hex: "&#x221E;",description: "Infinity" },
  { name: "&sum;",    symbol: "∑",  decimal: "&#8721;", hex: "&#x2211;",description: "Summation" },
  { name: "&radic;",  symbol: "√",  decimal: "&#8730;", hex: "&#x221A;",description: "Square root" },
  { name: "&pi;",     symbol: "π",  decimal: "&#960;",  hex: "&#x3C0;", description: "Greek pi" },
  { name: "&mu;",     symbol: "μ",  decimal: "&#956;",  hex: "&#x3BC;", description: "Greek mu (micro)" },
  { name: "&alpha;",  symbol: "α",  decimal: "&#945;",  hex: "&#x3B1;", description: "Greek alpha" },
  { name: "&beta;",   symbol: "β",  decimal: "&#946;",  hex: "&#x3B2;", description: "Greek beta" },
  { name: "&omega;",  symbol: "ω",  decimal: "&#969;",  hex: "&#x3C9;", description: "Greek omega" },
  { name: "&Omega;",  symbol: "Ω",  decimal: "&#937;",  hex: "&#x3A9;", description: "Greek capital omega" },
  { name: "&check;",  symbol: "✓",  decimal: "&#10003;",hex: "&#x2713;",description: "Check mark" },
  { name: "&cross;",  symbol: "✗",  decimal: "&#10007;",hex: "&#x2717;",description: "Ballot X" },
  { name: "&star;",   symbol: "★",  decimal: "&#9733;", hex: "&#x2605;",description: "Black star" },
  { name: "&phone;",  symbol: "☎",  decimal: "&#9742;", hex: "&#x260E;",description: "Black telephone" },
];

// Build named entity lookup map for decoding
const NAMED_ENTITY_MAP: Record<string, string> = {};
for (const entry of ENTITY_TABLE) {
  // e.g. "&amp;" → key "amp"
  const key = entry.name.replace(/^&|;$/g, "");
  NAMED_ENTITY_MAP[key] = entry.symbol;
}
// Also handle nbsp as space
NAMED_ENTITY_MAP["nbsp"] = "\u00a0";

// ── Encode logic ──────────────────────────────────────────────────────────────

// Build reverse map: symbol → named entity (for use-named-entity option)
const SYMBOL_TO_NAMED: Record<string, string> = {};
for (const entry of ENTITY_TABLE) {
  SYMBOL_TO_NAMED[entry.symbol] = entry.name;
}

interface EncodeOptions {
  encodeNonAscii: boolean;
  useNamed: boolean;
}

function encodeEntities(input: string, opts: EncodeOptions): { output: string; count: number } {
  const { encodeNonAscii, useNamed } = opts;
  let count = 0;

  const result = input.replace(/[\s\S]/g, (ch) => {
    const code = ch.codePointAt(0) ?? ch.charCodeAt(0);

    // Always encode safety chars
    const safety: Record<string, string> = {
      "&": useNamed ? "&amp;" : "&#38;",
      "<": useNamed ? "&lt;"  : "&#60;",
      ">": useNamed ? "&gt;"  : "&#62;",
      '"': useNamed ? "&quot;": "&#34;",
      "'": useNamed ? "&apos;": "&#39;",
    };
    if (safety[ch]) {
      count++;
      return safety[ch];
    }

    if (encodeNonAscii && code > 127) {
      count++;
      if (useNamed && SYMBOL_TO_NAMED[ch]) {
        return SYMBOL_TO_NAMED[ch];
      }
      return `&#${code};`;
    }

    return ch;
  });

  return { output: result, count };
}

// ── Decode logic ──────────────────────────────────────────────────────────────

function decodeEntities(input: string): string {
  return input
    // Named entities
    .replace(/&([a-zA-Z]+);/g, (match, name) => {
      return NAMED_ENTITY_MAP[name] ?? match;
    })
    // Hex entities &#xNN; or &#XNN;
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (_, hex) => {
      return String.fromCodePoint(parseInt(hex, 16));
    })
    // Decimal entities &#NNN;
    .replace(/&#(\d+);/g, (_, dec) => {
      return String.fromCodePoint(parseInt(dec, 10));
    });
}

// ── Copy helper ───────────────────────────────────────────────────────────────

function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    });
  }, []);
  return { copiedKey, copy };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function HTMLEntities() {
  const { copiedKey, copy } = useCopy();

  // Encode tab state
  const [encodeInput, setEncodeInput] = useState(`<h1>Hello "World" & <Friends>!</h1>\n© 2024 — All rights reserved™`);
  const [encodeNonAscii, setEncodeNonAscii] = useState(false);
  const [useNamed, setUseNamed] = useState(true);

  // Decode tab state
  const [decodeInput, setDecodeInput] = useState(`&lt;h1&gt;Hello &quot;World&quot; &amp; &lt;Friends&gt;!&lt;/h1&gt;\n&copy; 2024 &mdash; All rights reserved&trade;`);

  // Reference search
  const [search, setSearch] = useState("");

  // ── Encode computation
  const { output: encodeOutput, count: encodeCount } = useMemo(
    () => encodeEntities(encodeInput, { encodeNonAscii, useNamed }),
    [encodeInput, encodeNonAscii, useNamed]
  );

  const encodeOrigSize = new TextEncoder().encode(encodeInput).length;
  const encodeNewSize = new TextEncoder().encode(encodeOutput).length;

  // ── Decode computation
  const decodeOutput = useMemo(() => decodeEntities(decodeInput), [decodeInput]);

  // ── Reference filter
  const filteredEntities = useMemo(() => {
    if (!search.trim()) return ENTITY_TABLE;
    const q = search.toLowerCase();
    return ENTITY_TABLE.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.symbol.includes(search) ||
        e.description.toLowerCase().includes(q) ||
        e.decimal.includes(q) ||
        e.hex.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">HTML Entities</h1>
        <p className="text-sm text-muted-foreground">
          Encode and decode HTML entities, or browse the full reference table of common entities.
        </p>
      </div>

      <Tabs defaultValue="encode">
        <TabsList className="w-full">
          <TabsTrigger value="encode" className="flex-1">Encode</TabsTrigger>
          <TabsTrigger value="decode" className="flex-1">Decode</TabsTrigger>
          <TabsTrigger value="reference" className="flex-1">Reference</TabsTrigger>
        </TabsList>

        {/* ── ENCODE TAB ── */}
        <TabsContent value="encode" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="encode-input">Input</Label>
            <Textarea
              id="encode-input"
              value={encodeInput}
              onChange={(e) => setEncodeInput(e.target.value)}
              rows={6}
              placeholder="Paste HTML or text to encode…"
              className="font-mono text-sm resize-y min-h-[120px]"
            />
          </div>

          {/* Options */}
          <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Options</div>
            <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
              <input type="checkbox" checked={true} readOnly className="rounded border-border" />
              <span>Always encode <code className="font-mono text-xs bg-muted px-1 rounded">&lt; &gt; &amp; &quot; &apos;</code> (safety characters)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
              <input
                type="checkbox"
                checked={encodeNonAscii}
                onChange={(e) => setEncodeNonAscii(e.target.checked)}
                className="rounded border-border"
              />
              Encode all non-ASCII characters to numeric entities
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
              <input
                type="checkbox"
                checked={useNamed}
                onChange={(e) => setUseNamed(e.target.checked)}
                className="rounded border-border"
              />
              Use named entities where available (e.g., <code className="font-mono text-xs bg-muted px-1 rounded">&amp;amp;</code> instead of <code className="font-mono text-xs bg-muted px-1 rounded">&#38;38;</code>)
            </label>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Characters encoded", value: encodeCount },
              { label: "Original size", value: `${encodeOrigSize} B` },
              { label: "Encoded size", value: `${encodeNewSize} B` },
              { label: "Size increase", value: encodeOrigSize > 0 ? `+${Math.round(((encodeNewSize - encodeOrigSize) / encodeOrigSize) * 100)}%` : "—" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-card px-3 py-2 text-center min-w-[100px]">
                <div className="text-base font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Encoded Output</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copy(encodeOutput, "encode")}
                disabled={!encodeOutput}
              >
                {copiedKey === "encode" ? "Copied!" : "Copy"}
              </Button>
            </div>
            <div className="relative rounded-xl border border-border bg-muted/30 p-4 min-h-[100px] max-h-[240px] overflow-y-auto">
              <pre className="font-mono text-sm whitespace-pre-wrap break-all text-foreground">
                {encodeOutput || <span className="text-muted-foreground italic">Encoded text will appear here</span>}
              </pre>
            </div>
          </div>
        </TabsContent>

        {/* ── DECODE TAB ── */}
        <TabsContent value="decode" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="decode-input">Input (HTML entities)</Label>
            <Textarea
              id="decode-input"
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              rows={6}
              placeholder="Paste HTML with entities to decode…"
              className="font-mono text-sm resize-y min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Handles named entities (<code className="font-mono">&amp;amp;</code>), decimal (<code className="font-mono">&amp;#38;</code>), and hex (<code className="font-mono">&amp;#x26;</code>).
            </p>
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Decoded Output</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copy(decodeOutput, "decode")}
                disabled={!decodeOutput}
              >
                {copiedKey === "decode" ? "Copied!" : "Copy"}
              </Button>
            </div>
            <div className="relative rounded-xl border border-border bg-muted/30 p-4 min-h-[100px] max-h-[240px] overflow-y-auto">
              <pre className="font-mono text-sm whitespace-pre-wrap break-words text-foreground">
                {decodeOutput || <span className="text-muted-foreground italic">Decoded text will appear here</span>}
              </pre>
            </div>
          </div>
        </TabsContent>

        {/* ── REFERENCE TAB ── */}
        <TabsContent value="reference" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="entity-search">Search entities</Label>
            <Input
              id="entity-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, symbol, or description…"
              className="text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">{filteredEntities.length} entities</Badge>
            <span className="text-xs text-muted-foreground">Click any row to copy the named entity</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-y-auto max-h-[480px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-border bg-muted/80 backdrop-blur-sm">
                    <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Symbol</th>
                    <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Entity</th>
                    <th className="px-3 py-2.5 text-left font-medium text-muted-foreground hidden sm:table-cell">Decimal</th>
                    <th className="px-3 py-2.5 text-left font-medium text-muted-foreground hidden sm:table-cell">Hex</th>
                    <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntities.map((entry, i) => (
                    <tr
                      key={entry.name}
                      className={`border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-primary/5 active:bg-primary/10 ${
                        i % 2 === 0 ? "" : "bg-muted/20"
                      } ${copiedKey === `ref-${entry.name}` ? "bg-primary/10" : ""}`}
                      onClick={() => copy(entry.name, `ref-${entry.name}`)}
                      title={`Click to copy ${entry.name}`}
                    >
                      <td className="px-3 py-2.5 text-center">
                        <span className="text-lg leading-none">{entry.symbol === "\u00a0" ? "·" : entry.symbol}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">
                          {copiedKey === `ref-${entry.name}` ? "Copied!" : entry.name}
                        </code>
                      </td>
                      <td className="px-3 py-2.5 hidden sm:table-cell">
                        <code className="font-mono text-xs text-muted-foreground">{entry.decimal}</code>
                      </td>
                      <td className="px-3 py-2.5 hidden sm:table-cell">
                        <code className="font-mono text-xs text-muted-foreground">{entry.hex}</code>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs">{entry.description}</td>
                    </tr>
                  ))}
                  {filteredEntities.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground italic">
                        No entities match "{search}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <p className="border-t border-border pt-4 text-xs text-muted-foreground">
        All encoding and decoding runs entirely in your browser. Supports named, decimal, and hexadecimal entity formats.
      </p>
    </div>
  );
}
