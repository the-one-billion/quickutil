import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Star, Shield, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import {
  mcpServers,
  getMCPServerBySlug,
  getRelatedMCPServers,
  MCP_CLIENT_META,
} from "@/data/mcpServers";
import { getMCPCategoryDef } from "@/data/mcpCategories";
import { mcpUseCases } from "@/data/mcpUseCases";
import ClientConfigBlock from "@/components/mcp/ClientConfigBlock";
import ExamplePrompts from "@/components/mcp/ExamplePrompts";
import ServerCard from "@/components/mcp/ServerCard";

export function generateStaticParams() {
  return mcpServers.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const server = getMCPServerBySlug(slug);
  if (!server) return { title: "Server Not Found" };
  return {
    title: `${server.name} — MCP Install Guide & Config | QuickUtil`,
    description: server.tagline + `. Install config for Claude Desktop, Cursor, Windsurf, and more. ${server.tools.length} tools included.`,
    alternates: { canonical: `/mcp/server/${server.slug}` },
  };
}

export default async function MCPServerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const server = getMCPServerBySlug(slug);
  if (!server) notFound();

  const catDef = getMCPCategoryDef(server.category);
  const related = getRelatedMCPServers(server, 3);
  const linkedUseCases = mcpUseCases.filter((uc) =>
    server.useCaseSlugs.includes(uc.slug)
  );

  const BASE = "https://quickutil.io";

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: server.name,
    description: server.description,
    url: `${BASE}/mcp/server/${server.slug}`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    license: server.license,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "MCP Hub", item: `${BASE}/mcp` },
      { "@type": "ListItem", position: 3, name: "Servers", item: `${BASE}/mcp/servers` },
      { "@type": "ListItem", position: 4, name: server.name },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
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
          {catDef && (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              <Link
                href={`/mcp/category/${server.category}`}
                className="hover:text-foreground transition-colors"
              >
                {catDef.label}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-foreground">{server.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-3xl font-extrabold tracking-tight">{server.name}</h1>
            {server.isOfficial && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                <Shield className="h-3.5 w-3.5" />
                Official
              </span>
            )}
          </div>
          <p className="text-lg text-muted-foreground mb-4">{server.tagline}</p>

          <div className="flex flex-wrap gap-3">
            {server.githubUrl && (
              <a
                href={server.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm hover:border-primary/50 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                GitHub
                <span className="flex items-center gap-0.5 text-muted-foreground">
                  <Star className="h-3 w-3" />
                  {server.githubStars >= 1000
                    ? `${(server.githubStars / 1000).toFixed(1)}k`
                    : server.githubStars}
                </span>
              </a>
            )}
            <div className="flex flex-wrap gap-1.5 items-center">
              {server.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <section className="mb-10">
          <p className="text-sm leading-relaxed text-muted-foreground">{server.description}</p>
        </section>

        {/* Install config */}
        <section aria-labelledby="install-heading" className="mb-10">
          <h2 id="install-heading" className="mb-4 text-xl font-bold">
            Install Config
          </h2>
          <ClientConfigBlock server={server} />
        </section>

        {/* Tools */}
        <section aria-labelledby="tools-heading" className="mb-10">
          <h2 id="tools-heading" className="mb-4 text-xl font-bold">
            Available Tools ({server.tools.length})
          </h2>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold w-1/3">Tool name</th>
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {server.tools.map((tool, i) => (
                  <tr
                    key={tool.name}
                    className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs font-medium">{tool.name}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{tool.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Example prompts */}
        <section aria-labelledby="prompts-heading" className="mb-10">
          <h2 id="prompts-heading" className="mb-4 text-xl font-bold">
            Example Prompts
          </h2>
          <ExamplePrompts prompts={server.examplePrompts} />
        </section>

        {/* Pros & Cons */}
        <section aria-labelledby="proscons-heading" className="mb-10">
          <h2 id="proscons-heading" className="mb-4 text-xl font-bold">
            Pros &amp; Cons
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-green-600 dark:text-green-400 mb-3">
                Pros
              </p>
              <ul className="space-y-2">
                {server.pros.map((pro) => (
                  <li key={pro} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400 mb-3">
                Cons
              </p>
              <ul className="space-y-2">
                {server.cons.map((con) => (
                  <li key={con} className="flex items-start gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Who is it for */}
        <section aria-labelledby="who-heading" className="mb-10">
          <h2 id="who-heading" className="mb-4 text-xl font-bold">
            Who Is This For?
          </h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <ul className="space-y-2">
              {server.whoIsItFor.map((who) => (
                <li key={who} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-bold mt-0.5">·</span>
                  <span>{who}</span>
                </li>
              ))}
            </ul>
            {server.whenToUse && (
              <p className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">When to use: </span>
                {server.whenToUse}
              </p>
            )}
          </div>
        </section>

        {/* Supported clients */}
        <section aria-labelledby="clients-heading" className="mb-10">
          <h2 id="clients-heading" className="mb-4 text-xl font-bold">
            Supported Clients
          </h2>
          <div className="flex flex-wrap gap-2">
            {server.supportedClients.map((client) => (
              <Link
                key={client}
                href={`/mcp/client/${client}`}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                {MCP_CLIENT_META[client].label}
              </Link>
            ))}
          </div>
        </section>

        {/* Use case links */}
        {linkedUseCases.length > 0 && (
          <section aria-labelledby="usecases-heading" className="mb-10">
            <h2 id="usecases-heading" className="mb-4 text-xl font-bold">
              Related Use Cases
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {linkedUseCases.map((uc) => (
                <Link
                  key={uc.slug}
                  href={`/mcp/use-cases/${uc.slug}`}
                  className="group rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">
                    {uc.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                    {uc.difficulty} · {uc.timeToSetup}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related servers */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mb-10">
            <h2 id="related-heading" className="mb-4 text-xl font-bold">
              Related Servers
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s) => (
                <ServerCard key={s.slug} server={s} />
              ))}
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-center">
          <Link href="/mcp/servers" className="font-medium text-primary hover:underline">
            ← Browse all {mcpServers.length} MCP servers
          </Link>
        </div>
      </div>
    </>
  );
}
