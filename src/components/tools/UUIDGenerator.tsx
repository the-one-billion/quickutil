"use client";
/**
 * UUID Generator Tool
 * Generates v4 UUIDs using the native crypto.randomUUID() API.
 * Supports lowercase, UPPERCASE, and no-dashes formats.
 * Per-UUID copy buttons + Copy All. Zero external dependencies.
 */
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Types ─────────────────────────────────────────────────────────────────────

type UUIDFormat = "lowercase" | "uppercase" | "nodashes";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatUUID(raw: string, format: UUIDFormat): string {
  switch (format) {
    case "uppercase":
      return raw.toUpperCase();
    case "nodashes":
      return raw.replace(/-/g, "");
    default:
      return raw;
  }
}

function generateUUIDs(count: number, format: UUIDFormat): string[] {
  return Array.from({ length: count }, () =>
    formatUUID(crypto.randomUUID(), format)
  );
}

// ── UUID row ──────────────────────────────────────────────────────────────────

interface UUIDRowProps {
  uuid: string;
}

function UUIDRow({ uuid }: UUIDRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(uuid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail
    }
  }, [uuid]);

  return (
    <div className="flex items-center gap-2 group rounded-lg border border-border bg-background px-3 py-2 hover:bg-muted/30 transition-colors">
      <span className="flex-1 font-mono text-sm text-foreground break-all select-all">
        {uuid}
      </span>
      <button
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy UUID"}
        title={copied ? "Copied!" : "Copy"}
        className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {copied ? (
          <span className="text-green-600 dark:text-green-400">Copied!</span>
        ) : (
          <CopyIcon />
        )}
      </button>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function UUIDGenerator() {
  const [count, setCount]     = useState(5);
  const [format, setFormat]   = useState<UUIDFormat>("lowercase");
  const [uuids, setUuids]     = useState<string[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleGenerate = useCallback(() => {
    setUuids(generateUUIDs(count, format));
  }, [count, format]);

  const handleCopyAll = useCallback(async () => {
    if (!uuids.length) return;
    try {
      await navigator.clipboard.writeText(uuids.join("\n"));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // silently fail
    }
  }, [uuids]);

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseInt(e.target.value, 10);
    if (isNaN(raw)) return;
    setCount(Math.max(1, Math.min(100, raw)));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">UUID Generator</h1>
        <p className="text-sm text-muted-foreground">
          Generate cryptographically random v4 UUIDs using your browser&apos;s built-in{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            crypto.randomUUID()
          </code>
          .
        </p>
      </div>

      {/* ── Controls ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Count */}
        <div className="flex flex-col gap-1.5 w-28">
          <Label htmlFor="uuid-count">Count (1–100)</Label>
          <Input
            id="uuid-count"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={handleCountChange}
          />
        </div>

        {/* Format */}
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <Label htmlFor="uuid-format">Format</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as UUIDFormat)}>
            <SelectTrigger id="uuid-format" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lowercase">lowercase</SelectItem>
              <SelectItem value="uppercase">UPPERCASE</SelectItem>
              <SelectItem value="nodashes">No dashes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Generate */}
        <Button onClick={handleGenerate} className="shrink-0">
          Generate
        </Button>
      </div>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {uuids.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {uuids.length} UUID{uuids.length !== 1 ? "s" : ""} generated
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
              >
                {copiedAll ? "Copied!" : "Copy All"}
              </Button>
            </div>
          </div>

          {/* Scrollable UUID list */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="max-h-[480px] overflow-y-auto divide-y divide-border">
              {uuids.map((uuid, index) => (
                <UUIDRow key={`${uuid}-${index}`} uuid={uuid} />
              ))}
            </div>
          </div>

          {/* Plain-text textarea for select-all copy */}
          <details className="group">
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors select-none">
              Show as plain text
            </summary>
            <textarea
              className="mt-2 w-full rounded-xl border border-border bg-muted/30 px-4 py-3 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              rows={Math.min(uuids.length, 8)}
              readOnly
              value={uuids.join("\n")}
              aria-label="UUIDs as plain text"
            />
          </details>
        </div>
      )}

      {uuids.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6 rounded-xl border border-dashed border-border">
          Configure the options above and click <strong>Generate</strong> to create UUIDs.
        </p>
      )}
    </div>
  );
}
