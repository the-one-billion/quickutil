import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Zap, Server, ChevronRight } from "lucide-react";
import { mcpServers } from "@/data/mcpServers";
import { mcpCategoryDefs } from "@/data/mcpCategories";
import { mcpLearnTopics } from "@/data/mcpLearnTopics";
import { mcpUseCases } from "@/data/mcpUseCases";
import ServerCard from "@/components/mcp/ServerCard";

export const metadata: Metadata = {
  title: "MCP Hub — Model Context Protocol Servers, Guides & Use Cases | QuickUtil",
  description:
    "Discover MCP servers for Claude, Cursor, and Windsurf. Browse install-ready servers, learn how MCP works, and find step-by-step use case guides — all in one place.",
  alternates: { canonical: "/mcp" },
};

const FEATURED_SLUGS = ["filesystem", "github", "postgres", "memory", "brave-search", "notion"];

export default function MCPHubPage() {
  const featuredServers = FEATURED_SLUGS.map((s) =>
    mcpServers.find((srv) => srv.slug === s)
  ).filter(Boolean) as typeof mcpServers;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground"
      >
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium text-foreground">MCP Hub</span>
      </nav>

      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">
          MCP Hub
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Everything you need to get started with the Model Context Protocol — from
          beginner guides to production-ready server installs.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/mcp/servers"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Server className="h-4 w-4" />
            Browse {mcpServers.length} Servers
          </Link>
          <Link
            href="/mcp/learn/what-is-mcp"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:border-primary/50 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            What is MCP?
          </Link>
          <Link
            href="/mcp/learn/getting-started"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:border-primary/50 transition-colors"
          >
            <Zap className="h-4 w-4" />
            Quick Start Guide
          </Link>
        </div>
      </div>

      {/* Featured servers */}
      <section aria-labelledby="featured-heading" className="mb-14">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="featured-heading" className="text-xl font-bold">
            Popular Servers
          </h2>
          <Link
            href="/mcp/servers"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredServers.map((server) => (
            <ServerCard key={server.slug} server={server} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section aria-labelledby="categories-heading" className="mb-14">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="categories-heading" className="text-xl font-bold">
            Browse by Category
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
          {mcpCategoryDefs.map((cat) => {
            const count = mcpServers.filter((s) => s.category === cat.id).length;
            return (
              <Link
                key={cat.id}
                href={`/mcp/category/${cat.id}`}
                className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <span className={`rounded-lg ${cat.color} p-2 text-lg shrink-0`}>{cat.icon}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {cat.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {cat.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{count} servers</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Learn & Use Cases — two columns */}
      <div className="grid gap-8 sm:grid-cols-2 mb-14">
        {/* Learn */}
        <section aria-labelledby="learn-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="learn-heading" className="text-xl font-bold">
              Learn MCP
            </h2>
            <Link
              href="/mcp/learn"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              All guides <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="space-y-2">
            {mcpLearnTopics.map((topic) => (
              <li key={topic.slug}>
                <Link
                  href={`/mcp/learn/${topic.slug}`}
                  className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      {topic.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {topic.readingTimeMin} min read
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Use Cases */}
        <section aria-labelledby="usecases-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="usecases-heading" className="text-xl font-bold">
              Use Cases
            </h2>
            <Link
              href="/mcp/use-cases"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              All use cases <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="space-y-2">
            {mcpUseCases.map((uc) => (
              <li key={uc.slug}>
                <Link
                  href={`/mcp/use-cases/${uc.slug}`}
                  className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      {uc.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                      {uc.difficulty} · {uc.timeToSetup}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* CTA strip */}
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <h2 className="font-bold text-lg mb-1">New to MCP?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Start with the Getting Started guide — you&apos;ll have your first server running in 10
          minutes.
        </p>
        <Link
          href="/mcp/learn/getting-started"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Get started <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
