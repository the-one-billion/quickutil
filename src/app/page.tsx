import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, Zap, Shield, Smartphone, Globe,
  FileText, ImageIcon, Calculator, Type, ArrowLeftRight,
  Sparkles, Lock, Code2, Heart, DollarSign, Sigma,
  ChevronRight, Cpu, Layers, Users, Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { tools, categories, type ToolCategory } from "@/lib/tools";
import AdSlot from "@/components/AdSlot";
import ToolSearch from "@/components/ToolSearch";
import RecentlyUsedStrip from "@/components/RecentlyUsedStrip";
import SearchShortcut from "@/components/SearchShortcut";

export const metadata: Metadata = {
  title: "QuickUtil – 112+ Free Browser-Based Tools",
  description:
    "The private alternative to SmallPDF, TinyWow, and ILovePDF. 112+ free tools for PDF, image, developer, finance, and more — 100% client-side. Your files never leave your browser.",
};

// ── Data ──────────────────────────────────────────────────────────────────────

// Interactive / file-processing tools first — things AI chat literally cannot do
const popularSlugs = [
  "pdf-merge", "image-compress", "jwt-decoder", "password-generator",
  "json-formatter", "qr-generator", "regex-tester", "word-counter",
  "mortgage-calculator", "bmi-calculator", "unit-converter", "barcode-generator",
];
const popularTools = popularSlugs
  .map((s) => tools.find((t) => t.slug === s))
  .filter(Boolean) as typeof tools;

// Most recently added tools
const newToolSlugs = [
  "decision-matrix", "html-to-markdown", "heart-rate-zones",
  "macro-calculator", "text-encrypt", "color-contrast-checker",
];
const newTools = newToolSlugs
  .map(s => tools.find(t => t.slug === s))
  .filter(Boolean) as typeof tools;

// Tool of the Day — deterministic, changes once per day server-side
const todayIndex = Math.floor(Date.now() / 86_400_000) % tools.length;
const toolOfTheDay = tools[todayIndex];

// Categories that AI chat genuinely cannot replace
const AI_PROOF_CATS = new Set<ToolCategory>(["PDF", "Image", "Developer", "Text", "Security"]);

// Category display order — AI-proof first
const CAT_ORDER: ToolCategory[] = [
  "PDF", "Image", "Developer", "Text", "Security",
  "Generator", "Converter", "Calculator", "Finance", "Health", "Math",
];

const categoryMeta: Record<ToolCategory, { icon: React.ElementType; slug: string }> = {
  PDF:        { icon: FileText,       slug: "pdf"        },
  Image:      { icon: ImageIcon,      slug: "image"      },
  Calculator: { icon: Calculator,     slug: "calculator" },
  Text:       { icon: Type,           slug: "text"       },
  Converter:  { icon: ArrowLeftRight, slug: "converter"  },
  Generator:  { icon: Sparkles,       slug: "generator"  },
  Security:   { icon: Lock,           slug: "security"   },
  Developer:  { icon: Code2,          slug: "developer"  },
  Health:     { icon: Heart,          slug: "health"     },
  Finance:    { icon: DollarSign,     slug: "finance"    },
  Math:       { icon: Sigma,          slug: "math"       },
};

const devFavorites = [
  { slug: "jwt-decoder",           headline: "Inspect JWTs without touching a server",      cta: "Decode JWT"      },
  { slug: "json-formatter",        headline: "Paste messy JSON, get clean indented output",  cta: "Format JSON"     },
  { slug: "regex-tester",          headline: "Build and test regex patterns in real time",   cta: "Test Regex"      },
  { slug: "cron-builder",          headline: "Build cron expressions with a visual editor",  cta: "Build Cron"      },
  { slug: "color-contrast-checker",headline: "Check WCAG AA/AAA contrast ratios instantly",  cta: "Check Contrast"  },
  { slug: "text-encrypt",          headline: "AES-256-GCM encryption — key never leaves you",cta: "Encrypt Text"    },
];

