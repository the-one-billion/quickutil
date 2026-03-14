import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import { conversionCategories, conversionPairs } from "@/data/conversions";

export const metadata: Metadata = {
  title: "Free Unit Converters — Weight, Length, Temperature & More | QuickUtil",
  description: `${conversionPairs.length}+ free unit conversion pages. Convert weight, length, temperature, area, volume, speed, pressure, energy, data, time, and more — all in your browser, no signup.`,
  alternates: { canonical: "/convert" },
};

// Top pairs to feature per category (by search relevance)
const FEATURED: Partial<Record<string, string[]>> = {
  weight:      ["kg-to-lb", "lb-to-kg", "g-to-oz", "kg-to-g"],
  length:      ["cm-to-in", "in-to-cm", "m-to-ft", "km-to-mi"],
  temperature: ["c-to-f", "f-to-c", "c-to-k"],
  area:        ["m2-to-ft2", "ft2-to-m2", "ac-to-m2"],
  volume:      ["L-to-gal", "gal-to-L", "mL-to-floz"],
  speed:       ["km_h-to-mph", "mph-to-km_h", "m_s-to-km_h"],
  digital:     ["mb-to-gb", "gb-to-mb", "kb-to-mb", "gb-to-tb"],
  time:        ["s-to-min", "min-to-h", "h-to-s"],
  pressure:    ["pa-to-atm", "bar-to-pa", "psi-to-pa"],
  energy:      ["j-to-cal", "cal-to-j", "kj-to-kcal"],
  power:       ["w-to-kw", "kw-to-w", "hp-to-w"],
  fuel:        ["mpg-to-l100km", "l100km-to-mpg"],
};

export default function ConvertersHubPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium text-foreground">Unit Converters</span>
      </nav>

      <h1 className="text-3xl font-extrabold tracking-tight mb-2">
        Free Unit Converters
      </h1>
      <p className="mb-10 text-muted-foreground">
        {conversionPairs.length}+ conversion pages across {conversionCategories.length} categories — all free, all instant, all in your browser.
      </p>

      <div className="space-y-10">
        {conversionCategories.map((cat) => {
          const catPairs = conversionPairs.filter((p) => p.category === cat.id);
          const featured = (FEATURED[cat.id] ?? [])
            .map((s) => catPairs.find((p) => p.slug === s))
            .filter(Boolean) as typeof catPairs;
          const featuredSlugs = new Set(featured.map((p) => p.slug));
          const rest = catPairs.filter((p) => !featuredSlugs.has(p.slug));

          return (
            <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
              <div className="mb-4 flex items-center justify-between">
                <h2 id={`cat-${cat.id}`} className="text-xl font-bold capitalize">
                  {cat.name} Converters
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({catPairs.length} conversions)
                  </span>
                </h2>
              </div>

              {/* Featured pairs as prominent cards */}
              {featured.length > 0 && (
                <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {featured.map((pair) => (
                    <Link
                      key={pair.slug}
                      href={`/convert/${pair.slug}`}
                      className="group flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-sm hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                      <span className="font-medium group-hover:text-primary transition-colors truncate">
                        {pair.fromSymbol} → {pair.toSymbol}
                      </span>
                      <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground group-hover:text-primary ml-1 transition-colors" />
                    </Link>
                  ))}
                </div>
              )}

              {/* All remaining pairs as compact links */}
              {rest.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {rest.map((pair) => (
                    <Link
                      key={pair.slug}
                      href={`/convert/${pair.slug}`}
                      className="rounded-md border border-border/60 bg-background px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                    >
                      {pair.fromSymbol} to {pair.toSymbol}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Color converters cross-link */}
      <div className="mt-14 rounded-xl border border-border bg-card p-6 text-center">
        <h2 className="font-bold text-lg mb-1">Looking for Color Converters?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Convert HEX, RGB, HSL, and CMYK color codes online — all in your browser.
        </p>
        <Link
          href="/color"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Go to Color Converters <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
