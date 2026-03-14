import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  mcpServers,
  MCP_CLIENT_META,
  type MCPClient,
} from "@/data/mcpServers";
import ServerCard from "@/components/mcp/ServerCard";

const CLIENT_SLUGS = Object.keys(MCP_CLIENT_META) as MCPClient[];

export function generateStaticParams() {
  return CLIENT_SLUGS.map((client) => ({ client }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ client: string }>;
}): Promise<Metadata> {
  const { client } = await params;
  if (!CLIENT_SLUGS.includes(client as MCPClient)) return { title: "Client Not Found" };
  const meta = MCP_CLIENT_META[client as MCPClient];
  const count = mcpServers.filter((s) => s.supportedClients.includes(client as MCPClient)).length;
  return {
    title: `${meta.label} MCP Servers — ${count} Compatible Servers | QuickUtil`,
    description: `${count} MCP servers compatible with ${meta.label}. Find install configs, step-by-step guides, and example prompts for every server.`,
    alternates: { canonical: `/mcp/client/${client}` },
  };
}

const CLIENT_DESCRIPTIONS: Record<MCPClient, { intro: string; configNote: string }> = {
  "claude-desktop": {
    intro:
      "Claude Desktop is the official desktop app from Anthropic for macOS and Windows. It has the most comprehensive MCP support of any client and was the first mainstream app to ship MCP integration.",
    configNote:
      "Restart Claude Desktop (Cmd+Q then reopen) after editing the config file for changes to take effect.",
  },
  cursor: {
    intro:
      "Cursor is an AI-first code editor built on VS Code. It supports both global MCP config (~/.cursor/mcp.json) and project-scoped config (.cursor/mcp.json in your project root).",
    configNote:
      "Cursor loads MCP servers when you open a project. Use the global config for servers you want available everywhere.",
  },
  windsurf: {
    intro:
      "Windsurf is an AI code editor built by Codeium. It supports MCP through a global config file and is compatible with most stdio-based MCP servers.",
    configNote:
      "Windsurf restarts servers automatically when the config file changes — no manual restart required.",
  },
  cline: {
    intro:
      "Cline is a VS Code extension (formerly Claude Dev) that adds an agentic AI assistant directly into your editor. It supports MCP via VS Code's settings.json under the cline.mcpServers key.",
    configNote:
      "Open VS Code settings (Cmd+,), search for 'cline', and edit the mcpServers JSON object directly in the settings UI or settings.json.",
  },
  continue: {
    intro:
      "Continue is an open-source AI coding assistant for VS Code and JetBrains. It supports MCP through its config.json file and has a rich plugin ecosystem.",
    configNote:
      "Edit ~/.continue/config.json and add servers under the tools array using the mcp type.",
  },
  zed: {
    intro:
      "Zed is a high-performance code editor with built-in AI (Zed AI). MCP support was added in 2025 and is configured through Zed's settings.json file.",
    configNote:
      "Open Zed settings (Cmd+,) and add mcpServers to your settings.json. Zed restarts MCP processes when settings change.",
  },
};

export default async function MCPClientPage({
  params,
}: {
  params: Promise<{ client: string }>;
}) {
  const { client } = await params;
  if (!CLIENT_SLUGS.includes(client as MCPClient)) notFound();

  const clientKey = client as MCPClient;
  const meta = MCP_CLIENT_META[clientKey];
  const info = CLIENT_DESCRIPTIONS[clientKey];
  const compatibleServers = mcpServers.filter((s) =>
    s.supportedClients.includes(clientKey)
  );

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
        <span className="font-medium text-foreground">{meta.label}</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          {meta.label} MCP Servers
        </h1>
        <p className="text-muted-foreground max-w-2xl mb-4">{info.intro}</p>

        {/* Config paths */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Config file location</p>
          <div className="space-y-1">
            <div className="flex items-start gap-2 text-sm">
              <span className="text-muted-foreground w-16 shrink-0">macOS</span>
              <code className="font-mono text-xs bg-muted rounded px-1.5 py-0.5">{meta.configPath.mac}</code>
            </div>
            {meta.configPath.windows && (
              <div className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground w-16 shrink-0">Windows</span>
                <code className="font-mono text-xs bg-muted rounded px-1.5 py-0.5">{meta.configPath.windows}</code>
              </div>
            )}
            {meta.configPath.linux && (
              <div className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground w-16 shrink-0">Linux</span>
                <code className="font-mono text-xs bg-muted rounded px-1.5 py-0.5">{meta.configPath.linux}</code>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground pt-1 border-t border-border">{info.configNote}</p>
        </div>
      </div>

      {/* Compatible servers */}
      <section aria-labelledby="servers-heading">
        <h2 id="servers-heading" className="text-xl font-bold mb-4">
          Compatible Servers ({compatibleServers.length})
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {compatibleServers.map((server) => (
            <ServerCard key={server.slug} server={server} />
          ))}
        </div>
      </section>

      {/* Other clients */}
      <div className="mt-12 rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold mb-3">Other MCP clients</p>
        <div className="flex flex-wrap gap-2">
          {CLIENT_SLUGS.filter((c) => c !== clientKey).map((c) => (
            <Link
              key={c}
              href={`/mcp/client/${c}`}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:border-primary/40 hover:text-primary transition-colors"
            >
              {MCP_CLIENT_META[c].label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
