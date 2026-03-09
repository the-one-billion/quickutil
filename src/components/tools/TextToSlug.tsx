"use client";
/**
 * Text to URL Slug Converter
 * Live conversion with separator, max-length, stop-word, and number options.
 * Includes a batch mode tab for multiple titles at once.
 */
import { useState, useMemo, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Accented character map (~60+ common chars) ────────────────────────────────

const ACCENT_MAP: Record<string, string> = {
  à: "a", á: "a", â: "a", ã: "a", ä: "a", å: "a", æ: "ae",
  ç: "c",
  è: "e", é: "e", ê: "e", ë: "e",
  ì: "i", í: "i", î: "i", ï: "i",
  ð: "d",
  ñ: "n",
  ò: "o", ó: "o", ô: "o", õ: "o", ö: "o", ø: "o", œ: "oe",
  ù: "u", ú: "u", û: "u", ü: "u",
  ý: "y", ÿ: "y",
  þ: "th", ß: "ss",
  À: "a", Á: "a", Â: "a", Ã: "a", Ä: "a", Å: "a", Æ: "ae",
  Ç: "c",
  È: "e", É: "e", Ê: "e", Ë: "e",
  Ì: "i", Í: "i", Î: "i", Ï: "i",
  Ð: "d",
  Ñ: "n",
  Ò: "o", Ó: "o", Ô: "o", Õ: "o", Ö: "o", Ø: "o", Œ: "oe",
  Ù: "u", Ú: "u", Û: "u", Ü: "u",
  Ý: "y",
  Þ: "th",
  // Slavic / Czech / Slovak / Polish
  š: "s", Š: "s", ž: "z", Ž: "z", č: "c", Č: "c",
  ř: "r", Ř: "r", ě: "e", Ě: "e", ů: "u", Ů: "u",
  ł: "l", Ł: "l", ą: "a", Ą: "a", ę: "e", Ę: "e",
  ź: "z", Ź: "z", ż: "z", Ż: "z", ń: "n", Ń: "n",
  // Other
  ı: "i", İ: "i", ğ: "g", Ğ: "g", ş: "s", Ş: "s",
};

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but",
  "in", "on", "at", "to", "for", "of", "with", "by",
]);

// ── Slug logic ────────────────────────────────────────────────────────────────

type Separator = "-" | "_" | "." | "";
type MaxLength = "0" | "50" | "75" | "100";

interface SlugOptions {
  separator: Separator;
  maxLength: MaxLength;
  preserveNumbers: boolean;
  stripStopWords: boolean;
}

