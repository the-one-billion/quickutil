"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { MCPServer, MCPClient } from "@/data/mcpServers";

const CLIENT_LABELS: Record<MCPClient, string> = {
  "claude-desktop": "Claude Desktop",
  cursor: "Cursor",
  windsurf: "Windsurf",
  cline: "Cline",
  continue: "Continue",
  zed: "Zed",
};

const CONFIG_PATHS: Record<MCPClient, { mac: string; windows?: string }> = {
  "claude-desktop": {
    mac: "~/Library/Application Support/Claude/claude_desktop_config.json",
    windows: "%APPDATA%\\Claude\\claude_desktop_config.json",
  },
  cursor: {
    mac: "~/.cursor/mcp.json",
    windows: "%USERPROFILE%\\.cursor\\mcp.json",
  },
  windsurf: {
    mac: "~/.codeium/windsurf/mcp_config.json",
  },
  cline: {
    mac: "VS Code settings.json → cline.mcpServers",
  },
  continue: {
    mac: "~/.continue/config.json",
  },
  zed: {
    mac: "~/.config/zed/settings.json",
  },
};

function buildConfig(client: MCPClient, server: MCPServer): string {
  const key = server.slug;
  const serverBlock = {
    command: server.installConfig.command,
    args: server.installConfig.args,
    ...(server.installConfig.env && Object.keys(server.installConfig.env).length > 0
      ? { env: server.installConfig.env }
      : {}),
  };

  if (client === "cline") {
    return JSON.stringify(
      {
        "cline.mcpServers": {
          [key]: serverBlock,
        },
      },
      null,
      2
    );
  }

  if (client === "continue") {
    return JSON.stringify(
      {
        tools: [
          {
            type: "mcp",
            name: key,
            ...serverBlock,
          },
        ],
      },
      null,
      2
    );
  }

  return JSON.stringify(
    {
      mcpServers: {
        [key]: serverBlock,
      },
    },
    null,
    2
  );
}

interface Props {
  server: MCPServer;
}

export default function ClientConfigBlock({ server }: Props) {
  const availableClients = server.supportedClients;
  const [activeClient, setActiveClient] = useState<MCPClient>(
    availableClients[0] ?? "claude-desktop"
  );
  const [copied, setCopied] = useState(false);

  const config = buildConfig(activeClient, server);
  const paths = CONFIG_PATHS[activeClient];

  async function handleCopy() {
    await navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Client tabs */}
      <div className="flex flex-wrap gap-px border-b border-border bg-muted/40">
        {availableClients.map((client) => (
          <button
            key={client}
            onClick={() => setActiveClient(client)}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              activeClient === client
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {CLIENT_LABELS[client]}
          </button>
        ))}
      </div>

      {/* Config file path */}
      <div className="border-b border-border bg-muted/20 px-4 py-2">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Config file: </span>
          <code className="font-mono">{paths.mac}</code>
          {paths.windows && (
            <span className="ml-2 text-muted-foreground/60">
              · Windows: <code className="font-mono">{paths.windows}</code>
            </span>
          )}
        </p>
      </div>

      {/* JSON block */}
      <div className="relative bg-muted/30">
        <button
          onClick={handleCopy}
          className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-background border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <pre className="overflow-x-auto p-4 text-xs font-mono leading-relaxed pr-20">
          <code>{config}</code>
        </pre>
      </div>

      {/* Env vars reminder */}
      {server.envVars.filter((e) => e.required).length > 0 && (
        <div className="border-t border-border bg-amber-500/5 px-4 py-3">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
            Required environment variables:
          </p>
          <ul className="space-y-1">
            {server.envVars
              .filter((e) => e.required)
              .map((v) => (
                <li key={v.name} className="text-xs text-muted-foreground">
                  <code className="font-mono font-medium text-foreground">{v.name}</code>
                  {" — "}{v.description}
                  <span className="ml-1 text-muted-foreground/60">(e.g. {v.example})</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
