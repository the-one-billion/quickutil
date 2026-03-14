import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { mcpUseCases } from "@/data/mcpUseCases";

export const metadata: Metadata = {
  title: "MCP Use Cases — Step-by-Step AI Workflow Guides | QuickUtil",
  description:
    "Step-by-step guides for real MCP use cases: query databases with AI, automate GitHub, scrape the web, manage Notion, and more.",
  alternates: { canonical: "/mcp/use-cases" },
};

const DIFFICULTY_COLOR = {
  beginner: "bg-green-500/10 text-green-700 dark:text-green-400",
  intermediate: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  advanced: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export default function MCPUseCasesPage() {
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
        <span className="font-medium text-foreground">Use Cases</span>
      </nav>

      <h1 className="text-3xl font-extrabold tracking-tight mb-2">MCP Use Cases</h1>
      <p className="mb-10 text-muted-foreground">
        {mcpUseCases.length} step-by-step guides showing what you can actually do with MCP servers
        in your workflow.
      </p>

      <ul className="space-y-4">
        {mcpUseCases.map((uc) => (
          <li key={uc.slug}>
            <Link
              href={`/mcp/use-cases/${uc.slug}`}
              className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-semibold group-hover:text-primary transition-colors">
                    {uc.title}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${DIFFICULTY_COLOR[uc.difficulty]}`}
                  >
                    {uc.difficulty}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{uc.intro}</p>
                <p className="mt-2 text-xs text-muted-foreground">Setup: {uc.timeToSetup}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
