import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getToolBySlug, tools } from "@/lib/tools";
import AdSlot from "@/components/AdSlot";
import { Button } from "@/components/ui/button";
import ToolRenderer from "@/components/ToolRenderer";

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/tools">
          <Button variant="ghost" size="sm" className="gap-1 h-8 px-2">
            <ChevronLeft className="h-4 w-4" /> All Tools
          </Button>
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{tool.name}</span>
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

      {/* Bottom ad */}
      <div className="mt-8 flex justify-center">
        <AdSlot size="rectangle" />
      </div>

      {/* Privacy note */}
      <p className="mt-4 text-center text-xs text-muted-foreground">
        🔒 All processing happens in your browser. Your files are never uploaded.
      </p>
    </div>
  );
}
