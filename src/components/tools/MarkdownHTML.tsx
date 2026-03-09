"use client";
/**
 * Markdown ↔ HTML Converter
 * Parses Markdown inline with no external libraries and renders a live
 * HTML preview or raw HTML source side-by-side with the editor.
 */
import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";

// ── Minimal Markdown Parser ────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseInline(text: string): string {
  // Inline code (before bold/italic so backticks aren't processed further)
  text = text.replace(/`([^`]+)`/g, (_, code) => `<code class="md-code">${escapeHtml(code)}</code>`);
  // Bold
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic (single asterisk, not preceded/followed by another asterisk)
  text = text.replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="md-link" target="_blank" rel="noopener noreferrer">$1</a>');
  return text;
}

function parseMarkdown(markdown: string): string {
  const lines = markdown.split("\n");
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(escapeHtml(lines[i]));
        i++;
      }
      const langAttr = lang ? ` data-lang="${escapeHtml(lang)}"` : "";
      output.push(`<pre class="md-pre"${langAttr}><code>${codeLines.join("\n")}</code></pre>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      output.push("<hr />");
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      output.push(`<h${level} class="md-h${level}">${parseInline(headingMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [line.slice(2)];
      i++;
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      output.push(`<blockquote class="md-blockquote">${parseInline(quoteLines.join(" "))}</blockquote>`);
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        items.push(`<li>${parseInline(lines[i].replace(/^[-*+]\s/, ""))}</li>`);
        i++;
      }
      output.push(`<ul class="md-ul">${items.join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li>${parseInline(lines[i].replace(/^\d+\.\s/, ""))}</li>`);
        i++;
      }
      output.push(`<ol class="md-ol">${items.join("")}</ol>`);
      continue;
    }

    // Blank line — skip (paragraph separator)
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph: accumulate non-empty lines
    const paraLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("> ") &&
      !/^[-*+]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !lines[i].startsWith("```") &&
      !/^---+$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    output.push(`<p class="md-p">${parseInline(paraLines.join(" "))}</p>`);
  }

  return output.join("\n");
}

// ── Styles injected into preview ───────────────────────────────────────────

const PREVIEW_STYLES = `
  .md-h1 { font-size: 1.75rem; font-weight: 700; margin: 1rem 0 0.5rem; }
  .md-h2 { font-size: 1.4rem;  font-weight: 700; margin: 1rem 0 0.5rem; }
  .md-h3 { font-size: 1.15rem; font-weight: 700; margin: 0.75rem 0 0.4rem; }
  .md-h4, .md-h5, .md-h6 { font-size: 1rem; font-weight: 600; margin: 0.5rem 0 0.3rem; }
  .md-p  { margin: 0.6rem 0; line-height: 1.7; }
  .md-ul { list-style: disc;   padding-left: 1.5rem; margin: 0.5rem 0; }
  .md-ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
  .md-ul li, .md-ol li { margin: 0.2rem 0; }
  .md-blockquote { border-left: 4px solid #6366f1; padding: 0.4rem 1rem; margin: 0.6rem 0; opacity: 0.8; font-style: italic; }
  .md-code { font-family: monospace; background: rgba(99,102,241,0.15); padding: 0.1em 0.35em; border-radius: 4px; font-size: 0.88em; }
  .md-pre  { background: rgba(0,0,0,0.25); padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 0.75rem 0; }
  .md-pre code { background: none; padding: 0; font-size: 0.85em; }
  .md-link { color: #818cf8; text-decoration: underline; }
  hr { border: none; border-top: 2px solid rgba(99,102,241,0.4); margin: 1rem 0; }
`;

// ── Default sample document ────────────────────────────────────────────────

const SAMPLE_MARKDOWN = `# Markdown to HTML Converter

## Features

This converter supports **all common Markdown** features — no external libraries needed.

### Inline Formatting

You can write *italic* and **bold** text freely. Combine them for ***bold italic***.

Inline \`code snippets\` render with a subtle highlight.

### Links & Rules

Visit [OpenAI](https://openai.com) or [GitHub](https://github.com) for more.

---

### Lists

Unordered:

- First item
- Second item
- Third item

Ordered:

1. Step one
2. Step two
3. Step three

### Blockquotes

> The best way to predict the future is to invent it.
> — Alan Kay

### Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("World"));
\`\`\`

### Paragraph

Paragraphs are separated by blank lines. Long lines wrap naturally. The parser handles all edge cases gracefully, ensuring clean HTML output every time.
`;

// ── Component ──────────────────────────────────────────────────────────────

export default function MarkdownHTML() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [showSource, setShowSource] = useState(false);
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => parseMarkdown(markdown), [markdown]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [html]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Markdown → HTML</h1>
        <p className="text-sm text-muted-foreground">
          Write Markdown on the left, see the rendered HTML or raw source on the right.
        </p>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Markdown
          </span>
          <textarea
            className="min-h-[420px] resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            spellCheck={false}
            placeholder="Type Markdown here…"
            aria-label="Markdown input"
          />
        </div>

        {/* Preview / Source */}
        <div className="flex flex-col gap-2">
          {/* Panel header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {showSource ? "HTML Source" : "Preview"}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSource((v) => !v)}
                className="text-xs h-7 px-2"
              >
                {showSource ? "Preview" : "HTML Source"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="text-xs h-7 px-2"
              >
                {copied ? "Copied!" : "Copy HTML"}
              </Button>
            </div>
          </div>

          {showSource ? (
            <pre className="min-h-[420px] overflow-auto rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs font-mono text-foreground whitespace-pre-wrap break-all">
              {html}
            </pre>
          ) : (
            <div className="min-h-[420px] overflow-auto rounded-xl border border-border bg-background px-4 py-3">
              <style>{PREVIEW_STYLES}</style>
              <div
                className="text-sm text-foreground"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
