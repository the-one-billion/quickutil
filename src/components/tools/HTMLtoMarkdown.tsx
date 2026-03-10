"use client";
import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";

function htmlToMd(html: string): string {
  // Strip doctype / comments
  let s = html.replace(/<!DOCTYPE[^>]*>/gi, "").replace(/<!--[\s\S]*?-->/g, "");

  // Block elements — order matters (headings before paragraphs)
  s = s.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, l, c) =>
    "#".repeat(Number(l)) + " " + strip(c).trim() + "\n\n"
  );
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, c) =>
    strip(c).split("\n").map(l => "> " + l.trim()).join("\n") + "\n\n"
  );
  s = s.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, c) =>
    "```\n" + decode(c).trim() + "\n```\n\n"
  );
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, c) => "`" + decode(c) + "`");
  s = s.replace(/<hr[^>]*\/?>/gi, "---\n\n");
  s = s.replace(/<br\s*\/?>/gi, "\n");

  // Lists
  s = s.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, c) =>
    c.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, i: string) =>
      "- " + strip(i).trim()
    ).trim() + "\n\n"
  );
  s = s.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, c) => {
    let idx = 0;
    return c.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, i: string) =>
      `${++idx}. ` + strip(i).trim()
    ).trim() + "\n\n";
  });

  // Tables
  s = s.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tc) => {
    const rows: string[][] = [];
    const rowMatches = tc.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    for (const rm of rowMatches) {
      const cells: string[] = [];
      const cellMatches = rm[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
      for (const cm of cellMatches) cells.push(strip(cm[1]).trim());
      if (cells.length) rows.push(cells);
    }
    if (!rows.length) return "";
    const header = "| " + rows[0].join(" | ") + " |";
    const sep    = "| " + rows[0].map(() => "---").join(" | ") + " |";
    const body   = rows.slice(1).map(r => "| " + r.join(" | ") + " |").join("\n");
    return [header, sep, body].filter(Boolean).join("\n") + "\n\n";
  });

  // Inline
  s = s.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_, c) => "**" + strip(c) + "**");
  s = s.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi,           (_, c) => "**" + strip(c) + "**");
  s = s.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi,         (_, c) => "_"  + strip(c) + "_");
  s = s.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi,           (_, c) => "_"  + strip(c) + "_");
  s = s.replace(/<s[^>]*>([\s\S]*?)<\/s>/gi,           (_, c) => "~~" + strip(c) + "~~");
  s = s.replace(/<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, u, c) =>
    "[" + strip(c) + "](" + u + ")"
  );
  s = s.replace(/<img[^>]+src="([^"]*)"(?:[^>]+alt="([^"]*)")?[^>]*\/?>/gi, (_, src, alt) =>
    "![" + (alt || "") + "](" + src + ")"
  );

  // Paragraphs / divs
  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, c) => strip(c).trim() + "\n\n");
  s = s.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, (_, c) => strip(c).trim() + "\n");

  // Strip remaining tags
  s = strip(s);
  s = decode(s);

  // Clean up excessive blank lines
  s = s.replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

function strip(s: string) { return s.replace(/<[^>]+>/g, ""); }
function decode(s: string) {
  return s
    .replace(/&amp;/g,  "&")
    .replace(/&lt;/g,   "<")
    .replace(/&gt;/g,   ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&nbsp;/g, " ");
}

const EXAMPLE = `<h1>Hello World</h1>
<p>This is a <strong>bold</strong> and <em>italic</em> paragraph.</p>
<h2>Features</h2>
<ul>
  <li>Headings h1–h6</li>
  <li>Bold, italic, strikethrough</li>
  <li>Links and images</li>
  <li>Tables and code blocks</li>
</ul>
<blockquote>Markdown is great for documentation.</blockquote>
<a href="https://quickutil.io">Visit QuickUtil</a>`;

export default function HTMLtoMarkdown() {
  const [html, setHtml]       = useState("");
  const [copied, setCopied]   = useState(false);

  const markdown = useCallback(() => {
    if (!html.trim()) return "";
    return htmlToMd(html);
  }, [html]);

  const md = markdown();

  function copy() {
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <Button variant="outline" size="sm" onClick={() => setHtml(EXAMPLE)}>
        Load example
      </Button>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>HTML input</Label>
          <Textarea
            className="font-mono text-sm h-80 resize-none"
            placeholder="Paste HTML here…"
            value={html}
            onChange={e => setHtml(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label>Markdown output</Label>
            <Button variant="ghost" size="sm" onClick={copy} disabled={!md} className="h-7 gap-1">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Textarea
            className="font-mono text-sm h-80 resize-none bg-muted/30"
            readOnly
            value={md}
            placeholder="Markdown will appear here…"
          />
        </div>
      </div>

      {html && !md && (
        <p className="text-sm text-muted-foreground text-center">No convertible content found.</p>
      )}

      <div className="rounded-md bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        Supports: headings (h1–h6), paragraphs, bold, italic, strikethrough, links, images,
        ordered/unordered lists, blockquotes, inline code, code blocks, tables, and horizontal rules.
        Conversion runs entirely in your browser — nothing is sent to a server.
      </div>
    </div>
  );
}
