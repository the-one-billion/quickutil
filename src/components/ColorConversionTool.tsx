"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Copy, Check } from "lucide-react";
import {
  type ColorModel,
  colorModels,
  toRgb,
  fromRgb,
} from "@/data/colorConversions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { rgbToHex } from "@/data/colorConversions";

interface ColorConversionToolProps {
  fromModel: ColorModel;
  toModel: ColorModel;
  inverseSlug: string;
}

export default function ColorConversionTool({
  fromModel,
  toModel,
  inverseSlug,
}: ColorConversionToolProps) {
  const router = useRouter();
  const fromDef = colorModels[fromModel];
  const toDef = colorModels[toModel];

  const [inputValue, setInputValue] = useState(fromDef.exampleValue);
  const [copied, setCopied] = useState(false);

  // Recompute when the prop changes (navigation between color pages)
  useEffect(() => {
    setInputValue(colorModels[fromModel].exampleValue);
  }, [fromModel]);

  const convert = useCallback(
    (raw: string): string => {
      const rgb = toRgb(fromModel, raw);
      if (!rgb) return "";
      return fromRgb(toModel, rgb);
    },
    [fromModel, toModel]
  );

  const result = convert(inputValue);

  // Resolve a hex color for the swatch (pivot through RGB)
  const swatchRgb = toRgb(fromModel, inputValue);
  const swatchHex = swatchRgb ? rgbToHex(swatchRgb) : "#6366f1";

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">

        {/* Color swatch */}
        <div className="mb-5 flex items-center gap-4">
          <div
            className="h-14 w-14 shrink-0 rounded-xl border border-border shadow"
            style={{ backgroundColor: swatchHex }}
            aria-label="Color preview"
          />
          <div>
            <p className="text-sm font-medium text-foreground">Color Preview</p>
            <p className="text-xs text-muted-foreground font-mono">{swatchHex.toUpperCase()}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
          {/* From input */}
          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              {fromDef.label} — {fromDef.labelFull}
            </label>
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={fromDef.inputPlaceholder}
              className="font-mono text-base h-12"
              aria-label={`${fromDef.label} color value`}
            />
          </div>

          {/* Swap button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/color/${inverseSlug}`)}
            className="shrink-0 h-12 w-12 rounded-xl"
            aria-label="Swap color models"
            title={`Switch to ${toDef.label} → ${fromDef.label}`}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>

          {/* To output */}
          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              {toDef.label} — {toDef.labelFull}
            </label>
            <div
              className="flex h-12 items-center rounded-md border border-border bg-muted/50 px-3 font-mono text-base font-semibold"
              aria-live="polite"
              aria-label={`${toDef.label} result`}
            >
              {result || <span className="text-muted-foreground text-sm">Enter a valid {fromDef.label} value</span>}
            </div>
          </div>
        </div>

        {/* Copy + native picker row */}
        <div className="mt-4 flex items-center justify-between gap-3">
          {/* Native color picker for quick picking */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Pick a color:</label>
            <input
              type="color"
              value={swatchHex}
              onChange={(e) => {
                const hex = e.target.value;
                // Set the input in the "from" model's format
                const rgb = toRgb("hex", hex);
                if (!rgb) return;
                setInputValue(fromRgb(fromModel, rgb));
              }}
              className="h-8 w-14 cursor-pointer rounded border border-border bg-transparent p-0.5"
              aria-label="Native color picker"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!result}
            className="shrink-0 gap-1.5"
            aria-label="Copy result"
          >
            {copied ? (
              <><Check className="h-3.5 w-3.5 text-green-500" /> Copied!</>
            ) : (
              <><Copy className="h-3.5 w-3.5" /> Copy result</>
            )}
          </Button>
        </div>
      </div>

      {/* All-formats secondary output */}
      <AllFormatsOutput fromModel={fromModel} inputValue={inputValue} activeToModel={toModel} />
    </div>
  );
}

/** Shows the current color in all formats as a secondary reference panel. */
function AllFormatsOutput({
  fromModel,
  inputValue,
  activeToModel,
}: {
  fromModel: ColorModel;
  inputValue: string;
  activeToModel: ColorModel;
}) {
  const rgb = toRgb(fromModel, inputValue);
  const allModels: ColorModel[] = ["hex", "rgb", "hsl", "cmyk"];
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyValue = async (key: string, val: string) => {
    await navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  if (!rgb) return null;

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        All formats
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {allModels
          .filter((m) => m !== fromModel)
          .map((m) => {
            const val = fromRgb(m, rgb);
            const isActive = m === activeToModel;
            return (
              <div
                key={m}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                  isActive ? "border-primary/40 bg-primary/5" : "border-border bg-card"
                }`}
              >
                <div>
                  <span className={`text-xs font-bold uppercase ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {colorModels[m].label}
                  </span>
                  <p className="font-mono text-sm text-foreground">{val}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => copyValue(m, val)}
                >
                  {copiedKey === m ? "✓" : "Copy"}
                </Button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
