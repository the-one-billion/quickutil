"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Copy, Check } from "lucide-react";
import { getConversionBySlug, getCategoryForPair } from "@/data/conversions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

interface ConversionToolProps {
  slug: string;
}

export default function ConversionTool({ slug }: ConversionToolProps) {
  const router = useRouter();
  const pair = getConversionBySlug(slug);
  const cat = pair ? getCategoryForPair(pair) : undefined;

  const [inputValue, setInputValue] = useState("1");
  const [copied, setCopied] = useState(false);

  // Resolve the from/to unit objects from the category
  const fromUnit = cat?.units.find((u) => u.id === pair?.fromId);
  const toUnit = cat?.units.find((u) => u.id === pair?.toId);

  const convert = useCallback(
    (raw: string): string => {
      if (!fromUnit || !toUnit || !pair) return "";
      const num = parseFloat(raw);
      if (isNaN(num)) return "";
      const result = toUnit.fromBase(fromUnit.toBase(num));
      // Format: up to 10 significant digits, strip trailing zeros
      if (Math.abs(result) >= 1e10 || (Math.abs(result) < 0.0001 && result !== 0)) {
        return result.toExponential(6).replace(/\.?0+e/, "e");
      }
      return parseFloat(result.toPrecision(10)).toString();
    },
    [fromUnit, toUnit, pair]
  );

  const result = convert(inputValue);

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    if (!pair) return;
    router.push(`/convert/${pair.inverseSlug}`);
  };

  const handlePreset = (val: number) => {
    setInputValue(val.toString());
  };

  // Reset input when slug changes (navigation)
  useEffect(() => {
    setInputValue("1");
  }, [slug]);

  if (!pair || !fromUnit || !toUnit) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
        Conversion not found.
      </div>
    );
  }

  const presets = pair.commonValues.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Main converter */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
          {/* From */}
          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              {pair.fromName}
            </label>
            <div className="relative">
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pr-14 text-lg font-semibold h-12"
                placeholder="Enter value"
                aria-label={`Value in ${pair.fromName}`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                {pair.fromSymbol}
              </span>
            </div>
          </div>

          {/* Swap button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwap}
            className="shrink-0 h-12 w-12 rounded-xl"
            aria-label="Swap units"
            title={`Switch to ${pair.toName} to ${pair.fromName}`}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>

          {/* To */}
          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              {pair.toName}
            </label>
            <div className="relative">
              <div
                className={cn(
                  "flex h-12 items-center rounded-md border border-border bg-muted/50 pr-14 pl-3 text-lg font-semibold",
                  !result && "text-muted-foreground"
                )}
                aria-live="polite"
                aria-label={`Result in ${pair.toName}`}
              >
                {result || "—"}
              </div>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                {pair.toSymbol}
              </span>
            </div>
          </div>
        </div>

        {/* Copy result */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground self-center">Quick presets:</span>
            {presets.map((val) => (
              <Button
                key={val}
                variant="outline"
                size="sm"
                onClick={() => handlePreset(val)}
                className="h-7 px-3 text-xs"
              >
                {val}
              </Button>
            ))}
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
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy result
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
