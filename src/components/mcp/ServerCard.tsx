import Link from "next/link";
import { Star, Shield, ExternalLink } from "lucide-react";
import type { MCPServer } from "@/data/mcpServers";

interface Props {
  server: MCPServer;
}

export default function ServerCard({ server }: Props) {
  return (
    <Link
      href={`/mcp/server/${server.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-primary/5"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
              {server.name}
            </h3>
            {server.isOfficial && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400 shrink-0">
                <Shield className="h-3 w-3" />
                Official
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{server.tagline}</p>
        </div>
      </div>

      <p className="flex-1 text-xs text-muted-foreground leading-relaxed line-clamp-3">
        {server.description.slice(0, 120)}…
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {server.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-2">
          <Star className="h-3 w-3" />
          <span>{server.githubStars >= 1000 ? `${(server.githubStars / 1000).toFixed(1)}k` : server.githubStars}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
        <ExternalLink className="h-3 w-3" />
        View install guide
      </div>
    </Link>
  );
}
