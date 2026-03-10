import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FileText,
  ImageIcon,
  Calculator,
  Type,
  ArrowLeftRight,
  Sparkles,
  Lock,
  Code2,
  Heart,
  DollarSign,
  Sigma,
  ChevronRight,
} from "lucide-react";
import { getToolsByCategory } from "@/lib/tools";
import { categoryContent, getCategoryBySlug } from "@/data/categoryContent";
import ToolCard from "@/components/ToolCard";

// ── Icon map ──────────────────────────────────────────────────────────────────
const iconMap: Record<string, React.ElementType> = {
  FileText,
  ImageIcon,
  Calculator,
  Type,
  ArrowLeftRight,
  Sparkles,
  Lock,
  Code2,
  Heart,
  DollarSign,
  Sigma,
};

// ── Static params ─────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return categoryContent.map((c) => ({ category: c.slug }));
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const content = getCategoryBySlug(category);
  if (!content) return { title: "Category Not Found" };

  return {
    title: content.metaTitle,
    description: content.metaDescription,
    keywords: content.keywords,
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url: `https://quickutil.io/categories/${content.slug}`,
    },
    alternates: {
      canonical: `https://quickutil.io/categories/${content.slug}`,
    },
  };
}

// ── FAQ Accordion (server-safe, CSS-only) ─────────────────────────────────────
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const id = `faq-${index}`;
  return (
    <details
      className="group rounded-lg border border-border bg-card px-5 py-1 open:pb-4"
      name="faq"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-semibold select-none">
        <span>{q}</span>
        <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90 text-muted-foreground" />
      </summary>
      <p id={id} className="text-sm text-muted-foreground leading-relaxed pt-1">
        {a}
      </p>
    </details>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const content = getCategoryBySlug(category);
  if (!content) notFound();

  const Icon = iconMap[content.iconName] ?? FileText;
  const categoryTools = getToolsByCategory(content.category);
  const relatedCategories = categoryContent.filter((c) =>
    content.relatedCategories.includes(c.slug)
  );

  // ── JSON-LD schemas ─────────────────────────────────────────────────────────
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://quickutil.io",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: "https://quickutil.io/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: content.name,
        item: `https://quickutil.io/categories/${content.slug}`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    })),
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: content.name,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: content.metaDescription,
    url: `https://quickutil.io/categories/${content.slug}`,
  };

  return (
    <>
      {/* ── Schema markup ────────────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/tools" className="hover:text-foreground transition-colors">
            Tools
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-foreground">{content.name}</span>
        </nav>

        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${content.bgColor}`}
            >
              <Icon className={`h-6 w-6 ${content.color}`} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {content.headline}
            </h1>
          </div>

          <p className="mt-3 max-w-3xl text-base text-muted-foreground leading-relaxed">
            {content.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className={`h-1.5 w-1.5 rounded-full ${content.color.replace("text-", "bg-")}`} />
              {categoryTools.length} {categoryTools.length === 1 ? "tool" : "tools"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              100% free
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              No upload
            </span>
          </div>
        </section>

        {/* ── Tools grid ─────────────────────────────────────────────────────── */}
        <section className="mb-14" aria-labelledby="tools-heading">
          <h2
            id="tools-heading"
            className="mb-5 text-xl font-bold tracking-tight"
          >
            All {content.name}
          </h2>

          {categoryTools.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {categoryTools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No tools in this category yet. Check back soon.
            </p>
          )}
        </section>

        {/* ── About / long description ────────────────────────────────────────── */}
        <section
          className="mb-14 rounded-xl border border-border bg-card p-6 sm:p-8"
          aria-labelledby="about-heading"
        >
          <h2
            id="about-heading"
            className="mb-4 text-xl font-bold tracking-tight"
          >
            About {content.name}
          </h2>
          <div className="space-y-4">
            {content.longDescription
              .trim()
              .split("\n\n")
              .map((paragraph, i) => (
                <p
                  key={i}
                  className="text-sm text-muted-foreground leading-relaxed"
                >
                  {paragraph.trim()}
                </p>
              ))}
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────────────────── */}
        <section className="mb-14" aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="mb-5 text-xl font-bold tracking-tight"
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {content.faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </section>

        {/* ── Related categories ─────────────────────────────────────────────── */}
        {relatedCategories.length > 0 && (
          <section aria-labelledby="related-heading">
            <h2
              id="related-heading"
              className="mb-5 text-xl font-bold tracking-tight"
            >
              Related Tool Categories
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {relatedCategories.map((related) => {
                const RelatedIcon = iconMap[related.iconName] ?? FileText;
                return (
                  <Link
                    key={related.slug}
                    href={`/categories/${related.slug}`}
                    className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${related.bgColor}`}
                    >
                      <RelatedIcon className={`h-5 w-5 ${related.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                        {related.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {getToolsByCategory(related.category).length} tools
                      </p>
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
