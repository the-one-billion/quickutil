import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { mcpCategoryDefs, getMCPCategoryDef } from "@/data/mcpCategories";
import { mcpServers, getMCPServersByCategory } from "@/data/mcpServers";
import ServerCard from "@/components/mcp/ServerCard";

export function generateStaticParams() {
  return mcpCategoryDefs.map((c) => ({ category: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getMCPCategoryDef(category as never);
  if (!cat) return { title: "Category Not Found" };
  const servers = getMCPServersByCategory(category as never);
  return {
    title: `${cat.label} MCP Servers — ${servers.length} Servers for Claude & Cursor | QuickUtil`,
    description: cat.longDescription,
    alternates: { canonical: `/mcp/category/${cat.id}` },
  };
}

export default async function MCPCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getMCPCategoryDef(category as never);
  if (!cat) notFound();

  const servers = getMCPServersByCategory(category as never);
  if (servers.length === 0) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
      >
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link href="/mcp" className="hover:text-foreground transition-colors">MCP Hub</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link href="/mcp/servers" className="hover:text-foreground transition-colors">Servers</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium text-foreground">{cat.label}</span>
      </nav>

      {/* Header */}
      <div className="mb-10 flex items-start gap-4">
        <span className={`rounded-xl ${cat.color} p-3 text-3xl shrink-0`}>{cat.icon}</span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">{cat.label} MCP Servers</h1>
          <p className="text-muted-foreground max-w-2xl">{cat.longDescription}</p>
        </div>
      </div>

      {/* Server grid */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {servers.map((server) => (
          <ServerCard key={server.slug} server={server} />
        ))}
      </div>

      {/* Other categories */}
      <section aria-labelledby="other-cats-heading" className="mb-4">
        <h2 id="other-cats-heading" className="mb-4 text-xl font-bold">
          Other Categories
        </h2>
        <div className="flex flex-wrap gap-2">
          {mcpCategoryDefs
            .filter((c) => c.id !== cat.id)
            .map((c) => {
              const count = mcpServers.filter((s) => s.category === c.id).length;
              return (
                <Link
                  key={c.id}
                  href={`/mcp/category/${c.id}`}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <span>{c.icon}</span>
                  <span className="font-medium">{c.label}</span>
                  <span className="text-muted-foreground text-xs">({count})</span>
                </Link>
              );
            })}
        </div>
      </section>
    </div>
  );
}
