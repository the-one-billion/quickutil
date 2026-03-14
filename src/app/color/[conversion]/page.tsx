import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  colorConversionPairs,
  getColorPairBySlug,
  getRelatedColorPairs,
  colorModels,
  COMMON_COLORS,
  fromRgb,
} from "@/data/colorConversions";
import ColorConversionTool from "@/components/ColorConversionTool";
import AdSlot from "@/components/AdSlot";

// ── Static params (SSG) ───────────────────────────────────────────────────────

export function generateStaticParams() {
  return colorConversionPairs.map((p) => ({ conversion: p.slug }));
}

// ── Per-page metadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ conversion: string }>;
}): Promise<Metadata> {
  const { conversion } = await params;
  const pair = getColorPairBySlug(conversion);
  if (!pair) return { title: "Color Converter Not Found" };

  const from = colorModels[pair.fromModel];
  const to = colorModels[pair.toModel];

  return {
    title: pair.metaTitle,
    description: pair.metaDescription,
    keywords: [
      `${from.label.toLowerCase()} to ${to.label.toLowerCase()}`,
      `${from.label.toLowerCase()} to ${to.label.toLowerCase()} converter`,
      `convert ${from.label.toLowerCase()} to ${to.label.toLowerCase()}`,
      `${from.label.toLowerCase()} to ${to.label.toLowerCase()} online`,
      `${from.label.toLowerCase()} color converter`,
      `${to.label.toLowerCase()} color converter`,
      "color converter",
      "color code converter",
      "online color tool",
    ],
    openGraph: {
      title: pair.metaTitle,
      description: pair.metaDescription,
    },
    alternates: {
      canonical: `/color/${pair.slug}`,
    },
  };
}

// ── Page component ────────────────────────────────────────────────────────────

