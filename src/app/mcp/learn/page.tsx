import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { mcpLearnTopics } from "@/data/mcpLearnTopics";

export const metadata: Metadata = {
  title: "Learn MCP — Model Context Protocol Guides & Tutorials | QuickUtil",
  description:
    "Free guides to understanding the Model Context Protocol. Learn what MCP is, how it works, how to set it up, and how to build your own servers.",
  alternates: { canonical: "/mcp/learn" },
};

export default function MCPLearnPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground"
      >
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link href="/mcp" className="hover:text-foreground transition-colors">MCP Hub</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium text-foreground">Learn</span>
      </nav>

      <h1 className="text-3xl font-extrabold tracking-tight mb-2">Learn MCP</h1>
      <p className="mb-10 text-muted-foreground">
        {mcpLearnTopics.length} guides covering everything from &ldquo;What is MCP?&rdquo; to
        building your own server.
      </p>

      <ul className="space-y-3">
        {mcpLearnTopics.map((topic, i) => (
          <li key={topic.slug}>
            <Link
              href={`/mcp/learn/${topic.slug}`}
              className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <span className="text-xl font-bold text-muted-foreground/40 w-6 shrink-0 mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold group-hover:text-primary transition-colors">
                  {topic.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{topic.intro}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{topic.readingTimeMin} min read</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
