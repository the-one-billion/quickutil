"use client";
/**
 * Barcode Generator
 * Loads JsBarcode from CDN on mount, renders to an SVG element via window.JsBarcode,
 * and supports downloading the generated SVG.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Types ──────────────────────────────────────────────────────────────────────

type BarcodeFormat =
  | "CODE128"
  | "CODE39"
  | "EAN13"
  | "EAN8"
  | "UPC"
  | "ITF14"
  | "MSI"
  | "pharmacode";

interface FormatMeta {
  label: string;
  hint: string;
  example: string;
}

const FORMATS: Record<BarcodeFormat, FormatMeta> = {
  CODE128:    { label: "CODE128",    hint: "Any printable ASCII characters",      example: "Hello-World" },
  CODE39:     { label: "CODE39",     hint: "Uppercase A-Z, 0-9, and symbols",     example: "CODE39" },
  EAN13:      { label: "EAN-13",     hint: "12 or 13 digits",                     example: "590123412345" },
  EAN8:       { label: "EAN-8",      hint: "7 or 8 digits",                       example: "1234567" },
  UPC:        { label: "UPC-A",      hint: "11 or 12 digits",                     example: "12345678901" },
  ITF14:      { label: "ITF-14",     hint: "14 digits",                           example: "12345678901234" },
  MSI:        { label: "MSI",        hint: "Digits only (0-9)",                   example: "1234567890" },
  pharmacode: { label: "Pharmacode", hint: "Integer between 3 and 131070",        example: "12345" },
};

const FORMAT_ORDER: BarcodeFormat[] = [
  "CODE128",
  "CODE39",
  "EAN13",
  "EAN8",
  "UPC",
  "ITF14",
  "MSI",
  "pharmacode",
];

// ── Validation ─────────────────────────────────────────────────────────────────

function validateInput(format: BarcodeFormat, value: string): string | null {
  if (!value.trim()) return "Barcode value cannot be empty.";

  switch (format) {
    case "EAN13": {
      const clean = value.replace(/\D/g, "");
      if (clean.length !== 12 && clean.length !== 13)
        return "EAN-13 requires exactly 12 or 13 digits.";
      return null;
    }
    case "EAN8": {
      const clean = value.replace(/\D/g, "");
      if (clean.length !== 7 && clean.length !== 8)
        return "EAN-8 requires exactly 7 or 8 digits.";
      return null;
    }
    case "UPC": {
      const clean = value.replace(/\D/g, "");
      if (clean.length !== 11 && clean.length !== 12)
        return "UPC-A requires exactly 11 or 12 digits.";
      return null;
    }
    case "ITF14": {
      const clean = value.replace(/\D/g, "");
      if (clean.length !== 14)
        return "ITF-14 requires exactly 14 digits.";
      return null;
    }
    case "MSI": {
      if (!/^\d+$/.test(value))
        return "MSI accepts digits only (0-9).";
      return null;
    }
    case "pharmacode": {
      const n = parseInt(value, 10);
      if (isNaN(n) || n < 3 || n > 131070)
        return "Pharmacode must be an integer between 3 and 131070.";
      return null;
    }
    default:
      return null;
  }
}

// ── JsBarcode CDN script loader ────────────────────────────────────────────────
// Loads the script only once across re-renders; calls all waiting callbacks when ready.

const JSBARCODE_CDN =
  "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js";

let _scriptState: "idle" | "loading" | "ready" | "error" = "idle";
const _pendingCallbacks: Array<(ok: boolean) => void> = [];

function loadJsBarcode(onDone: (ok: boolean) => void): void {
  if (_scriptState === "ready") {
    onDone(true);
    return;
  }
  if (_scriptState === "error") {
    onDone(false);
    return;
  }

  _pendingCallbacks.push(onDone);

  if (_scriptState === "loading") return;

  _scriptState = "loading";
  const script = document.createElement("script");
  script.src = JSBARCODE_CDN;
  script.async = true;
  script.onload = () => {
    _scriptState = "ready";
    _pendingCallbacks.forEach((cb) => cb(true));
    _pendingCallbacks.length = 0;
  };
  script.onerror = () => {
    _scriptState = "error";
    _pendingCallbacks.forEach((cb) => cb(false));
    _pendingCallbacks.length = 0;
  };
  document.head.appendChild(script);
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function BarcodeGenerator() {
  const svgRef = useRef<SVGSVGElement>(null);

  // Settings
  const [value, setValue] = useState("Hello-World");
  const [format, setFormat] = useState<BarcodeFormat>("CODE128");
  const [barWidth, setBarWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [displayText, setDisplayText] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [lineColor, setLineColor] = useState("#000000");

  // UI state
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load JsBarcode on mount
  useEffect(() => {
    loadJsBarcode((ok) => {
      setScriptReady(ok);
      if (!ok) setScriptError(true);
    });
  }, []);

  // When format changes, reset the value to an example and clear errors
  const handleFormatChange = (newFormat: BarcodeFormat) => {
    setFormat(newFormat);
    setValue(FORMATS[newFormat].example);
    setError(null);
    setGenerated(false);
  };

  const generate = useCallback(() => {
    if (!scriptReady) {
      setError(
        scriptError
          ? "Failed to load JsBarcode from CDN. Check your internet connection."
          : "JsBarcode is still loading — please wait a moment."
      );
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const JsBarcode = (window as any).JsBarcode;
    if (typeof JsBarcode !== "function") {
      setError("JsBarcode is not available. Refresh the page and try again.");
      return;
    }

    const validationError = validateInput(format, value);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!svgRef.current) return;

    let generationFailed = false;

    try {
      JsBarcode(svgRef.current, value, {
        format,
        width: barWidth,
        height,
        displayValue: displayText,
        fontSize,
        background: bgColor,
        lineColor,
        margin: 10,
        valid: (valid: boolean) => {
          if (!valid) {
            generationFailed = true;
            setError(
              `"${value}" is not a valid value for ${FORMATS[format].label}. ${FORMATS[format].hint}.`
            );
          }
        },
      });

      if (!generationFailed) {
        setError(null);
        setGenerated(true);
      } else {
        setGenerated(false);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : `Could not generate ${FORMATS[format].label} barcode. Ensure the value matches the format.`;
      setError(msg);
      setGenerated(false);
    }
  }, [scriptReady, scriptError, format, value, barWidth, height, displayText, fontSize, bgColor, lineColor]);

  const downloadSVG = useCallback(() => {
    if (!svgRef.current || !generated) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `barcode-${format}-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generated, format]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Barcode Generator</h1>
        <p className="text-sm text-muted-foreground">
          Generate professional barcodes in multiple formats and download as SVG.
        </p>
      </div>

      {/* ── Settings ────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Barcode Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Format */}
          <div className="space-y-1.5">
            <Label htmlFor="bc-format">Format</Label>
            <Select value={format} onValueChange={(v) => handleFormatChange(v as BarcodeFormat)}>
              <SelectTrigger id="bc-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_ORDER.map((f) => (
                  <SelectItem key={f} value={f}>
                    {FORMATS[f].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{FORMATS[format].hint}</p>
          </div>

          {/* Value */}
          <div className="space-y-1.5">
            <Label htmlFor="bc-value">Barcode Value</Label>
            <Input
              id="bc-value"
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              placeholder={FORMATS[format].example}
            />
          </div>

          {/* Width & Height */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Bar Width</Label>
                <span className="text-sm font-medium text-foreground">{barWidth}px</span>
              </div>
              <Slider
                min={1}
                max={4}
                step={1}
                value={[barWidth]}
                onValueChange={([v]) => setBarWidth(v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 — thin</span>
                <span>4 — thick</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Height</Label>
                <span className="text-sm font-medium text-foreground">{height}px</span>
              </div>
              <Slider
                min={50}
                max={200}
                step={10}
                value={[height]}
                onValueChange={([v]) => setHeight(v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>50px</span>
                <span>200px</span>
              </div>
            </div>
          </div>

          {/* Display text toggle */}
          <div className="flex items-center gap-3">
            <input
              id="bc-display-text"
              type="checkbox"
              checked={displayText}
              onChange={(e) => setDisplayText(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-border accent-primary"
            />
            <Label htmlFor="bc-display-text" className="cursor-pointer">
              Show text below barcode
            </Label>
          </div>

          {/* Font size (conditional on displayText) */}
          {displayText && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Font Size</Label>
                <span className="text-sm font-medium text-foreground">{fontSize}px</span>
              </div>
              <Slider
                min={10}
                max={30}
                step={1}
                value={[fontSize]}
                onValueChange={([v]) => setFontSize(v)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10px</span>
                <span>30px</span>
              </div>
            </div>
          )}

          {/* Colors */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bc-bg-color">Background Color</Label>
              <div className="flex items-center gap-3">
                <input
                  id="bc-bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-md border border-border bg-background p-0.5"
                />
                <Input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 font-mono text-sm uppercase"
                  maxLength={7}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bc-line-color">Line Color</Label>
              <div className="flex items-center gap-3">
                <input
                  id="bc-line-color"
                  type="color"
                  value={lineColor}
                  onChange={(e) => setLineColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-md border border-border bg-background p-0.5"
                />
                <Input
                  type="text"
                  value={lineColor}
                  onChange={(e) => setLineColor(e.target.value)}
                  className="flex-1 font-mono text-sm uppercase"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Generate button */}
          <Button
            onClick={generate}
            disabled={!scriptReady && !scriptError}
            className="w-full"
          >
            {!scriptReady && !scriptError
              ? "Loading JsBarcode…"
              : "Generate Barcode"}
          </Button>
        </CardContent>
      </Card>

      {/* ── Error ───────────────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          <span className="font-semibold">Error: </span>
          {error}
        </div>
      )}

      {/* ── Preview ─────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Preview</CardTitle>
          {generated && (
            <Badge variant="secondary" className="text-xs">
              {FORMATS[format].label}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {/* Barcodes require a light background — wrap in white div for dark mode */}
          <div
            className="flex min-h-[140px] items-center justify-center overflow-auto rounded-lg border border-border"
            style={{ backgroundColor: generated ? bgColor : undefined }}
          >
            {!generated && (
              <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
                <svg
                  className="h-12 w-12 opacity-25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="2"    y="4" width="3"   height="16" rx="0.5" />
                  <rect x="7"    y="4" width="1.5" height="16" rx="0.5" />
                  <rect x="10.5" y="4" width="3"   height="16" rx="0.5" />
                  <rect x="15.5" y="4" width="1.5" height="16" rx="0.5" />
                  <rect x="19"   y="4" width="3"   height="16" rx="0.5" />
                </svg>
                <p className="text-sm text-center px-4">
                  Configure settings above and click{" "}
                  <span className="font-medium text-foreground">Generate Barcode</span>
                </p>
              </div>
            )}

            {/* SVG element is always in the DOM so the ref is always valid */}
            <svg
              ref={svgRef}
              className={generated ? "block max-w-full" : "hidden"}
            />
          </div>

          {generated && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={downloadSVG}>
                Download SVG
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="border-t border-border pt-4 text-xs text-muted-foreground">
        Barcodes are rendered client-side using{" "}
        <span className="font-medium">JsBarcode 3.11.6</span> loaded from
        jsDelivr CDN. The SVG output is resolution-independent and suitable for
        print at any size.
      </p>
    </div>
  );
}
