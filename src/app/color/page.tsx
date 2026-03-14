import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import { colorConversionPairs, colorModels } from "@/data/colorConversions";

export const metadata: Metadata = {
  title: "Free Color Code Converters — HEX, RGB, HSL, CMYK | QuickUtil",
  description:
    "Convert color codes between HEX, RGB, HSL, and CMYK formats instantly. Free online color converters with formulas, color pickers, and common color reference tables. No signup required.",
  alternates: { canonical: "/color" },
};

// Group pairs by "from" model for organised display
const COLOR_MODELS = ["hex", "rgb", "hsl", "cmyk"] as const;

export default function ColorHubPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium text-foreground">Color Converters</span>
      </nav>

      <h1 className="text-3xl font-extrabold tracking-tight mb-2">
        Free Color Code Converters
      </h1>
      <p className="mb-3 text-muted-foreground">
        Convert between HEX, RGB, HSL, and CMYK color formats instantly — with formula explanations,
        color pickers, and a 12-color reference table per page. All math runs in your browser.
      </p>
      <p className="mb-10 text-sm text-muted-foreground">
        {colorConversionPairs.length} color conversion pages · Used by web designers, frontend developers, and print designers.
      </p>

      <div className="space-y-10">
        {COLOR_MODELS.map((fromModel) => {
          const fromDef = colorModels[fromModel];
          const pairs = colorConversionPairs.filter((p) => p.fromModel === fromModel);

          return (
            <section key={fromModel} aria-labelledby={`from-${fromModel}`}>
              <h2 id={`from-${fromModel}`} className="mb-1 text-xl font-bold">
                Convert from {fromDef.label}
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">{fromDef.description}</p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {pairs.map((pair) => {
                  const toDef = colorModels[pair.toModel];
                  return (
                    <Link
                      key={pair.slug}
                      href={`/color/${pair.slug}`}
                      className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {fromDef.label} → {toDef.label}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {fromDef.labelFull} to {toDef.labelFull}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Color model descriptions */}
      <section className="mt-14">
        <h2 className="mb-6 text-xl font-bold">Color Format Reference</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {COLOR_MODELS.map((model) => {
            const def = colorModels[model];
            return (
              <div key={model} className="rounded-xl border border-border bg-card p-5">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{def.label}</p>
                <p className="font-semibold mb-2">{def.labelFull}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{def.description}</p>
                <p className="mt-2 font-mono text-xs bg-muted/50 rounded px-2 py-1 text-muted-foreground">
                  {def.cssUsage}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Unit converters cross-link */}
      <div className="mt-10 rounded-xl border border-border bg-muted/30 p-5 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Need unit conversions? Weight, length, temperature, and more:
        </p>
        <Link
          href="/convert"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          All Unit Converters <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
