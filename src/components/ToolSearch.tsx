"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { tools } from "@/lib/tools";

const POPULAR_QUERIES = [
  "PDF merge", "image compress", "password generator",
  "JSON format", "word count", "BMI calculator",
];

export default function ToolSearch() {
  const [query, setQuery]   = useState("");
  const [open, setOpen]     = useState(false);
  const [active, setActive] = useState(-1);
  const router       = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);

  const results = query.trim().length >= 1
    ? tools.filter(t => {
        const q = query.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.keywords.some(k => k.toLowerCase().includes(q))
        );
      }).slice(0, 7)
    : [];

  const navigate = useCallback((slug: string) => {
    setQuery(""); setOpen(false);
    router.push(`/tools/${slug}`);
  }, [router]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown")  { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    if (e.key === "ArrowUp")    { e.preventDefault(); setActive(a => Math.max(a - 1, -1)); }
    if (e.key === "Enter" && active >= 0 && results[active]) navigate(results[active].slug);
    if (e.key === "Enter" && (active < 0) && results.length > 0) navigate(results[0].slug);
    if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      {/* Search input + dropdown anchored together */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={`Search ${tools.length}+ tools… e.g. compress PDF, word count`}
          className={`w-full border border-border py-3.5 pl-11 pr-4 text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground ${open && results.length > 0 ? "rounded-t-xl rounded-b-none" : "rounded-xl"}`}
          style={{ backgroundColor: "hsl(var(--background))" }}
          aria-label="Search tools"
          aria-autocomplete="list"
          aria-expanded={open && results.length > 0}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Dropdown anchored directly to the input wrapper */}
        {open && results.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 z-50 rounded-b-xl border border-t-0 border-border overflow-hidden shadow-xl"
            style={{ backgroundColor: "hsl(var(--background))" }}
            role="listbox"
          >
            {results.map((tool, i) => (
              <button
                key={tool.slug}
                role="option"
                aria-selected={i === active}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  i === active ? "bg-accent text-accent-foreground" : "hover:bg-muted/60"
                }`}
                onMouseDown={() => navigate(tool.slug)}
                onMouseEnter={() => setActive(i)}
              >
                <div className="flex-1 min-w-0">
                  <span className="font-medium block truncate">{tool.name}</span>
                  <span className="text-xs text-muted-foreground truncate block">{tool.description}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-muted-foreground rounded-md bg-muted px-1.5 py-0.5">
                    {tool.category}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular query chips */}
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {POPULAR_QUERIES.map(q => (
          <button
            key={q}
            onClick={() => {
              setQuery(q);
              setOpen(true);
              setActive(-1);
              inputRef.current?.focus();
            }}
            className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-foreground transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
