"use client";
import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ToolCard from "@/components/ToolCard";
import AdSlot from "@/components/AdSlot";
import { tools, categories, searchTools, type ToolCategory } from "@/lib/tools";
import { cn } from "@/lib/cn";

export default function ToolsPage() {
  const [query,           setQuery]           = useState("");
  const [activeCategory,  setActiveCategory]  = useState<ToolCategory | "All">("All");

  const filtered = useMemo(() => {
    const searched = searchTools(query);
    if (activeCategory === "All") return searched;
    return searched.filter((t) => t.category === activeCategory);
  }, [query, activeCategory]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          All Tools
        </h1>
        <p className="mt-2 text-muted-foreground">
          {tools.length} free tools · 100% browser-side · no signup needed
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground mr-1" />
          <span className="text-sm text-muted-foreground mr-2 hidden sm:block">Filter:</span>
          {/* All */}
          <Button
            variant={activeCategory === "All" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("All")}
          >
            All
          </Button>
        </div>
      </div>

      {/* Category pills row */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat === activeCategory ? "All" : cat)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
              activeCategory === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary/50 hover:bg-accent text-muted-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Ad slot */}
      <div className="mb-8 flex justify-center">
        <AdSlot size="leaderboard" adClient="ca-pub-5463169058698651" />
      </div>

      {/* Tools grid */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No tools found for &ldquo;{query}&rdquo;</p>
          <p className="text-sm mt-1">Try a different keyword or browse all categories.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => { setQuery(""); setActiveCategory("All"); }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((tool, i) => (
            <>
              <ToolCard key={tool.slug} tool={tool} />
              {/* Inject a rectangle ad every 12 cards */}
              {(i + 1) % 12 === 0 && i < filtered.length - 1 && (
                <div
                  key={`ad-${i}`}
                  className="col-span-full flex justify-center py-2"
                >
                  <AdSlot size="rectangle" adClient="ca-pub-5463169058698651" />
                </div>
              )}
            </>
          ))}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Showing {filtered.length} of {tools.length} tools
      </p>
    </div>
  );
}
