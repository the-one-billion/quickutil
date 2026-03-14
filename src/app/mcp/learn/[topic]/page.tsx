import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock } from "lucide-react";
import {
  mcpLearnTopics,
  getMCPLearnTopicBySlug,
} from "@/data/mcpLearnTopics";

export function generateStaticParams() {
  return mcpLearnTopics.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  const t = getMCPLearnTopicBySlug(topic);
  if (!t) return { title: "Guide Not Found" };
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: { canonical: `/mcp/learn/${t.slug}` },
  };
}

export default async function MCPLearnTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  const t = getMCPLearnTopicBySlug(topic);
  if (!t) notFound();

  const topicIndex = mcpLearnTopics.findIndex((x) => x.slug === t.slug);
  const prev = topicIndex > 0 ? mcpLearnTopics[topicIndex - 1] : null;
  const next =
    topicIndex < mcpLearnTopics.length - 1 ? mcpLearnTopics[topicIndex + 1] : null;

  const related = t.relatedSlugs
    .map((s) => getMCPLearnTopicBySlug(s))
    .filter(Boolean) as typeof mcpLearnTopics;

  const BASE = "https://quickutil.io";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: t.headline,
    description: t.metaDescription,
    url: `${BASE}/mcp/learn/${t.slug}`,
    author: { "@type": "Organization", name: "QuickUtil" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link href="/mcp" className="hover:text-foreground transition-colors">MCP Hub</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link href="/mcp/learn" className="hover:text-foreground transition-colors">Learn</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-foreground">{t.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">{t.headline}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{t.readingTimeMin} min read</span>
          </div>
          <p className="mt-4 text-muted-foreground leading-relaxed">{t.intro}</p>
        </div>

        {/* Article sections */}
        <div className="space-y-8 mb-10">
          {t.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-bold mb-3">{section.heading}</h2>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        {/* FAQ */}
        {t.faq.length > 0 && (
          <section aria-labelledby="faq-heading" className="mb-10">
            <h2 id="faq-heading" className="text-xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {t.faq.map((item, i) => (
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
        )}

        {/* Prev / Next */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          {prev ? (
            <Link
              href={`/mcp/learn/${prev.slug}`}
              className="group rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <p className="text-xs text-muted-foreground mb-1">← Previous</p>
              <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                {prev.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/mcp/learn/${next.slug}`}
              className="group rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:bg-primary/5 transition-colors text-right"
            >
              <p className="text-xs text-muted-foreground mb-1">Next →</p>
              <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                {next.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Related guides */}
        {related.length > 0 && (
          <section aria-labelledby="related-guides-heading" className="mb-10">
            <h2 id="related-guides-heading" className="text-xl font-bold mb-4">
              Related Guides
            </h2>
            <div className="space-y-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/mcp/learn/${r.slug}`}
                  className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {r.title}
                  </p>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {r.readingTimeMin} min
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-sm font-medium mb-2">Ready to install your first server?</p>
          <Link
            href="/mcp/servers"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Browse MCP Servers
          </Link>
        </div>
      </div>
    </>
  );
}