function toSlug(text: string, opts: SlugOptions): string {
  const { separator, maxLength, preserveNumbers, stripStopWords } = opts;
  const max = parseInt(maxLength, 10);

  // 1. Replace accented chars
  let slug = text
    .split("")
    .map((ch) => ACCENT_MAP[ch] ?? ch)
    .join("");

  // 2. Lowercase
  slug = slug.toLowerCase();

  // 3. Remove apostrophes and special punctuation (keep spaces and hyphens for splitting)
  slug = slug.replace(/[''`]/g, "");

  // 4. Split into words on non-alphanumeric boundaries
  const rawWords = slug.split(/[^a-z0-9]+/).filter(Boolean);

  // 5. Strip stop words if option enabled
  const words = stripStopWords
    ? rawWords.filter((w) => !STOP_WORDS.has(w))
    : rawWords;

  // 6. Optionally strip numbers
  const finalWords = preserveNumbers
    ? words
    : words.map((w) => w.replace(/\d/g, "")).filter(Boolean);

  // 7. Join with separator
  slug = finalWords.join(separator);

  // 8. Truncate at word boundary
  if (max > 0 && slug.length > max) {
    slug = slug.slice(0, max);
    // Trim trailing separator
    if (separator && slug.endsWith(separator)) {
      slug = slug.slice(0, slug.length - separator.length);
    } else if (separator) {
      // Cut at last separator boundary
      const lastSep = slug.lastIndexOf(separator);
      if (lastSep > 0) slug = slug.slice(0, lastSep);
    }
  }

  // 9. Clean up leading/trailing separators
  if (separator) {
    const escapedSep = separator.replace(".", "\\.");
    slug = slug.replace(new RegExp(`^${escapedSep}+|${escapedSep}+$`, "g"), "");
    // Collapse multiple separators
    slug = slug.replace(new RegExp(`${escapedSep}+`, "g"), separator);
  }

  return slug;
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

const SEP_OPTIONS: { value: Separator; label: string }[] = [
  { value: "-", label: "Hyphen  —  hello-world" },
  { value: "_", label: "Underscore  —  hello_world" },
  { value: ".", label: "Period  —  hello.world" },
  { value: "", label: "None  —  helloworld" },
];

const MAX_OPTIONS: { value: MaxLength; label: string }[] = [
  { value: "0", label: "Unlimited" },
  { value: "50", label: "50 characters" },
  { value: "75", label: "75 characters" },
  { value: "100", label: "100 characters" },
];

export default function TextToSlug() {
  const [title, setTitle] = useState("Hello World! A Guide to Slug Generation & SEO");
  const [batchText, setBatchText] = useState("10 Tips for Better Sleep\nThe Ultimate Guide to Coffee\nHow to Learn JavaScript Fast");
  const [separator, setSeparator] = useState<Separator>("-");
  const [maxLength, setMaxLength] = useState<MaxLength>("0");
  const [preserveNumbers, setPreserveNumbers] = useState(true);
  const [stripStopWords, setStripStopWords] = useState(false);

  const { copiedKey, copy } = useCopy();

  const opts: SlugOptions = { separator, maxLength, preserveNumbers, stripStopWords };

  const slug = useMemo(() => toSlug(title, opts), [title, opts]);

  const batchSlugs = useMemo(() => {
    return batchText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({ original: line, slug: toSlug(line, opts) }));
  }, [batchText, opts]);

  const batchOutput = useMemo(
    () => batchSlugs.map((b) => b.slug).join("\n"),
    [batchSlugs]
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Text to Slug</h1>
        <p className="text-sm text-muted-foreground">
          Convert text to clean URL slugs with live preview, accent normalization, and batch mode.
        </p>
      </div>

      <Tabs defaultValue="single">
        <TabsList className="w-full">
          <TabsTrigger value="single" className="flex-1">Single</TabsTrigger>
          <TabsTrigger value="batch" className="flex-1">Batch Mode</TabsTrigger>
        </TabsList>

        {/* ── Options panel (shared) ── */}
        <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Separator</Label>
              <Select value={separator} onValueChange={(v) => setSeparator(v as Separator)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEP_OPTIONS.map((o) => (
                    <SelectItem key={o.value === "" ? "none" : o.value} value={o.value === "" ? "" : o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Max Length</Label>
              <Select value={maxLength} onValueChange={(v) => setMaxLength(v as MaxLength)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAX_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
              <input
                type="checkbox"
                checked={preserveNumbers}
                onChange={(e) => setPreserveNumbers(e.target.checked)}
                className="rounded border-border"
              />
              Preserve numbers
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
              <input
                type="checkbox"
                checked={stripStopWords}
                onChange={(e) => setStripStopWords(e.target.checked)}
                className="rounded border-border"
              />
              Strip stop words
              <span className="text-xs text-muted-foreground">(a, the, and…)</span>
            </label>
          </div>
        </div>

        {/* ── Single mode ── */}
        <TabsContent value="single" className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title-input">Title or text</Label>
            <Input
              id="title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title or text…"
              className="text-base"
            />
          </div>

          {/* Large output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Slug</Label>
              <span className="text-xs text-muted-foreground">{slug.length} chars</span>
            </div>
            <div className="group relative rounded-xl border border-border bg-muted/30 px-4 py-4 min-h-[56px]">
              <p className="font-mono text-lg break-all text-foreground pr-16">
                {slug || <span className="text-muted-foreground italic text-sm">slug will appear here</span>}
              </p>
              {slug && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-2"
                  onClick={() => copy(slug, "slug")}
                >
                  {copiedKey === "slug" ? "Copied!" : "Copy"}
                </Button>
              )}
            </div>
          </div>

          {/* URL preview */}
          {slug && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">URL Preview</Label>
              <div className="rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-sm text-muted-foreground break-all">
                https://example.com/blog/
                <span className="text-foreground font-medium">{slug}</span>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Batch mode ── */}
        <TabsContent value="batch" className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="batch-input">Titles (one per line)</Label>
            <Textarea
              id="batch-input"
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              rows={6}
              placeholder={"Title One\nTitle Two\nTitle Three"}
              className="font-mono text-sm resize-y min-h-[120px]"
            />
          </div>

          {batchSlugs.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{batchSlugs.length} slug{batchSlugs.length !== 1 ? "s" : ""}</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copy(batchOutput, "batch")}
                >
                  {copiedKey === "batch" ? "Copied all!" : "Copy all"}
                </Button>
              </div>
              <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                {batchSlugs.map((item, i) => (
                  <div key={i} className="px-4 py-3 bg-card hover:bg-muted/30 transition-colors group">
                    <div className="text-xs text-muted-foreground truncate mb-0.5">{item.original}</div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-foreground break-all flex-1">{item.slug}</span>
                      <button
                        onClick={() => copy(item.slug, `batch-${i}`)}
                        className="text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        {copiedKey === `batch-${i}` ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <p className="border-t border-border pt-4 text-xs text-muted-foreground">
        Accented characters are mapped to ASCII equivalents. Conversion happens live in your browser — nothing is sent to a server.
      </p>
    </div>
  );
}
