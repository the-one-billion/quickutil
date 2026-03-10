import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  conversionPairs,
  getConversionBySlug,
  getRelatedConversions,
  getCategoryForPair,
} from "@/data/conversions";
import ConversionTool from "@/components/ConversionTool";
import AdSlot from "@/components/AdSlot";

// ── Static params (SSG) ───────────────────────────────────────────────────────

export async function generateStaticParams() {
  return conversionPairs.map((p) => ({ conversion: p.slug }));
}

// ── Per-page metadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ conversion: string }>;
}): Promise<Metadata> {
  const { conversion } = await params;
  const pair = getConversionBySlug(conversion);
  if (!pair) return { title: "Converter Not Found" };

  return {
    title: pair.metaTitle,
    description: pair.metaDescription,
    keywords: [
      `${pair.fromSymbol} to ${pair.toSymbol}`,
      `convert ${pair.fromName.toLowerCase()} to ${pair.toName.toLowerCase()}`,
      `${pair.fromName.toLowerCase()} converter`,
      `${pair.toName.toLowerCase()} converter`,
      `${pair.categoryName.toLowerCase()} converter`,
      "unit converter",
      "online converter",
    ],
    openGraph: {
      title: pair.metaTitle,
      description: pair.metaDescription,
    },
    alternates: {
      canonical: `/convert/${pair.slug}`,
    },
  };
}

// ── Server-side table computation ─────────────────────────────────────────────

function computeTableRows(
  pair: ReturnType<typeof getConversionBySlug>
): { from: number; to: string }[] {
  if (!pair) return [];
  const cat = getCategoryForPair(pair);
  if (!cat) return [];

  const fromUnit = cat.units.find((u) => u.id === pair.fromId);
  const toUnit = cat.units.find((u) => u.id === pair.toId);
  if (!fromUnit || !toUnit) return [];

  return pair.commonValues.map((v) => {
    const result = toUnit.fromBase(fromUnit.toBase(v));
    let formatted: string;
    if (Math.abs(result) >= 1e10 || (Math.abs(result) < 0.0001 && result !== 0)) {
      formatted = result.toExponential(4).replace(/\.?0+e/, "e");
    } else {
      formatted = parseFloat(result.toPrecision(8)).toString();
    }
    return { from: v, to: formatted };
  });
}

function computeExampleResult(
  pair: ReturnType<typeof getConversionBySlug>
): { input: number; output: string } | null {
  if (!pair) return null;
  const cat = getCategoryForPair(pair);
  if (!cat) return null;
  const fromUnit = cat.units.find((u) => u.id === pair.fromId);
  const toUnit = cat.units.find((u) => u.id === pair.toId);
  if (!fromUnit || !toUnit) return null;

  const input = pair.commonValues[0] ?? 1;
  const result = toUnit.fromBase(fromUnit.toBase(input));
  const output = parseFloat(result.toPrecision(8)).toString();
  return { input, output };
}

// ── Page component ────────────────────────────────────────────────────────────

