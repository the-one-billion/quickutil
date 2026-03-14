import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { mcpServers } from "@/data/mcpServers";
import { mcpCategoryDefs } from "@/data/mcpCategories";
import ServerCard from "@/components/mcp/ServerCard";

export const metadata: Metadata = {
  title: `${mcpServers.length} MCP Servers — Browse All Model Context Protocol Servers | QuickUtil`,
  description: `Browse all ${mcpServers.length} MCP servers for Claude, Cursor, Windsurf, and more. Filter by category, find install configs, and get step-by-step setup guides.`,
  alternates: { canonical: "/mcp/servers" },
};

export default function MCPServersPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground"
      >
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link href="/mcp" className="hover:text-foreground transition-colors">MCP Hub</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium text-foreground">All Servers</span>
      </nav>

      <h1 className="text-3xl font-extrabold tracking-tight mb-2">
        MCP Server Directory
      </h1>
      <p className="mb-10 text-muted-foreground">
        {mcpServers.length} servers across {mcpCategoryDefs.length} categories — all with install
        configs for Claude Desktop, Cursor, Windsurf, and more.
      </p>

      {/* Category sections */}
      <div className="space-y-12">
        {mcpCategoryDefs.map((cat) => {
          const servers = mcpServers.filter((s) => s.category === cat.id);
          if (servers.length === 0) return null;
          return (
            <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
              <div className="mb-4 flex items-center gap-3">
                <span className={`rounded-lg ${cat.color} p-2 text-xl`}>{cat.icon}</span>
                <div>
                  <h2
                    id={`cat-${cat.id}`}
                    className="text-xl font-bold"
                  >
                    <Link
                      href={`/mcp/category/${cat.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {cat.label}
                    </Link>
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({servers.length} servers)
                    </span>
                  </h2>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {servers.map((server) => (
                  <ServerCard key={server.slug} server={server} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
