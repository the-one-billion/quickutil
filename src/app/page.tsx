import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, Zap, Shield, Smartphone, Globe,
  FileText, ImageIcon, Calculator, Type, ArrowLeftRight,
  Sparkles, Lock, Code2, Heart, DollarSign, Sigma,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { tools, categories, type ToolCategory } from "@/lib/tools";
import AdSlot from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "QuickUtil – 64+ Free Browser-Based Tools",
  description:
    "PDF merge, image compress, BMI calculator, JWT decoder, mortgage calculator and 60+ more free tools — all client-side. Your files never leave your browser.",
};

// ── Data ─────────────────────────────────────────────────────────────────────

const popularSlugs = [
  "pdf-merge", "image-compress", "qr-generator", "bmi-calculator",
  "json-formatter", "password-generator", "jwt-decoder", "word-counter",
  "mortgage-calculator", "unit-converter", "barcode-generator", "regex-tester",
];
const popularTools = popularSlugs
  .map((s) => tools.find((t) => t.slug === s))
  .filter(Boolean) as typeof tools;

const categoryMeta: Record<ToolCategory, { icon: React.ElementType; description: string; slug: string }> = {
  PDF:       { icon: FileText,       description: "Merge, split, compress, and convert PDFs in-browser.",        slug: "pdf" },
  Image:     { icon: ImageIcon,      description: "Compress, resize, crop, convert and watermark images.",       slug: "image" },
  Calculator:{ icon: Calculator,     description: "BMI, mortgage, loan, tip, and 10+ life calculators.",         slug: "calculator" },
  Text:      { icon: Type,           description: "Word count, case convert, readability, slug generator.",      slug: "text" },
  Converter: { icon: ArrowLeftRight, description: "Unit, currency, color, base, CSV↔JSON and more.",            slug: "converter" },
  Generator: { icon: Sparkles,       description: "QR codes, barcodes, UUIDs, fake data, color palettes.",      slug: "generator" },
  Security:  { icon: Lock,           description: "Password generator, hash tools, JWT decoder, encryption.",   slug: "security" },
  Developer: { icon: Code2,          description: "JSON formatter, regex tester, SQL formatter, cron parser.",  slug: "developer" },
  Health:    { icon: Heart,          description: "Calorie, due date, and date difference calculators.",         slug: "health" },
  Finance:   { icon: DollarSign,     description: "Currency, VAT, mortgage, discount, investment tools.",       slug: "finance" },
  Math:      { icon: Sigma,          description: "Statistics, compound interest, grade calculator, and more.", slug: "math" },
};