export default async function ConversionPage({
  params,
}: {
  params: Promise<{ conversion: string }>;
}) {
  const { conversion } = await params;
  const pair = getConversionBySlug(conversion);
  if (!pair) notFound();

  const related = getRelatedConversions(pair, 6);
  const tableRows = computeTableRows(pair);
  const example = computeExampleResult(pair);

  const BASE = "https://quickutil.io";

  // ── Structured data ──────────────────────────────────────────────────────

  const faqItems = [
    {
      q: `How many ${pair.toName} in a ${pair.fromName.slice(0, -1)}?`,
      a: example
        ? `1 ${pair.fromSymbol} = ${example.output} ${pair.toSymbol}. Use the converter above for any value.`
        : `Use the converter above to find the exact ${pair.toSymbol} equivalent.`,
    },
    {
      q: `How do I convert ${pair.fromName} to ${pair.toName}?`,
      a: `To convert ${pair.fromName} to ${pair.toName}, use the formula: ${pair.formula}. Enter your value in the input above and the result is shown instantly.`,
    },
    {
      q: `What is the formula for ${pair.fromName} to ${pair.toName}?`,
      a: `The conversion formula is: ${pair.formula}. This gives the exact ${pair.toName} equivalent for any ${pair.fromName} value.`,
    },
    {
      q: `Is this ${pair.fromName} to ${pair.toName} converter free?`,
      a: `Yes, this converter is completely free to use. No signup, no download, and no limits. It works directly in your browser.`,
    },
  ];

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: pair.h1,
    url: `${BASE}/convert/${pair.slug}`,
    description: pair.metaDescription,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "Converters", item: `${BASE}/convert` },
      {
        "@type": "ListItem",
        position: 3,
        name: pair.categoryName,
        item: `${BASE}/convert?category=${pair.category}`,
      },
      { "@type": "ListItem", position: 4, name: pair.h1 },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link href="/tools" className="hover:text-foreground transition-colors">
            Converters
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-foreground">{pair.categoryName}</span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-foreground">{pair.h1}</span>
        </nav>

        {/* H1 */}
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight">{pair.h1}</h1>
        <p className="mb-8 text-muted-foreground">
          Instantly convert {pair.fromName} to {pair.toName} with the calculator below.
          Enter any value and get an accurate result immediately.
        </p>

        {/* Interactive converter — client component */}
        <ConversionTool slug={pair.slug} />

        {/* Ad slot */}
        <div className="my-10 flex justify-center">
          <AdSlot size="leaderboard" adClient="ca-pub-5463169058698651" />
        </div>

        {/* Formula section */}
        <section aria-labelledby="formula-heading" className="mb-10">
          <h2 id="formula-heading" className="mb-4 text-xl font-bold">
            How to convert {pair.fromName} to {pair.toName}
          </h2>

          <div className="rounded-xl border border-border bg-muted/40 p-5 font-mono text-base">
            <span className="text-primary font-semibold">{pair.formula}</span>
          </div>

          {example && (
            <div className="mt-4 rounded-xl border border-border bg-card p-5 space-y-2 text-sm">
              <p className="font-semibold text-foreground">Step-by-step example</p>
              <ol className="ml-4 list-decimal space-y-1 text-muted-foreground">
                <li>
                  Start with the value in {pair.fromName}: <strong>{example.input} {pair.fromSymbol}</strong>
                </li>
                <li>
                  Apply the formula: <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{pair.formula}</code>
                </li>
                <li>
                  Result: <strong>{example.input} {pair.fromSymbol} = {example.output} {pair.toSymbol}</strong>
                </li>
              </ol>
            </div>
          )}
        </section>

        {/* Conversion table */}
        <section aria-labelledby="table-heading" className="mb-10">
          <h2 id="table-heading" className="mb-4 text-xl font-bold">
            {pair.fromName} to {pair.toName} Conversion Table
          </h2>

          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold">
                    {pair.fromName} ({pair.fromSymbol})
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    {pair.toName} ({pair.toSymbol})
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => (
                  <tr
                    key={row.from}
                    className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}
                  >
                    <td className="px-4 py-2.5 tabular-nums">
                      {row.from} {pair.fromSymbol}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums font-medium">
                      {row.to} {pair.toSymbol}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Related conversions */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mb-10">
            <h2 id="related-heading" className="mb-4 text-xl font-bold">
              Related {pair.categoryName} Conversions
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/convert/${rel.slug}`}
                  className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">
                    {rel.fromName} to {rel.toName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {rel.fromSymbol} → {rel.toSymbol}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="mb-10">
          <h2 id="faq-heading" className="mb-4 text-xl font-bold">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-5"
              >
                <h3 className="font-semibold text-sm mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Inverse link */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-center">
          Looking for the reverse?{" "}
          <Link
            href={`/convert/${pair.inverseSlug}`}
            className="font-medium text-primary hover:underline"
          >
            Convert {pair.toName} to {pair.fromName} ({pair.toSymbol} to {pair.fromSymbol})
          </Link>
        </div>
      </div>
    </>
  );
}