export default async function ColorConversionPage({
  params,
}: {
  params: Promise<{ conversion: string }>;
}) {
  const { conversion } = await params;
  const pair = getColorPairBySlug(conversion);
  if (!pair) notFound();

  const from = colorModels[pair.fromModel];
  const to = colorModels[pair.toModel];
  const related = getRelatedColorPairs(pair, 6);

  const BASE = "https://quickutil.io";

  // ── Build common colors table server-side ─────────────────────────────────
  const colorTableRows = COMMON_COLORS.map((color) => ({
    name: color.name,
    fromValue: fromRgb(pair.fromModel, color.rgb),
    toValue: fromRgb(pair.toModel, color.rgb),
    hex: `#${[color.rgb.r, color.rgb.g, color.rgb.b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")}`,
  }));

  // ── Structured data ───────────────────────────────────────────────────────

  const faqItems = [
    {
      q: `How do I convert ${from.label} to ${to.label}?`,
      a: `To convert ${from.label} to ${to.label}: ${pair.formula}. Use the converter above to do this instantly for any color value.`,
    },
    {
      q: `What is the ${from.label} color format?`,
      a: `${from.labelFull} (${from.label}) — ${from.description}`,
    },
    {
      q: `What is the ${to.label} color format?`,
      a: `${to.labelFull} (${to.label}) — ${to.description}`,
    },
    {
      q: `Is this ${from.label} to ${to.label} converter free?`,
      a: "Yes. It is completely free, works in your browser with no signup or upload. All color math runs locally.",
    },
    {
      q: `Can I convert ${to.label} back to ${from.label}?`,
      a: `Yes — use the swap button in the converter above, or visit the ${to.label} to ${from.label} converter page directly.`,
    },
  ];

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: pair.h1,
    url: `${BASE}/color/${pair.slug}`,
    description: pair.metaDescription,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",             item: BASE },
      { "@type": "ListItem", position: 2, name: "Color Converters", item: `${BASE}/color` },
      { "@type": "ListItem", position: 3, name: pair.h1 },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to Convert ${from.label} to ${to.label}`,
    step: [
      { "@type": "HowToStep", text: `Enter your ${from.labelFull} (${from.label}) value in the input field.` },
      { "@type": "HowToStep", text: `The ${to.labelFull} (${to.label}) equivalent is shown instantly in the output field.` },
      { "@type": "HowToStep", text: "Click 'Copy result' to copy the converted value to your clipboard." },
    ],
  };

  return (
    <>
      {/* Structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link href="/color" className="hover:text-foreground transition-colors">Color Converters</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-foreground">{pair.h1}</span>
        </nav>

        {/* H1 + description */}
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight">{pair.h1}</h1>
        <p className="mb-8 text-muted-foreground">
          Instantly convert {from.labelFull} ({from.label}) to {to.labelFull} ({to.label}) color codes.
          Enter any {from.label} value and get the {to.label} equivalent in real time — no signup required.
        </p>

        {/* Interactive converter */}
        <ColorConversionTool
          fromModel={pair.fromModel}
          toModel={pair.toModel}
          inverseSlug={pair.inverseSlug}
        />

        {/* Ad slot */}
        <div className="my-10 flex justify-center">
          <AdSlot size="leaderboard" adClient="ca-pub-5463169058698651" />
        </div>

        {/* What is each format? */}
        <section aria-labelledby="formats-heading" className="mb-10">
          <h2 id="formats-heading" className="mb-4 text-xl font-bold">
            {from.label} vs {to.label} — What&apos;s the Difference?
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[from, to].map((model) => (
              <div key={model.id} className="rounded-xl border border-border bg-card p-5">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{model.label}</p>
                <p className="font-semibold mb-2">{model.labelFull}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{model.description}</p>
                <p className="mt-3 font-mono text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                  Example: <span className="text-foreground">{model.cssUsage}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Formula */}
        <section aria-labelledby="formula-heading" className="mb-10">
          <h2 id="formula-heading" className="mb-4 text-xl font-bold">
            How to Convert {from.label} to {to.label}
          </h2>
          <div className="rounded-xl border border-border bg-muted/40 p-5 font-mono text-sm leading-relaxed">
            <span className="text-primary font-semibold">{pair.formula}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            All conversion math runs in your browser using the sRGB color space. No data is sent to a server.
          </p>
        </section>

        {/* Common colors reference table */}
        <section aria-labelledby="table-heading" className="mb-10">
          <h2 id="table-heading" className="mb-4 text-xl font-bold">
            Common Colors — {from.label} to {to.label} Reference Table
          </h2>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold">Color</th>
                  <th className="px-4 py-3 text-left font-semibold">{from.label}</th>
                  <th className="px-4 py-3 text-left font-semibold">{to.label}</th>
                </tr>
              </thead>
              <tbody>
                {colorTableRows.map((row, i) => (
                  <tr key={row.name} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-4 w-4 rounded shrink-0 border border-border"
                          style={{ backgroundColor: row.hex }}
                        />
                        {row.name}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">{row.fromValue}</td>
                    <td className="px-4 py-2.5 font-mono text-xs font-medium text-primary">{row.toValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Related converters */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mb-10">
            <h2 id="related-heading" className="mb-4 text-xl font-bold">Related Color Converters</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/color/${rel.slug}`}
                  className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">
                    {colorModels[rel.fromModel].label} to {colorModels[rel.toModel].label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {colorModels[rel.fromModel].labelFull} → {colorModels[rel.toModel].labelFull}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="mb-10">
          <h2 id="faq-heading" className="mb-4 text-xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-sm mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Inverse link */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-center">
          Looking for the reverse?{" "}
          <Link href={`/color/${pair.inverseSlug}`} className="font-medium text-primary hover:underline">
            Convert {to.label} to {from.label} ({to.labelFull} → {from.labelFull})
          </Link>
        </div>

        {/* Ad */}
        <div className="mt-10 flex justify-center">
          <AdSlot size="rectangle" adClient="ca-pub-5463169058698651" />
        </div>
      </div>
    </>
  );
}