const faqs = [
  {
    q: "Are all tools really free?",
    a: "Yes, all 64+ tools are completely free with no hidden fees, no premium tiers, and no registration required.",
  },
  {
    q: "Do my files ever leave my device?",
    a: "Never. Every tool runs entirely in your browser using client-side APIs. No file, image, or text is ever transmitted to a server. You can verify this by opening your browser's Network tab while using any tool.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. There is no account, no login, no email required. Just open a tool and use it.",
  },
  {
    q: "Is there a file size limit?",
    a: "No artificial limits. The only constraint is your device's available memory, which is typically several gigabytes.",
  },
  {
    q: "Do the tools work offline?",
    a: "Yes, once the page is loaded the tools work offline. QuickUtil is a Progressive Web App (PWA) — you can even install it to your home screen.",
  },
  {
    q: "How is QuickUtil different from SmallPDF or TinyWow?",
    a: "Those services upload your files to their servers to process them. QuickUtil processes everything locally in your browser. We physically cannot see your files because they never reach our servers.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const toolCount = tools.length;
  const catCount = categories.length;

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pb-20 pt-24 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />
            {toolCount}+ Free Tools · 100% Browser-Side · No Upload Ever
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Every tool you need.{" "}
            <span className="text-primary">Your files never leave your device.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {toolCount}+ free browser-based tools for PDF, image, code, finance, and more.
            No upload. No account. No watermark. No file size limit. Ever.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/tools">
              <Button size="lg" className="gap-2">
                Browse All {toolCount} Tools <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/tools/pdf-merge">
              <Button size="lg" variant="outline">
                Try PDF Merge Free
              </Button>
            </Link>
          </div>

          {/* Trust bar */}
          <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-green-500" /> Files processed locally</span>
            <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-500" /> No sign-up required</span>
            <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-blue-500" /> Works offline</span>
            <span className="flex items-center gap-1.5"><Smartphone className="h-4 w-4 text-purple-500" /> Mobile-ready PWA</span>
          </div>
        </div>
      </section>

      {/* ── Ad ────────────────────────────────────────────────────────────── */}
      <div className="flex justify-center py-4">
        <AdSlot size="leaderboard" />
      </div>

      {/* ── Category Grid ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {catCount} Tool Categories
          </h2>
          <p className="mt-2 text-muted-foreground">
            From PDFs to finance to developer utilities — everything you need in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(Object.entries(categoryMeta) as [ToolCategory, typeof categoryMeta[ToolCategory]][]).map(
            ([cat, meta]) => {
              const Icon = meta.icon;
              const count = tools.filter((t) => t.category === cat).length;
              return (
                <Link
                  key={cat}
                  href={`/categories/${meta.slug}`}
                  className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold leading-none">{cat}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{count} tools</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-snug">{meta.description}</p>
                  <span className="mt-auto flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Browse {cat} tools <ChevronRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            }
          )}
        </div>
      </section>

      {/* ── Popular Tools ─────────────────────────────────────────────────── */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold">Popular Tools</h2>
              <p className="mt-1 text-sm text-muted-foreground">Most-used tools this week</p>
            </div>
            <Link href="/tools">
              <Button variant="ghost" size="sm" className="gap-1">
                All {toolCount} Tools <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {popularTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="tool-card group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{tool.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                    {tool.description}
                  </p>
                </div>
                <span className="mt-auto flex items-center gap-1 text-xs font-medium text-primary">
                  Use tool <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy Section ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-8 md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
              <Shield className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              Why "no upload" actually matters
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Most free tool sites — SmallPDF, TinyWow, ILoveIMG — upload your files to their servers
              to process them. Your documents, images, and data leave your device.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              QuickUtil is different <strong className="text-foreground">by architecture</strong>.
              PDF merging uses PDF.js in your browser. Image compression uses the Canvas API.
              Passwords are generated with the Web Crypto API. Nothing is transmitted.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { icon: "🔒", title: "Zero transmission", desc: "Open DevTools → Network tab. Watch: zero file upload requests." },
                { icon: "⚡", title: "Works offline", desc: "Once loaded, all tools function without an internet connection." },
                { icon: "∞", title: "No size limits", desc: "No artificial file size caps. Processes files limited only by your device's RAM." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="rounded-xl border border-green-500/20 bg-background/60 p-4 text-center">
                  <div className="mb-2 text-2xl">{icon}</div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="bg-muted/30 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            {[
              { value: `${toolCount}+`,  label: "Free Tools"        },
              { value: `${catCount}`,    label: "Categories"        },
              { value: "0",              label: "Files Uploaded"    },
              { value: "100%",           label: "Client-Side"       },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-4xl font-extrabold text-primary">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
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
        <div className="space-y-4">
          {faqs.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-xl border border-border bg-card"
            >
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
      </section>

      {/* ── SEO Content Block ─────────────────────────────────────────────── */}
      <section className="border-t border-border bg-muted/20 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-xl font-bold mb-4">About QuickUtil — Free Online Tools</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3 text-sm leading-relaxed">
            <p>
              QuickUtil is a free collection of {toolCount}+ browser-based utility tools spanning
              {" "}{catCount} categories: PDF tools, image tools, developer utilities, calculators,
              text tools, converters, generators, security tools, health calculators, finance tools,
              and math tools. Every tool runs entirely client-side — no file is ever uploaded to
              a server.
            </p>
            <p>
              <strong className="text-foreground">PDF tools</strong> include PDF merge (combine multiple PDFs),
              PDF split (extract pages), images to PDF, and PDF to images converter — all powered by PDF.js running locally.
              <strong className="text-foreground"> Image tools</strong> include image compressor, image resizer,
              image cropper, format converter (JPG, PNG, WebP), and image watermark tool — all using the
              browser Canvas API with zero uploads.
            </p>
            <p>
              <strong className="text-foreground">Developer tools</strong> include a JSON formatter,
              JWT decoder (with expiry checking), regex tester, SQL formatter, CSS minifier,
              URL encoder/decoder, cron expression parser, and HTML entities encoder.
              <strong className="text-foreground"> Calculator tools</strong> cover BMI, loan payments,
              mortgage with amortization schedule, compound interest, investment return, grade/GPA,
              tip, percentage, age, and scientific calculator.
            </p>
            <p>
              <strong className="text-foreground">Finance tools</strong> include a currency converter
              (30+ currencies), VAT/sales tax calculator, mortgage calculator with SVG amortization chart,
              and discount calculator with stacked discount support.
              <strong className="text-foreground"> Text tools</strong> include word counter, case converter,
              text diff, readability checker (6 scoring algorithms), keyword density, email validator,
              and text to URL slug converter.
            </p>
            <p>
              QuickUtil is the privacy-first alternative to SmallPDF, TinyWow, ILovePDF, and ILoveIMG.
              Unlike those services, QuickUtil processes all data locally — making it suitable for
              confidential documents, sensitive financial information, and private communications.
            </p>
          </div>
        </div>
      </section>

      {/* ── Bottom Ad ─────────────────────────────────────────────────────── */}
      <div className="flex justify-center py-10">
        <AdSlot size="rectangle" />
      </div>

      {/* ── Schema: SiteLinksSearchBox ────────────────────────────────────── */}
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
