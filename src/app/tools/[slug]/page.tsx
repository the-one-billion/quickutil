import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { getToolBySlug, getToolsByCategory, tools } from "@/lib/tools";
import AdSlot from "@/components/AdSlot";
import { Button } from "@/components/ui/button";
import ToolRenderer from "@/components/ToolRenderer";
import ToolVisitTracker from "@/components/ToolVisitTracker";

// ── Static params (SSG) ───────────────────────────────────────────────────────
export async function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

// ── Per-page metadata ─────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return { title: "Tool Not Found" };

  return {
    title: `${tool.name} – Free Online Tool`,
    description: tool.metaDescription ?? tool.description,
    keywords: tool.keywords,
    openGraph: {
      title: `${tool.name} | QuickUtil`,
      description: tool.metaDescription ?? tool.description,
    },
  };
}

// ── Page component ────────────────────────────────────────────────────────────
export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  // ── Related tools ─────────────────────────────────────────────────────────
  const relatedTools = (() => {
    if (tool.relatedSlugs && tool.relatedSlugs.length > 0) {
      return tool.relatedSlugs
        .map((s) => getToolBySlug(s))
        .filter((t): t is NonNullable<typeof t> => t !== undefined)
        .slice(0, 3);
    }
    // Fallback: 3 tools from the same category (excluding current)
    return getToolsByCategory(tool.category)
      .filter((t) => t.slug !== tool.slug)
      .slice(0, 3);
  })();

  // ── Schema data ───────────────────────────────────────────────────────────
  const baseUrl = "https://quickutil.io";
  const toolUrl = `${baseUrl}/tools/${tool.slug}`;

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: tool.description,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Tools", item: `${baseUrl}/tools` },
      { "@type": "ListItem", position: 3, name: tool.name, item: toolUrl },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Is ${tool.name} free?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. No registration required.",
        },
      },
      {
        "@type": "Question",
        name: "Do my files get uploaded?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `No. ${tool.name} runs entirely in your browser. Nothing is sent to a server.`,
        },
      },
      {
        "@type": "Question",
        name: "Is there a file size limit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No artificial limits. Processing is limited only by your device's available memory.",
        },
      },
      {
        "@type": "Question",
        name: `Does ${tool.name} work offline?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, once the page is loaded, the tool works without an internet connection.",
        },
      },
    ],
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link href="/tools" className="hover:text-foreground transition-colors">
          Tools
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium text-foreground">{tool.name}</span>
      </nav>

      {/* Back button */}
      <div className="mb-6">
        <Link href="/tools">
          <Button variant="ghost" size="sm" className="gap-1 h-8 px-2">
            <ChevronLeft className="h-4 w-4" /> All Tools
          </Button>
        </Link>
      </div>

      {/* Tool header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold">{tool.name}</h1>
        <p className="mt-1 text-muted-foreground">{tool.description}</p>
      </div>

      {/* Top ad */}
      <div className="mb-6 flex justify-center">
        <AdSlot size="leaderboard" />
      </div>

      {/* Tool UI — client component handles ssr:false dynamic imports */}
      <div className="rounded-xl border border-border bg-card p-6">
        <ToolRenderer slug={slug} />
      </div>

      {/* Track visit for "Recently Used" on homepage */}
      <ToolVisitTracker slug={slug} />

      {/* Privacy badge */}
      <p className="mt-4 text-center text-xs text-muted-foreground">
        🔒 Processed locally — your data never leaves your device.
      </p>

      {/* How to Use */}
      <section className="mt-10" aria-labelledby="how-to-use-heading">
        <h2 id="how-to-use-heading" className="text-lg font-bold mb-4">
          How to Use {tool.name}
        </h2>
        <ol className="space-y-3">
          {[
            `Open the ${tool.name} tool on this page.`,
            "Enter your input — paste text, upload a file, or fill in the required fields.",
            "Get instant results processed entirely in your browser.",
            "Copy the output or download your file with one click.",
          ].map((step, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-sm text-muted-foreground leading-relaxed pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Bottom ad */}
      <div className="mt-8 flex justify-center">
        <AdSlot size="rectangle" />
      </div>

      {/* FAQ */}
      <section className="mt-10" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-lg font-bold mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {[
            {
              q: `Is ${tool.name} free?`,
              a: "Yes, completely free. No registration required.",
            },
            {
              q: "Do my files get uploaded?",
              a: `No. ${tool.name} runs entirely in your browser. Nothing is sent to a server.`,
            },
            {
              q: "Is there a file size limit?",
              a: "No artificial limits. Processing is limited only by your device's available memory.",
            },
            {
              q: `Does ${tool.name} work offline?`,
              a: "Yes, once the page is loaded, the tool works without an internet connection.",
            },
          ].map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-lg border border-border bg-card"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3 text-sm font-medium list-none select-none">
                {q}
                <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90 text-muted-foreground" />
              </summary>
              <p className="px-4 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed">
                {a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <section className="mt-10" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-lg font-bold mb-4">
            Related Tools
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {relatedTools.map((related) => (
              <Link
                key={related.slug}
                href={`/tools/${related.slug}`}
                className="tool-card group flex flex-col gap-2 animate-fade-in"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
                    {related.name}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                  {related.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Schema JSON-LD */}
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
    </div>
  );
}
