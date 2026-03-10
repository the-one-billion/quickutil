"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { History } from "lucide-react";
import { tools } from "@/lib/tools";

export default function RecentlyUsedStrip() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("qu_recent") ?? "[]");
      if (Array.isArray(stored) && stored.length > 0) setSlugs(stored.slice(0, 6));
    } catch {}
  }, []);

  const recentTools = slugs
    .map(s => tools.find(t => t.slug === s))
    .filter((t): t is NonNullable<typeof t> => !!t);

  if (!recentTools.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 pb-2 sm:px-6">
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">Pick up where you left off</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {recentTools.map(tool => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium hover:border-primary/50 hover:bg-accent transition-colors"
          >
            {tool.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
