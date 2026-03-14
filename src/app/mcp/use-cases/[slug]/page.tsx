import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, CheckCircle } from "lucide-react";
import { mcpUseCases, getMCPUseCaseBySlug } from "@/data/mcpUseCases";
import { getMCPServerBySlug } from "@/data/mcpServers";
import ExamplePrompts from "@/components/mcp/ExamplePrompts";
import ServerCard from "@/components/mcp/ServerCard";

export function generateStaticParams() {
  return mcpUseCases.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const uc = getMCPUseCaseBySlug(slug);
  if (!uc) return { title: "Use Case Not Found" };
  return {
    title: uc.metaTitle,
    description: uc.metaDescription,
    alternates: { canonical: `/mcp/use-cases/${uc.slug}` },
  };
}

const DIFFICULTY_COLOR = {
  beginner: "bg-green-500/10 text-green-700 dark:text-green-400",
  intermediate: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  advanced: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export default async function MCPUseCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const uc = getMCPUseCaseBySlug(slug);
  if (!uc) notFound();

  const servers = uc.serversNeeded
    .map((s) => getMCPServerBySlug(s))
    .filter(Boolean) as NonNullable<ReturnType<typeof getMCPServerBySlug>>[];

  const related = uc.relatedSlugs
    .map((s) => getMCPUseCaseBySlug(s))
    .filter(Boolean) as typeof mcpUseCases;

  const BASE = "https://quickutil.io";

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: uc.headline,
    description: uc.metaDescription,
    url: `${BASE}/mcp/use-cases/${uc.slug}`,
    step: uc.steps.map((s) => ({
      "@type": "HowToStep",
      name: s.heading,
      text: s.body,
    })),
  };

  const faqSchema = uc.faq.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: uc.faq.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

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
          <Link href="/mcp/use-cases" className="hover:text-foreground transition-colors">Use Cases</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-foreground">{uc.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-3xl font-extrabold tracking-tight">{uc.headline}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${DIFFICULTY_COLOR[uc.difficulty]}`}
            >
              {uc.difficulty}
            </span>
            <span className="text-xs text-muted-foreground">Setup time: {uc.timeToSetup}</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">{uc.intro}</p>
        </div>

        {/* Servers needed */}
        {servers.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">Servers You&apos;ll Need</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {servers.map((server) => (
                <ServerCard key={server.slug} server={server} />
              ))}
            </div>
          </section>
        )}

        {/* Steps */}
        <section aria-labelledby="steps-heading" className="mb-10">
          <h2 id="steps-heading" className="text-xl font-bold mb-4">
            Step-by-Step Setup
          </h2>
          <ol className="space-y-4">
            {uc.steps.map((step, i) => (
              <li
                key={i}
                className="flex gap-4 rounded-xl border border-border bg-card p-5"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold mb-1">{step.heading}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Example prompts */}
        <section aria-labelledby="prompts-heading" className="mb-10">
          <h2 id="prompts-heading" className="text-xl font-bold mb-4">
            Example Prompts to Try
          </h2>
          <ExamplePrompts prompts={uc.examplePrompts} />
        </section>

        {/* Tips */}
        {uc.tips.length > 0 && (
          <section aria-labelledby="tips-heading" className="mb-10">
            <h2 id="tips-heading" className="text-xl font-bold mb-4">Tips</h2>
            <ul className="space-y-2">
              {uc.tips.map((tip) => (
                <li key={tip} className="flex items-start gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ */}
        {uc.faq.length > 0 && (
          <section aria-labelledby="faq-heading" className="mb-10">
            <h2 id="faq-heading" className="text-xl font-bold mb-4">FAQ</h2>
            <div className="space-y-4">
              {uc.faq.map((item, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-semibold text-sm mb-2">{item.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related use cases */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mb-10">
            <h2 id="related-heading" className="text-xl font-bold mb-4">
              Related Use Cases
            </h2>
            <div className="space-y-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/mcp/use-cases/${r.slug}`}
                  className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {r.title}
                  </p>
                  <span className="text-xs text-muted-foreground capitalize shrink-0 ml-2">
                    {r.difficulty}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-center">
          <Link href="/mcp/use-cases" className="font-medium text-primary hover:underline">
            ← Browse all use cases
          </Link>
        </div>
      </div>
    </>
  );
}