const useCases = [
  {
    icon: Users,
    title: "Freelancers & Creatives",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    tasks: [
      { label: "Merge client PDFs",          slug: "pdf-merge"          },
      { label: "Compress images for email",  slug: "image-compress"     },
      { label: "Calculate invoice discounts",slug: "discount-calculator" },
      { label: "Generate QR codes for links",slug: "qr-generator"       },
    ],
  },
  {
    icon: Cpu,
    title: "Developers",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    tasks: [
      { label: "Format & validate JSON",     slug: "json-formatter"         },
      { label: "Decode & inspect JWTs",      slug: "jwt-decoder"            },
      { label: "Build cron expressions",     slug: "cron-builder"           },
      { label: "Check WCAG color contrast",  slug: "color-contrast-checker" },
    ],
  },
  {
    icon: Layers,
    title: "Everyday Use",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    tasks: [
      { label: "Calculate mortgage payments",slug: "mortgage-calculator"      },
      { label: "Track sleep cycles",         slug: "sleep-calculator"         },
      { label: "Check tax brackets",         slug: "tax-bracket-calculator"   },
      { label: "Convert units instantly",    slug: "unit-converter"           },
    ],
  },
];

const faqs = [
  {
    q: "Are all tools really free?",
    a: `Yes — all ${tools.length}+ tools are completely free with no hidden fees, no premium tiers, and no registration required.`,
  },
  {
    q: "Do my files ever leave my device?",
    a: "Never. Every tool runs entirely in your browser using client-side APIs (PDF.js, Canvas, Web Crypto). No file, image, or text is ever transmitted to a server. Verify this yourself: open any tool → F12 → Network tab → use the tool → zero upload requests.",
  },
  {
    q: "Why not just use ChatGPT or an AI assistant?",
    a: "AI chat is great for answering questions — but it can't merge your PDFs, compress your images, strip EXIF metadata from your photos, or run AES-256 encryption locally. These are interactive, file-processing tasks that require running code against real files in your browser. QuickUtil does the work; AI tells you it's possible.",
  },
  {
    q: "How is QuickUtil different from SmallPDF or TinyWow?",
    a: "SmallPDF, TinyWow, and ILovePDF upload your files to their servers to process them — your documents leave your device. QuickUtil is different by architecture: we process everything locally, which means we physically cannot see your files because they never reach us.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. There is no account, no login, no email required. Open a tool and use it.",
  },
  {
    q: "Is there a file size limit?",
    a: "No artificial limits. The only constraint is your device's available memory, which is typically several gigabytes.",
  },
  {
    q: "Do the tools work offline?",
    a: "Yes — once a page is loaded, the tools work without an internet connection. QuickUtil is a PWA (Progressive Web App) — you can install it to your home screen.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const toolCount = tools.length;
  const catCount  = categories.length;

  return (
    <>
      {/* Global "/" keyboard shortcut — invisible client component */}
      <SearchShortcut />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pb-16 pt-20 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4">
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />
            {toolCount}+ Tools · Zero Upload · No Account · Works Offline
          </div>

          {/* H1 */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            AI tells you how.{" "}
            <span className="text-primary">QuickUtil just does it.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            The private alternative to SmallPDF, TinyWow, and ILovePDF.
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-base text-muted-foreground">
            {toolCount}+ free tools for PDF, image, developer, finance, health, and more.
            Every tool runs in your browser.{" "}
            <strong className="text-foreground">Your files never touch our servers.</strong>
          </p>

          {/* Search bar */}
          <div className="mt-8">
            <ToolSearch />
            <p className="mt-2 text-xs text-muted-foreground">
              Press{" "}
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">/</kbd>
              {" "}from anywhere to search
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/tools/pdf-merge">
              <Button size="lg" className="gap-2">
                Try PDF Merge Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/tools">
              <Button size="lg" variant="outline">
                Browse All {toolCount} Tools
              </Button>
            </Link>
          </div>

          {/* Trust bar */}
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-green-500" /> Files stay on your device</span>
            <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-500" /> No sign-up, ever</span>
            <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-blue-500" /> Works offline</span>
            <span className="flex items-center gap-1.5"><Smartphone className="h-4 w-4 text-purple-500" /> Mobile-ready PWA</span>
            <span className="flex items-center gap-1.5"><Bot className="h-4 w-4 text-rose-500" /> Does what AI chat can&apos;t</span>
          </div>
        </div>
      </section>

      {/* ── Recently Used (client-only, localStorage) ─────────────────────── */}
      <RecentlyUsedStrip />

      {/* ── Tool of the Day ───────────────────────────────────────────────── */}
      {toolOfTheDay && (
        <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
          <Link
            href={`/tools/${toolOfTheDay.slug}`}
            className="group flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4 hover:border-primary/60 hover:bg-primary/10 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-bold text-primary uppercase tracking-wide">
                Tool of the Day
              </span>
              <span className="font-semibold text-sm truncate">{toolOfTheDay.name}</span>
              <span className="hidden sm:block text-sm text-muted-foreground truncate">{toolOfTheDay.description}</span>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
              Try it free <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>
      )}

      {/* ── "AI Can't Do This" strip ───────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <Bot className="h-3.5 w-3.5 text-rose-500" /> AI can&apos;t do this →
          </span>
          {[
            { label: "Merge PDFs",          slug: "pdf-merge"           },
            { label: "Compress Images",     slug: "image-compress"      },
            { label: "Decode JWT",          slug: "jwt-decoder"         },
            { label: "Encrypt Text locally",slug: "text-encrypt"        },
          ].map(({ label, slug }) => (
            <Link
              key={slug}
              href={`/tools/${slug}`}
              className="rounded-full border border-rose-500/30 bg-rose-500/5 px-3 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:border-rose-500/60 hover:bg-rose-500/10 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Popular Tools ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">Popular Tools</h2>
            <p className="mt-1 text-sm text-muted-foreground">Most-used tools by our visitors</p>
          </div>
          <Link href="/tools">
            <Button variant="ghost" size="sm" className="gap-1">
              All {toolCount} Tools <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {popularTools.map((tool) => (
            <Link key={tool.slug} href={`/tools/${tool.slug}`} className="tool-card group">
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{tool.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                  {tool.description}
                </p>
              </div>
              <span className="mt-auto flex items-center gap-1 text-xs font-medium text-primary">
                Use free <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Ad ────────────────────────────────────────────────────────────── */}
      <div className="flex justify-center py-4">
        <AdSlot size="leaderboard" adClient="ca-pub-5463169058698651" />
      </div>

      {/* ── Developer Favorites ───────────────────────────────────────────── */}
      <section className="bg-muted/30 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold">Developer Favorites</h2>
              <p className="mt-1 text-sm text-muted-foreground">Built for the terminal crowd — no AI needed</p>
            </div>
            <Link href="/categories/developer">
              <Button variant="ghost" size="sm" className="gap-1">
                All Dev Tools <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {devFavorites.map(({ slug, headline, cta }) => {
              const tool = tools.find(t => t.slug === slug);
              if (!tool) return null;
              return (
                <Link
                  key={slug}
                  href={`/tools/${slug}`}
                  className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <p className="text-sm font-medium text-foreground leading-snug">{headline}</p>
                  <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                    {cta} <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Category Grid ─────────────────────────────────────────────────── */}
      <section className="py-16" id="categories">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {catCount} Tool Categories
            </h2>
            <p className="mt-2 text-muted-foreground">
              From PDFs to finance to developer utilities — everything in one place.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {CAT_ORDER.map((cat) => {
              const meta     = categoryMeta[cat];
              const Icon     = meta.icon;
              const catTools = tools.filter(t => t.category === cat);
              const count    = catTools.length;
              const topNames = catTools.slice(0, 4).map(t => t.name);
              const remaining = Math.max(0, count - 4);
              const aiProof  = AI_PROOF_CATS.has(cat);
              return (
                <Link
                  key={cat}
                  href={`/categories/${meta.slug}`}
                  className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold leading-none">{cat}</p>
                        {aiProof && (
                          <span className="mt-0.5 inline-block text-[10px] font-medium text-rose-500">
                            AI-proof
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{count} tools</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {topNames.map(name => (
                      <span key={name} className="text-xs text-muted-foreground bg-muted/60 rounded px-1.5 py-0.5">
                        {name}
                      </span>
                    ))}
                    {remaining > 0 && (
                      <span className="text-xs text-primary font-medium bg-primary/10 rounded px-1.5 py-0.5">
                        +{remaining} more
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Browse {cat} tools <ChevronRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── New This Month ────────────────────────────────────────────────── */}
      <section className="bg-muted/30 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold">New This Month</h2>
              <p className="mt-1 text-sm text-muted-foreground">Recently added advanced tools</p>
            </div>
            <Link href="/tools">
              <Button variant="ghost" size="sm" className="gap-1">
                See all new <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {newTools.map(tool => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                      {tool.name}
                    </h3>
                    <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wide">
                      New
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{tool.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy / Trust ───────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-8 md:p-12">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
                <Shield className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                We built it so storing your data is impossible.
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                We don&apos;t just promise not to store your files — we built an architecture where it cannot happen.
                SmallPDF, TinyWow, and ILovePDF process files on their servers. QuickUtil does not have a file processing server.
              </p>

              {/* Competitor comparison table */}
              <div className="mt-8 overflow-x-auto">
                <table className="mx-auto w-full max-w-lg text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 text-left font-semibold text-foreground"></th>
                      <th className="py-2 px-3 font-semibold text-primary">QuickUtil</th>
                      <th className="py-2 px-3 font-semibold text-muted-foreground">SmallPDF</th>
                      <th className="py-2 px-3 font-semibold text-muted-foreground">TinyWow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Files uploaded to server",   "Never",  "Always",  "Always"  ],
                      ["Account required",           "No",     "Optional","No"      ],
                      ["Daily usage limit",          "None",   "2/day",   "Yes"     ],
                      ["Works offline",              "Yes",    "No",      "No"      ],
                      ["Open source processing",     "Yes",    "No",      "No"      ],
                      ["Free forever",               "Yes",    "Limited", "Limited" ],
                    ].map(([feature, qu, sp, tw]) => (
                      <tr key={feature} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-4 text-left text-muted-foreground">{feature}</td>
                        <td className="py-2.5 px-3 text-center font-medium text-green-600 dark:text-green-400">{qu}</td>
                        <td className="py-2.5 px-3 text-center text-muted-foreground">{sp}</td>
                        <td className="py-2.5 px-3 text-center text-muted-foreground">{tw}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: "📄",
                    title: "PDF.js (Mozilla)",
                    desc: "PDF merging, splitting, and conversion runs in your browser tab using the same engine Firefox uses.",
                  },
                  {
                    icon: "🖼",
                    title: "Canvas API",
                    desc: "Image compression, resizing, and format conversion uses the browser's native Canvas API — zero uploads.",
                  },
                  {
                    icon: "🔐",
                    title: "Web Crypto API",
                    desc: "Passwords, hashes, JWT signing, and AES-256 encryption use the browser's built-in cryptography engine.",
                  },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="rounded-xl border border-green-500/20 bg-background/60 p-4 text-center">
                    <div className="mb-2 text-2xl">{icon}</div>
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                <strong className="text-foreground">Verify it yourself:</strong> open any tool → press{" "}
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">F12</kbd> →
                Network tab → use the tool → zero upload requests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="bg-muted/30 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            {[
              { value: `${toolCount}+`, label: "Free Tools"      },
              { value: `${catCount}`,   label: "Categories"      },
              { value: "0",             label: "Files Uploaded"  },
              { value: "100%",          label: "Client-Side"     },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-4xl font-extrabold text-primary">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use Cases ─────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-extrabold sm:text-3xl">Who uses QuickUtil?</h2>
            <p className="mt-2 text-muted-foreground">Common tasks — all free, all instant, all private.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {useCases.map(({ icon: Icon, title, color, bg, tasks }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                </div>
                <ul className="space-y-2">
                  {tasks.map(({ label, slug }) => (
                    <li key={slug}>
                      <Link
                        href={`/tools/${slug}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                      >
                        <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${color} opacity-70 group-hover:opacity-100`} />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="bg-muted/30 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-extrabold">Frequently Asked Questions</h2>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faqs.map(({ q, a }) => ({
                  "@type": "Question",
                  name: q,
                  acceptedAnswer: { "@type": "Answer", text: a },
                })),
              }),
            }}
          />
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-border bg-card">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-medium list-none">
                  {q}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <p className="border-t border-border px-5 pb-4 pt-3 text-sm text-muted-foreground leading-relaxed">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEO Content Block ─────────────────────────────────────────────── */}
      <section className="border-t border-border bg-muted/20 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-xl font-bold mb-4">Free Online Utility Tools — No Upload Required</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-4 text-sm leading-relaxed">
            <p>
              QuickUtil is a free collection of {toolCount}+ browser-based utility tools spanning {catCount} categories.
              Every tool runs entirely client-side — no file is ever uploaded to a server, making it
              the privacy-first alternative to SmallPDF, TinyWow, ILovePDF, and ILoveIMG.
            </p>
            <p>
              <strong className="text-foreground">PDF tools:</strong>{" "}
              <Link href="/tools/pdf-merge" className="text-primary hover:underline">PDF Merge</Link> combines
              multiple PDFs into one.{" "}
              <Link href="/tools/pdf-split" className="text-primary hover:underline">PDF Split</Link> extracts
              pages or page ranges.{" "}
              <Link href="/tools/images-to-pdf" className="text-primary hover:underline">Images to PDF</Link> converts
              JPG and PNG files into a PDF document — all powered by PDF.js running locally in your browser.
            </p>
            <p>
              <strong className="text-foreground">Image tools:</strong>{" "}
              <Link href="/tools/image-compress" className="text-primary hover:underline">Image Compressor</Link> reduces
              file size by up to 90% without visible quality loss.{" "}
              <Link href="/tools/image-resize" className="text-primary hover:underline">Image Resizer</Link>,{" "}
              <Link href="/tools/image-crop" className="text-primary hover:underline">Image Crop</Link>, and{" "}
              <Link href="/tools/image-convert" className="text-primary hover:underline">Image Format Converter</Link> (JPG,
              PNG, WebP) all use the Canvas API — zero uploads.
            </p>
            <p>
              <strong className="text-foreground">Developer tools:</strong>{" "}
              <Link href="/tools/json-formatter" className="text-primary hover:underline">JSON Formatter</Link>,{" "}
              <Link href="/tools/regex-tester" className="text-primary hover:underline">Regex Tester</Link>,{" "}
              <Link href="/tools/jwt-decoder" className="text-primary hover:underline">JWT Decoder</Link> with expiry
              checking,{" "}
              <Link href="/tools/sql-formatter" className="text-primary hover:underline">SQL Formatter</Link>,{" "}
              <Link href="/tools/cron-builder" className="text-primary hover:underline">Cron Builder</Link>, and{" "}
              <Link href="/tools/color-contrast-checker" className="text-primary hover:underline">WCAG Contrast Checker</Link>.
            </p>
            <p>
              <strong className="text-foreground">Finance tools:</strong>{" "}
              <Link href="/tools/mortgage-calculator" className="text-primary hover:underline">Mortgage Calculator</Link> with
              amortization schedule,{" "}
              <Link href="/tools/tax-bracket-calculator" className="text-primary hover:underline">Tax Bracket Calculator</Link> (2024
              US federal rates),{" "}
              <Link href="/tools/retirement-calculator" className="text-primary hover:underline">Retirement Calculator</Link> with
              4% rule projection, and{" "}
              <Link href="/tools/credit-card-payoff" className="text-primary hover:underline">Credit Card Payoff Calculator</Link>.
            </p>
            <p>
              <strong className="text-foreground">Health tools:</strong>{" "}
              <Link href="/tools/macro-calculator" className="text-primary hover:underline">Macro Calculator</Link> using
              Mifflin-St Jeor BMR,{" "}
              <Link href="/tools/heart-rate-zones" className="text-primary hover:underline">Heart Rate Zones</Link> (Karvonen
              formula),{" "}
              <Link href="/tools/sleep-calculator" className="text-primary hover:underline">Sleep Cycle Calculator</Link>, and{" "}
              <Link href="/tools/ideal-weight-calculator" className="text-primary hover:underline">Ideal Weight Calculator</Link> using
              5 medical formulas.
            </p>
            <p>
              <strong className="text-foreground">Security tools:</strong>{" "}
              <Link href="/tools/password-generator" className="text-primary hover:underline">Password Generator</Link>,{" "}
              <Link href="/tools/hash-generator" className="text-primary hover:underline">Hash Generator</Link> (MD5, SHA-1,
              SHA-256, SHA-512),{" "}
              <Link href="/tools/text-encrypt" className="text-primary hover:underline">AES-256 Text Encryptor</Link>, and{" "}
              <Link href="/tools/jwt-generator" className="text-primary hover:underline">JWT Generator</Link> — all using
              the browser&apos;s Web Crypto API.
            </p>
            <p>
              <strong className="text-foreground">Tools AI assistants cannot replace:</strong>{" "}
              While AI chat can explain how to merge a PDF, it cannot actually merge your files. QuickUtil handles
              the tasks that require real file processing — PDF manipulation, image conversion, local encryption,
              EXIF stripping, and color palette extraction — all without uploading a single byte to a server.
            </p>
          </div>
        </div>
      </section>

      {/* ── Bottom Ad ─────────────────────────────────────────────────────── */}
      <div className="flex justify-center py-10">
        <AdSlot size="rectangle" adClient="ca-pub-5463169058698651"/>
      </div>

      {/* ── Schema markup ─────────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "QuickUtil",
            url: "https://quickutil.io",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://quickutil.io/tools?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "QuickUtil",
            url: "https://quickutil.io",
            description: `${toolCount}+ free browser-based utility tools. No upload, no account, 100% private.`,
          }),
        }}
      />
    </>
  );
}
